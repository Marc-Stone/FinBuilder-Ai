import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialData } from "@/hooks/useFinancialData";
import { formatMoney } from "@/lib/finance";
import {
  computeEtapesProgress,
  computeProjectMetrics,
  getProjectCategory,
  getProjectStatus,
  parseEtapes,
} from "@/lib/projects";

const statusWeight = (statut: string) => {
  if (statut === "en_cours") return 0;
  if (statut === "preparation") return 1;
  if (statut === "suspendu") return 2;
  return 3;
};

const isActivable = (statut: string) => statut === "en_cours" || statut === "preparation";

export default function ActiveProjectsCard() {
  const { profile } = useAuth();
  const devise = profile?.devise ?? "FCFA";
  // Projets et objectifs proviennent de la source partagée (dépenses liées déjà rattachées).
  const { projects: rows, goals, loading, error, reload } = useFinancialData();

  const goalNames = useMemo(() => {
    const names: Record<string, string> = {};
    goals.forEach((goal) => {
      names[goal.id] = goal.nom;
    });
    return names;
  }, [goals]);

  const active = useMemo(() => {
    const ranked = [...rows].sort((a, b) => {
      const diff = statusWeight(a.statut) - statusWeight(b.statut);
      if (diff !== 0) return diff;
      return (Number(b.budget_total) || 0) - (Number(a.budget_total) || 0);
    });
    return ranked.filter((project) => isActivable(project.statut)).slice(0, 4);
  }, [rows]);

  const totals = useMemo(() => {
    return active.reduce(
      (acc, project) => {
        const metrics = computeProjectMetrics(project);
        return {
          enveloppe: acc.enveloppe + metrics.enveloppe,
          finance: acc.finance + metrics.finance,
          manquante: acc.manquante + metrics.enveloppeManquante,
        };
      },
      { enveloppe: 0, finance: 0, manquante: 0 },
    );
  }, [active]);

  const activeCount = rows.filter((project) => isActivable(project.statut)).length;
  const remaining = Math.max(activeCount - active.length, 0);

  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Projets en cours
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">
            Avancement des étapes, progression budgétaire et reste à financer de vos projets actifs.
          </p>
        </div>
        <Link
          to="/app/projets"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-primary-300 bg-primary-50 px-3 py-1.5 text-[11px] font-semibold text-primary-800 transition-colors hover:bg-primary-100"
        >
          <i className="ri-building-4-line text-sm" />
          Tous mes projets
        </Link>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-md border border-background-200 px-3 py-3">
              <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-background-200" />
              <div className="mt-2.5 h-1.5 w-full animate-pulse rounded-full bg-background-200" />
              <div className="mt-2 h-2 w-1/2 animate-pulse rounded-full bg-background-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-md border border-accent-300 bg-accent-50 px-3.5 py-3">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-accent-900">
            <i className="ri-error-warning-line mt-0.5 text-sm" />
            <span>Impossible de charger vos projets : {error}</span>
          </p>
          <button
            type="button"
            onClick={() => reload()}
            className="mt-2.5 inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
          >
            <i className="ri-refresh-line text-xs" />
            Réessayer
          </button>
        </div>
      ) : active.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-background-300 bg-background-50 px-4 py-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <i className="ri-building-4-line text-xl" />
          </span>
          <p className="mt-2.5 text-sm font-semibold text-foreground-950">Aucun projet actif</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-foreground-500">
            Déclarez une enveloppe pour votre maison, votre véhicule ou votre business : la
            répartition par poste et le reste à financer apparaîtront ici.
          </p>
          <Link
            to="/app/projets"
            className="mt-3 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-add-line text-sm" />
            Créer un projet
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="min-w-0 rounded-md bg-background-100 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
                Enveloppes actives
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-foreground-950">
                {formatMoney(totals.enveloppe, devise)}
              </p>
            </div>
            <div className="min-w-0 rounded-md bg-primary-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
                Déjà financé
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-primary-800">
                {formatMoney(totals.finance, devise)}
              </p>
            </div>
            <div className="min-w-0 rounded-md bg-accent-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
                Reste à financer
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-accent-900">
                {formatMoney(totals.manquante, devise)}
              </p>
            </div>
          </div>

          <ul className="mt-3 space-y-2">
            {active.map((project) => {
              const meta = getProjectCategory(project.categorie);
              const statut = getProjectStatus(project.statut);
              const metrics = computeProjectMetrics(project);
              const barProgress =
                metrics.prevuTotal > 0 ? metrics.progression : metrics.financementProgression;
              const goalName = project.goal_id ? goalNames[project.goal_id] : undefined;
              const etapes = parseEtapes(project.etapes);
              const steps = computeEtapesProgress(etapes);
              const nextEtape = etapes.find((etape) => etape.statut !== "termine") ?? null;

              return (
                <li
                  key={project.id}
                  className="rounded-md border border-background-200 bg-background-50 px-3 py-2.5 transition-colors hover:border-primary-200"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${meta.bubble}`}
                    >
                      <i className={`${meta.icon} text-sm`} />
                    </span>
                    <Link
                      to="/app/projets"
                      className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground-950 transition-colors hover:text-primary-700"
                    >
                      {project.nom}
                    </Link>
                    <span
                      className={`shrink-0 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${statut.tone}`}
                    >
                      {statut.label}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-background-200">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all duration-700"
                        style={{ width: `${Math.max(barProgress, barProgress > 0 ? 2 : 0)}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold text-primary-700">
                      {Math.round(barProgress)}%
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px]">
                    <span className="text-foreground-500">
                      {metrics.prevuTotal > 0
                        ? `Budget consommé ${formatMoney(metrics.depenseTotal, devise)} / ${formatMoney(
                            metrics.prevuTotal,
                            devise,
                          )}`
                        : `Financé ${formatMoney(metrics.finance, devise)} / ${formatMoney(
                            metrics.enveloppe,
                            devise,
                          )}`}
                    </span>
                    <span
                      className={`font-semibold ${
                        metrics.enveloppeManquante > 0 ? "text-accent-800" : "text-primary-700"
                      }`}
                    >
                      {metrics.enveloppeManquante > 0
                        ? `Reste à financer ${formatMoney(metrics.enveloppeManquante, devise)}`
                        : "Enveloppe entièrement financée"}
                    </span>
                  </div>

                  {steps.total > 0 && (
                    <div className="mt-2 rounded-md bg-background-100/75 px-2 py-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1 text-[10px] font-semibold text-foreground-600">
                          <i className="ri-route-line text-[11px] text-primary-600" />
                          Étapes du plan
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold text-primary-700">
                          {steps.termines}/{steps.total} terminées
                        </span>
                      </div>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-background-200">
                        <div
                          className="h-full rounded-full bg-accent-500 transition-all duration-700"
                          style={{
                            width: `${Math.max(steps.progression, steps.progression > 0 ? 2 : 0)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-foreground-500">
                        <i
                          className={`text-[10px] ${
                            nextEtape?.statut === "en_cours"
                              ? "ri-timer-line text-accent-700"
                              : "ri-checkbox-blank-circle-line text-foreground-400"
                          }`}
                        />
                        <span className="min-w-0 truncate">
                          {nextEtape
                            ? `${nextEtape.statut === "en_cours" ? "En cours" : "Prochaine étape"} : ${nextEtape.libelle}`
                            : "Toutes les étapes sont terminées"}
                        </span>
                      </p>
                    </div>
                  )}

                  {goalName && (
                    <p className="mt-2 flex items-center gap-1.5 rounded-md border border-secondary-200 bg-secondary-100/70 px-2 py-1 text-[10px] font-semibold text-secondary-900">
                      <i className="ri-flag-2-line text-xs" />
                      Financé par l'objectif « {goalName} »
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          {remaining > 0 && (
            <p className="mt-2.5 text-[11px] font-medium text-foreground-400">
              + {remaining} autre{remaining > 1 ? "s" : ""} projet{remaining > 1 ? "s" : ""} actif
              {remaining > 1 ? "s" : ""}
            </p>
          )}
        </>
      )}
    </section>
  );
}