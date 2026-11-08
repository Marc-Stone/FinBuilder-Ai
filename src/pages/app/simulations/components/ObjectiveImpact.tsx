import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/finance";
import type { GoalEntry } from "@/lib/goals";
import { describeMonths, monthsToTarget } from "@/lib/simulations";

type ObjectiveImpactProps = {
  goals: GoalEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
  capaciteActuelle: number;
  capaciteFinale: number;
  devise: string;
  loading: boolean;
};

export default function ObjectiveImpact({
  goals,
  selectedId,
  onSelect,
  capaciteActuelle,
  capaciteFinale,
  devise,
  loading,
}: ObjectiveImpactProps) {
  const goal = goals.find((item) => item.id === selectedId) ?? goals[0] ?? null;

  const objectif = goal ? Number(goal.montant_objectif) || 0 : 0;
  const deja = goal ? Number(goal.montant_actuel) || 0 : 0;
  const restant = Math.max(objectif - deja, 0);

  const moisActuel = monthsToTarget(objectif, deja, capaciteActuelle);
  const moisScenario = monthsToTarget(objectif, deja, capaciteFinale);
  const gainMois =
    Number.isFinite(moisActuel) && Number.isFinite(moisScenario) ? moisActuel - moisScenario : 0;

  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Impact sur un objectif
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">
            Combien de temps pour atteindre la cible avec et sans ce scénario.
          </p>
        </div>

        {goals.length > 0 && (
          <label className="w-full shrink-0 sm:w-[220px]">
            <span className="sr-only">Objectif à comparer</span>
            <select
              value={goal?.id ?? ""}
              onChange={(event) => onSelect(event.target.value)}
              className="w-full cursor-pointer rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-xs font-medium text-foreground-800 outline-none focus:border-primary-400"
            >
              {goals.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nom}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {loading ? (
        <div className="mt-4 h-24 animate-pulse rounded-md bg-background-200" />
      ) : !goal ? (
        <div className="mt-4 rounded-md border border-dashed border-background-300 bg-background-50 px-4 py-8 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <i className="ri-flag-2-line text-lg" />
          </span>
          <p className="mt-2 text-sm font-semibold text-foreground-950">Aucun objectif à comparer</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-foreground-500">
            Créez un objectif financier pour voir combien de mois ce scénario vous fait gagner.
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
        <>
          <div className="mt-3 rounded-md bg-background-100 px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="min-w-0 truncate text-xs font-semibold text-foreground-950">
                {goal.nom}
              </p>
              <p className="shrink-0 text-[11px] font-medium text-foreground-600">
                Reste {formatMoney(restant, devise)} sur {formatMoney(objectif, devise)}
              </p>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
              <div
                className="h-full rounded-full bg-primary-500"
                style={{
                  width: `${objectif > 0 ? Math.min((deja / objectif) * 100, 100) : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="min-w-0 rounded-md border border-background-200 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
                Sans changement
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground-950">
                {describeMonths(moisActuel)}
              </p>
              <p className="mt-0.5 text-[11px] text-foreground-500">
                À {formatMoney(Math.max(capaciteActuelle, 0), devise)} / mois
              </p>
            </div>
            <div className="min-w-0 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-700">
                Avec ce scénario
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-primary-900">
                {describeMonths(moisScenario)}
              </p>
              <p className="mt-0.5 text-[11px] text-primary-800">
                À {formatMoney(Math.max(capaciteFinale, 0), devise)} / mois
              </p>
            </div>
          </div>

          <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-foreground-600">
            <i
              className={`mt-0.5 text-sm ${
                gainMois > 0 ? "ri-flashlight-line text-primary-700" : "ri-information-line text-foreground-400"
              }`}
            />
            <span className="min-w-0">
              {gainMois > 0
                ? `Vous atteignez cet objectif ${gainMois} mois plus tôt — soit environ ${Math.round(
                    (gainMois / 12) * 10,
                  ) / 10} an${gainMois >= 24 ? "s" : ""} gagné${gainMois > 1 ? "s" : ""}.`
                : gainMois < 0
                  ? "Ce scénario allonge le délai : renforcez plutôt les leviers qui augmentent votre capacité d'épargne."
                  : "Le délai reste identique pour cet objectif avec les paramètres actuels."}
            </span>
          </p>
        </>
      )}
    </section>
  );
}