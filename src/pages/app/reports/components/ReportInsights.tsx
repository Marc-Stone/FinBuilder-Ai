import { formatMoney, getExpenseCategory, getIncomeType } from "@/lib/finance";
import type { MonthReport, ReportInsight } from "@/lib/reports";
import { toneClasses } from "@/lib/reports";

type ReportInsightsProps = {
  report: MonthReport;
  devise: string;
};

function InsightRow({ insight }: { insight: ReportInsight }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${toneClasses(insight.tone)}`}>
        <i className={`${insight.icon} text-xs`} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground-900">{insight.title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">{insight.text}</p>
      </div>
    </li>
  );
}

export default function ReportInsights({ report, devise }: ReportInsightsProps) {
  const top = report.expenses.slice(0, 3);

  return (
    <section className="flex h-full flex-col rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Synthèse du mois
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">
            Lecture automatique de vos chiffres de {report.month.label.toLowerCase()}.
          </p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
          <i className="ri-sparkling-line text-base" />
        </span>
      </div>

      <p className="mt-3 rounded-md bg-background-100 px-3 py-2.5 text-[11px] leading-relaxed text-foreground-700">
        {report.totals.revenus > 0
          ? `Sur ${formatMoney(report.totals.revenus, devise)} encaissés, ${formatMoney(
              report.totals.depenses,
              devise,
            )} ont été dépensés. ${
              report.totals.solde >= 0
                ? `Il reste ${formatMoney(report.totals.solde, devise)}, soit ${Math.round(report.totals.tauxEpargne)} % de vos revenus.`
                : `Le mois se termine avec ${formatMoney(Math.abs(report.totals.solde), devise)} de déficit.`
            }`
          : "Aucun revenu n'est enregistré pour ce mois : la synthèse sera complète dès votre première entrée."}
      </p>

      <ul className="mt-3.5 space-y-3">
        {report.insights.map((insight) => (
          <InsightRow key={`${insight.title}-${insight.icon}`} insight={insight} />
        ))}
      </ul>

      {top.length > 0 && (
        <div className="mt-4 border-t border-background-200 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
            Trois plus grosses dépenses
          </p>
          <ul className="mt-2 space-y-1.5">
            {top.map((row) => {
              const meta = getExpenseCategory(row.categorie);
              return (
                <li key={row.id} className="flex items-center gap-2">
                  <i className={`${meta.icon} text-xs text-foreground-400`} />
                  <p className="min-w-0 flex-1 truncate text-[11px] text-foreground-700">
                    {row.description}
                  </p>
                  <p className="shrink-0 text-[11px] font-semibold text-foreground-900">
                    {formatMoney(Number(row.montant) || 0, devise)}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {report.sources.length > 0 && (
        <div className="mt-4 border-t border-background-200 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
            Origine des revenus
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {report.sources.map((source) => (
              <span
                key={source.value}
                className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-semibold text-secondary-900"
              >
                <i className={`${getIncomeType(source.value).icon} text-[10px]`} />
                {source.label} · {Math.round(source.percent)} %
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}