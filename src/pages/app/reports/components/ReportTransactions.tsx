import { useState } from "react";
import { formatDateFr, formatMoney, getExpenseCategory, getIncomeType } from "@/lib/finance";
import type { MonthReport } from "@/lib/reports";

type ReportTransactionsProps = {
  report: MonthReport;
  devise: string;
};

type TabKey = "toutes" | "revenus" | "depenses";

export default function ReportTransactions({ report, devise }: ReportTransactionsProps) {
  const [tab, setTab] = useState<TabKey>("toutes");

  const rows = [
    ...report.income.map((row) => ({
      id: `in-${row.id}`,
      date: row.date,
      label: row.source || "Revenu",
      meta: getIncomeType(row.type),
      amount: Number(row.montant) || 0,
      kind: "revenu" as const,
    })),
    ...report.expenses.map((row) => ({
      id: `out-${row.id}`,
      date: row.date,
      label: row.description || "Dépense",
      meta: getExpenseCategory(row.categorie),
      amount: Number(row.montant) || 0,
      kind: "depense" as const,
    })),
  ]
    .filter((row) => (tab === "toutes" ? true : tab === "revenus" ? row.kind === "revenu" : row.kind === "depense"))
    .sort((a, b) => b.date.localeCompare(a.date));

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "toutes", label: "Tout", count: report.transactionCount },
    { key: "revenus", label: "Revenus", count: report.income.length },
    { key: "depenses", label: "Dépenses", count: report.expenses.length },
  ];

  return (
    <section className="flex h-full flex-col rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Détail des opérations
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">
            Toutes les lignes du mois, prêtes pour l'export.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-background-100 p-1">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`cursor-pointer whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                tab === item.key
                  ? "bg-background-50 text-foreground-950"
                  : "text-foreground-500 hover:text-foreground-800"
              }`}
            >
              {item.label}
              <span className="ml-1 text-[10px] font-medium text-foreground-400">{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 flex flex-1 items-center justify-center rounded-md border border-dashed border-background-300 px-4 py-10 text-center">
          <div>
            <i className="ri-file-list-3-line text-xl text-foreground-300" />
            <p className="mt-2 text-xs leading-relaxed text-foreground-500">
              Aucune opération pour ce filtre.
            </p>
          </div>
        </div>
      ) : (
        <div className="no-scrollbar mt-3 max-h-[320px] flex-1 overflow-y-auto overflow-x-hidden">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-background-50">
              <tr className="border-b border-background-200">
                <th className="hidden pb-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400 sm:table-cell">
                  Date
                </th>
                <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
                  Libellé
                </th>
                <th className="hidden pb-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400 sm:table-cell">
                  Catégorie
                </th>
                <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-background-200/70 last:border-0">
                  <td className="hidden whitespace-nowrap py-2 pr-3 text-[11px] text-foreground-500 sm:table-cell">
                    {formatDateFr(row.date)}
                  </td>
                  <td className="max-w-[150px] py-2 pr-3 text-xs font-medium text-foreground-900 sm:max-w-[180px]">
                    <span className="block truncate">{row.label}</span>
                    <span className="mt-0.5 block truncate text-[10px] font-normal text-foreground-500 sm:hidden">
                      {formatDateFr(row.date)} · {row.meta.label}
                    </span>
                  </td>
                  <td className="hidden py-2 pr-3 sm:table-cell">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-semibold text-secondary-900">
                      <i className={`${row.meta.icon} text-[10px]`} />
                      {row.meta.label}
                    </span>
                  </td>
                  <td
                    className={`whitespace-nowrap py-2 text-right text-xs font-semibold ${
                      row.kind === "revenu" ? "text-primary-700" : "text-foreground-900"
                    }`}
                  >
                    {row.kind === "revenu" ? "+ " : "− "}
                    {formatMoney(row.amount, devise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}