import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useSyncedReload } from "@/hooks/useDataSync";
import { formatMoney, parseIsoDate } from "@/lib/finance";
import { resolveReferenceIncome } from "@/lib/budget";
import type { GoalEntry } from "@/lib/goals";
import {
  computeSimulation,
  scenarioPresets,
  type ScenarioPreset,
  type SimulationResult,
} from "@/lib/simulations";
import SimulatorControls, {
  type SimulatorState,
} from "@/pages/app/simulations/components/SimulatorControls";
import SimulationResultPanel from "@/pages/app/simulations/components/SimulationResultPanel";
import ObjectiveImpact from "@/pages/app/simulations/components/ObjectiveImpact";

type IncomeRow = { montant: number; date: string };
type ExpenseRow = { montant: number; date: string; categorie: string };

const initialState: SimulatorState = {
  revenu: 0,
  depenses: 0,
  revenuVariation: 0,
  depensesReduction: 0,
  epargneAdditionnelle: 0,
  horizonMois: 12,
};

export default function SimulationsPage() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const devise = profile?.devise ?? "FCFA";

  const [state, setState] = useState<SimulatorState>(initialState);
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [goalId, setGoalId] = useState("");
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
      const [incomeResult, expenseResult, goalsResult] = await Promise.all([
        supabase.from("income").select("montant, date"),
        supabase.from("expenses").select("montant, date, categorie"),
        supabase
          .from("goals")
          .select("id, nom, categorie, montant_objectif, montant_actuel, date_limite, priorite, statut, note")
          .eq("statut", "actif")
          .order("date_creation", { ascending: false }),
      ]);
      if (incomeResult.error) throw incomeResult.error;
      if (expenseResult.error) throw expenseResult.error;
      if (goalsResult.error) throw goalsResult.error;

      const incomeRows = (incomeResult.data ?? []) as IncomeRow[];
      const expenseRows = (expenseResult.data ?? []) as ExpenseRow[];

      const incomeByMonth: Record<string, number> = {};
      const expenseByMonth: Record<string, number> = {};

      incomeRows.forEach((row) => {
        const date = parseIsoDate(row.date);
        const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
        incomeByMonth[key] = (incomeByMonth[key] ?? 0) + (Number(row.montant) || 0);
      });

      expenseRows.forEach((row) => {
        if (row.categorie === "epargne") return;
        const date = parseIsoDate(row.date);
        const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
        expenseByMonth[key] = (expenseByMonth[key] ?? 0) + (Number(row.montant) || 0);
      });

      const now = new Date();
      const currentKey = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}`;
      const revenuMoisCourant = incomeByMonth[currentKey] ?? 0;
      const revenuReference =
        revenuMoisCourant > 0
          ? revenuMoisCourant
          : resolveReferenceIncome(incomeByMonth).reference;

      const keys = Object.keys(expenseByMonth)
        .filter((key) => expenseByMonth[key] > 0)
        .sort()
        .slice(-3);
      const depensesMoyennes =
        keys.length > 0
          ? Math.round(keys.reduce((total, key) => total + expenseByMonth[key], 0) / keys.length)
          : 0;

      setState((previous) => ({
        ...previous,
        revenu: Math.round(revenuReference),
        depenses: depensesMoyennes,
      }));
      setFromRealData(revenuReference > 0 || depensesMoyennes > 0);

      const goalRows = (goalsResult.data ?? []) as GoalEntry[];
      setGoals(goalRows);
      setGoalId((previous) => previous || goalRows[0]?.id || "");
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

  const result: SimulationResult = useMemo(
    () => computeSimulation({ ...state, horizonMois: state.horizonMois }),
    [state],
  );

  const presetGains = useMemo(() => {
    const gains: Record<string, number> = {};
    scenarioPresets.forEach((preset) => {
      const simulated = computeSimulation({
        revenu: state.revenu,
        depenses: state.depenses,
        revenuVariation: preset.revenuVariation,
        depensesReduction: preset.depensesReduction,
        epargneAdditionnelle: preset.epargneAdditionnelle,
        horizonMois: state.horizonMois,
      });
      gains[preset.id] = Math.max(simulated.gainMensuel, 0);
    });
    return gains;
  }, [state.revenu, state.depenses, state.horizonMois]);

  const activePreset = useMemo(() => {
    const found = scenarioPresets.find(
      (preset) =>
        preset.revenuVariation === state.revenuVariation &&
        preset.depensesReduction === state.depensesReduction &&
        preset.epargneAdditionnelle === state.epargneAdditionnelle,
    );
    return found?.id ?? null;
  }, [state.revenuVariation, state.depensesReduction, state.epargneAdditionnelle]);

  const patch = (next: Partial<SimulatorState>) => {
    setState((previous) => ({ ...previous, ...next }));
  };

  const applyPreset = (preset: ScenarioPreset) => {
    patch({
      revenuVariation: preset.revenuVariation,
      depensesReduction: preset.depensesReduction,
      epargneAdditionnelle: preset.epargneAdditionnelle,
    });
  };

  const reset = () => {
    patch({ revenuVariation: 0, depensesReduction: 0, epargneAdditionnelle: 0 });
  };

  const sourceLabel = fromRealData ? "D'après vos données" : "À saisir";

  if (loading) {
    return (
      <div className="w-full animate-fade-up space-y-4">
        <div className="h-[120px] animate-pulse rounded-lg bg-background-200" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="h-[420px] animate-pulse rounded-lg bg-background-200 lg:col-span-5" />
          <div className="h-[420px] animate-pulse rounded-lg bg-background-200 lg:col-span-7" />
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
              Simulations « et si… »
            </p>
            <h1
              className="mt-1.5 text-xl font-semibold leading-tight text-foreground-950 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Testez un changement avant de le vivre
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-foreground-600 md:text-sm">
              Un revenu qui bouge, une dépense qui baisse, une épargne automatique en plus :
              voyez immédiatement l'effet sur votre capacité d'épargne et sur le délai de vos
              objectifs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-background-300 bg-background-50 px-2.5 py-1 text-[11px] font-semibold text-foreground-700">
              <i className="ri-database-2-line text-xs text-primary-600" />
              Base : {formatMoney(state.revenu, devise)} de revenus
            </span>
            <button
              type="button"
              onClick={reset}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-1.5 text-[11px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
            >
              <i className="ri-restart-line text-xs" />
              Réinitialiser
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
                onClick={load}
                className="mt-2 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
              >
                <i className="ri-refresh-line text-xs" />
                Réessayer
              </button>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-accent-800">
            Vous pouvez tout de même saisir vos montants manuellement ci-dessous.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SimulatorControls
            state={state}
            devise={devise}
            sourceLabel={sourceLabel}
            activePreset={activePreset}
            presetGains={presetGains}
            onPatch={patch}
            onPreset={applyPreset}
            presets={scenarioPresets}
          />
        </div>

        <div className="space-y-3 lg:col-span-7">
          <SimulationResultPanel result={result} devise={devise} />

          <ObjectiveImpact
            goals={goals}
            selectedId={goalId}
            onSelect={setGoalId}
            capaciteActuelle={result.capaciteActuelle}
            capaciteFinale={result.capaciteFinale}
            devise={devise}
            loading={false}
          />

          <section className="flex flex-col gap-3 rounded-lg border border-accent-200 bg-accent-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-500 text-foreground-950">
                <i className="ri-sparkling-line text-base" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-accent-900">Le conseil FinBuilder</p>
                <p className="mt-0.5 text-xs leading-relaxed text-accent-800">
                  {result.capaciteActuelle <= 0
                    ? "Aujourd'hui, votre budget ne dégage aucune marge. Commencez par un seul poste non essentiel à réduire de 10 %, puis automatisez le versement."
                    : result.gainMensuel > 0
                      ? `Chaque mois gagné compte : placez ${formatMoney(
                          Math.max(result.capaciteFinale, 0),
                          devise,
                        )} dès la réception de vos revenus, avant toute dépense.`
                      : "Déplacez un curseur pour mesurer l'effet d'un changement avant de le décider dans la vraie vie."}
                </p>
              </div>
            </div>
            <Link
              to="/app/objectifs"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-foreground-900"
            >
              Voir mes objectifs
              <i className="ri-arrow-right-line text-xs" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}