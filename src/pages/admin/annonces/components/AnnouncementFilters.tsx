type AnnouncementFiltersProps = {
  search: string;
  onSearch: (value: string) => void;
  statut: string;
  onStatut: (value: string) => void;
  type: string;
  onType: (value: string) => void;
  audience: string;
  onAudience: (value: string) => void;
  resultCount: number;
  isFiltered: boolean;
  onReset: () => void;
};

export default function AnnouncementFilters({
  search,
  onSearch,
  statut,
  onStatut,
  type,
  onType,
  audience,
  onAudience,
  resultCount,
  isFiltered,
  onReset,
}: AnnouncementFiltersProps) {
  const selectClass =
    "cursor-pointer rounded-md border border-background-300 bg-background-50 px-2.5 py-2 text-xs font-medium text-foreground-800 outline-none transition-colors focus:border-primary-400";

  return (
    <div className="rounded-lg border border-background-200 bg-background-50 p-3">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-foreground-400">
            <i className="ri-search-line text-sm" />
          </span>
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Rechercher un titre ou un message…"
            className="w-full rounded-md border border-background-300 bg-background-50 py-2 pl-9 pr-3 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-primary-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statut}
            onChange={(event) => onStatut(event.target.value)}
            aria-label="Filtrer par statut"
            className={selectClass}
          >
            <option value="tous">Tous les statuts</option>
            <option value="envoye">Envoyées</option>
            <option value="programme">Programmées</option>
            <option value="brouillon">Brouillons</option>
          </select>

          <select
            value={type}
            onChange={(event) => onType(event.target.value)}
            aria-label="Filtrer par type"
            className={selectClass}
          >
            <option value="tous">Tous les types</option>
            <option value="info">Information</option>
            <option value="important">Important</option>
            <option value="reussite">Bonne nouvelle</option>
            <option value="mise_a_jour">Mise à jour</option>
          </select>

          <select
            value={audience}
            onChange={(event) => onAudience(event.target.value)}
            aria-label="Filtrer par audience"
            className={selectClass}
          >
            <option value="toutes">Toutes les audiences</option>
            <option value="tous">Tous les utilisateurs</option>
            <option value="utilisateur">Ciblées</option>
          </select>

          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-background-300 px-2.5 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
            >
              <i className="ri-filter-off-line text-xs" />
              Réinitialiser
            </button>
          )}

          <span className="whitespace-nowrap rounded-full bg-background-100 px-2.5 py-1 text-[11px] font-semibold text-foreground-600">
            {resultCount} annonce{resultCount > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}