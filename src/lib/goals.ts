import { parseIsoDate } from "@/lib/finance";

export type GoalEntry = {
  id: string;
  nom: string;
  categorie: string;
  montant_objectif: number;
  montant_actuel: number;
  date_limite: string | null;
  priorite: string;
  statut: string;
  note: string | null;
};

export type GoalCategoryMeta = {
  value: string;
  label: string;
  icon: string;
  bubble: string;
  badge: string;
  bar: string;
};

export const goalCategories: GoalCategoryMeta[] = [
  {
    value: "logement",
    label: "Maison",
    icon: "ri-home-5-line",
    bubble: "bg-primary-50 text-primary-700",
    badge: "border-primary-200 bg-primary-50 text-primary-800",
    bar: "bg-primary-600",
  },
  {
    value: "vehicule",
    label: "Voiture",
    icon: "ri-car-line",
    bubble: "bg-secondary-100 text-secondary-800",
    badge: "border-secondary-200 bg-secondary-100 text-secondary-900",
    bar: "bg-secondary-600",
  },
  {
    value: "mariage",
    label: "Mariage",
    icon: "ri-heart-3-line",
    bubble: "bg-accent-100 text-accent-800",
    badge: "border-accent-200 bg-accent-100 text-accent-900",
    bar: "bg-accent-600",
  },
  {
    value: "voyage",
    label: "Voyage",
    icon: "ri-plane-line",
    bubble: "bg-secondary-50 text-secondary-800",
    badge: "border-secondary-200 bg-secondary-50 text-secondary-800",
    bar: "bg-secondary-500",
  },
  {
    value: "education",
    label: "Formation",
    icon: "ri-graduation-cap-line",
    bubble: "bg-background-100 text-foreground-600",
    badge: "border-background-300 bg-background-100 text-foreground-700",
    bar: "bg-foreground-400",
  },
  {
    value: "epargne",
    label: "Épargne",
    icon: "ri-safe-2-line",
    bubble: "bg-primary-100 text-primary-800",
    badge: "border-primary-200 bg-primary-100 text-primary-900",
    bar: "bg-primary-500",
  },
  {
    value: "investissement",
    label: "Investissement",
    icon: "ri-line-chart-line",
    bubble: "bg-accent-50 text-accent-700",
    badge: "border-accent-200 bg-accent-50 text-accent-900",
    bar: "bg-accent-500",
  },
  {
    value: "business",
    label: "Création entreprise",
    icon: "ri-store-2-line",
    bubble: "bg-secondary-100 text-secondary-900",
    badge: "border-secondary-300 bg-secondary-100 text-secondary-900",
    bar: "bg-secondary-700",
  },
  {
    value: "fonds_urgence",
    label: "Fonds d'urgence",
    icon: "ri-shield-star-line",
    bubble: "bg-background-100 text-foreground-600",
    badge: "border-background-300 bg-background-100 text-foreground-700",
    bar: "bg-foreground-400",
  },
  {
    value: "autre",
    label: "Autre objectif",
    icon: "ri-flag-2-line",
    bubble: "bg-background-100 text-foreground-600",
    badge: "border-background-300 bg-background-100 text-foreground-700",
    bar: "bg-foreground-400",
  },
];

export function getGoalCategory(value: string): GoalCategoryMeta {
  return goalCategories.find((item) => item.value === value) ?? goalCategories[goalCategories.length - 1];
}

export const goalPriorities = [
  { value: "haute", label: "Priorité haute", tone: "border-accent-300 bg-accent-50 text-accent-900" },
  { value: "moyenne", label: "Priorité moyenne", tone: "border-secondary-200 bg-secondary-100 text-secondary-900" },
  { value: "basse", label: "Priorité basse", tone: "border-background-300 bg-background-100 text-foreground-700" },
];

export function getGoalPriority(value: string) {
  return goalPriorities.find((item) => item.value === value) ?? goalPriorities[1];
}

export type GoalProgress = {
  restant: number;
  progression: number;
  moisRestants: number;
  epargneMensuelle: number;
  echeancePassee: boolean;
  atteint: boolean;
  statutAffiche: "actif" | "atteint" | "retard" | "sans_echeance";
};

/** Number of months between today and a deadline (minimum 1 when a deadline exists). */
export function monthsUntil(iso: string | null, now = new Date()): number {
  if (!iso) return 0;
  const target = parseIsoDate(iso);
  const dayDiff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (dayDiff <= 0) return 0;
  return Math.max(1, Math.ceil(dayDiff / 30.44));
}

export function computeGoalProgress(goal: GoalEntry, now = new Date()): GoalProgress {
  const objectif = Number(goal.montant_objectif) || 0;
  const actuel = Number(goal.montant_actuel) || 0;
  const restant = Math.max(objectif - actuel, 0);
  const progression = objectif > 0 ? Math.min((actuel / objectif) * 100, 100) : 0;
  const atteint = objectif > 0 && actuel >= objectif;

  const deadline = goal.date_limite ? parseIsoDate(goal.date_limite) : null;
  const echeancePassee = Boolean(deadline && deadline.getTime() < now.getTime());
  const moisRestants = monthsUntil(goal.date_limite, now);
  const epargneMensuelle = !atteint && moisRestants > 0 ? Math.ceil(restant / moisRestants) : 0;

  let statutAffiche: GoalProgress["statutAffiche"] = "actif";
  if (atteint) statutAffiche = "atteint";
  else if (echeancePassee) statutAffiche = "retard";
  else if (moisRestants === 0) statutAffiche = "sans_echeance";

  return { restant, progression, moisRestants, epargneMensuelle, echeancePassee, atteint, statutAffiche };
}

export function formatMonths(months: number) {
  if (months <= 0) return "sans échéance";
  if (months === 1) return "1 mois";
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (rest === 0) return `${years} an${years > 1 ? "s" : ""}`;
  return `${years} an${years > 1 ? "s" : ""} et ${rest} mois`;
}

/** Splits the monthly saving need of each goal into a realistic timeline. */
export function feasibility(epargneMensuelle: number, capacite: number) {
  if (epargneMensuelle <= 0) {
    return { level: "done" as const, label: "Atteint", detail: "Objectif financé à 100 %." };
  }
  if (capacite <= 0) {
    return {
      level: "unknown" as const,
      label: "À évaluer",
      detail: "Ajoutez revenus et dépenses pour mesurer votre capacité d'épargne.",
    };
  }
  if (epargneMensuelle <= capacite) {
    return {
      level: "ok" as const,
      label: "Réalisable",
      detail: "Compatible avec votre capacité d'épargne estimée.",
    };
  }
  return {
    level: "tight" as const,
    label: "Sous tension",
    detail: "Dépasse votre capacité d'épargne : allongez l'échéance ou réduisez la cible.",
  };
}