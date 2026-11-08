import { useState } from "react";
import { formatMoney } from "@/lib/finance";
import type { MonthReport } from "@/lib/reports";

type CategoryReportProps = {
  report: MonthReport;
  devise: string;
};

type TabKey = "depenses" | "revenus";

export default function CategoryReport({ report, devise }: CategoryReportProps) {
  const [tab, setTab] = useState<TabKey>("depenses");
  const slices = tab === "depenses" ? report.categories : report.sources;
  const total = tab === "depenses" ? report.totals.depenses : report.totals.revenus;

  return (
    <section className="flex h-full flex-col rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Répartition du mois
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">
            {slices.length > 0
              ? `${slices.length} ${tab === "depenses" ? "catégorie" : "source"}${slices.length > 1 ? "s" : ""} · ${formatMoney(total, devise)}`
              : "Aucune opération enregistrée"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-full bg-background-100 p-1">
          {(["depenses", "revenus"] as TabKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`cursor-pointer whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                tab === key
                  ? "bg-background-50 text-foreground-950"
                  : "text-foreground-500 hover:text-foreground-800"
              }`}
            >
              {key === "depenses" ? "Dépenses" : "Revenus"}
            </button>
          ))}
        </div>
      </div>

      {slices.length === 0 ? (
        <div className="mt-4 flex flex-1 items-center justify-center rounded-md border border-dashed border-background-300 px-4 py-8 text-center">
          <div>
            <i className="ri-pie-chart-line text-xl text-foreground-300" />
            <p className="mt-2 text-xs leading-relaxed text-foreground-500">
              Rien à afficher pour ce mois.
            </p>
          </div>
        </div>
      ) : (
        <ul className="mt-4 flex-1 space-y-3">
          {slices.slice(0, 7).map((slice) => (
            <li key={slice.value}>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-800">
                  <i className={`${slice.icon} text-xs`} />
                </span>
                <p className="min-w-0 flex-1 truncate text-xs font-medium text-foreground-800">
                  {slice.label}
                </p>
                <p className="shrink-0 text-xs font-semibold text-foreground-950">
                  {formatMoney(slice.amount, devise)}
                </p>
              </div>
              <div className="mt-1.5 flex items-center gap-2 pl-8">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background-100">
                  <div
                    className={`h-full rounded-full ${
                      tab === "depenses" ? "bg-accent-500" : "bg-primary-500"
                    }`}
                    style={{ width: `${Math.max(Math.min(slice.percent, 100), 2)}%` }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-[10px] font-semibold text-foreground-400">
                  {Math.round(slice.percent)} %
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}