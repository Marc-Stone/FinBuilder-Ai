import ProjectCard from "@/pages/app/projects/components/ProjectCard";
import type { ProjectEntry } from "@/lib/projects";

type ProjectListProps = {
  rows: ProjectEntry[];
  devise: string;
  goalNames: Record<string, string>;
  loading: boolean;
  error: string;
  hasFilters: boolean;
  onRetry: () => void;
  onOpen: (project: ProjectEntry) => void;
  onEdit: (project: ProjectEntry) => void;
  onDelete: (project: ProjectEntry) => void;
  onAdd: () => void;
};

export default function ProjectList({
  rows,
  devise,
  goalNames,
  loading,
  error,
  hasFilters,
  onRetry,
  onOpen,
  onEdit,
  onDelete,
  onAdd,
}: ProjectListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-lg border border-background-200 bg-background-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-background-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-background-200" />
                <div className="h-2 w-1/3 animate-pulse rounded-full bg-background-200" />
              </div>
            </div>
            <div className="mt-4 h-3 w-1/2 animate-pulse rounded-full bg-background-200" />
            <div className="mt-2 h-2 w-full animate-pulse rounded-full bg-background-200" />
            <div className="mt-4 space-y-2">
              {[0, 1, 2].map((cell) => (
                <div key={cell} className="h-2 w-full animate-pulse rounded-full bg-background-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-accent-300 bg-accent-50 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-500 text-foreground-950">
            <i className="ri-error-warning-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-900">Impossible de charger vos projets</p>
            <p className="mt-1 text-xs leading-relaxed text-accent-800">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-foreground-900"
            >
              <i className="ri-refresh-line text-sm" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-background-300 bg-background-50 px-5 py-12 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <i className="ri-building-4-line text-2xl" />
        </span>
        <p className="mt-3 text-sm font-semibold text-foreground-950">
          {hasFilters ? "Aucun projet ne correspond à vos filtres" : "Aucun projet pour le moment"}
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-foreground-500">
          {hasFilters
            ? "Changez de statut ou de type de projet pour retrouver vos planifications."
            : "Construction, véhicule, mariage ou business : déclarez une enveloppe et FinBuilder la répartit par poste, avec le suivi des dépenses réelles."}
        </p>
        {!hasFilters && (
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-add-line text-base" />
            Créer mon premier projet
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          devise={devise}
          goalName={project.goal_id ? goalNames[project.goal_id] : undefined}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}