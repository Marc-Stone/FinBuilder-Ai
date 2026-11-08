import { formatDateFr, formatMoney } from "@/lib/finance";
import {
  computeGoalProgress,
  feasibility,
  formatMonths,
  getGoalCategory,
  getGoalPriority,
  type GoalEntry,
} from "@/lib/goals";

type GoalCardProps = {
  goal: GoalEntry;
  devise: string;
  capacite: number;
  project?: { nom: string; progression: number };
  onEdit: (goal: GoalEntry) => void;
  onDeposit: (goal: GoalEntry) => void;
  onDelete: (goal: GoalEntry) => void;
};

const statusBadges: Record<string, { label: string; tone: string }> = {
  actif: { label: "En cours", tone: "border-primary-200 bg-primary-50 text-primary-800" },
  atteint: { label: "Atteint", tone: "border-primary-300 bg-primary-100 text-primary-900" },
  retard: { label: "Échéance dépassée", tone: "border-accent-300 bg-accent-50 text-accent-900" },
  sans_echeance: { label: "Sans échéance", tone: "border-background-300 bg-background-100 text-foreground-700" },
};

export default function GoalCard({
  goal,
  devise,
  capacite,
  project,
  onEdit,
  onDeposit,
  onDelete,
}: GoalCardProps) {
  const meta = getGoalCategory(goal.categorie);
  const priority = getGoalPriority(goal.priorite);
  const progress = computeGoalProgress(goal);
  const status = statusBadges[progress.statutAffiche];
  const fit = progress.atteint
    ? { level: "done", label: "Atteint", detail: "Objectif financé à 100 %." }
    : progress.epargneMensuelle > 0
      ? feasibility(progress.epargneMensuelle, capacite)
      : {
          level: "unknown",
          label: "Sans échéance",
          detail: "Ajoutez une date limite pour calculer l'effort mensuel nécessaire.",
        };

  const fitTone: Record<string, string> = {
    done: "border-primary-200 bg-primary-50 text-primary-800",
    ok: "border-primary-200 bg-primary-50 text-primary-800",
    tight: "border-accent-300 bg-accent-50 text-accent-900",
    unknown: "border-background-300 bg-background-100 text-foreground-600",
  };

  return (
    <article className="flex h-full flex-col rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-primary-200 md:p-5">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${meta.bubble}`}>
          <i className={`${meta.icon} text-lg`} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="min-w-0 truncate text-sm font-semibold text-foreground-950">
              {goal.nom}
            </h3>
            <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${status.tone}`}>
              {status.label}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badge}`}>
              {meta.label}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${priority.tone}`}>
              <i className="ri-flag-line text-[10px]" />
              {priority.label.replace("Priorité ", "")}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            aria-label={`Modifier ${goal.nom}`}
            title="Modifier"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-background-200 text-foreground-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 lg:h-8 lg:w-8"
          >
            <i className="ri-pencil-line text-sm" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal)}
            aria-label={`Supprimer ${goal.nom}`}
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
            {formatMoney(Number(goal.montant_actuel), devise)}
            <span className="ml-1.5 text-xs font-medium text-foreground-400">
              / {formatMoney(Number(goal.montant_objectif), devise)}
            </span>
          </p>
          <span className="shrink-0 text-xs font-semibold text-primary-700">
            {Math.round(progress.progression)}%
          </span>
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              progress.atteint ? "bg-primary-600" : meta.bar
            }`}
            style={{ width: `${Math.max(progress.progression, progress.progression > 0 ? 2 : 0)}%` }}
          />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="min-w-0 rounded-md bg-background-100 px-2.5 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400">
            Reste à financer
          </dt>
          <dd className="mt-0.5 truncate text-xs font-semibold text-foreground-900">
            {formatMoney(progress.restant, devise)}
          </dd>
        </div>
        <div className="min-w-0 rounded-md bg-background-100 px-2.5 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400">
            Épargne / mois
          </dt>
          <dd className="mt-0.5 truncate text-xs font-semibold text-foreground-900">
            {progress.epargneMensuelle > 0 ? formatMoney(progress.epargneMensuelle, devise) : "—"}
          </dd>
        </div>
        <div className="min-w-0 rounded-md bg-background-100 px-2.5 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400">
            Échéance
          </dt>
          <dd className="mt-0.5 truncate text-xs font-semibold text-foreground-900">
            {goal.date_limite ? formatDateFr(goal.date_limite) : "Libre"}
          </dd>
        </div>
        <div className="min-w-0 rounded-md bg-background-100 px-2.5 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400">
            Temps restant
          </dt>
          <dd className="mt-0.5 truncate text-xs font-semibold text-foreground-900">
            {formatMonths(progress.moisRestants)}
          </dd>
        </div>
      </dl>

      <p
        className={`mt-3 flex items-start gap-1.5 rounded-md border px-2.5 py-2 text-[11px] leading-relaxed ${fitTone[fit.level]}`}
      >
        <i className="ri-information-line mt-0.5 text-xs" />
        <span>
          <span className="font-semibold">{fit.label}</span> — {fit.detail}
        </span>
      </p>

      {project && (
        <div className="mt-2 rounded-md border border-secondary-200 bg-secondary-100/70 px-2.5 py-2">
          <div className="flex items-center gap-1.5">
            <i className="ri-link-m text-xs text-secondary-800" />
            <p className="min-w-0 flex-1 truncate text-[10px] font-semibold text-secondary-900">
              Projet « {project.nom} »
            </p>
            <span className="shrink-0 text-[10px] font-semibold text-secondary-900">
              {project.progression}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary-200/80">
            <div
              className="h-full rounded-full bg-secondary-600 transition-all duration-500"
              style={{
                width: `${Math.max(project.progression, project.progression > 0 ? 3 : 0)}%`,
              }}
            />
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-secondary-900/70">
            Votre projet associé avance à {project.progression}%.
          </p>
        </div>
      )}

      {goal.note && (
        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-foreground-500">{goal.note}</p>
      )}

      <div className="mt-auto pt-3.5">
        <button
          type="button"
          onClick={() => onDeposit(goal)}
          disabled={progress.atteint}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-background-200 disabled:text-foreground-500"
        >
          <i className={progress.atteint ? "ri-checkbox-circle-line text-sm" : "ri-add-line text-sm"} />
          {progress.atteint ? "Objectif atteint" : "Enregistrer une épargne"}
        </button>
      </div>
    </article>
  );
}