import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useSyncedReload } from "@/hooks/useDataSync";
import { formatMoney, parseIsoDate } from "@/lib/finance";
import { resolveReferenceIncome } from "@/lib/budget";
import { computeHousingPlan, type HousingResult } from "@/lib/housing";
import HousingInputs, {
  type HousingState,
} from "@/pages/app/logement/components/HousingInputs";
import HousingResults from "@/pages/app/logement/components/HousingResults";

type IncomeRow = { montant: number; date: string };
type ExpenseRow = { montant: number; date: string; categorie: string };

const initialHousingState: HousingState = {
  revenu: 0,
  loyerActuel: 0,
  charges: 0,
  apport: 0,
  prixCible: 0,
  tauxAnnuel: 7.5,
  dureeAnnees: 15,
  tauxEndettement: 30,
};

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export default function LogementPage() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const devise = profile?.devise ?? "FCFA";

  const [state, setState] = useState<HousingState>(initialHousingState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromRealData, setFromRealData] = useState(false);

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    if (!options?.silent) setLoading(true);
    setError("");
    try {
      const [incomeResult, expenseResult] = await Promise.all([
        supabase.from("income").select("montant, date"),
        supabase.from("expenses").select("montant, date, categorie"),
      ]);
      if (incomeResult.error) throw incomeResult.error;
      if (expenseResult.error) throw expenseResult.error;

      const incomeRows = (incomeResult.data ?? []) as IncomeRow[];
      const expenseRows = (expenseResult.data ?? []) as ExpenseRow[];

      const incomeByMonth: Record<string, number> = {};
      const logementByMonth: Record<string, number> = {};

      incomeRows.forEach((row) => {
        const date = parseIsoDate(row.date);
        const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
        incomeByMonth[key] = (incomeByMonth[key] ?? 0) + (Number(row.montant) || 0);
      });

      expenseRows.forEach((row) => {
        if (row.categorie !== "logement") return;
        const date = parseIsoDate(row.date);
        const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
        logementByMonth[key] = (logementByMonth[key] ?? 0) + (Number(row.montant) || 0);
      });

      const now = new Date();
      const currentKey = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}`;
      const revenuMoisCourant = incomeByMonth[currentKey] ?? 0;
      const revenu =
        revenuMoisCourant > 0 ? revenuMoisCourant : resolveReferenceIncome(incomeByMonth).reference;

      const logementKeys = Object.keys(logementByMonth)
        .filter((key) => logementByMonth[key] > 0)
        .sort()
        .slice(-3);
      const loyerMoyen =
        logementKeys.length > 0
          ? Math.round(
              logementKeys.reduce((total, key) => total + logementByMonth[key], 0) /
                logementKeys.length,
            )
          : 0;

      const base: HousingState = {
        ...initialHousingState,
        revenu: Math.round(revenu),
        loyerActuel: loyerMoyen,
      };

      setFromRealData(revenu > 0 || loyerMoyen > 0);

      // Rafraîchissement silencieux : on met à jour les bases chiffrées
      // sans écraser le scénario que l'utilisateur est en train de tester.
      if (options?.silent) {
        setState((previous) => ({
          ...previous,
          revenu: base.revenu,
          loyerActuel: base.loyerActuel,
        }));
        return;
      }

      const estimate = computeHousingPlan(base);

      setState({
        ...base,
        prixCible: estimate.prixMax > 0 ? roundTo(estimate.prixMax, 100000) : 0,
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Vos données n'ont pas pu être chargées.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useSyncedReload(load);

  const result: HousingResult = useMemo(() => computeHousingPlan(state), [state]);

  const patch = (next: Partial<HousingState>) => {
    setState((previous) => ({ ...previous, ...next }));
  };

  const reset = () => {
    setState((previous) => ({
      ...previous,
      apport: 0,
      charges: 0,
      tauxAnnuel: 7.5,
      dureeAnnees: 15,
      tauxEndettement: 30,
      prixCible: result.prixMax > 0 ? roundTo(result.prixMax, 100000) : previous.prixCible,
    }));
  };

  const sourceLabel = fromRealData ? "D'après vos données" : "À saisir";

  if (loading) {
    return (
      <div className="w-full animate-fade-up space-y-4">
        <div className="h-[120px] animate-pulse rounded-lg bg-background-200" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="h-[440px] animate-pulse rounded-lg bg-background-200 lg:col-span-5" />
          <div className="h-[440px] animate-pulse rounded-lg bg-background-200 lg:col-span-7" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-up space-y-4">
      <section className="rounded-lg border border-background-200 bg-background-100 px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-700">
              Conseiller logement
            </p>
            <h1
              className="mt-1.5 text-xl font-semibold leading-tight text-foreground-950 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Louer ou acheter sans se mettre en danger
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-foreground-600 md:text-sm">
              Votre logement ne devrait pas dépasser 30 % de vos revenus. Mesurez votre situation
              actuelle, votre capacité d'emprunt et le prix du bien que vous pouvez viser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-background-300 bg-background-50 px-2.5 py-1 text-[11px] font-semibold text-foreground-700">
              <i className="ri-home-5-line text-xs text-primary-600" />
              Charge actuelle : {formatMoney(state.loyerActuel + state.charges, devise)}
            </span>
            <button
              type="button"
              onClick={reset}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-1.5 text-[11px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
            >
              <i className="ri-restart-line text-xs" />
              Réinitialiser le scénario
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-accent-300 bg-accent-50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <i className="ri-error-warning-line mt-0.5 text-base text-accent-800" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent-900">
                Impossible de récupérer vos chiffres réels
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-accent-800">{error}</p>
              <button
                type="button"
                onClick={() => {
                  void load();
                }}
                className="mt-2 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
              >
                <i className="ri-refresh-line text-xs" />
                Réessayer
              </button>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-accent-800">
            Vous pouvez saisir vos montants manuellement dans le panneau de gauche.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <HousingInputs state={state} devise={devise} sourceLabel={sourceLabel} onPatch={patch} />
        </div>
        <div className="lg:col-span-7">
          <HousingResults result={result} devise={devise} />
        </div>
      </div>
    </div>
  );
}