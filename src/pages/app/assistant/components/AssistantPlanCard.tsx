import { Link } from "react-router-dom";
import { formatDateFr, formatMoney } from "@/lib/finance";
import { getGoalCategory } from "@/lib/goals";
import { getProjectCategory } from "@/lib/projects";
import {
  deadlineFromMonths,
  draftEtapes,
  draftMonthlyEffort,
  draftPostesPreview,
  type AssistantDraft,
} from "@/lib/assistant";

type AssistantPlanCardProps = {
  draft: AssistantDraft;
  devise: string;
  capacity: number;
  onChange: (patch: Partial<AssistantDraft>) => void;
  onCreateGoal: () => void;
  onCreateProject: () => void;
  onCreateAll: () => void;
};

const monthOptions = [6, 12, 24, 36, 60];

function toNumber(raw: string) {
  const value = Number(raw.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(value) ? value : 0;
}

export default function AssistantPlanCard({
  draft,
  devise,
  capacity,
  onChange,
  onCreateGoal,
  onCreateProject,
  onCreateAll,
}: AssistantPlanCardProps) {
  const goalMeta = getGoalCategory(draft.goalCategorie);
  const projectMeta = getProjectCategory(draft.projectCategorie);
  const effort = draftMonthlyEffort(draft);
  const remaining = Math.max(draft.target - draft.saved, 0);
  const busy = draft.status === "saving";
  const goalReady = Boolean(draft.goalId);
  const done = draft.status === "done";
  const postes = draftPostesPreview(draft);
  const etapes = draftEtapes(draft);

  const setMonths = (months: number) => {
    const safe = Math.max(1, Math.min(Math.round(months) || 1, 480));
    onChange({ months: safe, dateLimite: deadlineFromMonths(safe) });
  };

  return (
    <div className="mt-3 rounded-lg border border-background-200 bg-background-50 p-3.5 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
          <i className="ri-sparkling-2-line text-sm text-secondary-700" />
          Plan proposé
        </p>
        <span className="shrink-0 rounded-full border border-secondary-200 bg-secondary-100 px-2 py-0.5 text-[10px] font-semibold text-secondary-900">
          Objectif → Projet
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="min-w-0 rounded-md border border-accent-200 bg-accent-50/70 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-background-50 text-accent-700">
              <i className="ri-flag-2-line text-xs" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-900">
              1 · Objectif
            </p>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs font-semibold text-foreground-950">
            {draft.goalNom}
          </p>
          <p className="mt-0.5 text-[10px] text-foreground-500">
            {goalMeta.label} · échéance {formatDateFr(draft.dateLimite)}
          </p>
          {draft.goalId ? (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-800">
              <i className="ri-checkbox-circle-line text-[10px]" />
              Enregistré dans Objectifs
            </p>
          ) : (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-background-50 px-2 py-0.5 text-[10px] font-medium text-foreground-500">
              <i className="ri-time-line text-[10px]" />
              Pas encore créé
            </p>
          )}
        </div>

        <div className="min-w-0 rounded-md border border-primary-200 bg-primary-50/70 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-background-50 text-primary-700">
              <i className="ri-building-4-line text-xs" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-900">
              2 · Projet
            </p>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs font-semibold text-foreground-950">
            {draft.projectNom}
          </p>
          <p className="mt-0.5 text-[10px] text-foreground-500">
            {projectMeta.label} · {etapes.length} étapes prévues
          </p>
          {draft.projectId ? (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-800">
              <i className="ri-checkbox-circle-line text-[10px]" />
              Enregistré dans Projets
            </p>
          ) : (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-background-50 px-2 py-0.5 text-[10px] font-medium text-foreground-500">
              <i className="ri-route-line text-[10px]" />
              {goalReady ? "Prêt à être créé" : "Créé avec l'objectif"}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="min-w-0">
          <label
            htmlFor={`cible-${draft.key}`}
            className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-500"
          >
            Montant cible ({devise})
          </label>
          <input
            id={`cible-${draft.key}`}
            type="text"
            inputMode="decimal"
            value={draft.target > 0 ? String(draft.target) : ""}
            disabled={busy || goalReady}
            onChange={(event) =>
              onChange({ target: Math.max(toNumber(event.target.value), 0) })
            }
            className="box-border w-full min-w-0 rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-xs font-semibold text-foreground-950 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:bg-background-100 disabled:text-foreground-500"
          />
        </div>
        <div className="min-w-0">
          <label
            htmlFor={`epargne-${draft.key}`}
            className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-500"
          >
            Déjà épargné ({devise})
          </label>
          <input
            id={`epargne-${draft.key}`}
            type="text"
            inputMode="decimal"
            value={draft.saved > 0 ? String(draft.saved) : ""}
            placeholder="0"
            disabled={busy || goalReady}
            onChange={(event) =>
              onChange({ saved: Math.max(toNumber(event.target.value), 0) })
            }
            className="box-border w-full min-w-0 rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-xs font-semibold text-foreground-950 transition-colors placeholder:text-foreground-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:bg-background-100 disabled:text-foreground-500"
          />
        </div>
        <div className="min-w-0">
          <label
            htmlFor={`duree-${draft.key}`}
            className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-500"
          >
            Durée (mois)
          </label>
          <input
            id={`duree-${draft.key}`}
            type="number"
            min={1}
            max={480}
            value={draft.months}
            disabled={busy}
            onChange={(event) => setMonths(Number(event.target.value))}
            className="box-border w-full min-w-0 rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-xs font-semibold text-foreground-950 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:bg-background-100 disabled:text-foreground-500"
          />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {monthOptions.map((option) => (
          <button
            key={option}
            type="button"
            disabled={busy}
            onClick={() => setMonths(option)}
            className={`cursor-pointer whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              draft.months === option
                ? "border-primary-500 bg-primary-500 text-background-50"
                : "border-background-300 bg-background-50 text-foreground-600 hover:border-primary-300 hover:bg-primary-50"
            }`}
          >
            {option} mois
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-background-100 px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
            Effort mensuel nécessaire
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground-950">
            {formatMoney(effort, devise)}
            <span className="ml-1.5 text-[10px] font-medium text-foreground-500">
              pendant {draft.months} mois
            </span>
          </p>
        </div>
        <div className="min-w-0 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
            Reste à financer
          </p>
          <p className="mt-0.5 text-sm font-semibold text-accent-900">
            {formatMoney(remaining, devise)}
          </p>
        </div>
      </div>

      {capacity > 0 && effort > 0 && (
        <p
          className={`mt-2 flex items-start gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] leading-relaxed ${
            effort <= capacity
              ? "border-primary-200 bg-primary-50 text-primary-900"
              : "border-accent-300 bg-accent-50 text-accent-900"
          }`}
        >
          <i
            className={`mt-0.5 text-xs ${
              effort <= capacity ? "ri-checkbox-circle-line" : "ri-error-warning-line"
            }`}
          />
          <span>
            {effort <= capacity
              ? `Compatible avec votre capacité d'épargne estimée (${formatMoney(capacity, devise)} par mois).`
              : `Cela dépasse votre capacité estimée (${formatMoney(capacity, devise)} par mois) de ${formatMoney(effort - capacity, devise)} : allongez la durée.`}
          </span>
        </p>
      )}

      <div className="mt-2 rounded-md border border-dashed border-background-300 bg-background-100/50 px-2.5 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400">
          Postes budgétaires du projet
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {postes.map((poste) => (
            <span
              key={poste.libelle}
              className="inline-flex items-center gap-1 rounded-full border border-background-300 bg-background-50 px-2 py-0.5 text-[10px] font-medium text-foreground-600"
            >
              {poste.libelle}
              <span className="text-foreground-400">{poste.percent}%</span>
            </span>
          ))}
          <span className="inline-flex items-center rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-semibold text-secondary-900">
            + étapes détaillées
          </span>
        </div>
      </div>

      {draft.error && (
        <p className="mt-2 flex items-start gap-1.5 rounded-md border border-accent-300 bg-accent-50 px-2.5 py-1.5 text-[10px] leading-relaxed text-accent-900">
          <i className="ri-error-warning-line mt-0.5 text-xs" />
          <span>{draft.error}</span>
        </p>
      )}

      {done ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/app/objectifs"
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-accent-300 bg-accent-50 px-3 py-2 text-[11px] font-semibold text-accent-900 transition-colors hover:bg-accent-100"
          >
            <i className="ri-flag-2-line text-sm" />
            Voir mes objectifs
          </Link>
          <Link
            to="/app/projets"
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3 py-2 text-[11px] font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-building-4-line text-sm" />
            Ouvrir le projet
          </Link>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          {!goalReady ? (
            <button
              type="button"
              onClick={onCreateAll}
              disabled={busy || draft.target <= 0}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3 py-2 text-[11px] font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-sm" />
                  Création…
                </>
              ) : (
                <>
                  <i className="ri-magic-line text-sm" />
                  Créer l'objectif et le projet
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onCreateProject}
              disabled={busy}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3 py-2 text-[11px] font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-sm" />
                  Création…
                </>
              ) : (
                <>
                  <i className="ri-building-4-line text-sm" />
                  Créer le projet maintenant
                </>
              )}
            </button>
          )}

          {!goalReady && (
            <button
              type="button"
              onClick={onCreateGoal}
              disabled={busy || draft.target <= 0}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-[11px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className="ri-flag-2-line text-sm" />
              Objectif seul
            </button>
          )}
        </div>
      )}
    </div>
  );
}