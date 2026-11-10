import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useBudgetRule } from "@/hooks/useBudgetRule";
import { getExpenseCategory, parseIsoDate } from "@/lib/finance";
import {
  aggregateExpenses,
  buildBudgetPlan,
  computeFinancialScore,
  mergePlanWithActuals,
  monthKey,
  resolveReferenceIncome,
  type BudgetBlockKey,
} from "@/lib/budget";
import { computeGoalProgress, type GoalEntry } from "@/lib/goals";
import { computeProjectMetrics } from "@/lib/projects";
import { buildNotificationFeed, type NotifProjectRow } from "@/lib/notifications";

export type GoalOverview = {
  goal: GoalEntry;
  progression: number;
  restant: number;
  moisRestants: number;
  epargneMensuelle: number;
  atteint: boolean;
  enRetard: boolean;
};

export type BudgetOverrun = {
  label: string;
  icon: string;
  percent: number;
  montant: number;
};

export type FinancialOverview = {
  loading: boolean;
  error: string;
  reload: (options?: { silent?: boolean }) => void;
  mois: {
    revenus: number;
    depenses: number;
    epargne: number;
    besoins: number;
    revenusCount: number;
    depensesCount: number;
  };
  reference: number;
  capacity: number;
  budget: {
    recommande: number;
    consomme: number;
    restant: number;
    partConsommee: number;
    groups: { key: BudgetBlockKey; label: string; recommande: number; reel: number }[];
    overruns: BudgetOverrun[];
  };
  score: ReturnType<typeof computeFinancialScore>;
  goals: GoalOverview[];
  projects: {
    total: number;
    actifs: number;
    budget: number;
    finance: number;
    manquant: number;
    progression: number;
  };
  alertes: number;
  advice: { title: string; text: string; to: string; actionLabel: string; icon: string };
};

const PRIORITY_WEIGHT: Record<string, number> = { haute: 0, moyenne: 1, basse: 2 };

function adviceFor(diagnosisKey: string, devise: string, capacity: number) {
  switch (diagnosisKey) {
    case "revenus":
      return {
        title: "Votre premier revenu débloque tout le reste",
        text: "Dès qu'un revenu est enregistré, FinBuilder calcule votre budget (règle 50 / 30 / 20 ou 80 / 20, au choix), votre capacité d'épargne et votre score. Budget, objectifs, projets et simulations se remplissent ensemble.",
        to: "/app/revenus",
        actionLabel: "Ajouter un revenu",
        icon: "ri-arrow-down-line",
      };
    case "depenses":
      return {
        title: "Vos revenus sont là, vos dépenses manquent",
        text: "Sans dépenses, impossible de savoir où part votre argent. Saisissez vos trois plus grosses sorties du mois : le budget, les alertes et votre score deviennent fiables.",
        to: "/app/depenses",
        actionLabel: "Saisir une dépense",
        icon: "ri-arrow-up-line",
      };
    case "deficit":
      return {
        title: "Vos dépenses dépassent vos revenus",
        text: "Identifiez le poste non essentiel le plus lourd et coupez-le de 10 %. Le simulateur vous montre immédiatement l'effet sur votre épargne et sur la date d'atteinte de vos objectifs.",
        to: "/app/simulations",
        actionLabel: "Simuler un ajustement",
        icon: "ri-git-branch-line",
      };
    case "epargne":
      return {
        title: "Votre épargne est le levier le plus rentable",
        text:
          capacity > 0
            ? `Votre capacité d'épargne est de ${new Intl.NumberFormat("fr-FR").format(Math.round(capacity))} ${devise} par mois. Automatisez ce versement en début de mois et affectez-le à votre objectif prioritaire.`
            : "Fixez une épargne cible de 20 % de vos revenus puis affectez-la à un objectif : vos projets se financent sans nouvelle saisie.",
        to: "/app/objectifs",
        actionLabel: "Voir mes objectifs",
        icon: "ri-safe-2-line",
      };
    case "envies":
      return {
        title: "Vos envies pèsent plus que prévu",
        text: "Sorties, shopping et abonnements dépassent la cible de 30 %. Réduire ce bloc est le moyen le plus rapide de financer un objectif sans toucher à l'essentiel.",
        to: "/app/budget",
        actionLabel: "Comparer mon budget",
        icon: "ri-shopping-bag-3-line",
      };
    case "quotidien":
      return {
        title: "Vos dépenses dépassent 80 % de vos revenus",
        text: "Avec la règle 80 / 20, toutes vos dépenses doivent tenir dans 80 % de vos revenus. Repérez le poste le plus lourd dans votre budget : chaque économie finance directement vos 20 % d'épargne.",
        to: "/app/budget",
        actionLabel: "Comparer mon budget",
        icon: "ri-wallet-3-line",
      };
    case "besoins":
      return {
        title: "Vos charges essentielles sont trop lourdes",
        text: "Logement, transport et factures absorbent plus de la moitié de vos revenus. Le conseiller logement chiffre un loyer ou une mensualité soutenable avec vos revenus réels.",
        to: "/app/logement",
        actionLabel: "Calculer mon logement",
        icon: "ri-home-heart-line",
      };
    default:
      return {
        title: "Budget équilibré : faites travailler votre épargne",
        text: "Votre budget respecte la répartition choisie et vous épargnez déjà plus de 20 % de vos revenus. Simulez un revenu en hausse pour voir la nouvelle date d'atteinte de vos objectifs.",
        to: "/app/simulations",
        actionLabel: "Ouvrir le simulateur",
        icon: "ri-award-line",
      };
  }
}

/**
 * Vue financière synthétique du tableau de bord.
 * Elle ne déclenche aucune requête : toutes les données proviennent de la
 * source partagée `useFinancialData()`, chargée une seule fois pour l'espace
 * connecté. Les calculs (budget 50/30/20 ou 80/20 selon le choix de l'utilisateur, score, objectifs, projets, conseils)
 * sont simplement recalculés à partir de ces données communes.
 */
export function useFinancialOverview(): FinancialOverview {
  const { profile } = useAuth();
  const devise = profile?.devise ?? "FCFA";
  const { rule } = useBudgetRule();
  const { income, expenses, goals, projects, loading, error, reload } = useFinancialData();

  return useMemo<FinancialOverview>(() => {
    const now = new Date();
    const currentKey = monthKey(now);

    const incomeByMonth: Record<string, number> = {};
    income.forEach((row) => {
      const key = monthKey(parseIsoDate(row.date));
      incomeByMonth[key] = (incomeByMonth[key] ?? 0) + (Number(row.montant) || 0);
    });

    const currentIncome = incomeByMonth[currentKey] ?? 0;
    const resolved = resolveReferenceIncome(incomeByMonth, currentIncome);
    const reference = resolved.reference > 0 ? resolved.reference : currentIncome;

    const monthExpenses = expenses.filter(
      (row) => monthKey(parseIsoDate(row.date)) === currentKey,
    );
    const actual = aggregateExpenses(monthExpenses);
    const plan = mergePlanWithActuals(buildBudgetPlan(reference, rule), actual);

    const epargne = Math.round(actual.parGroupe.epargne);
    const depensesHorsEpargne = Math.max(actual.total - actual.parGroupe.epargne, 0);
    const score = computeFinancialScore({
      revenu: reference,
      depenses: depensesHorsEpargne,
      besoins: actual.parGroupe.besoins,
    });

    const capacity = reference - depensesHorsEpargne;

    const overruns: BudgetOverrun[] = plan.lines
      .filter(
        (line) =>
          line.categorie !== "epargne" && line.recommande > 0 && line.reel > line.recommande * 1.05,
      )
      .map((line) => ({
        label: line.label,
        icon: getExpenseCategory(line.categorie).icon,
        percent: Math.round(((line.reel - line.recommande) / line.recommande) * 100),
        montant: line.reel - line.recommande,
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 3);

    const goalOverviews: GoalOverview[] = goals
      .map((goal) => {
        const progress = computeGoalProgress(goal, now);
        return {
          goal,
          progression: progress.progression,
          restant: progress.restant,
          moisRestants: progress.moisRestants,
          epargneMensuelle: progress.epargneMensuelle,
          atteint: progress.atteint,
          enRetard: progress.statutAffiche === "retard",
        };
      })
      .sort((a, b) => {
        const priority =
          (PRIORITY_WEIGHT[a.goal.priorite] ?? 1) - (PRIORITY_WEIGHT[b.goal.priorite] ?? 1);
        if (priority !== 0) return priority;
        return b.progression - a.progression;
      });

    const projectTotals = projects.reduce(
      (acc, project) => {
        const metrics = computeProjectMetrics(project, now);
        const active = project.statut === "en_cours" || project.statut === "preparation";
        return {
          total: acc.total + 1,
          actifs: acc.actifs + (active ? 1 : 0),
          budget: acc.budget + (active ? metrics.enveloppe : 0),
          finance: acc.finance + (active ? metrics.finance : 0),
          manquant: acc.manquant + (active ? metrics.enveloppeManquante : 0),
          depense: acc.depense + (active ? metrics.depenseTotal : 0),
          prevu: acc.prevu + (active ? metrics.prevuTotal : 0),
        };
      },
      { total: 0, actifs: 0, budget: 0, finance: 0, manquant: 0, depense: 0, prevu: 0 },
    );

    const feed = buildNotificationFeed({
      income: income.map((row) => ({ id: row.id, montant: row.montant, date: row.date })),
      expenses: expenses.map((row) => ({
        id: row.id,
        montant: row.montant,
        date: row.date,
        categorie: row.categorie,
        description: row.description,
      })),
      goals,
      projects: projects as NotifProjectRow[],
      devise,
      now,
      rule,
    });

    const projectProgress =
      projectTotals.prevu > 0
        ? Math.min((projectTotals.depense / projectTotals.prevu) * 100, 100)
        : 0;

    return {
      loading,
      error,
      reload,
      mois: {
        revenus: currentIncome,
        depenses: Math.round(actual.total),
        epargne,
        besoins: Math.round(actual.parGroupe.besoins),
        revenusCount: income.filter(
          (row) => monthKey(parseIsoDate(row.date)) === currentKey,
        ).length,
        depensesCount: monthExpenses.length,
      },
      reference,
      capacity,
      budget: {
        recommande: reference,
        consomme: Math.round(actual.total),
        restant: reference - Math.round(actual.total),
        partConsommee: reference > 0 ? (actual.total / reference) * 100 : 0,
        groups: plan.groups.map((group) => ({
          key: group.meta.key,
          label: group.meta.label,
          recommande: group.recommande,
          reel: group.reel,
        })),
        overruns,
      },
      score,
      goals: goalOverviews,
      projects: {
        total: projectTotals.total,
        actifs: projectTotals.actifs,
        budget: projectTotals.budget,
        finance: projectTotals.finance,
        manquant: projectTotals.manquant,
        progression: projectProgress,
      },
      alertes: feed.notifications.length,
      advice: adviceFor(feed.diagnosis.key, devise, capacity),
    };
  }, [income, expenses, goals, projects, loading, error, reload, devise, rule]);
}