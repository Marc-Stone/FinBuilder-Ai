import { formatMoney, getExpenseCategory } from "@/lib/finance";
import { budgetGroups, DEFAULT_BUDGET_RULE, type BudgetLine, type BudgetRule } from "@/lib/budget";

type BudgetTableProps = {
  lines: BudgetLine[];
  devise: string;
  rule?: BudgetRule;
};

export default function BudgetTable({ lines, devise, rule = DEFAULT_BUDGET_RULE }: BudgetTableProps) {
  const visible = lines.filter((line) => line.recommande > 0 || line.reel > 0);

  return (
    <section className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
      <div className="flex flex-col gap-1 border-b border-background-200 px-4 py-3.5 md:px-5">
        <h2
          className="text-sm font-semibold text-foreground-950 md:text-base"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Répartition recommandée détaillée
        </h2>
        <p className="text-xs text-foreground-500">
          Le montant idéal par poste, comparé à ce que vous avez réellement dépensé ce mois-ci.
        </p>
      </div>

      <div className="hidden items-center gap-4 bg-background-100/70 px-4 py-2.5 md:flex md:px-5">
        <p className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
          Poste de dépense
        </p>
        <p className="w-[130px] shrink-0 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
          Recommandé
        </p>
        <p className="w-[130px] shrink-0 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
          Réel
        </p>
        <p className="w-[130px] shrink-0 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
          Écart
        </p>
      </div>

      <ul className="divide-y divide-background-200">
        {budgetGroups.map((group) => {
          const groupLines = visible.filter((line) => line.group === group.key);
          if (groupLines.length === 0) return null;

          return (
            <li key={group.key} className="bg-background-50">
              <div className="flex items-center gap-2 bg-background-100/60 px-4 py-2 md:px-5">
                <span className={`flex h-5 w-5 items-center justify-center rounded ${group.tone}`}>
                  <i className={`${group.icon} text-xs`} />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground-600">
                  {group.label} ·{" "}
                  {rule === "80-20" && group.key !== "epargne"
                    ? `${group.percent} % · dans le bloc 80 %`
                    : `${group.percent} %`}
                </p>
              </div>

              <ul className="divide-y divide-background-200/70">
                {groupLines.map((line) => {
                  const meta = getExpenseCategory(line.categorie);
                  const fill =
                    line.recommande > 0
                      ? Math.min((line.reel / line.recommande) * 100, 100)
                      : line.reel > 0
                        ? 100
                        : 0;
                  const over = line.ecart > 0 && line.categorie !== "epargne";
                  const savingGap = line.categorie === "epargne" && line.ecart < 0;

                  return (
                    <li
                      key={line.categorie}
                      className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-background-100/40 md:flex-row md:items-center md:gap-4 md:px-5"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-2.5">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.bubble}`}
                        >
                          <i className={`${meta.icon} text-sm`} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-semibold text-foreground-900">
                              {meta.label}
                            </p>
                            <span className="shrink-0 text-[10px] font-medium text-foreground-400 md:hidden">
                              {line.percent} % du revenu
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-background-200">
                              <div
                                className={`h-full rounded-full ${
                                  over ? "bg-accent-500" : savingGap ? "bg-foreground-300" : meta.bar
                                } transition-all duration-700`}
                                style={{ width: `${Math.max(fill, line.reel > 0 ? 3 : 0)}%` }}
                              />
                            </div>
                            <span className="hidden w-10 shrink-0 text-right text-[10px] text-foreground-400 lg:block">
                              {line.percent} %
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-foreground-500 md:hidden">
                            Recommandé {formatMoney(line.recommande, devise)} · Réel{" "}
                            {formatMoney(line.reel, devise)}
                          </p>
                        </div>
                      </div>

                      <p className="hidden w-[130px] shrink-0 text-right text-xs font-semibold text-foreground-800 md:block">
                        {formatMoney(line.recommande, devise)}
                      </p>
                      <p className="hidden w-[130px] shrink-0 text-right text-xs font-semibold text-foreground-950 md:block">
                        {formatMoney(line.reel, devise)}
                      </p>
                      <p
                        className={`shrink-0 text-right text-xs font-semibold md:w-[130px] ${
                          line.reel === 0
                            ? "text-foreground-400"
                            : over
                              ? "text-accent-800"
                              : savingGap
                                ? "text-foreground-500"
                                : "text-primary-700"
                        }`}
                      >
                        <span className="md:hidden">Écart : </span>
                        {line.reel === 0
                          ? "—"
                          : `${line.ecart > 0 ? "+" : line.ecart < 0 ? "−" : ""}${formatMoney(
                              Math.abs(line.ecart),
                              devise,
                            )}`}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}