import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/finance";
import { formatMonths, getGoalCategory } from "@/lib/goals";
import type { GoalOverview } from "@/hooks/useFinancialOverview";

type GoalsOverviewCardProps = {
  goals: GoalOverview[];
  devise: string;
};

export default function GoalsOverviewCard({ goals, devise }: GoalsOverviewCardProps) {
  const visibles = goals.filter((item) => !item.atteint).slice(0, 3);
  const termines = goals.filter((item) => item.atteint).length;

  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Mes objectifs en cours
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">
            Progression, montant restant et échéance, mis à jour à chaque épargne.
          </p>
        </div>
        <Link
          to="/app/objectifs"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-secondary-200 bg-secondary-100 px-3 py-1.5 text-[11px] font-semibold text-secondary-900 transition-colors hover:bg-secondary-200"
        >
          <i className="ri-flag-2-line text-sm" />
          Tous mes objectifs
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="mt-3.5 rounded-md border border-dashed border-background-300 px-4 py-6 text-center">
          <p className="text-xs leading-relaxed text-foreground-500">
            Aucun objectif pour l'instant. Un objectif est la destination : une maison, un voyage, un
            fonds d'urgence.
          </p>
          <Link
            to="/app/objectifs"
            className="mt-3 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-add-line text-sm" />
            Créer un objectif
          </Link>
        </div>
      ) : (
        <ul className="mt-3.5 space-y-2.5">
          {visibles.length === 0 && (
            <li className="rounded-md bg-primary-50 px-3 py-2.5 text-[11px] font-semibold text-primary-800">
              Tous vos objectifs sont atteints ({termines}). Félicitations — définissez une nouvelle
              cible pour continuer à faire travailler votre épargne.
            </li>
          )}
          {visibles.map((item) => {
            const meta = getGoalCategory(item.goal.categorie);
            return (
              <li key={item.goal.id} className="rounded-md border border-background-200 px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${meta.bubble}`}
                  >
                    <i className={`${meta.icon} text-sm`} />
                  </span>
                  <Link
                    to="/app/objectifs"
                    className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground-950 transition-colors hover:text-primary-700"
                  >
                    {item.goal.nom}
                  </Link>
                  <span className="shrink-0 text-xs font-semibold text-primary-700">
                    {Math.round(item.progression)} %
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
                  <div
                    className="h-full rounded-full bg-primary-500 transition-all duration-700"
                    style={{ width: `${Math.max(item.progression, item.progression > 0 ? 2 : 0)}%` }}
                  />
                </div>
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px]">
                  <span className="text-foreground-500">
                    Reste {formatMoney(item.restant, devise)}
                  </span>
                  <span
                    className={`font-semibold ${
                      item.enRetard ? "text-accent-800" : "text-foreground-600"
                    }`}
                  >
                    {item.enRetard
                      ? "Échéance dépassée"
                      : item.moisRestants > 0
                        ? `dans ${formatMonths(item.moisRestants)}`
                        : "sans échéance"}
                    {item.epargneMensuelle > 0
                      ? ` · ${formatMoney(item.epargneMensuelle, devise)}/mois`
                      : ""}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}