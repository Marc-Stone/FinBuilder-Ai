import { formatMoney, getExpenseCategory } from "@/lib/finance";

type BreakdownRow = {
  categorie: string;
  montant: number;
  count: number;
};

type CategoryBreakdownProps = {
  rows: BreakdownRow[];
  total: number;
  devise: string;
};

export default function CategoryBreakdown({ rows, total, devise }: CategoryBreakdownProps) {
  const sorted = [...rows].sort((a, b) => b.montant - a.montant);

  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Répartition par catégorie
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">
            Où part réellement votre argent sur la période sélectionnée.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-background-300 bg-background-100 px-2.5 py-1 text-[11px] font-semibold text-foreground-700">
          <i className="ri-arrow-up-line text-[11px] text-accent-700" />
          {formatMoney(total, devise)}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-background-300 bg-background-100/60 px-4 py-8 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-background-200 text-foreground-500">
            <i className="ri-pie-chart-2-line text-lg" />
          </span>
          <p className="mt-2.5 text-xs font-semibold text-foreground-800">
            Pas encore de répartition
          </p>
          <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-foreground-500">
            Enregistrez une première dépense pour visualiser la part de chaque poste.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3.5 lg:grid-cols-2">
          {sorted.map((row) => {
            const meta = getExpenseCategory(row.categorie);
            const part = total > 0 ? (row.montant / total) * 100 : 0;
            return (
              <article key={row.categorie} className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${meta.bubble}`}
                  >
                    <i className={`${meta.icon} text-sm`} />
                  </span>
                  <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-foreground-900">{meta.label}</p>
                    <p className="shrink-0 text-xs font-semibold text-foreground-950">
                      {formatMoney(row.montant, devise)}
                    </p>
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-2 pl-[38px]">
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-background-200">
                    <div
                      className={`h-full rounded-full ${meta.bar} transition-all duration-700`}
                      style={{ width: `${Math.max(part, 2)}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-[10px] font-medium text-foreground-500">
                    {part.toFixed(1)} % · {row.count}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}