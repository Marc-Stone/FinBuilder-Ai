import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useSyncedReload } from "@/hooks/useDataSync";
import {
  formatMoney,
  parseIsoDate,
  startOfMonth,
  type ExpenseEntry,
  type IncomeEntry,
} from "@/lib/finance";
import {
  aggregateExpenses,
  buildBudgetPlan,
  computeFinancialScore,
  mergePlanWithActuals,
  monthKey,
  resolveReferenceIncome,
} from "@/lib/budget";
import BudgetScoreCard from "@/pages/app/budget/components/BudgetScoreCard";
import BudgetGroups from "@/pages/app/budget/components/BudgetGroups";
import BudgetTable from "@/pages/app/budget/components/BudgetTable";
import ExpenseDonutChart from "@/pages/app/components/ExpenseDonutChart";

export default function BudgetPage() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const devise = profile?.devise ?? "FCFA";

  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [expenseRows, setExpenseRows] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    if (!options?.silent) setLoading(true);
    setError("");
    try {
      const [incomeResult, expenseResult] = await Promise.all([
        supabase.from("income").select("id, source, montant, date, type, note, recurrent"),
        supabase
          .from("expenses")
          .select("id, description, montant, date, categorie, mode_paiement, note, recurrent"),
      ]);
      if (incomeResult.error) throw incomeResult.error;
      if (expenseResult.error) throw expenseResult.error;
      setIncome((incomeResult.data ?? []) as IncomeEntry[]);
      setExpenseRows((expenseResult.data ?? []) as ExpenseEntry[]);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Une erreur inattendue est survenue pendant le chargement.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useSyncedReload(load);

  const monthExpenses = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    return expenseRows.filter((row) => parseIsoDate(row.date) >= monthStart);
  }, [expenseRows]);

  const incomeByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    income.forEach((row) => {
      const key = monthKey(parseIsoDate(row.date));
      map[key] = (map[key] ?? 0) + (Number(row.montant) || 0);
    });
    return map;
  }, [income]);

  const monthIncomeTotal = incomeByMonth[monthKey(new Date())] ?? 0;

  const reference = useMemo(() => {
    if (monthIncomeTotal > 0) {
      return { reference: monthIncomeTotal, monthsUsed: 1, isAverage: false };
    }
    return resolveReferenceIncome(incomeByMonth);
  }, [incomeByMonth, monthIncomeTotal]);

  const budget = useMemo(() => {
    const plan = buildBudgetPlan(reference.reference);
    const actual = aggregateExpenses(monthExpenses);
    return { plan: mergePlanWithActuals(plan, actual), actual };
  }, [reference.reference, monthExpenses]);

  const score = useMemo(() => {
    const depensesHorsEpargne = budget.actual.total - budget.actual.parGroupe.epargne;
    return computeFinancialScore({
      revenu: reference.reference,
      depenses: depensesHorsEpargne,
      besoins: budget.actual.parGroupe.besoins,
    });
  }, [budget, reference.reference]);

  const overGroup = useMemo(() => {
    const candidates = budget.plan.groups.filter((group) => group.meta.key !== "epargne");
    const worst = [...candidates].sort((a, b) => b.ecart - a.ecart)[0];
    return worst && worst.ecart > 0 ? worst : null;
  }, [budget]);

  const today = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="w-full animate-fade-up space-y-4">
        <div className="h-[132px] animate-pulse rounded-lg bg-background-200" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-[150px] animate-pulse rounded-lg bg-background-200" />
          ))}
        </div>
        <div className="h-[280px] animate-pulse rounded-lg bg-background-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-accent-300 bg-accent-50 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-500 text-foreground-950">
            <i className="ri-error-warning-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-900">
              Impossible de charger votre budget
            </p>
            <p className="mt-1 text-xs leading-relaxed text-accent-800">{error}</p>
            <button
              type="button"
              onClick={() => {
                void load();
              }}
              className="mt-3 inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-foreground-900"
            >
              <i className="ri-refresh-line text-sm" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-up space-y-4 md:space-y-5">
      <section className="relative overflow-hidden rounded-lg bg-primary-950 px-5 py-6 md:px-7 md:py-7">
        <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-primary-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-accent-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-accent-300">
              Budget intelligent · {today}
            </p>
            <h1
              className="mt-2 text-xl font-semibold leading-tight text-background-50 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Votre répartition recommandée
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-background-50/70 md:text-sm">
              La règle 50 / 30 / 20 appliquée à vos vrais revenus
              {reference.isAverage
                ? ` — moyenne de vos ${reference.monthsUsed} derniers mois de revenus.`
                : monthIncomeTotal > 0
                  ? " — calculée sur vos revenus encaissés ce mois-ci."
                  : "."}
            </p>

            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <Link
                to="/app/depenses"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
              >
                <i className="ri-arrow-up-line text-base" />
                Enregistrer une dépense
              </Link>
              <Link
                to="/app/revenus"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-50/25 bg-background-50/10 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-background-50/20"
              >
                <i className="ri-arrow-down-line text-base" />
                Mettre à jour mes revenus
              </Link>
            </div>
          </div>

          <div className="w-full max-w-[280px] shrink-0 rounded-lg border border-background-50/10 bg-background-50/5 p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-background-50/60">
              Revenu de référence
            </p>
            <p
              className="mt-1.5 truncate text-xl font-semibold text-background-50"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {formatMoney(reference.reference, devise)}
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background-50/15">
              <div
                className="h-full rounded-full bg-accent-400 transition-all duration-700"
                style={{ width: `${Math.min(score.score, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-background-50/60">
              {reference.reference > 0
                ? `Basé sur ${reference.isAverage ? `${reference.monthsUsed} mois de revenus` : "vos revenus du mois"}.`
                : "Ajoutez un revenu pour activer le calcul."}
            </p>
          </div>
        </div>
      </section>

      {reference.reference <= 0 ? (
        <section className="rounded-lg border border-dashed border-background-300 bg-background-50 px-5 py-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <i className="ri-pie-chart-2-line text-2xl" />
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground-950">
            Ajoutez d'abord un revenu
          </p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-foreground-500">
            Le budget intelligent calcule une répartition 50 % besoins, 30 % envies et 20 %
            épargne à partir de votre revenu réel. Dès votre premier revenu enregistré, la
            répartition apparaît ici automatiquement.
          </p>
          <Link
            to="/app/revenus"
            className="mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-add-line text-base" />
            Ajouter mon premier revenu
          </Link>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <BudgetScoreCard
              score={score}
              devise={devise}
              revenu={reference.reference}
              depenses={budget.actual.total}
              epargne={budget.actual.parGroupe.epargne}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
              <article className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground-500">
                    Épargne recommandée
                  </p>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                    <i className="ri-safe-2-line text-base" />
                  </span>
                </div>
                <p
                  className="mt-3 text-xl font-semibold text-foreground-950 md:text-2xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {formatMoney(budget.plan.lines.find((line) => line.categorie === "epargne")?.recommande ?? 0, devise)}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-foreground-400">
                  À mettre de côté chaque mois pour sécuriser vos projets.
                </p>
              </article>

              <article className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground-500">
                    Marge disponible
                  </p>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-700">
                    <i className="ri-wallet-3-line text-base" />
                  </span>
                </div>
                <p
                  className={`mt-3 text-xl font-semibold md:text-2xl ${
                    reference.reference - budget.actual.total >= 0
                      ? "text-primary-700"
                      : "text-accent-800"
                  }`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {formatMoney(reference.reference - budget.actual.total, devise)}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-foreground-400">
                  Revenu moins dépenses réellement enregistrées ce mois.
                </p>
              </article>

              <article className="rounded-lg border border-background-200 bg-background-50 p-4 sm:col-span-2 md:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-800">
                    <i className="ri-lightbulb-flash-line text-base" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground-950">
                      Comment votre budget est calculé
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-foreground-600">
                      Votre revenu de référence est réparti selon la règle{" "}
                      <strong className="font-semibold text-foreground-900">50 / 30 / 20</strong> :
                      50 % pour les besoins essentiels, 30 % pour les envies et 20 % pour l'épargne.
                      Chaque poste reçoit ensuite un pourcentage cible. Nous comparons ce montant
                      idéal à vos dépenses réelles pour afficher vos écarts.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ExpenseDonutChart
              title="Répartition réelle des dépenses"
              hint="Par catégorie · dépenses du mois en cours"
            />
            <BudgetGroups
              groups={budget.plan.groups}
              devise={devise}
              reference={reference.reference}
              layout="stack"
            />
          </section>

          <BudgetTable lines={budget.plan.lines} devise={devise} />

          <section className="flex flex-col gap-3 rounded-lg border border-accent-200 bg-accent-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-500 text-foreground-950">
                <i className="ri-sparkling-line text-base" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-accent-900">Le conseil FinBuilder</p>
                <p className="mt-0.5 text-xs leading-relaxed text-accent-800">
                  {overGroup
                    ? `Votre poste le plus en dépassement est « ${overGroup.meta.label} ». Réduisez-le en priorité pour financer votre épargne.`
                    : "Vous restez dans les montants recommandés. Orientez la marge vers votre fonds d'urgence ou un objectif."}
                </p>
              </div>
            </div>
            <Link
              to="/app/depenses"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-foreground-900"
            >
              Voir mes dépenses
              <i className="ri-arrow-right-line text-xs" />
            </Link>
          </section>
        </>
      )}
    </div>
  );
}