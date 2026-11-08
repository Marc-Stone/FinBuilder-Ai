import { supabase } from "@/lib/supabaseClient";
import type { GoalEntry } from "@/lib/goals";

/** Columns needed to read or refresh a savings goal. */
export const GOAL_SELECT =
  "id, nom, categorie, montant_objectif, montant_actuel, date_limite, priorite, statut, note";

export type GoalOption = {
  id: string;
  nom: string;
  montant_objectif: number;
  montant_actuel: number;
};

export type GoalSyncResult = { finance: number; error: string };

/**
 * Keeps the linked savings goal aligned with the project it finances:
 * the goal target becomes the project envelope, its saved amount the project financing.
 * `merge` is used when the link is new, so previous savings are never lost.
 */
export async function syncGoalWithProject({
  goalId,
  enveloppe,
  finance,
  merge,
}: {
  goalId: string;
  enveloppe: number;
  finance: number;
  merge: boolean;
}): Promise<GoalSyncResult> {
  const { data, error } = await supabase
    .from("goals")
    .select(GOAL_SELECT)
    .eq("id", goalId)
    .maybeSingle();

  if (error) return { finance, error: error.message };
  if (!data) return { finance, error: "L'objectif d'épargne lié est introuvable." };

  const goal = data as GoalEntry;
  const target = Math.max(Math.round(enveloppe), 0);
  const cleanFinance = Math.max(Math.round(finance), 0);
  const saved = merge
    ? Math.max(cleanFinance, Math.round(Number(goal.montant_actuel) || 0))
    : cleanFinance;

  const { error: updateError } = await supabase
    .from("goals")
    .update({
      montant_objectif: target,
      montant_actuel: saved,
      statut: target > 0 && saved >= target ? "atteint" : "actif",
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId);

  if (updateError) return { finance: saved, error: updateError.message };
  return { finance: saved, error: "" };
}

/** Project categories that map to an existing savings goal category. */
export const projectGoalCategories: Record<string, string> = {
  logement: "logement",
  vehicule: "vehicule",
  mariage: "mariage",
  business: "business",
  education: "education",
  voyage: "voyage",
  autre: "autre",
};

export function goalCategoryForProject(categorie: string): string {
  return projectGoalCategories[categorie] ?? "autre";
}

/** Default name and values of the savings goal created from a project. */
export function buildGoalDraftFromProject({
  nom,
  categorie,
  enveloppe,
  finance,
  dateLimite,
  priorite,
}: {
  nom: string;
  categorie: string;
  enveloppe: number;
  finance: number;
  dateLimite?: string | null;
  priorite?: string;
}) {
  const target = Math.max(Math.round(enveloppe), 0);
  const saved = Math.min(Math.max(Math.round(finance), 0), target);
  const base = nom.trim() || "Projet";
  return {
    nom: `${base} — épargne`.slice(0, 70),
    categorie: goalCategoryForProject(categorie),
    montant_objectif: target,
    montant_actuel: saved,
    date_limite: dateLimite || null,
    priorite: priorite || "moyenne",
    statut: target > 0 && saved >= target ? "atteint" : "actif",
  };
}

/**
 * Creates the savings goal that will finance a project, prefilled with the project envelope.
 * Returns the created goal so the form can select it immediately.
 */
export async function createGoalFromProject({
  userId,
  nom,
  categorie,
  enveloppe,
  finance,
  dateLimite,
  priorite,
}: {
  userId: string;
  nom: string;
  categorie: string;
  enveloppe: number;
  finance: number;
  dateLimite?: string | null;
  priorite?: string;
}): Promise<{ goal: GoalOption | null; error: string }> {
  const draft = buildGoalDraftFromProject({
    nom,
    categorie,
    enveloppe,
    finance,
    dateLimite,
    priorite,
  });

  const { data, error } = await supabase
    .from("goals")
    .insert({
      ...draft,
      note: null,
      user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .select("id, nom, montant_objectif, montant_actuel")
    .maybeSingle();

  if (error) return { goal: null, error: error.message };
  if (!data) return { goal: null, error: "L'objectif n'a pas pu être créé." };
  return { goal: data as GoalOption, error: "" };
}

/**
 * After a savings deposit, every project financed by the goal receives the new amount.
 * Returns an error message when the synchronisation could not be completed.
 */
export async function syncProjectsFromGoal(goal: GoalEntry): Promise<string> {
  const finance = Math.max(Math.round(Number(goal.montant_actuel) || 0), 0);

  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("goal_id", goal.id);

  if (error) return error.message;

  const rows = (data ?? []) as { id: string }[];
  if (rows.length === 0) return "";

  const results = await Promise.all(
    rows.map((row) =>
      supabase
        .from("projects")
        .update({ montant_finance: finance, updated_at: new Date().toISOString() })
        .eq("id", row.id),
    ),
  );

  const failure = results.find((result) => result.error);
  return failure?.error?.message ?? "";
}