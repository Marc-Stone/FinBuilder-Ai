import {
  expenseCategories,
  getExpenseCategory,
  parseIsoDate,
  startOfMonth,
  type BudgetGroupKey,
  type ExpenseEntry,
} from "@/lib/finance";

export type { BudgetGroupKey } from "@/lib/finance";

/** Bloc affiché dans la répartition : un groupe de catégories, ou « dépenses » (règle 80/20). */
export type BudgetBlockKey = BudgetGroupKey | "depenses";

export type BudgetGroupMeta = {
  key: BudgetBlockKey;
  /** Groupes de catégories couverts par ce bloc. */
  members: BudgetGroupKey[];
  label: string;
  percent: number;
  icon: string;
  description: string;
  tone: string;
  bar: string;
  soft: string;
};

export const budgetGroups: BudgetGroupMeta[] = [
  {
    key: "besoins",
    members: ["besoins"],
    label: "Besoins essentiels",
    percent: 50,
    icon: "ri-home-heart-line",
    description: "Logement, nourriture, transport, factures, santé et éducation.",
    tone: "text-primary-800",
    bar: "bg-primary-600",
    soft: "bg-primary-50",
  },
  {
    key: "envies",
    members: ["envies"],
    label: "Envies & confort",
    percent: 30,
    icon: "ri-shopping-bag-3-line",
    description: "Sorties, shopping, abonnements et dépenses non essentielles.",
    tone: "text-accent-800",
    bar: "bg-accent-500",
    soft: "bg-accent-50",
  },
  {
    key: "epargne",
    members: ["epargne"],
    label: "Épargne & projets",
    percent: 20,
    icon: "ri-safe-2-line",
    description: "Fonds d'urgence, objectifs, investissement et remboursement.",
    tone: "text-secondary-900",
    bar: "bg-secondary-600",
    soft: "bg-secondary-100",
  },
];

/* ---------- Règles de répartition ---------- */

export type BudgetRule = "50-30-20" | "80-20";

export const DEFAULT_BUDGET_RULE: BudgetRule = "50-30-20";

export type BudgetRuleMeta = {
  value: BudgetRule;
  label: string;
  short: string;
  description: string;
};

export const budgetRules: BudgetRuleMeta[] = [
  {
    value: "50-30-20",
    label: "50 / 30 / 20",
    short: "Détaillée",
    description: "50 % besoins essentiels, 30 % envies, 20 % épargne. Idéale pour suivre précisément vos postes.",
  },
  {
    value: "80-20",
    label: "80 / 20",
    short: "Simplifiée",
    description: "80 % pour toutes vos dépenses, 20 % d'épargne en priorité. Idéale pour démarrer simplement.",
  },
];

/** Règle 80/20 : besoins et envies sont réunis en un seul bloc de dépenses. */
const spendingBlock: BudgetGroupMeta = {
  key: "depenses",
  members: ["besoins", "envies"],
  label: "Dépenses du quotidien",
  percent: 80,
  icon: "ri-wallet-3-line",
  description: "Besoins essentiels et envies réunis : logement, nourriture, transport, factures, loisirs, shopping.",
  tone: "text-primary-800",
  bar: "bg-primary-600",
  soft: "bg-primary-50",
};

export function getBudgetBlocks(rule: BudgetRule): BudgetGroupMeta[] {
  if (rule === "80-20") {
    return [spendingBlock, budgetGroups.find((group) => group.key === "epargne")!];
  }
  return budgetGroups;
}

export function isBudgetRule(value: unknown): value is BudgetRule {
  return value === "50-30-20" || value === "80-20";
}

/** Libellé court de la règle (« 50 / 30 / 20 » ou « 80 / 20 »). */
export function budgetRuleLabel(rule: BudgetRule): string {
  return rule === "80-20" ? "80 / 20" : "50 / 30 / 20";
}

/** Émis à chaque changement de règle : toute l'application se recalcule. */
export const BUDGET_RULE_EVENT = "finbuilder:budget-rule";

const budgetRuleStorageKey = (userId: string) => `finbuilder:budget-rule:${userId}`;

/** Préférence d'affichage (aucune donnée financière) : stockée sur l'appareil. */
export function readBudgetRule(userId: string | null | undefined): BudgetRule {
  if (!userId || typeof window === "undefined") return DEFAULT_BUDGET_RULE;
  try {
    const raw = window.localStorage.getItem(budgetRuleStorageKey(userId));
    return isBudgetRule(raw) ? raw : DEFAULT_BUDGET_RULE;
  } catch {
    return DEFAULT_BUDGET_RULE;
  }
}

export function writeBudgetRule(userId: string, rule: BudgetRule): void {
  try {
    window.localStorage.setItem(budgetRuleStorageKey(userId), rule);
  } catch {
    /* stockage indisponible : le choix reste valable pour la session */
  }
  window.dispatchEvent(new Event(BUDGET_RULE_EVENT));
}

/** Abonnement aux changements de règle (cet onglet et les autres onglets ouverts). */
export function subscribeBudgetRule(listener: () => void): () => void {
  window.addEventListener(BUDGET_RULE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(BUDGET_RULE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export type BudgetLine = {
  categorie: string;
  label: string;
  percent: number;
  group: BudgetGroupKey;
  recommande: number;
  reel: number;
  ecart: number;
  partReelle: number;
};

export type BudgetGroupResult = {
  meta: BudgetGroupMeta;
  recommande: number;
  reel: number;
  partReelle: number;
  ecart: number;
};

export type BudgetPlan = {
  rule: BudgetRule;
  reference: number;
  lines: BudgetLine[];
  groups: BudgetGroupResult[];
};

/**
 * Builds the recommended split from a reference monthly income.
 * Les cibles par catégorie sont identiques dans les deux règles (besoins 50 + envies 30 = 80) :
 * seule la répartition par blocs change.
 */
export function buildBudgetPlan(reference: number, rule: BudgetRule = DEFAULT_BUDGET_RULE): BudgetPlan {
  const safe = Number.isFinite(reference) && reference > 0 ? reference : 0;

  const lines: BudgetLine[] = expenseCategories.map((category) => ({
    categorie: category.value,
    label: category.label,
    percent: category.percent,
    group: category.group,
    recommande: Math.round((safe * category.percent) / 100),
    reel: 0,
    ecart: 0,
    partReelle: 0,
  }));

  const groups: BudgetGroupResult[] = getBudgetBlocks(rule).map((meta) => ({
    meta,
    recommande: Math.round((safe * meta.percent) / 100),
    reel: 0,
    partReelle: 0,
    ecart: 0,
  }));

  return { rule, reference: safe, lines, groups };
}

export type ActualTotals = {
  parCategorie: Record<string, number>;
  parGroupe: Record<BudgetGroupKey, number>;
  total: number;
};

type BudgetExpenseRow = {
  categorie: string;
  montant: number | string | null | undefined;
};

/** Aggregates real expenses (already filtered on the target period). */
export function aggregateExpenses(rows: BudgetExpenseRow[]): ActualTotals {
  const parCategorie: Record<string, number> = {};
  const parGroupe: Record<BudgetGroupKey, number> = { besoins: 0, envies: 0, epargne: 0 };
  let total = 0;

  rows.forEach((row) => {
    const amount = Number(row.montant) || 0;
    const meta = getExpenseCategory(row.categorie);
    parCategorie[meta.value] = (parCategorie[meta.value] ?? 0) + amount;
    parGroupe[meta.group] += amount;
    total += amount;
  });

  return { parCategorie, parGroupe, total };
}

/** Merges the recommendation with the real spending of the period. */
export function mergePlanWithActuals(plan: BudgetPlan, actual: ActualTotals): BudgetPlan {
  const lines = plan.lines.map((line) => {
    const reel = Math.round(actual.parCategorie[line.categorie] ?? 0);
    return {
      ...line,
      reel,
      ecart: reel - line.recommande,
      partReelle: actual.total > 0 ? (reel / actual.total) * 100 : 0,
    };
  });

  const groups = plan.groups.map((group) => {
    const reel = Math.round(
      group.meta.members.reduce((sum, member) => sum + (actual.parGroupe[member] ?? 0), 0),
    );
    return {
      ...group,
      reel,
      ecart: reel - group.recommande,
      partReelle: plan.reference > 0 ? (reel / plan.reference) * 100 : 0,
    };
  });

  return { ...plan, lines, groups };
}

/** Average monthly income over the last N months that actually hold income. */
export function resolveReferenceIncome(amountsByMonth: Record<string, number>, fallback = 0) {
  const keys = Object.keys(amountsByMonth)
    .filter((key) => amountsByMonth[key] > 0)
    .sort()
    .slice(-3);

  if (keys.length === 0) {
    return { reference: fallback, monthsUsed: 0, isAverage: false };
  }

  if (keys.length === 1) {
    return { reference: amountsByMonth[keys[0]], monthsUsed: 1, isAverage: false };
  }

  const sum = keys.reduce((total, key) => total + amountsByMonth[key], 0);
  return { reference: Math.round(sum / keys.length), monthsUsed: keys.length, isAverage: true };
}

export type ScoreResult = {
  score: number;
  label: string;
  tone: "good" | "watch" | "risk";
  savingsRate: number;
  commentary: string;
};

/**
 * Financial health score (0-100) built on three transparent pillars:
 * savings effort (60), budget discipline (25), essentials discipline (15).
 */
export function computeFinancialScore({
  revenu,
  depenses,
  besoins,
}: {
  revenu: number;
  depenses: number;
  besoins: number;
}): ScoreResult {
  const income = Number.isFinite(revenu) && revenu > 0 ? revenu : 0;
  const spending = Number.isFinite(depenses) ? Math.max(depenses, 0) : 0;
  const essentials = Number.isFinite(besoins) ? Math.max(besoins, 0) : 0;

  if (income <= 0) {
    return {
      score: 0,
      label: "À démarrer",
      tone: "watch",
      savingsRate: 0,
      commentary:
        "Ajoutez vos revenus du mois pour obtenir une évaluation chiffrée de votre santé financière.",
    };
  }

  const savingsRate = (income - spending) / income;

  // No expense recorded yet: the score cannot be trusted, keep it neutral.
  if (spending <= 0) {
    return {
      score: 55,
      label: "À affiner",
      tone: "watch",
      savingsRate,
      commentary:
        "Votre revenu est enregistré mais aucune dépense ne l'est encore. Ajoutez vos sorties du mois pour obtenir un score fiable.",
    };
  }

  // 1. Savings effort — 60 points, full marks at a 20% savings rate.
  const effort = Math.min(Math.max(savingsRate, 0) / 0.2, 1) * 60;

  // 2. Budget discipline — 25 points, drops to 0 at 120% of income spent.
  const ratio = spending / income;
  const discipline = ratio <= 0.8 ? 1 : Math.min(Math.max((1.2 - ratio) / 0.4, 0), 1);
  const disciplinePoints = discipline * 25;

  // 3. Essentials discipline — 15 points, below 50% of income.
  const essentialsRatio = essentials / income;
  const essentialsPoints =
    essentialsRatio <= 0.5 ? 15 : Math.min(Math.max((0.75 - essentialsRatio) / 0.25, 0), 1) * 15;

  const score = Math.round(effort + disciplinePoints + essentialsPoints);
  const bounded = Math.min(Math.max(score, 0), 100);

  if (bounded >= 75) {
    return {
      score: bounded,
      label: "Solide",
      tone: "good",
      savingsRate,
      commentary:
        "Votre rythme est sain. Continuez à alimenter votre fonds d'urgence puis vos projets.",
    };
  }

  if (bounded >= 45) {
    return {
      score: bounded,
      label: "À consolider",
      tone: "watch",
      savingsRate,
      commentary:
        "Les bases sont là. Réduisez d'abord les dépenses non essentielles pour libérer 20 % d'épargne.",
    };
  }

  return {
    score: bounded,
    label: "Sous tension",
    tone: "risk",
    savingsRate,
    commentary:
      "Vos dépenses consomment presque tout votre revenu. Commencez par un poste non essentiel à réduire.",
  };
}

/** Groups expenses by "YYYY-MM" for monthly series. */
export function groupByMonth(rows: ExpenseEntry[]) {
  const result: Record<string, number> = {};
  rows.forEach((row) => {
    const date = parseIsoDate(row.date);
    const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
    result[key] = (result[key] ?? 0) + (Number(row.montant) || 0);
  });
  return result;
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
}

export function currentMonthStart() {
  return startOfMonth(new Date());
}