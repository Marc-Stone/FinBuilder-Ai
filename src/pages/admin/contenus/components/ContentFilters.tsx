import { CONTENT_CATEGORIES, CONTENT_STATUS_LABELS } from "@/lib/content";

const statusOptions = ["tous", "publie", "brouillon", "archive"];

type ContentFiltersProps = {
  search: string;
  onSearch: (value: string) => void;
  statut: string;
  onStatut: (value: string) => void;
  categorie: string;
  onCategorie: (value: string) => void;
  resultCount: number;
  onReset: () => void;
  isFiltered: boolean;
};

export default function ContentFilters({
  search,
  onSearch,
  statut,
  onStatut,
  categorie,
  onCategorie,
  resultCount,
  onReset,
  isFiltered,
}: ContentFiltersProps) {
  return (
    <div className="rounded-lg border border-background-200 bg-background-50 p-3 md:p-4">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <i className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Rechercher une fiche par titre, résumé, catégorie…"
            className="w-full rounded-md border border-background-300 bg-background-50 py-2 pl-9 pr-3 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-primary-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statut}
            onChange={(event) => onStatut(event.target.value)}
            className="max-w-[200px] cursor-pointer rounded-md border border-background-300 bg-background-50 px-2.5 py-2 text-xs font-medium text-foreground-800 outline-none transition-colors focus:border-primary-400"
          >
            {statusOptions.map((value) => (
              <option key={value} value={value}>
                {value === "tous" ? "Tous les statuts" : CONTENT_STATUS_LABELS[value]}
              </option>
            ))}
          </select>

          <select
            value={categorie}
            onChange={(event) => onCategorie(event.target.value)}
            className="max-w-[200px] cursor-pointer rounded-md border border-background-300 bg-background-50 px-2.5 py-2 text-xs font-medium text-foreground-800 outline-none transition-colors focus:border-primary-400"
          >
            <option value="toutes">Toutes les catégories</option>
            {CONTENT_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background-100 px-2.5 py-1 text-[11px] font-semibold text-foreground-700">
          <i className="ri-filter-3-line text-[11px] text-primary-600" />
          {resultCount} fiche{resultCount > 1 ? "s" : ""} affichée{resultCount > 1 ? "s" : ""}
        </span>
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-background-300 px-2.5 py-1 text-[11px] font-semibold text-foreground-600 transition-colors hover:border-primary-300 hover:text-primary-800"
          >
            <i className="ri-close-line text-[11px]" />
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}