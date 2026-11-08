import { useState, type FormEvent } from "react";
import {
  computeEtapesProgress,
  createPosteId,
  etapeStatuses,
  getEtapeStatus,
  type ProjectEtape,
  type ProjectEtapeStatus,
} from "@/lib/projects";

type ProjectEtapesSectionProps = {
  etapes: ProjectEtape[];
  onChange: (etapes: ProjectEtape[]) => void;
  disabled?: boolean;
};

const nextStatus: Record<ProjectEtapeStatus, ProjectEtapeStatus> = {
  a_faire: "en_cours",
  en_cours: "termine",
  termine: "a_faire",
};

export default function ProjectEtapesSection({ etapes, onChange, disabled }: ProjectEtapesSectionProps) {
  const [draft, setDraft] = useState("");
  const progress = computeEtapesProgress(etapes);

  const cycle = (id: string) => {
    onChange(
      etapes.map((etape) =>
        etape.id === id ? { ...etape, statut: nextStatus[etape.statut] } : etape,
      ),
    );
  };

  const rename = (id: string, libelle: string) => {
    onChange(etapes.map((etape) => (etape.id === id ? { ...etape, libelle } : etape)));
  };

  const remove = (id: string) => {
    onChange(etapes.filter((etape) => etape.id !== id));
  };

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const libelle = draft.trim();
    if (libelle.length < 2) return;
    onChange([...etapes, { id: createPosteId(), libelle, statut: "a_faire" }]);
    setDraft("");
  };

  return (
    <section className="mt-4 rounded-lg border border-background-200 bg-background-50 px-3.5 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600">
            <i className="ri-route-line text-sm text-primary-600" />
            Étapes du plan
          </h3>
          <p className="mt-0.5 text-[11px] text-foreground-500">
            {progress.total === 0
              ? "Découpez votre projet en étapes concrètes."
              : `${progress.termines} / ${progress.total} terminée${progress.termines > 1 ? "s" : ""}${
                  progress.enCours > 0 ? ` · ${progress.enCours} en cours` : ""
                }`}
          </p>
        </div>
        {progress.total > 0 && (
          <span className="shrink-0 rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-800">
            {Math.round(progress.progression)}% du plan
          </span>
        )}
      </div>

      {progress.total > 0 && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-500"
            style={{ width: `${Math.max(progress.progression, progress.progression > 0 ? 3 : 0)}%` }}
          />
        </div>
      )}

      {etapes.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {etapes.map((etape) => {
            const meta = getEtapeStatus(etape.statut);
            return (
              <li
                key={etape.id}
                className="flex items-center gap-2 rounded-md border border-background-200 bg-background-100/40 px-2 py-1.5"
              >
                <button
                  type="button"
                  onClick={() => cycle(etape.id)}
                  disabled={disabled}
                  title={`${meta.label} — cliquer pour changer`}
                  aria-label={`Statut de ${etape.libelle}`}
                  className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors ${meta.tone} disabled:cursor-not-allowed`}
                >
                  <i className={`${meta.icon} text-sm`} />
                </button>
                <input
                  type="text"
                  value={etape.libelle}
                  onChange={(event) => rename(etape.id, event.target.value)}
                  disabled={disabled}
                  maxLength={80}
                  aria-label={`Intitulé de l'étape ${etape.libelle}`}
                  className={`box-border min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-xs font-medium focus:border-primary-300 focus:bg-background-50 focus:outline-none ${
                    etape.statut === "termine"
                      ? "text-foreground-400 line-through"
                      : etape.statut === "en_cours"
                        ? "text-accent-900"
                        : "text-foreground-800"
                  }`}
                />
                <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-wide text-foreground-400 sm:block">
                  {meta.short}
                </span>
                <button
                  type="button"
                  onClick={() => remove(etape.id)}
                  disabled={disabled}
                  aria-label={`Supprimer l'étape ${etape.libelle}`}
                  className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-400 transition-colors hover:bg-accent-50 hover:text-accent-800 disabled:cursor-not-allowed"
                >
                  <i className="ri-close-line text-sm" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 rounded-md border border-dashed border-background-300 bg-background-100/50 px-3 py-2.5 text-[11px] text-foreground-500">
          Aucune étape pour l'instant. Exemple : « Acheter le terrain », « Faire les plans »,
          « Construire ».
        </p>
      )}

      <form onSubmit={add} className="mt-2 flex flex-col gap-1.5 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <i className="ri-add-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={disabled}
            maxLength={80}
            placeholder="Ajouter une étape…"
            className="box-border w-full min-w-0 rounded-md border border-background-300 bg-background-50 py-1.5 pl-8 pr-2.5 text-xs text-foreground-900 placeholder:text-foreground-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || draft.trim().length < 2}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md border border-primary-300 bg-primary-50 px-3 py-1.5 text-[11px] font-semibold text-primary-800 transition-colors hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ajouter
        </button>
      </form>

      <p className="mt-1.5 flex items-start gap-1.5 text-[10px] leading-relaxed text-foreground-400">
        <i className="ri-information-line mt-0.5 text-[11px]" />
        <span>
          Cliquez sur la pastille pour faire passer une étape de « {etapeStatuses[0].label} » à «{" "}
          {etapeStatuses[1].label} », puis « {etapeStatuses[2].label} ». Pensez à enregistrer.
        </span>
      </p>
    </section>
  );
}