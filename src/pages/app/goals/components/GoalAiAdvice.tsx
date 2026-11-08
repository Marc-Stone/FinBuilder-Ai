import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/finance";
import { computeGoalProgress, formatMonths, type GoalEntry } from "@/lib/goals";

type GoalAiAdviceProps = {
  goals: GoalEntry[];
  devise: string;
  capacite: number;
  onEdit: (goal: GoalEntry) => void;
};

export default function GoalAiAdvice({ goals, devise, capacite, onEdit }: GoalAiAdviceProps) {
  const ranked = goals
    .map((goal) => ({ goal, progress: computeGoalProgress(goal) }))
    .filter((item) => !item.progress.atteint && item.progress.epargneMensuelle > 0)
    .sort((a, b) => b.progress.epargneMensuelle - a.progress.epargneMensuelle);

  const top = ranked[0];
  const effort = top?.progress.epargneMensuelle ?? 0;
  const achievable = capacite > 0 ? effort <= capacite : null;

  return (
    <section className="rounded-lg border border-secondary-200 bg-secondary-100/55 px-4 py-3.5 md:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary-500 text-background-50">
            <i className="ri-sparkling-2-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-secondary-900">
              Recommandation FinBuilder IA
              <span className="rounded-full border border-secondary-300 bg-background-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-secondary-800">
                Objectif = destination
              </span>
            </p>

            {top ? (
              <p className="mt-1 text-[12px] leading-relaxed text-secondary-900/85">
                Pour atteindre <strong className="font-semibold">« {top.goal.nom} »</strong>, vous devez
                économiser{" "}
                <strong className="font-semibold text-foreground-950">
                  {formatMoney(effort, devise)} par mois
                </strong>{" "}
                pendant {formatMonths(top.progress.moisRestants)}. Il reste{" "}
                {formatMoney(top.progress.restant, devise)} à financer.
                {achievable !== null && (
                  <>
                    {" "}
                    Votre capacité d'épargne estimée est de {formatMoney(capacite, devise)} :{" "}
                    {achievable
                      ? "cet effort est réalisable."
                      : `il manque ${formatMoney(effort - capacite, devise)} par mois — allongez l'échéance ou réduisez la cible.`}
                  </>
                )}
              </p>
            ) : (
              <p className="mt-1 text-[12px] leading-relaxed text-secondary-900/85">
                Fixez une cible et une échéance : FinBuilder calcule automatiquement l'épargne mensuelle
                nécessaire et suit votre progression vers la destination.
              </p>
            )}

            <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-secondary-900/70">
              <i className="ri-route-line mt-0.5 text-[11px]" />
              <span>
                Un objectif dit <strong className="font-semibold">où vous allez</strong>. Le projet dit{" "}
                <strong className="font-semibold">comment y arriver</strong> : c'est lui qui porte le
                budget détaillé, les étapes et les dépenses réelles.
              </span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row lg:flex-col">
          <Link
            to="/app/projets"
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-[11px] font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-building-4-line text-sm" />
            Créer le projet associé
          </Link>
          {top && (
            <button
              type="button"
              onClick={() => onEdit(top.goal)}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-secondary-300 bg-background-50 px-3.5 py-2 text-[11px] font-semibold text-secondary-900 transition-colors hover:bg-secondary-200/60"
            >
              <i className="ri-equalizer-line text-sm" />
              Ajuster l'objectif
            </button>
          )}
        </div>
      </div>
    </section>
  );
}