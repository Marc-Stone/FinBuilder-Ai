import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useSyncedReload } from "@/hooks/useDataSync";
import { useFinancialProfile, type FinancialProfileRow } from "@/hooks/useFinancialProfile";
import type { ExpenseEntry, IncomeEntry } from "@/lib/finance";
import { toIsoDate } from "@/lib/finance";
import type { GoalEntry } from "@/lib/goals";
import {
  attachLinkedExpenses,
  type LinkedExpenseSource,
  type ProjectEntry,
} from "@/lib/projects";

const INCOME_COLUMNS = "id, source, montant, date, type, note, recurrent";
const EXPENSE_COLUMNS =
  "id, description, montant, date, categorie, mode_paiement, note, recurrent, project_id";
const GOAL_COLUMNS =
  "id, nom, categorie, montant_objectif, montant_actuel, date_limite, priorite, statut, note";
const PROJECT_COLUMNS =
  "id, nom, categorie, budget_total, montant_finance, postes, etapes, statut, priorite, date_fin, goal_id";

export type FinancialDataKey = "income" | "expenses" | "goals" | "projects";

const ALL_KEYS: FinancialDataKey[] = ["income", "expenses", "goals", "projects"];

type ReloadOptions = { silent?: boolean };

/** Fenêtre temporelle chargée pour le tableau de bord (12 derniers mois). */
const HISTORY_MONTHS = 12;

function historyStartIso(): string {
  const now = new Date();
  return toIsoDate(new Date(now.getFullYear(), now.getMonth() - (HISTORY_MONTHS - 1), 1));
}

export type FinancialDataValue = {
  /** Revenus de l'utilisateur (une seule requête pour tout le tableau de bord). */
  income: IncomeEntry[];
  /** Dépenses de l'utilisateur (source unique, projets liés inclus). */
  expenses: ExpenseEntry[];
  goals: GoalEntry[];
  /** Projets avec leurs dépenses rattachées. */
  projects: ProjectEntry[];
  financialProfile: FinancialProfileRow | null;
  profileLoading: boolean;
  loading: boolean;
  error: string;
  reload: (options?: ReloadOptions) => Promise<void>;
};

export type SharedExpensesValue = {
  expenses: ExpenseEntry[];
  loading: boolean;
  error: string;
  reload: (options?: ReloadOptions) => Promise<void>;
};

type FinancialDataContextValue = {
  income: IncomeEntry[];
  expenses: ExpenseEntry[];
  goals: GoalEntry[];
  projects: ProjectEntry[];
  financialProfile: FinancialProfileRow | null;
  profileLoading: boolean;
  loading: boolean;
  error: string;
  demand: (keys: FinancialDataKey[]) => void;
  reload: (options?: ReloadOptions) => Promise<void>;
};

const FinancialDataContext = createContext<FinancialDataContextValue | null>(null);

type QueryResult = { data: unknown; error: unknown };

async function runQuery(key: FinancialDataKey): Promise<QueryResult> {
  const start = historyStartIso();
  if (key === "income") {
    const result = await supabase.from("income").select(INCOME_COLUMNS).gte("date", start);
    return { data: result.data, error: result.error };
  }
  if (key === "expenses") {
    // Dépenses des 12 derniers mois + dépenses rattachées à un projet, pour que
    // l'avancement des projets reste exact même sur un projet ancien.
    const result = await supabase
      .from("expenses")
      .select(EXPENSE_COLUMNS)
      .or(`date.gte.${start},project_id.not.is.null`);
    return { data: result.data, error: result.error };
  }
  if (key === "goals") {
    const result = await supabase.from("goals").select(GOAL_COLUMNS);
    return { data: result.data, error: result.error };
  }
  const result = await supabase.from("projects").select(PROJECT_COLUMNS);
  return { data: result.data, error: result.error };
}

/**
 * Source de données financière unique et partagée pour l'espace connecté.
 *
 * - Revenus, dépenses, objectifs et projets ne sont chargés qu'une seule fois,
 *   puis distribués aux composants du tableau de bord (graphiques, cartes de
 *   synthèse, projets actifs) : plus aucune requête en double.
 * - Le tableau de bord ne lit que la fenêtre utile : revenus et dépenses des
 *   12 derniers mois (les historiques complets sont paginés sur leurs pages).
 * - Le chargement est piloté à la demande : un écran ne réclame que les jeux de
 *   données qu'il affiche réellement (la page Budget ne charge pas les projets).
 * - Les règles RLS restent la seule barrière d'accès aux lignes : aucune requête
 *   ne filtre ni ne contourne les politiques de la base.
 */
export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { financialProfile, loading: profileLoading } = useFinancialProfile();

  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [rawProjects, setRawProjects] = useState<ProjectEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requested, setRequested] = useState<FinancialDataKey[]>([]);

  const requestedRef = useRef<FinancialDataKey[]>([]);
  requestedRef.current = requested;

  const loadedRef = useRef<Record<FinancialDataKey, boolean>>({
    income: false,
    expenses: false,
    goals: false,
    projects: false,
  });
  const inFlightRef = useRef<Set<FinancialDataKey>>(new Set());
  const hasDataRef = useRef(false);

  const demand = useCallback((keys: FinancialDataKey[]) => {
    setRequested((previous) => {
      const merged = Array.from(new Set([...previous, ...keys]));
      return merged.length === previous.length ? previous : merged;
    });
  }, []);

  const load = useCallback(
    async (scope: FinancialDataKey[], options?: ReloadOptions) => {
      const keys = Array.from(new Set(scope));
      if (!userId || keys.length === 0) {
        setLoading(false);
        return;
      }
      if (!options?.silent) setLoading(true);
      setError("");
      keys.forEach((key) => inFlightRef.current.add(key));
      try {
        const results = await Promise.all(keys.map((key) => runQuery(key)));

        results.forEach((result, index) => {
          const key = keys[index];
          if (result.error) {
            throw result.error;
          }
          if (key === "income") setIncome((result.data ?? []) as IncomeEntry[]);
          else if (key === "expenses") setExpenses((result.data ?? []) as ExpenseEntry[]);
          else if (key === "goals") setGoals((result.data ?? []) as GoalEntry[]);
          else setRawProjects((result.data ?? []) as ProjectEntry[]);
          loadedRef.current[key] = true;
        });
        hasDataRef.current = true;
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Vos données financières n'ont pas pu être chargées.",
        );
        keys.forEach((key) => {
          if (key === "income") setIncome([]);
          else if (key === "expenses") setExpenses([]);
          else if (key === "goals") setGoals([]);
          else setRawProjects([]);
          loadedRef.current[key] = false;
        });
      } finally {
        keys.forEach((key) => inFlightRef.current.delete(key));
        setLoading(false);
      }
    },
    [userId],
  );

  const requestedSignature = requested.join("|");

  useEffect(() => {
    if (!userId || !requestedSignature) return;
    const missing = requestedSignature
      .split("|")
      .filter(Boolean)
      .map((key) => key as FinancialDataKey)
      .filter((key) => !loadedRef.current[key] && !inFlightRef.current.has(key));
    if (missing.length === 0) return;
    load(missing, { silent: hasDataRef.current });
  }, [userId, requestedSignature, load]);

  const reload = useCallback(
    (options?: ReloadOptions) => load(requestedRef.current, options),
    [load],
  );

  const syncedReload = useCallback(
    (options?: ReloadOptions) => {
      if (requestedRef.current.length === 0) return;
      load(requestedRef.current, options);
    },
    [load],
  );

  useSyncedReload(syncedReload);

  const projects = useMemo(
    () => attachLinkedExpenses(rawProjects, expenses as LinkedExpenseSource[]),
    [rawProjects, expenses],
  );

  const value = useMemo<FinancialDataContextValue>(
    () => ({
      income,
      expenses,
      goals,
      projects,
      financialProfile,
      profileLoading,
      loading,
      error,
      demand,
      reload,
    }),
    [
      income,
      expenses,
      goals,
      projects,
      financialProfile,
      profileLoading,
      loading,
      error,
      demand,
      reload,
    ],
  );

  return <FinancialDataContext.Provider value={value}>{children}</FinancialDataContext.Provider>;
}

function useFinancialDataContext(): FinancialDataContextValue {
  const context = useContext(FinancialDataContext);
  if (!context) {
    throw new Error("useFinancialData doit être utilisé dans FinancialDataProvider");
  }
  return context;
}

/** Vue complète : revenus, dépenses, objectifs, projets et profil financier. */
export function useFinancialData(): FinancialDataValue {
  const context = useFinancialDataContext();
  const { demand } = context;

  // Le premier composant monté réclame la totalité des jeux de données :
  // une seule salve de requêtes, partagée par tous les blocs du tableau de bord.
  useEffect(() => {
    demand(ALL_KEYS);
  }, [demand]);

  return context;
}

/**
 * Vue restreinte aux dépenses : utilisée par les graphiques de répartition
 * (tableau de bord et page Budget) pour ne pas charger le reste inutilement.
 */
export function useSharedExpenses(): SharedExpensesValue {
  const context = useFinancialDataContext();
  const { demand } = context;

  useEffect(() => {
    demand(["expenses"]);
  }, [demand]);

  return {
    expenses: context.expenses,
    loading: context.loading,
    error: context.error,
    reload: context.reload,
  };
}