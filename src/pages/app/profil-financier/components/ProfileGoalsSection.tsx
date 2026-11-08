import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useDataSync } from "@/hooks/useDataSync";
import { formatMoney, toIsoDate } from "@/lib/finance";
import { getGoalCategory } from "@/lib/goals";
import type { FinancialProfileBlueprint, SuggestedGoal } from "@/lib/financialProfiles";

type ProfileGoalsSectionProps = {
  blueprint: FinancialProfileBlueprint;
  devise: string;
  declaredGoals: string[];
};

function deadlineIn(months: number) {
  const now = new Date();
  const safeMonths = Math.max(1, Math.min(Math.round(months) || 1, 480));
  const day = Math.min(now.getDate(), 28);
  return toIsoDate(new Date(now.getFullYear(), now.getMonth() + safeMonths, day));
}

export default function ProfileGoalsSection({
  blueprint,
  devise,
  declaredGoals,
}: ProfileGoalsSectionProps) {
  const { session } = useAuth();
  const { notifyChange } = useDataSync();
  const [creating, setCreating] = useState<string | null>(null);
  const [created, setCreated] = useState<string[]>([]);
  const [error, setError] = useState("");

  const goals = useMemo<SuggestedGoal[]>(() => {
    const custom = declaredGoals
      .filter((goal) => !blueprint.goals.some((item) => item.nom === goal))
      .map<SuggestedGoal>((goal) => ({
        nom: goal,
        categorie: "autre",
        cible: 500000,
        mois: 12,
      }));
    return [...blueprint.goals, ...custom];
  }, [blueprint, declaredGoals]);

  const handleCreate = async (goal: SuggestedGoal) => {
    const userId = session?.user?.id;
    if (!userId) {
      setError("Session expirée. Reconnectez-vous.");
      return;
    }
    setCreating(goal.nom);
    setError("");
    try {
      const { error: insertError } = await supabase.from("goals").insert({
        user_id: userId,
        nom: goal.nom,
        categorie: goal.categorie,
        montant_objectif: Math.max(Math.round(goal.cible), 0),
        montant_actuel: 0,
        date_limite: deadlineIn(goal.mois),
        priorite: "moyenne",
        statut: "actif",
        note: `Objectif proposé pour le profil ${blueprint.label}.`,
        updated_at: new Date().toISOString(),
      });
      if (insertError) throw insertError;
      setCreated((current) => [...current, goal.nom]);
      notifyChange();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? `Création impossible : ${createError.message}`
          : "Création impossible. Réessayez.",
      );
    } finally {
      setCreating(null);
    }
  };

  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Objectifs adaptés à votre profil
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-foreground-500">
            Des cibles choisies pour un profil {blueprint.label.toLowerCase()}. Créez-les en un clic,
            vous pourrez ajuster montants et échéances ensuite.
          </p>
        </div>
        <Link
          to="/app/objectifs"
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-[11px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
        >
          Tous mes objectifs
          <i className="ri-arrow-right-line text-xs" />
        </Link>
      </div>

      {error && (
        <p className="mt-3 rounded-md border border-accent-300 bg-accent-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-accent-900">
          {error}
        </p>
      )}

      <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => {
          const meta = getGoalCategory(goal.categorie);
          const isDeclared = declaredGoals.includes(goal.nom);
          const isCreated = created.includes(goal.nom);
          return (
            <article
              key={goal.nom}
              className="flex flex-col rounded-lg border border-background-200 p-3.5 transition-colors hover:border-primary-200"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.bubble}`}
                >
                  <i className={`${meta.icon} text-sm`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-snug text-foreground-900">
                    {goal.nom}
                  </p>
                  <p className="mt-0.5 text-[10px] text-foreground-400">
                    {meta.label} · {goal.mois} mois
                  </p>
                </div>
              </div>

              <div className="mt-2.5 flex items-baseline gap-1.5">
                <p
                  className="text-sm font-semibold text-foreground-950"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {formatMoney(goal.cible, devise)}
                </p>
                <span className="text-[10px] text-foreground-400">
                  soit {formatMoney(Math.ceil(goal.cible / goal.mois), devise)} / mois
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5">
                {isDeclared && (
                  <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-[9px] font-semibold text-secondary-900">
                    Dans vos priorités
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleCreate(goal)}
                  disabled={isCreated || creating === goal.nom}
                  className="ml-auto inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md border border-primary-300 bg-primary-50 px-2.5 py-1.5 text-[10px] font-semibold text-primary-800 transition-colors hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCreated ? (
                    <>
                      <i className="ri-check-line text-[11px]" />
                      Objectif créé
                    </>
                  ) : creating === goal.nom ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-[11px]" />
                      Création…
                    </>
                  ) : (
                    <>
                      <i className="ri-add-line text-[11px]" />
                      Créer l'objectif
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}