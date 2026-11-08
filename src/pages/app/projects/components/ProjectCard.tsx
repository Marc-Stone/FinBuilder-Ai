import { formatMoney } from "@/lib/finance";
import {
  computeEtapesProgress,
  computeProjectMetrics,
  formatDaysRange,
  getProjectCategory,
  getProjectPriority,
  getProjectStatus,
  parseEtapes,
  posteTone,
  type ProjectEntry,
} from "@/lib/projects";

type ProjectCardProps = {
  project: ProjectEntry;
  devise: string;
  goalName?: string;
  onOpen: (project: ProjectEntry) => void;
  onEdit: (project: ProjectEntry) => void;
  onDelete: (project: ProjectEntry) => void;
};

export default function ProjectCard({
  project,
  devise,
  goalName,
  onOpen,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const meta = getProjectCategory(project.categorie);
  const statut = getProjectStatus(project.statut);
  const priorite = getProjectPriority(project.priorite);
  const metrics = computeProjectMetrics(project);
  const lignes = metrics.lignes;
  const etapes = parseEtapes(project.etapes);
  const etapesProgress = computeEtapesProgress(etapes);

  return (
    <article className="flex h-full flex-col rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-primary-200 md:p-5">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${meta.bubble}`}>
          <i className={`${meta.icon} text-lg`} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="min-w-0 truncate text-sm font-semibold text-foreground-950">{project.nom}</h3>
            <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${statut.tone}`}>
              {statut.label}
            </span>
            {metrics.enRetard && (
              <span className="shrink-0 rounded-full border border-accent-300 bg-accent-50 px-1.5 py-0.5 text-[10px] font-semibold text-accent-900">
                Échéance dépassée
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badge}`}>
              {meta.label}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${priorite.tone}`}>
              <i className="ri-flag-line text-[10px]" />
              {priorite.label.replace("Priorité ", "")}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-background-300 bg-background-100 px-2 py-0.5 text-[10px] font-medium text-foreground-600">
              <i className="ri-calendar-line text-[10px]" />
              {formatDaysRange(project.date_debut, project.date_fin)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(project)}
            aria-label={`Modifier ${project.nom}`}
            title="Modifier"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-background-200 text-foreground-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 lg:h-8 lg:w-8"
          >
            <i className="ri-pencil-line text-sm" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(project)}
            aria-label={`Supprimer ${project.nom}`}
            title="Supprimer"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-background-200 text-foreground-600 transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-800 lg:h-8 lg:w-8"
          >
            <i className="ri-delete-bin-line text-sm" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className="truncate text-base font-semibold text-foreground-950"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {formatMoney(metrics.depenseTotal, devise)}
            <span className="ml-1.5 text-xs font-medium text-foreground-400">
              / {formatMoney(metrics.prevuTotal, devise)}
            </span>
          </p>
          <span className="shrink-0 text-xs font-semibold text-primary-700">
            {Math.round(metrics.progression)}%
          </span>
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              metrics.termine ? "bg-primary-600" : "bg-primary-500"
            }`}
            style={{ width: `${Math.max(metrics.progression, metrics.progression > 0 ? 2 : 0)}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10px] text-foreground-400">
          Enveloppe déclarée : {formatMoney(Number(project.budget_total) || 0, devise)}
          {metrics.nonAlloue !== 0 && (
            <span className={metrics.nonAlloue < 0 ? "font-semibold text-accent-700" : "font-semibold text-foreground-600"}>
              {" · "}
              {metrics.nonAlloue > 0
                ? `${formatMoney(metrics.nonAlloue, devise)} non répartis`
                : `${formatMoney(Math.abs(metrics.nonAlloue), devise)} de dépassement`}
            </span>
          )}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="min-w-0 rounded-md bg-background-100 px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400">
            Déjà financé
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-foreground-900">
            {formatMoney(metrics.finance, devise)}
          </p>
        </div>
        <div
          className={`min-w-0 rounded-md px-2.5 py-2 ${
            metrics.enveloppeManquante > 0 ? "bg-accent-50" : "bg-primary-50"
          }`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400">
            Reste à financer
          </p>
          <p
            className={`mt-0.5 truncate text-xs font-semibold ${
              metrics.enveloppeManquante > 0 ? "text-accent-900" : "text-primary-800"
            }`}
          >
            {metrics.enveloppeManquante > 0
              ? formatMoney(metrics.enveloppeManquante, devise)
              : "Enveloppe financée"}
          </p>
        </div>
      </div>

      {project.goal_id && (
        <p className="mt-2 flex items-start gap-1.5 rounded-md border border-secondary-200 bg-secondary-100/70 px-2.5 py-1.5 text-[10px] font-semibold leading-relaxed text-secondary-900">
          <i className="ri-flag-2-line mt-0.5 text-xs" />
          <span className="min-w-0 truncate">
            Répond à {goalName ? `l'objectif « ${goalName} »` : "un objectif d'épargne"}
          </span>
        </p>
      )}

      {lignes.length > 0 ? (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
            Répartition par poste
          </p>
          <div className="mt-1.5 flex h-2.5 w-full overflow-hidden rounded-full bg-background-200">
            {lignes.map((ligne, index) => (
              <div
                key={ligne.id}
                className={`h-full ${posteTone(index)}`}
                style={{ width: `${Math.max(ligne.part, 1)}%` }}
                title={`${ligne.libelle} · ${formatMoney(ligne.prevu, devise)}`}
              />
            ))}
          </div>

          <ul className="mt-2.5 space-y-1.5">
            {lignes.slice(0, 3).map((ligne, index) => (
              <li key={ligne.id} className="flex items-center gap-2 text-[11px]">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${posteTone(index)}`} />
                <span className="min-w-0 flex-1 truncate font-medium text-foreground-700">{ligne.libelle}</span>
                <span className="shrink-0 text-foreground-400">{Math.round(ligne.part)}%</span>
                <span className="shrink-0 font-semibold text-foreground-800">
                  {formatMoney(ligne.prevu, devise)}
                </span>
              </li>
            ))}
            {lignes.length > 3 && (
              <li className="text-[10px] font-medium text-foreground-400">
                + {lignes.length - 3} autre{lignes.length - 3 > 1 ? "s" : ""} poste
                {lignes.length - 3 > 1 ? "s" : ""}
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-dashed border-background-300 bg-background-100/60 px-3 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-foreground-600">
            <i className="ri-list-check-2 text-sm text-foreground-400" />
            Budget pas encore réparti entre les postes.
          </p>
        </div>
      )}

      {etapes.length > 0 && (
        <div className="mt-3 rounded-md border border-background-200 bg-background-100/40 px-2.5 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
              Étapes du plan
            </p>
            <span className="shrink-0 text-[10px] font-semibold text-primary-700">
              {etapesProgress.termines}/{etapesProgress.total}
            </span>
          </div>
          <ul className="mt-1.5 space-y-1">
            {etapes.slice(0, 3).map((etape) => (
              <li key={etape.id} className="flex items-center gap-1.5 text-[11px]">
                <i
                  className={`text-xs ${
                    etape.statut === "termine"
                      ? "ri-checkbox-circle-fill text-primary-700"
                      : etape.statut === "en_cours"
                        ? "ri-timer-line text-accent-700"
                        : "ri-checkbox-blank-circle-line text-foreground-300"
                  }`}
                />
                <span
                  className={`min-w-0 flex-1 truncate ${
                    etape.statut === "termine"
                      ? "text-foreground-400 line-through"
                      : etape.statut === "en_cours"
                        ? "font-semibold text-accent-900"
                        : "text-foreground-700"
                  }`}
                >
                  {etape.libelle}
                </span>
              </li>
            ))}
          </ul>
          {etapes.length > 3 && (
            <p className="mt-1 text-[10px] font-medium text-foreground-400">
              + {etapes.length - 3} autre{etapes.length - 3 > 1 ? "s" : ""} étape
              {etapes.length - 3 > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      <div className="mt-auto pt-3.5">
        <button
          type="button"
          onClick={() => onOpen(project)}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-primary-300 bg-primary-50 px-3.5 py-2 text-xs font-semibold text-primary-800 transition-colors hover:bg-primary-100"
        >
          <i className="ri-folder-open-line text-sm" />
          Voir projet
        </button>
      </div>
    </article>
  );
}