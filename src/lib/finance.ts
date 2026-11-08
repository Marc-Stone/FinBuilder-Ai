export type IncomeType = "salaire" | "business" | "freelance" | "investissement" | "autre";

export type IncomeEntry = {
  id: string;
  source: string;
  montant: number;
  date: string;
  type: string;
  note: string | null;
  recurrent: boolean;
};

export type PeriodKey = "mois" | "mois-1" | "3mois" | "annee" | "tout";

export type IncomeTypeMeta = {
  value: IncomeType;
  label: string;
  icon: string;
  bubble: string;
  badge: string;
};

export const incomeTypes: IncomeTypeMeta[] = [
  {
    value: "salaire",
    label: "Salaire",
    icon: "ri-briefcase-4-line",
    bubble: "bg-primary-50 text-primary-700",
    badge: "border-primary-200 bg-primary-50 text-primary-800",
  },
  {
    value: "business",
    label: "Business",
    icon: "ri-store-2-line",
    bubble: "bg-accent-50 text-accent-700",
    badge: "border-accent-200 bg-accent-50 text-accent-900",
  },
  {
    value: "freelance",
    label: "Freelance",
    icon: "ri-computer-line",
    bubble: "bg-secondary-100 text-secondary-800",
    badge: "border-secondary-200 bg-secondary-100 text-secondary-900",
  },
  {
    value: "investissement",
    label: "Investissement",
    icon: "ri-line-chart-line",
    bubble: "bg-primary-100 text-primary-800",
    badge: "border-primary-200 bg-primary-100 text-primary-900",
  },
  {
    value: "autre",
    label: "Autre",
    icon: "ri-add-circle-line",
    bubble: "bg-background-100 text-foreground-600",
    badge: "border-background-300 bg-background-100 text-foreground-700",
  },
];

export const periodOptions: { value: PeriodKey; label: string }[] = [
  { value: "mois", label: "Ce mois-ci" },
  { value: "mois-1", label: "Mois dernier" },
  { value: "3mois", label: "3 derniers mois" },
  { value: "annee", label: "Cette année" },
  { value: "tout", label: "Tout l'historique" },
];

export function getIncomeType(value: string): IncomeTypeMeta {
  return incomeTypes.find((item) => item.value === value) ?? incomeTypes[incomeTypes.length - 1];
}

export type ExpenseCategory =
  | "logement"
  | "alimentation"
  | "transport"
  | "factures"
  | "sante"
  | "education"
  | "loisirs"
  | "shopping"
  | "famille"
  | "epargne"
  | "autre";

export type BudgetGroupKey = "besoins" | "envies" | "epargne";

export type ExpenseEntry = {
  id: string;
  description: string;
  montant: number;
  date: string;
  categorie: string;
  mode_paiement: string;
  note: string | null;
  recurrent: boolean;
  /** Projet auquel la dépense est rattachée (alimente automatiquement son budget consommé). */
  project_id?: string | null;
};

export type ExpenseCategoryMeta = {
  value: ExpenseCategory;
  label: string;
  icon: string;
  group: BudgetGroupKey;
  percent: number;
  bubble: string;
  badge: string;
  bar: string;
};

export const expenseCategories: ExpenseCategoryMeta[] = [
  {
    value: "logement",
    label: "Logement",
    icon: "ri-home-5-line",
    group: "besoins",
    percent: 22,
    bubble: "bg-primary-50 text-primary-700",
    badge: "border-primary-200 bg-primary-50 text-primary-800",
    bar: "bg-primary-600",
  },
  {
    value: "alimentation",
    label: "Alimentation",
    icon: "ri-restaurant-2-line",
    group: "besoins",
    percent: 12,
    bubble: "bg-secondary-100 text-secondary-800",
    badge: "border-secondary-200 bg-secondary-100 text-secondary-900",
    bar: "bg-secondary-600",
  },
  {
    value: "transport",
    label: "Transport",
    icon: "ri-roadster-line",
    group: "besoins",
    percent: 7,
    bubble: "bg-accent-50 text-accent-700",
    badge: "border-accent-200 bg-accent-50 text-accent-900",
    bar: "bg-accent-600",
  },
  {
    value: "factures",
    label: "Factures & charges",
    icon: "ri-receipt-line",
    group: "besoins",
    percent: 5,
    bubble: "bg-primary-100 text-primary-800",
    badge: "border-primary-200 bg-primary-100 text-primary-900",
    bar: "bg-primary-500",
  },
  {
    value: "sante",
    label: "Santé",
    icon: "ri-heart-pulse-line",
    group: "besoins",
    percent: 2,
    bubble: "bg-secondary-50 text-secondary-800",
    badge: "border-secondary-200 bg-secondary-50 text-secondary-800",
    bar: "bg-secondary-500",
  },
  {
    value: "education",
    label: "Éducation",
    icon: "ri-book-2-line",
    group: "besoins",
    percent: 1.5,
    bubble: "bg-background-100 text-foreground-600",
    badge: "border-background-300 bg-background-100 text-foreground-700",
    bar: "bg-foreground-400",
  },
  {
    value: "famille",
    label: "Famille & soutien",
    icon: "ri-parent-line",
    group: "besoins",
    percent: 0.5,
    bubble: "bg-accent-100 text-accent-800",
    badge: "border-accent-200 bg-accent-100 text-accent-900",
    bar: "bg-accent-500",
  },
  {
    value: "loisirs",
    label: "Loisirs & sorties",
    icon: "ri-gamepad-line",
    group: "envies",
    percent: 12,
    bubble: "bg-accent-50 text-accent-700",
    badge: "border-accent-200 bg-accent-50 text-accent-900",
    bar: "bg-accent-500",
  },
  {
    value: "shopping",
    label: "Shopping",
    icon: "ri-shopping-bag-3-line",
    group: "envies",
    percent: 10,
    bubble: "bg-primary-50 text-primary-700",
    badge: "border-primary-200 bg-primary-50 text-primary-800",
    bar: "bg-primary-400",
  },
  {
    value: "autre",
    label: "Autre",
    icon: "ri-more-2-line",
    group: "envies",
    percent: 8,
    bubble: "bg-background-100 text-foreground-600",
    badge: "border-background-300 bg-background-100 text-foreground-700",
    bar: "bg-foreground-400",
  },
  {
    value: "epargne",
    label: "Épargne & placement",
    icon: "ri-safe-2-line",
    group: "epargne",
    percent: 20,
    bubble: "bg-primary-100 text-primary-800",
    badge: "border-primary-300 bg-primary-100 text-primary-900",
    bar: "bg-primary-700",
  },
];

export function getExpenseCategory(value: string): ExpenseCategoryMeta {
  return (
    expenseCategories.find((item) => item.value === value) ??
    expenseCategories[expenseCategories.length - 1]
  );
}

export const paymentMethods = [
  { value: "especes", label: "Espèces", icon: "ri-money-cny-circle-line" },
  { value: "mobile_money", label: "Mobile money", icon: "ri-smartphone-line" },
  { value: "carte", label: "Carte bancaire", icon: "ri-bank-card-line" },
  { value: "virement", label: "Virement", icon: "ri-exchange-dollar-line" },
  { value: "prelevement", label: "Prélèvement", icon: "ri-repeat-line" },
];

export function getPaymentMethod(value: string) {
  return paymentMethods.find((item) => item.value === value) ?? paymentMethods[0];
}

export function formatMoney(value: number, devise: string) {
  const safe = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(safe));
  return `${formatted} ${devise}`;
}

export function formatDateFr(iso: string) {
  const date = parseIsoDate(iso);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function parseIsoDate(value: string) {
  const parts = value.split("-").map(Number);
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(value);
}

export function toIsoDate(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function periodRange(key: PeriodKey, now = new Date()): { start: Date | null; end: Date | null } {
  const currentStart = startOfMonth(now);
  switch (key) {
    case "mois":
      return { start: currentStart, end: null };
    case "mois-1":
      return { start: new Date(now.getFullYear(), now.getMonth() - 1, 1), end: currentStart };
    case "3mois":
      return { start: new Date(now.getFullYear(), now.getMonth() - 2, 1), end: null };
    case "annee":
      return { start: new Date(now.getFullYear(), 0, 1), end: null };
    default:
      return { start: null, end: null };
  }
}

export function isInPeriod(isoDate: string, key: PeriodKey, now = new Date()) {
  const { start, end } = periodRange(key, now);
  const date = parseIsoDate(isoDate);
  if (start && date < start) return false;
  if (end && date >= end) return false;
  return true;
}

export function formatPercent(value: number) {
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toFixed(1).replace(".0", "")} %`;
}