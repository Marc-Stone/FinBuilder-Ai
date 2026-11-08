import { formatMoney } from "@/lib/finance";
import type { MonthReport } from "@/lib/reports";
import type { ReportPdfOptions } from "@/lib/reportPdf";

type ExportPanelProps = {
  report: MonthReport;
  devise: string;
  options: ReportPdfOptions;
  exporting: boolean;
  onToggle: (key: keyof ReportPdfOptions) => void;
  onExport: () => void;
};

const toggles: { key: keyof ReportPdfOptions; label: string; hint: string; icon: string }[] = [
  {
    key: "includeInsights",
    label: "Points clés et synthèse",
    hint: "Lecture commentée de votre mois",
    icon: "ri-sparkling-line",
  },
  {
    key: "includeBreakdown",
    label: "Répartition des dépenses",
    hint: "Montants et parts par catégorie",
    icon: "ri-pie-chart-2-line",
  },
  {
    key: "includeTransactions",
    label: "Détail des opérations",
    hint: "Chaque revenu et chaque dépense",
    icon: "ri-file-list-3-line",
  },
];

export default function ExportPanel({
  report,
  devise,
  options,
  exporting,
  onToggle,
  onExport,
}: ExportPanelProps) {
  const lines = report.transactionCount;

  return (
    <section className="rounded-lg border border-primary-200 bg-primary-50 p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-700">
            Export
          </p>
          <h2
            className="mt-1 text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Rapport PDF — {report.month.label}
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-foreground-600">
            Un document A4 prêt à partager avec votre conjoint, votre comptable ou votre banquier :
            synthèse, indicateurs, répartition par catégorie et {lines} opération{lines > 1 ? "s" : ""}{" "}
            détaillée{lines > 1 ? "s" : ""} pour {formatMoney(report.totals.depenses, devise)} de dépenses.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { icon: "ri-file-text-line", label: "Synthèse" },
              { icon: "ri-bar-chart-2-line", label: "Indicateurs" },
              { icon: "ri-shield-check-line", label: "Données réelles" },
            ].map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-background-50 px-2 py-0.5 text-[10px] font-semibold text-primary-800"
              >
                <i className={`${chip.icon} text-[10px]`} />
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full shrink-0 lg:w-[300px]">
          <ul className="space-y-1.5">
            {toggles.map((toggle) => {
              const active = options[toggle.key];
              return (
                <li key={toggle.key}>
                  <button
                    type="button"
                    onClick={() => onToggle(toggle.key)}
                    aria-pressed={active}
                    className={`flex w-full cursor-pointer items-center gap-2.5 rounded-md border px-2.5 py-2 text-left transition-colors ${
                      active
                        ? "border-primary-300 bg-background-50"
                        : "border-background-300 bg-background-50/60 hover:border-primary-200"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                        active
                          ? "border-primary-600 bg-primary-500 text-background-50"
                          : "border-background-400 bg-background-50"
                      }`}
                    >
                      {active && <i className="ri-check-line text-[10px]" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-semibold text-foreground-900">
                        {toggle.label}
                      </span>
                      <span className="block truncate text-[10px] text-foreground-400">
                        {toggle.hint}
                      </span>
                    </span>
                    <i className={`${toggle.icon} text-xs text-foreground-400`} />
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="mt-2.5 inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-wait disabled:opacity-70"
          >
            <i className={exporting ? "ri-loader-4-line animate-spin text-sm" : "ri-file-pdf-2-line text-sm"} />
            {exporting ? "Génération en cours…" : "Télécharger le rapport PDF"}
          </button>
          <p className="mt-1.5 text-center text-[10px] text-foreground-400">
            Le fichier reprend uniquement les chiffres de {report.month.label.toLowerCase()}.
          </p>
        </div>
      </div>
    </section>
  );
}