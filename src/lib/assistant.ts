import { formatMoney, toIsoDate } from "@/lib/finance";
import {
  buildEtapesFromTemplate,
  buildPostesFromTemplate,
  projectTemplates,
  type ProjectEtape,
  type ProjectPoste,
} from "@/lib/projects";

/** A proposal produced by the assistant: the goal first, then its project. */
export type AssistantDraft = {
  key: string;
  /** Original sentence typed by the user. */
  phrase: string;
  goalNom: string;
  goalCategorie: string;
  projectNom: string;
  projectCategorie: string;
  target: number;
  saved: number;
  months: number;
  dateLimite: string;
  goalId: string | null;
  projectId: string | null;
  status: "idle" | "saving" | "goal-ready" | "done";
  error: string;
};

type IntentRule = {
  keywords: string[];
  goalCategorie: string;
  projectCategorie: string;
  goalNom: string;
  projectNom: string;
  target: number;
  months: number;
};

const INTENT_RULES: IntentRule[] = [
  {
    keywords: ["maison", "appartement", "logement", "terrain", "construction", "villa", "immeuble", "habiter"],
    goalCategorie: "logement",
    projectCategorie: "logement",
    goalNom: "Acheter une maison",
    projectNom: "Plan financement maison",
    target: 25000000,
    months: 60,
  },
  {
    keywords: ["voiture", "vehicule", "moto", "auto", "camion", "4x4"],
    goalCategorie: "vehicule",
    projectCategorie: "vehicule",
    goalNom: "Acheter une voiture",
    projectNom: "Plan financement véhicule",
    target: 8000000,
    months: 24,
  },
  {
    keywords: ["mariage", "marier", "noces", "dote", "ceremonie"],
    goalCategorie: "mariage",
    projectCategorie: "mariage",
    goalNom: "Organiser mon mariage",
    projectNom: "Plan financement mariage",
    target: 9000000,
    months: 18,
  },
  {
    keywords: ["voyage", "voyager", "vacances", "tour du monde", "billet", "zanzibar", "paris", "dubai"],
    goalCategorie: "voyage",
    projectCategorie: "voyage",
    goalNom: "Financer mon voyage",
    projectNom: "Plan financement voyage",
    target: 2500000,
    months: 12,
  },
  {
    keywords: ["formation", "etude", "etudes", "ecole", "universite", "master", "licence", "scolarite", "certification", "ordinateur", "laptop", "diplome"],
    goalCategorie: "education",
    projectCategorie: "education",
    goalNom: "Financer ma formation",
    projectNom: "Plan financement formation",
    target: 3000000,
    months: 24,
  },
  {
    keywords: ["entreprise", "business", "boutique", "commerce", "restaurant", "startup", "salon", "ferme"],
    goalCategorie: "business",
    projectCategorie: "business",
    goalNom: "Créer mon entreprise",
    projectNom: "Plan financement entreprise",
    target: 5000000,
    months: 24,
  },
  {
    keywords: ["investir", "investissement", "placement", "bourse", "immobilier locatif"],
    goalCategorie: "investissement",
    projectCategorie: "autre",
    goalNom: "Investir mon capital",
    projectNom: "Plan financement investissement",
    target: 5000000,
    months: 36,
  },
  {
    keywords: ["urgence", "imprevu", "securite"],
    goalCategorie: "fonds_urgence",
    projectCategorie: "autre",
    goalNom: "Constituer mon fonds d'urgence",
    projectNom: "Plan fonds d'urgence",
    target: 3000000,
    months: 12,
  },
  {
    keywords: ["epargne", "epargner", "economiser", "mettre de cote"],
    goalCategorie: "epargne",
    projectCategorie: "autre",
    goalNom: "Constituer une épargne",
    projectNom: "Plan d'épargne",
    target: 1000000,
    months: 12,
  },
];

export const assistantSuggestions = [
  "Je veux acheter une maison",
  "Je veux organiser mon mariage",
  "Je veux lancer mon business",
  "Je veux voyager à Zanzibar",
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Reads an amount written in different ways (15 millions, 500 000, 2,5 M…). */
export function parseAmount(raw: string): number | null {
  const text = normalize(raw).replace(/\u00a0/g, " ");

  const milliards = text.match(/(\d+(?:[.,]\d+)?)\s*milliards?\b/);
  if (milliards) return Math.round(Number(milliards[1].replace(",", ".")) * 1_000_000_000);

  const millions = text.match(/(\d+(?:[.,]\d+)?)\s*(?:millions?|m)\b/);
  if (millions) return Math.round(Number(millions[1].replace(",", ".")) * 1_000_000);

  const thousands = text.match(/(\d+(?:[.,]\d+)?)\s*(?:mille|k)\b/);
  if (thousands) return Math.round(Number(thousands[1].replace(",", ".")) * 1_000);

  const plain = text.match(/(\d{1,3}(?:[ .]\d{3})+|\d{4,})/);
  if (plain) {
    const cleaned = plain[1].replace(/[ .]/g, "");
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : null;
  }

  return null;
}

/** Reads a duration ("dans 3 ans", "en 2029", "sur 18 mois"). */
export function parseMonths(raw: string, now = new Date()): number | null {
  const text = normalize(raw);

  const months = text.match(/(\d{1,3})\s*mois/);
  if (months) {
    const value = Number(months[1]);
    if (value > 0 && value <= 480) return value;
  }

  const years = text.match(/(\d{1,2})\s*ans?\b/);
  if (years) {
    const value = Number(years[1]);
    if (value > 0 && value <= 40) return value * 12;
  }

  const year = text.match(/\b(20\d{2})\b/);
  if (year) {
    const target = Number(year[1]);
    const diff = (target - now.getFullYear()) * 12 + (11 - now.getMonth());
    if (diff >= 1) return diff;
  }

  return null;
}

/** ISO deadline computed from a duration in months. */
export function deadlineFromMonths(months: number, now = new Date()): string {
  const safeMonths = Math.max(1, Math.min(Math.round(months) || 1, 480));
  const day = Math.min(now.getDate(), 28);
  return toIsoDate(new Date(now.getFullYear(), now.getMonth() + safeMonths, day));
}

export function draftMonthlyEffort(draft: AssistantDraft): number {
  const remaining = Math.max(draft.target - draft.saved, 0);
  if (remaining <= 0) return 0;
  if (draft.months <= 0) return remaining;
  return Math.ceil(remaining / draft.months);
}

export function draftPostes(draft: AssistantDraft): ProjectPoste[] {
  return buildPostesFromTemplate(draft.projectCategorie, Math.max(Math.round(draft.target), 0));
}

export function draftEtapes(draft: AssistantDraft): ProjectEtape[] {
  return buildEtapesFromTemplate(draft.projectCategorie);
}

export function draftPostesPreview(draft: AssistantDraft): { libelle: string; percent: number }[] {
  const template = projectTemplates[draft.projectCategorie] ?? projectTemplates.autre;
  return template.slice(0, 4).map((item) => ({ libelle: item.libelle, percent: item.percent }));
}

export type AssistantAnalysis = {
  reply: string;
  hints: string[];
  draft: AssistantDraft | null;
};

function createDraftKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `plan-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

/**
 * Reads a sentence like "je veux acheter une maison" and proposes
 * first a financial goal (the destination), then the project that funds it (the path).
 */
export function analyzeRequest(
  raw: string,
  options: {
    capacity: number;
    devise: string;
    now?: Date;
    profile?: { label: string; advice: string } | null;
  },
): AssistantAnalysis {
  const now = options.now ?? new Date();
  const text = normalize(raw);
  const rule = INTENT_RULES.find((item) => item.keywords.some((keyword) => text.includes(keyword)));

  if (!rule) {
    return {
      reply:
        "Je n'ai pas encore identifié de destination précise. Dites-moi ce que vous voulez accomplir — par exemple acheter un logement, financer des études ou lancer une activité — et j'en déduis l'objectif puis le projet.",
      hints: assistantSuggestions,
      draft: null,
    };
  }

  const parsedAmount = parseAmount(raw);
  const target = parsedAmount && parsedAmount >= 10000 ? parsedAmount : rule.target;
  const parsedMonths = parseMonths(raw, now);
  const months = parsedMonths ?? rule.months;
  const dateLimite = deadlineFromMonths(months, now);
  const effort = Math.ceil(target / months);

  const draft: AssistantDraft = {
    key: createDraftKey(),
    phrase: raw.trim(),
    goalNom: rule.goalNom,
    goalCategorie: rule.goalCategorie,
    projectNom: rule.projectNom,
    projectCategorie: rule.projectCategorie,
    target,
    saved: 0,
    months,
    dateLimite,
    goalId: null,
    projectId: null,
    status: "idle",
    error: "",
  };

  const capacitySentence =
    options.capacity > 0
      ? effort <= options.capacity
        ? `Avec une capacité d'épargne estimée à ${formatMoney(options.capacity, options.devise)} par mois, cet effort est réalisable.`
        : `Votre capacité d'épargne estimée est de ${formatMoney(options.capacity, options.devise)} par mois : il faudra allonger la durée ou réduire la cible de ${formatMoney(effort - options.capacity, options.devise)} par mois.`
      : "Ajoutez vos revenus et vos dépenses pour que je vérifie si cet effort mensuel est réaliste pour vous.";

  return {
    reply: [
      `J'ai compris : « ${raw.trim()} ».`,
      options.profile
        ? `Je raisonne avec votre profil ${options.profile.label} : ${options.profile.advice}`
        : "",
      `C'est une destination, donc je vous propose un objectif — ${rule.goalNom.toLowerCase()} — puis le projet qui organise le budget pour y arriver.`,
      `Il reste ${formatMoney(target, options.devise)} à financer sur ${months} mois, soit environ ${formatMoney(effort, options.devise)} par mois. ${capacitySentence}`,
    ]
      .filter(Boolean)
      .join(" "),
    hints: [],
    draft,
  };
}