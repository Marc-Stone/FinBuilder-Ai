import { formatMoney, formatPercent } from "@/lib/finance";
import type { MonthReport } from "@/lib/reports";

type ReportKpisProps = {
  report: MonthReport;
  devise: string;
};

type Kpi = {
  label: string;
  value: string;
  icon: string;
  tone: string;
  delta: number | null;
  deltaLabel: string;
  invertDelta: boolean;
  hint: string;
};

export default function ReportKpis({ report, devise }: ReportKpisProps) {
  const previousLabel = report.previousMonth.shortLabel;

  const kpis: Kpi[] = [
    {
      label: "Revenus du mois",
      value: formatMoney(report.totals.revenus, devise),
      icon: "ri-arrow-down-line",
      tone: "bg-primary-50 text-primary-700",
      delta: report.deltas.revenus,
      deltaLabel: `vs ${previousLabel}`,
      invertDelta: false,
      hint: `${report.income.length} ${report.income.length > 1 ? "entrées" : "entrée"}`,
    },
    {
      label: "Dépenses du mois",
      value: formatMoney(report.totals.depenses, devise),
      icon: "ri-arrow-up-line",
      tone: "bg-accent-50 text-accent-700",
      delta: report.deltas.depenses,
      deltaLabel: `vs ${previousLabel}`,
      invertDelta: true,
      hint: `${report.expenses.length} ${report.expenses.length > 1 ? "sorties" : "sortie"}`,
    },
    {
      label: "Solde net",
      value: formatMoney(report.totals.solde, devise),
      icon: "ri-scales-3-line",
      tone:
        report.totals.solde >= 0
          ? "bg-secondary-100 text-secondary-800"
          : "bg-accent-100 text-accent-900",
      delta: report.deltas.solde,
      deltaLabel: `vs ${previousLabel}`,
      invertDelta: false,
      hint: report.totals.solde >= 0 ? "Revenus − dépenses" : "Dépenses supérieures aux revenus",
    },
    {
      label: "Taux d'épargne",
      value: `${Math.round(report.totals.tauxEpargne)} %`,
      icon: "ri-percent-line",
      tone: "bg-primary-100 text-primary-800",
      delta: null,
      deltaLabel: "",
      invertDelta: false,
      hint:
        report.totals.tauxEpargne >= 20
          ? "Au-dessus de la cible de 20 %"
          : report.totals.revenus > 0
            ? "Cible recommandée : 20 %"
            : "Aucun revenu enregistré",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const positive = kpi.delta !== null && (kpi.invertDelta ? kpi.delta <= 0 : kpi.delta >= 0);
        return (
          <article
            key={kpi.label}
            className="rounded-lg border border-background-200 bg-background-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-foreground-500">
                {kpi.label}
              </p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${kpi.tone}`}>
                <i className={`${kpi.icon} text-base`} />
              </span>
            </div>

            <p
              className="mt-2.5 truncate text-lg font-semibold text-foreground-950 md:text-xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {kpi.value}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {kpi.delta !== null && (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    positive ? "bg-primary-50 text-primary-800" : "bg-accent-50 text-accent-800"
                  }`}
                >
                  <i className={`${kpi.delta >= 0 ? "ri-arrow-up-line" : "ri-arrow-down-line"} text-[10px]`} />
                  {formatPercent(kpi.delta)}
                </span>
              )}
              <span className="text-[10px] text-foreground-400">
                {kpi.delta !== null ? kpi.deltaLabel : kpi.hint}
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}