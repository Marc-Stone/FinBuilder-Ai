import {
  expenseCategories,
  periodOptions,
  type ExpenseCategory,
  type PeriodKey,
} from "@/lib/finance";

export type ExpenseSortKey = "date-desc" | "date-asc" | "montant-desc" | "montant-asc";

const sortOptions: { value: ExpenseSortKey; label: string }[] = [
  { value: "date-desc", label: "Date — plus récent" },
  { value: "date-asc", label: "Date — plus ancien" },
  { value: "montant-desc", label: "Montant — décroissant" },
  { value: "montant-asc", label: "Montant — croissant" },
];

type ExpenseFiltersProps = {
  categorie: ExpenseCategory | "toutes";
  onCategorieChange: (value: ExpenseCategory | "toutes") => void;
  period: PeriodKey;
  onPeriodChange: (value: PeriodKey) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sort: ExpenseSortKey;
  onSortChange: (value: ExpenseSortKey) => void;
  counts: Record<string, number>;
  total: number;
  onReset: () => void;
};

export default function ExpenseFilters({
  categorie,
  onCategorieChange,
  period,
  onPeriodChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  counts,
  total,
  onReset,
}: ExpenseFiltersProps) {
  const hasFilters = categorie !== "toutes" || period !== "tout" || search.trim().length > 0;

  const chips: { value: ExpenseCategory | "toutes"; label: string; icon: string; count: number }[] = [
    { value: "toutes", label: "Toutes", icon: "ri-apps-2-line", count: total },
    ...expenseCategories.map((item) => ({
      value: item.value,
      label: item.label,
      icon: item.icon,
      count: counts[item.value] ?? 0,
    })),
  ];

  return (
    <div className="rounded-lg border border-background-200 bg-background-50 p-3 md:p-4">
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => {
          const active = categorie === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => onCategorieChange(chip.value)}
              className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                active
                  ? "border-primary-500 bg-primary-500 text-background-50"
                  : "border-background-300 bg-background-50 text-foreground-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
              }`}
            >
              <i className={`${chip.icon} text-sm`} />
              {chip.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  active
                    ? "bg-background-50/20 text-background-50"
                    : "bg-background-100 text-foreground-500"
                }`}
              >
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-background-200 pt-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-foreground-400">
            <i className="ri-search-line text-base" />
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Rechercher une dépense ou une note…"
            className="box-border w-full min-w-0 rounded-md border border-background-300 bg-background-50 py-2 pl-10 pr-3.5 text-sm text-foreground-950 transition-colors placeholder:text-foreground-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 sm:w-[190px]">
            <select
              value={period}
              onChange={(event) => onPeriodChange(event.target.value as PeriodKey)}
              aria-label="Période"
              className="box-border w-full min-w-0 cursor-pointer appearance-none rounded-md border border-background-300 bg-background-50 py-2 pl-9 pr-8 text-sm text-foreground-950 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <i className="ri-calendar-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
            <i className="ri-arrow-down-s-line pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-base text-foreground-400" />
          </div>

          <div className="relative min-w-0 sm:w-[210px]">
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value as ExpenseSortKey)}
              aria-label="Trier"
              className="box-border w-full min-w-0 cursor-pointer appearance-none rounded-md border border-background-300 bg-background-50 py-2 pl-9 pr-8 text-sm text-foreground-950 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <i className="ri-sort-desc pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
            <i className="ri-arrow-down-s-line pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-base text-foreground-400" />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 px-3 py-2 text-xs font-semibold text-foreground-600 transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-800"
            >
              <i className="ri-filter-off-line text-sm" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}