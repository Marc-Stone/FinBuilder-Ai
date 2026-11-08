import { educationCategories } from "@/lib/education";

type EducationFiltersProps = {
  search: string;
  onSearch: (value: string) => void;
  category: string;
  onCategory: (value: string) => void;
  unreadOnly: boolean;
  onToggleUnread: () => void;
  resultCount: number;
};

export default function EducationFilters({
  search,
  onSearch,
  category,
  onCategory,
  unreadOnly,
  onToggleUnread,
  resultCount,
}: EducationFiltersProps) {
  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-3.5 md:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[260px]">
            <i className="ri-search-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Rechercher une fiche…"
              className="h-11 w-full rounded-md border border-background-300 bg-background-50 pl-8 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 sm:h-9"
            />
          </div>

          <button
            type="button"
            onClick={onToggleUnread}
            aria-pressed={unreadOnly}
            className={`inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-2 text-[11px] font-semibold transition-colors sm:min-h-0 ${
              unreadOnly
                ? "border-primary-300 bg-primary-50 text-primary-800"
                : "border-background-300 text-foreground-600 hover:border-primary-200 hover:text-primary-800"
            }`}
          >
            <i className={`${unreadOnly ? "ri-filter-fill" : "ri-filter-line"} text-xs`} />
            Non lues
          </button>
        </div>

        <p className="text-[11px] font-medium text-foreground-500">
          {resultCount} fiche{resultCount > 1 ? "s" : ""}
        </p>
      </div>

      <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
        {educationCategories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onCategory(item)}
            className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              category === item
                ? "border-primary-500 bg-primary-500 text-background-50"
                : "border-background-300 bg-background-50 text-foreground-600 hover:border-primary-300 hover:text-primary-800"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}