import { projectCategories } from "@/lib/projects";

export type ProjectSortKey = "recent" | "budget-desc" | "progression-desc" | "echeance" | "priorite";

type ProjectFiltersProps = {
  statut: string;
  onStatutChange: (value: string) => void;
  categorie: string;
  onCategorieChange: (value: string) => void;
  sort: ProjectSortKey;
  onSortChange: (value: ProjectSortKey) => void;
  statusCounts: Record<string, number>;
  categorieCounts: Record<string, number>;
  total: number;
  onReset: () => void;
  hasFilters: boolean;
};

const statusTabs = [
  { value: "tous", label: "Tous", icon: "ri-list-check" },
  { value: "preparation", label: "En préparation", icon: "ri-draft-line" },
  { value: "en_cours", label: "En cours", icon: "ri-loader-3-line" },
  { value: "termine", label: "Terminés", icon: "ri-checkbox-circle-line" },
  { value: "suspendu", label: "En pause", icon: "ri-pause-circle-line" },
];

const sortOptions: { value: ProjectSortKey; label: string }[] = [
  { value: "recent", label: "Les plus récents" },
  { value: "budget-desc", label: "Budget le plus élevé" },
  { value: "progression-desc", label: "Avancement le plus fort" },
  { value: "echeance", label: "Échéance la plus proche" },
  { value: "priorite", label: "Priorité d'abord" },
];

export default function ProjectFilters({
  statut,
  onStatutChange,
  categorie,
  onCategorieChange,
  sort,
  onSortChange,
  statusCounts,
  categorieCounts,
  total,
  onReset,
  hasFilters,
}: ProjectFiltersProps) {
  return (
    <div className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full max-w-full flex-wrap items-center gap-1.5 rounded-full bg-background-100 p-1 xl:w-auto">
          {statusTabs.map((tab) => {
            const active = statut === tab.value;
            const count = statusCounts[tab.value] ?? 0;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatutChange(tab.value)}
                className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-primary-500 text-background-50"
                    : "text-foreground-600 hover:bg-background-50 hover:text-foreground-900"
                }`}
              >
                <i className={`${tab.icon} text-xs`} />
                {tab.label}
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold ${
                    active ? "bg-background-50/25 text-background-50" : "bg-background-200 text-foreground-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full min-w-0 sm:w-[230px]">
            <i className="ri-sort-desc pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-foreground-400" />
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value as ProjectSortKey)}
              aria-label="Trier les projets"
              className="box-border w-full min-w-0 cursor-pointer appearance-none rounded-md border border-background-300 bg-background-50 py-2 pl-9 pr-8 text-xs font-medium text-foreground-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <i className="ri-arrow-down-s-line pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-base text-foreground-400" />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 px-3 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-900"
            >
              <i className="ri-close-line text-sm" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
          Type de projet
        </span>
        <button
          type="button"
          onClick={() => onCategorieChange("toutes")}
          className={`cursor-pointer whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            categorie === "toutes"
              ? "border-primary-500 bg-primary-50 text-primary-800"
              : "border-background-300 bg-background-50 text-foreground-600 hover:border-primary-300 hover:bg-primary-50/60"
          }`}
        >
          Tous
          <span className="ml-1 text-[10px] font-bold text-foreground-400">{total}</span>
        </button>
        {projectCategories.map((item) => {
          const count = categorieCounts[item.value] ?? 0;
          if (count === 0) return null;
          const active = categorie === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onCategorieChange(item.value)}
              className={`inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                active
                  ? "border-primary-500 bg-primary-50 text-primary-800"
                  : "border-background-300 bg-background-50 text-foreground-600 hover:border-primary-300 hover:bg-primary-50/60"
              }`}
            >
              <i className={`${item.icon} text-[11px]`} />
              {item.label}
              <span className="text-[10px] font-bold text-foreground-400">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}