import { formatMoney, getExpenseCategory, getIncomeType, parseIsoDate } from "@/lib/finance";

export type ReportIncomeRow = {
  id: string;
  source: string;
  montant: number;
  date: string;
  type: string;
};

export type ReportExpenseRow = {
  id: string;
  description: string;
  montant: number;
  date: string;
  categorie: string;
};

export type MonthOption = {
  key: string;
  label: string;
  shortLabel: string;
  year: number;
  date: Date;
};

export type ReportTotals = {
  revenus: number;
  depenses: number;
  solde: number;
  tauxEpargne: number;
};

export type ReportSlice = {
  value: string;
  label: string;
  icon: string;
  amount: number;
  percent: number;
};

export type ReportInsight = {
  icon: string;
  title: string;
  text: string;
  tone: "good" | "watch" | "risk" | "neutral";
};

export type TrendPoint = {
  key: string;
  label: string;
  revenus: number;
  depenses: number;
  solde: number;
};

export type MonthReport = {
  month: MonthOption;
  previousMonth: MonthOption;
  totals: ReportTotals;
  previousTotals: ReportTotals;
  deltas: { revenus: number | null; depenses: number | null; solde: number | null };
  categories: ReportSlice[];
  sources: ReportSlice[];
  income: ReportIncomeRow[];
  expenses: ReportExpenseRow[];
  trends: TrendPoint[];
  insights: ReportInsight[];
  transactionCount: number;
};

export function monthKeyOf(iso: string): string {
  const date = parseIsoDate(iso);
  return monthKeyOfDate(date);
}

export function monthKeyOfDate(date: Date): string {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
}

export function keyToMonthOption(key: string): MonthOption {
  const [yearPart, monthPart] = key.split("-");
  const year = Number(yearPart) || new Date().getFullYear();
  const date = new Date(year, (Number(monthPart) || 1) - 1, 1);
  const long = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const short = date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");
  return {
    key,
    label: long.charAt(0).toUpperCase() + long.slice(1),
    shortLabel: short,
    year,
    date,
  };
}

/** Months of the last `span` months, merged with months holding real data. */
export function buildMonthOptions(
  income: ReportIncomeRow[],
  expenses: ReportExpenseRow[],
  span = 12,
): MonthOption[] {
  const now = new Date();
  const keys = new Set<string>();

  Array.from({ length: span }, (_, index) =>
    monthKeyOfDate(new Date(now.getFullYear(), now.getMonth() - index, 1)),
  ).forEach((key) => keys.add(key));

  income.forEach((row) => keys.add(monthKeyOf(row.date)));
  expenses.forEach((row) => keys.add(monthKeyOf(row.date)));

  return Array.from(keys)
    .sort()
    .reverse()
    .map(keyToMonthOption);
}

export function previousMonthKey(key: string): string {
  const month = keyToMonthOption(key);
  return monthKeyOfDate(new Date(month.date.getFullYear(), month.date.getMonth() - 1, 1));
}

function computeTotals(income: ReportIncomeRow[], expenses: ReportExpenseRow[]): ReportTotals {
  const revenus = income.reduce((total, row) => total + (Number(row.montant) || 0), 0);
  const depenses = expenses.reduce((total, row) => total + (Number(row.montant) || 0), 0);
  const solde = revenus - depenses;
  const tauxEpargne = revenus > 0 ? (solde / revenus) * 100 : 0;
  return { revenus, depenses, solde, tauxEpargne };
}

function change(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

function buildSlices(
  entries: { key: string; label: string; icon: string; amount: number }[],
  total: number,
): ReportSlice[] {
  const grouped = new Map<string, ReportSlice>();

  entries.forEach((entry) => {
    const existing = grouped.get(entry.key);
    if (existing) {
      existing.amount += entry.amount;
      return;
    }
    grouped.set(entry.key, {
      value: entry.key,
      label: entry.label,
      icon: entry.icon,
      amount: entry.amount,
      percent: 0,
    });
  });

  return Array.from(grouped.values())
    .map((slice) => ({
      ...slice,
      amount: Math.round(slice.amount),
      percent: total > 0 ? (slice.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function buildTrends(
  month: MonthOption,
  income: ReportIncomeRow[],
  expenses: ReportExpenseRow[],
  span = 6,
): TrendPoint[] {
  const months = Array.from({ length: span }, (_, index) =>
    new Date(month.date.getFullYear(), month.date.getMonth() - (span - 1 - index), 1),
  );

  return months.map((date) => {
    const key = monthKeyOfDate(date);
    const revenus = income
      .filter((row) => monthKeyOf(row.date) === key)
      .reduce((total, row) => total + (Number(row.montant) || 0), 0);
    const depenses = expenses
      .filter((row) => monthKeyOf(row.date) === key)
      .reduce((total, row) => total + (Number(row.montant) || 0), 0);

    return {
      key,
      label: date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""),
      revenus: Math.round(revenus),
      depenses: Math.round(depenses),
      solde: Math.round(revenus - depenses),
    };
  });
}

function buildInsights(
  month: MonthOption,
  totals: ReportTotals,
  previousTotals: ReportTotals,
  categories: ReportSlice[],
  expenses: ReportExpenseRow[],
  devise: string,
): ReportInsight[] {
  const insights: ReportInsight[] = [];

  if (totals.revenus === 0 && totals.depenses === 0) {
    insights.push({
      icon: "ri-inbox-line",
      title: "Mois sans mouvement enregistré",
      text: `Aucune entrée ni sortie n'a été saisie pour ${month.label.toLowerCase()}. Ajoutez vos opérations pour obtenir une synthèse exploitable.`,
      tone: "neutral",
    });
    return insights;
  }

  if (totals.solde >= 0) {
    insights.push({
      icon: "ri-safe-2-line",
      title: `Solde positif de ${formatMoney(totals.solde, devise)}`,
      text:
        totals.revenus > 0
          ? `Vous avez conservé ${Math.round(totals.tauxEpargne)} % de vos revenus. C'est cette marge qui finance vos objectifs et vos projets.`
          : "Vous avez enregistré des dépenses sans revenu ce mois-ci : vérifiez que tous vos revenus sont bien saisis.",
      tone: totals.tauxEpargne >= 15 ? "good" : "watch",
    });
  } else {
    insights.push({
      icon: "ri-error-warning-line",
      title: `Déficit de ${formatMoney(Math.abs(totals.solde), devise)}`,
      text: `Vos dépenses dépassent vos revenus de ${Math.round(Math.abs(totals.tauxEpargne))} %. Identifiez le poste le plus lourd avant d'ajouter une nouvelle dépense.`,
      tone: "risk",
    });
  }

  if (categories.length > 0 && categories[0].amount > 0) {
    insights.push({
      icon: categories[0].icon,
      title: `Premier poste : ${categories[0].label}`,
      text: `${formatMoney(categories[0].amount, devise)} sur ${formatMoney(totals.depenses, devise)} de dépenses, soit ${Math.round(categories[0].percent)} % du total.`,
      tone: "neutral",
    });
  }

  if (previousTotals.depenses > 0) {
    const delta = change(totals.depenses, previousTotals.depenses);
    if (delta !== null) {
      const hausse = delta >= 0;
      insights.push({
        icon: hausse ? "ri-arrow-up-line" : "ri-arrow-down-line",
        title: `Dépenses ${hausse ? "en hausse" : "en baisse"} de ${Math.abs(Math.round(delta))} %`,
        text: `Elles passent de ${formatMoney(previousTotals.depenses, devise)} à ${formatMoney(totals.depenses, devise)} par rapport au mois précédent.`,
        tone: hausse ? "watch" : "good",
      });
    }
  }

  const biggest = [...expenses].sort((a, b) => (Number(b.montant) || 0) - (Number(a.montant) || 0))[0];
  if (biggest && Number(biggest.montant) > 0) {
    insights.push({
      icon: "ri-focus-3-line",
      title: "Dépense la plus importante",
      text: `${biggest.description} — ${formatMoney(Number(biggest.montant) || 0, devise)} (${biggest.categorie ? getExpenseCategory(biggest.categorie).label : "Autre"}).`,
      tone: "neutral",
    });
  }

  return insights;
}

export function buildMonthReport(
  monthKey: string,
  income: ReportIncomeRow[],
  expenses: ReportExpenseRow[],
  devise: string,
): MonthReport {
  const month = keyToMonthOption(monthKey);
  const previousKey = previousMonthKey(monthKey);
  const previousMonth = keyToMonthOption(previousKey);

  const monthIncome = income
    .filter((row) => monthKeyOf(row.date) === monthKey)
    .sort((a, b) => parseIsoDate(b.date).getTime() - parseIsoDate(a.date).getTime());
  const monthExpenses = expenses
    .filter((row) => monthKeyOf(row.date) === monthKey)
    .sort((a, b) => parseIsoDate(b.date).getTime() - parseIsoDate(a.date).getTime());

  const previousIncome = income.filter((row) => monthKeyOf(row.date) === previousKey);
  const previousExpenses = expenses.filter((row) => monthKeyOf(row.date) === previousKey);

  const totals = computeTotals(monthIncome, monthExpenses);
  const previousTotals = computeTotals(previousIncome, previousExpenses);

  const categories = buildSlices(
    monthExpenses.map((row) => {
      const meta = getExpenseCategory(row.categorie);
      return {
        key: meta.value,
        label: meta.label,
        icon: meta.icon,
        amount: Number(row.montant) || 0,
      };
    }),
    totals.depenses,
  );

  const sources = buildSlices(
    monthIncome.map((row) => {
      const meta = getIncomeType(row.type);
      return {
        key: meta.value,
        label: meta.label,
        icon: meta.icon,
        amount: Number(row.montant) || 0,
      };
    }),
    totals.revenus,
  );

  return {
    month,
    previousMonth,
    totals,
    previousTotals,
    deltas: {
      revenus: change(totals.revenus, previousTotals.revenus),
      depenses: change(totals.depenses, previousTotals.depenses),
      solde: change(totals.solde, previousTotals.solde),
    },
    categories,
    sources,
    income: monthIncome,
    expenses: monthExpenses,
    trends: buildTrends(month, income, expenses),
    insights: buildInsights(month, totals, previousTotals, categories, monthExpenses, devise),
    transactionCount: monthIncome.length + monthExpenses.length,
  };
}

export function toneClasses(tone: ReportInsight["tone"]): string {
  switch (tone) {
    case "good":
      return "bg-primary-50 text-primary-800";
    case "watch":
      return "bg-accent-50 text-accent-800";
    case "risk":
      return "bg-accent-100 text-accent-900";
    default:
      return "bg-secondary-100 text-secondary-800";
  }
}