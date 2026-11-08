type UserFiltersProps = {
  search: string;
  onSearch: (value: string) => void;
  role: string;
  onRole: (value: string) => void;
  country: string;
  onCountry: (value: string) => void;
  countries: string[];
  sort: string;
  onSort: (value: string) => void;
  resultCount: number;
  onReset: () => void;
};

export default function UserFilters({
  search,
  onSearch,
  role,
  onRole,
  country,
  onCountry,
  countries,
  sort,
  onSort,
  resultCount,
  onReset,
}: UserFiltersProps) {
  const isFiltered = search !== "" || role !== "tous" || country !== "tous";

  return (
    <div className="rounded-lg border border-background-200 bg-background-50 p-3 md:p-4">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <i className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Rechercher un nom, un email, un téléphone…"
            className="w-full rounded-md border border-background-300 bg-background-50 py-2 pl-9 pr-3 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-primary-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={role}
            onChange={(event) => onRole(event.target.value)}
            className="cursor-pointer rounded-md border border-background-300 bg-background-50 px-2.5 py-2 text-xs font-medium text-foreground-800 outline-none transition-colors focus:border-primary-400"
          >
            <option value="tous">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="user">Utilisateurs</option>
          </select>

          <select
            value={country}
            onChange={(event) => onCountry(event.target.value)}
            className="max-w-[180px] cursor-pointer rounded-md border border-background-300 bg-background-50 px-2.5 py-2 text-xs font-medium text-foreground-800 outline-none transition-colors focus:border-primary-400"
          >
            <option value="tous">Tous les pays</option>
            {countries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => onSort(event.target.value)}
            className="cursor-pointer rounded-md border border-background-300 bg-background-50 px-2.5 py-2 text-xs font-medium text-foreground-800 outline-none transition-colors focus:border-primary-400"
          >
            <option value="recent">Inscription récente</option>
            <option value="ancien">Inscription ancienne</option>
            <option value="nom">Nom (A → Z)</option>
          </select>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background-100 px-2.5 py-1 text-[11px] font-semibold text-foreground-700">
          <i className="ri-filter-3-line text-[11px] text-primary-600" />
          {resultCount} compte(s) affiché(s)
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