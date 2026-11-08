import GoalCard from "@/pages/app/goals/components/GoalCard";
import type { GoalEntry } from "@/lib/goals";

type GoalListProps = {
  rows: GoalEntry[];
  devise: string;
  capacite: number;
  projects: Record<string, { nom: string; progression: number }>;
  loading: boolean;
  error: string;
  hasFilters: boolean;
  onRetry: () => void;
  onEdit: (goal: GoalEntry) => void;
  onDeposit: (goal: GoalEntry) => void;
  onDelete: (goal: GoalEntry) => void;
  onAdd: () => void;
};

export default function GoalList({
  rows,
  devise,
  capacite,
  projects,
  loading,
  error,
  hasFilters,
  onRetry,
  onEdit,
  onDeposit,
  onDelete,
  onAdd,
}: GoalListProps) {
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
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {[0, 1, 2, 3].map((cell) => (
                <div key={cell} className="h-12 animate-pulse rounded-md bg-background-100" />
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
            <p className="text-sm font-semibold text-accent-900">Impossible de charger vos objectifs</p>
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
          <i className="ri-flag-2-line text-2xl" />
        </span>
        <p className="mt-3 text-sm font-semibold text-foreground-950">
          {hasFilters ? "Aucun objectif ne correspond à vos filtres" : "Aucun objectif pour le moment"}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-foreground-500">
          {hasFilters
            ? "Changez de statut ou de catégorie pour retrouver vos projets d'épargne."
            : "Maison, voiture, mariage : fixez une destination et FinBuilder calcule l'épargne mensuelle nécessaire. Le budget détaillé se gère ensuite dans un projet."}
        </p>
        {!hasFilters && (
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-add-line text-base" />
            Créer mon premier objectif
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          devise={devise}
          capacite={capacite}
          project={projects[goal.id]}
          onEdit={onEdit}
          onDeposit={onDeposit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}