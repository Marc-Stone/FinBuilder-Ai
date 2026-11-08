import { parseIsoDate } from "@/lib/finance";

export type ProjectPoste = {
  id: string;
  libelle: string;
  categorie: string;
  prevu: number;
  depense: number;
};

export type ProjectEtapeStatus = "a_faire" | "en_cours" | "termine";

/** One step of the project action plan. */
export type ProjectEtape = {
  id: string;
  libelle: string;
  statut: ProjectEtapeStatus;
};

/** A document reference attached to the project (name + optional link). */
export type ProjectDocument = {
  id: string;
  nom: string;
  url: string | null;
};

/** Une dépense rattachée au projet (issue du module Dépenses). */
export type LinkedExpenseRow = {
  montant: number;
  categorie: string;
  date?: string;
  description?: string | null;
};

export type ProjectEntry = {
  id: string;
  nom: string;
  categorie: string;
  description: string | null;
  budget_total: number;
  montant_finance: number;
  /** Savings goal financing this project, when one is linked. */
  goal_id?: string | null;
  postes: ProjectPoste[];
  /** Action plan steps (planning). */
  etapes?: ProjectEtape[];
  /** Attached documents. */
  documents?: ProjectDocument[];
  date_debut: string | null;
  date_fin: string | null;
  statut: string;
  priorite: string;
  note: string | null;
  /** Dépenses du module Dépenses rattachées à ce projet (chargées à la lecture). */
  expenses_liees?: LinkedExpenseRow[];
};

export type ProjectCategoryMeta = {
  value: string;
  label: string;
  icon: string;
  bubble: string;
  badge: string;
  bar: string;
};

export const projectCategories: ProjectCategoryMeta[] = [
  {
    value: "logement",
    label: "Logement",
    icon: "ri-home-5-line",
    bubble: "bg-primary-50 text-primary-700",
    badge: "border-primary-200 bg-primary-50 text-primary-800",
    bar: "bg-primary-600",
  },
  {
    value: "vehicule",
    label: "Véhicule",
    icon: "ri-car-line",
    bubble: "bg-secondary-100 text-secondary-800",
    badge: "border-secondary-200 bg-secondary-100 text-secondary-900",
    bar: "bg-secondary-600",
  },
  {
    value: "mariage",
    label: "Mariage / cérémonie",
    icon: "ri-heart-3-line",
    bubble: "bg-accent-50 text-accent-700",
    badge: "border-accent-200 bg-accent-50 text-accent-900",
    bar: "bg-accent-500",
  },
  {
    value: "business",
    label: "Business",
    icon: "ri-store-2-line",
    bubble: "bg-primary-100 text-primary-800",
    badge: "border-primary-200 bg-primary-100 text-primary-900",
    bar: "bg-primary-500",
  },
  {
    value: "education",
    label: "Éducation",
    icon: "ri-graduation-cap-line",
    bubble: "bg-secondary-50 text-secondary-800",
    badge: "border-secondary-200 bg-secondary-50 text-secondary-800",
    bar: "bg-secondary-500",
  },
  {
    value: "voyage",
    label: "Voyage",
    icon: "ri-plane-line",
    bubble: "bg-accent-100 text-accent-800",
    badge: "border-accent-200 bg-accent-100 text-accent-900",
    bar: "bg-accent-600",
  },
  {
    value: "autre",
    label: "Autre projet",
    icon: "ri-building-4-line",
    bubble: "bg-background-100 text-foreground-600",
    badge: "border-background-300 bg-background-100 text-foreground-700",
    bar: "bg-foreground-400",
  },
];

export function getProjectCategory(value: string): ProjectCategoryMeta {
  return (
    projectCategories.find((item) => item.value === value) ??
    projectCategories[projectCategories.length - 1]
  );
}

export const projectStatuses = [
  {
    value: "preparation",
    label: "En préparation",
    tone: "border-background-300 bg-background-100 text-foreground-700",
    icon: "ri-draft-line",
  },
  {
    value: "en_cours",
    label: "En cours",
    tone: "border-primary-200 bg-primary-50 text-primary-800",
    icon: "ri-loader-3-line",
  },
  {
    value: "termine",
    label: "Terminé",
    tone: "border-primary-300 bg-primary-100 text-primary-900",
    icon: "ri-checkbox-circle-line",
  },
  {
    value: "suspendu",
    label: "En pause",
    tone: "border-accent-300 bg-accent-50 text-accent-900",
    icon: "ri-pause-circle-line",
  },
];

export function getProjectStatus(value: string) {
  return projectStatuses.find((item) => item.value === value) ?? projectStatuses[0];
}

export const projectPriorities = [
  { value: "haute", label: "Priorité haute", tone: "border-accent-300 bg-accent-50 text-accent-900" },
  { value: "moyenne", label: "Priorité moyenne", tone: "border-secondary-200 bg-secondary-100 text-secondary-900" },
  { value: "basse", label: "Priorité basse", tone: "border-background-300 bg-background-100 text-foreground-700" },
];

export function getProjectPriority(value: string) {
  return projectPriorities.find((item) => item.value === value) ?? projectPriorities[1];
}

/** Colours used to draw the allocation bar of each poste. */
export const posteBarTones = [
  "bg-primary-600",
  "bg-secondary-500",
  "bg-accent-500",
  "bg-primary-400",
  "bg-secondary-700",
  "bg-accent-600",
  "bg-foreground-400",
];

export function posteTone(index: number) {
  return posteBarTones[index % posteBarTones.length];
}

export function createPosteId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `poste-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

/** Reads the jsonb column safely, whatever shape was stored. */
export function parsePostes(value: unknown): ProjectPoste[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      id: typeof item.id === "string" && item.id ? item.id : createPosteId(),
      libelle: typeof item.libelle === "string" ? item.libelle : "",
      categorie: typeof item.categorie === "string" ? item.categorie : "autre",
      prevu: Number.isFinite(Number(item.prevu)) ? Number(item.prevu) : 0,
      depense: Number.isFinite(Number(item.depense)) ? Number(item.depense) : 0,
    }))
    .filter((item) => item.libelle.trim().length > 0);
}

export const etapeStatuses: { value: ProjectEtapeStatus; label: string; short: string; icon: string; tone: string }[] = [
  {
    value: "a_faire",
    label: "À faire",
    short: "À faire",
    icon: "ri-checkbox-blank-circle-line",
    tone: "border-background-300 bg-background-100 text-foreground-600",
  },
  {
    value: "en_cours",
    label: "En cours",
    short: "En cours",
    icon: "ri-timer-line",
    tone: "border-accent-300 bg-accent-50 text-accent-900",
  },
  {
    value: "termine",
    label: "Terminée",
    short: "Terminé",
    icon: "ri-checkbox-circle-line",
    tone: "border-primary-200 bg-primary-50 text-primary-800",
  },
];

export function getEtapeStatus(value: string) {
  return etapeStatuses.find((item) => item.value === value) ?? etapeStatuses[0];
}

/** Reads the jsonb steps column safely. */
export function parseEtapes(value: unknown): ProjectEtape[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => {
      const statut = item.statut === "termine" || item.statut === "en_cours" ? item.statut : "a_faire";
      return {
        id: typeof item.id === "string" && item.id ? item.id : createPosteId(),
        libelle: typeof item.libelle === "string" ? item.libelle : "",
        statut: statut as ProjectEtapeStatus,
      };
    })
    .filter((item) => item.libelle.trim().length > 0);
}

/** Reads the jsonb documents column safely. */
export function parseDocuments(value: unknown): ProjectDocument[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      id: typeof item.id === "string" && item.id ? item.id : createPosteId(),
      nom: typeof item.nom === "string" ? item.nom : "",
      url: typeof item.url === "string" && item.url.trim() ? item.url.trim() : null,
    }))
    .filter((item) => item.nom.trim().length > 0);
}

/** Default action plan proposed for each project type. */
export const projectEtapeTemplates: Record<string, string[]> = {
  logement: [
    "Définir le budget et le terrain",
    "Acheter le terrain",
    "Faire réaliser les plans",
    "Construire les fondations",
    "Élever les murs et la toiture",
    "Finitions et aménagement",
  ],
  vehicule: [
    "Choisir le modèle et le budget",
    "Comparer les offres",
    "Obtenir le financement",
    "Acheter le véhicule",
    "Assurance et carte grise",
  ],
  mariage: [
    "Fixer la date et le budget",
    "Réserver la salle",
    "Choisir le traiteur",
    "Tenues et cérémonie",
    "Voyage de noces",
  ],
  business: [
    "Étude de marché",
    "Formalités et création",
    "Local et équipement",
    "Stock de départ",
    "Lancement commercial",
  ],
  education: [
    "Choisir la formation",
    "Constituer le dossier",
    "Payer les frais de scolarité",
    "Organiser le logement",
    "Rentrée et installation",
  ],
  voyage: [
    "Choisir la destination",
    "Réserver les billets",
    "Réserver l'hébergement",
    "Préparer les activités",
    "Départ",
  ],
  autre: [
    "Cadrer le projet",
    "Chiffrer les besoins",
    "Lancer la première étape",
    "Suivre l'avancement",
    "Clôturer le projet",
  ],
};

/** Builds the suggested action plan of a project type. */
export function buildEtapesFromTemplate(categorie: string): ProjectEtape[] {
  const template = projectEtapeTemplates[categorie] ?? projectEtapeTemplates.autre;
  return template.map((libelle) => ({ id: createPosteId(), libelle, statut: "a_faire" as ProjectEtapeStatus }));
}

export function computeEtapesProgress(etapes: ProjectEtape[]) {
  const total = etapes.length;
  const termines = etapes.filter((etape) => etape.statut === "termine").length;
  const enCours = etapes.filter((etape) => etape.statut === "en_cours").length;
  const progression = total > 0 ? Math.min((termines / total) * 100, 100) : 0;
  return { total, termines, enCours, progression };
}

/**
 * Progress of a project read straight from the stored columns.
 * Used where the full project object is not needed (e.g. goal cards).
 */
export function progressFromStored(etapes: unknown, postes: unknown): number {
  const steps = computeEtapesProgress(parseEtapes(etapes));
  if (steps.total > 0) return Math.round(steps.progression);
  const postesList = parsePostes(postes);
  const prevu = postesList.reduce((total, poste) => total + poste.prevu, 0);
  const depense = postesList.reduce((total, poste) => total + poste.depense, 0);
  return prevu > 0 ? Math.round(Math.min((depense / prevu) * 100, 100)) : 0;
}

/**
 * Overall project progress: the action plan when it exists, otherwise budget consumption.
 * This is the number shown on the linked savings goal.
 */
export function projectOverallProgress(project: ProjectEntry): number {
  const etapes = parseEtapes(project.etapes);
  if (etapes.length > 0) {
    const steps = computeEtapesProgress(etapes);
    if (steps.termines === 0 && steps.enCours > 0) {
      return Math.max(Math.round(((steps.termines + 0.5) / steps.total) * 100), 1);
    }
    return Math.round(steps.progression);
  }
  return Math.round(computeProjectMetrics(project).progression);
}

type PosteTemplate = { libelle: string; categorie: string; percent: number };

/** Recommended budget split per project category. Percentages add up to 100. */
export const projectTemplates: Record<string, PosteTemplate[]> = {
  logement: [
    { libelle: "Terrain", categorie: "logement", percent: 30 },
    { libelle: "Construction / travaux", categorie: "logement", percent: 42 },
    { libelle: "Études, permis & notaire", categorie: "logement", percent: 8 },
    { libelle: "Aménagement & équipement", categorie: "logement", percent: 12 },
    { libelle: "Imprévus", categorie: "logement", percent: 8 },
  ],
  vehicule: [
    { libelle: "Achat du véhicule", categorie: "transport", percent: 68 },
    { libelle: "Carte grise & taxes", categorie: "transport", percent: 9 },
    { libelle: "Assurance", categorie: "transport", percent: 8 },
    { libelle: "Entretien & révision", categorie: "transport", percent: 10 },
    { libelle: "Imprévus", categorie: "transport", percent: 5 },
  ],
  mariage: [
    { libelle: "Salle & traiteur", categorie: "famille", percent: 34 },
    { libelle: "Tenues & beauté", categorie: "famille", percent: 15 },
    { libelle: "Dot & cérémonie", categorie: "famille", percent: 21 },
    { libelle: "Photo & vidéo", categorie: "famille", percent: 12 },
    { libelle: "Musique, déco & invitation", categorie: "famille", percent: 10 },
    { libelle: "Imprévus", categorie: "famille", percent: 8 },
  ],
  business: [
    { libelle: "Matériel & équipement", categorie: "business", percent: 32 },
    { libelle: "Stock de départ", categorie: "business", percent: 28 },
    { libelle: "Local & installation", categorie: "business", percent: 15 },
    { libelle: "Marketing & lancement", categorie: "business", percent: 10 },
    { libelle: "Trésorerie de sécurité", categorie: "business", percent: 10 },
    { libelle: "Formalités", categorie: "business", percent: 5 },
  ],
  education: [
    { libelle: "Frais de scolarité", categorie: "education", percent: 52 },
    { libelle: "Matériel & livres", categorie: "education", percent: 14 },
    { libelle: "Logement étudiant", categorie: "logement", percent: 18 },
    { libelle: "Transport", categorie: "transport", percent: 11 },
    { libelle: "Imprévus", categorie: "education", percent: 5 },
  ],
  voyage: [
    { libelle: "Billets & transport", categorie: "transport", percent: 36 },
    { libelle: "Hébergement", categorie: "loisirs", percent: 30 },
    { libelle: "Activités & visites", categorie: "loisirs", percent: 17 },
    { libelle: "Restauration", categorie: "alimentation", percent: 12 },
    { libelle: "Imprévus", categorie: "autre", percent: 5 },
  ],
  autre: [
    { libelle: "Phase 1", categorie: "autre", percent: 30 },
    { libelle: "Phase 2", categorie: "autre", percent: 30 },
    { libelle: "Matériel", categorie: "autre", percent: 20 },
    { libelle: "Prestations", categorie: "autre", percent: 15 },
    { libelle: "Imprévus", categorie: "autre", percent: 5 },
  ],
};

/** Turns the recommended split of a category into real postes for a given budget. */
export function buildPostesFromTemplate(categorie: string, budget: number): ProjectPoste[] {
  const template = projectTemplates[categorie] ?? projectTemplates.autre;
  const total = Number.isFinite(budget) && budget > 0 ? Math.round(budget) : 0;
  if (total <= 0) return [];

  let allocated = 0;
  return template.map((item, index) => {
    const isLast = index === template.length - 1;
    const montant = isLast ? Math.max(total - allocated, 0) : Math.round((total * item.percent) / 100);
    allocated += montant;
    return {
      id: createPosteId(),
      libelle: item.libelle,
      categorie: item.categorie,
      prevu: montant,
      depense: 0,
    };
  });
}

export function recommendedSplitLabel(categorie: string) {
  const template = projectTemplates[categorie] ?? projectTemplates.autre;
  return template.map((item) => `${item.percent}% ${item.libelle}`).join(" · ");
}

export type ProjectMetrics = {
  enveloppe: number;
  finance: number;
  enveloppeManquante: number;
  financementProgression: number;
  prevuTotal: number;
  depenseTotal: number;
  /** Part des dépenses venues du module Dépenses (rattachées au projet). */
  depenseLiee: number;
  nonAlloue: number;
  couverture: number;
  progression: number;
  reste: number;
  postePrincipal: { libelle: string; montant: number } | null;
  lignes: (ProjectPoste & { part: number; progression: number; ecart: number })[];
  termine: boolean;
  enRetard: boolean;
};

/** Computes allocation, consumption and remaining amounts for one project. */
export function computeProjectMetrics(project: ProjectEntry, now = new Date()): ProjectMetrics {
  const postes = parsePostes(project.postes);
  const budget = Number(project.budget_total) || 0;
  const finance = Number(project.montant_finance) || 0;
  const enveloppeManquante = Math.max(budget - finance, 0);
  const financementProgression = budget > 0 ? Math.min((finance / budget) * 100, 100) : 0;

  // Dépenses saisies dans le module Dépenses et rattachées à ce projet.
  const liees = Array.isArray(project.expenses_liees) ? project.expenses_liees : [];
  const lieesParCategorie: Record<string, number> = {};
  liees.forEach((row) => {
    const montant = Number(row.montant) || 0;
    const categorie = row.categorie || "autre";
    lieesParCategorie[categorie] = (lieesParCategorie[categorie] ?? 0) + montant;
  });
  const resteALier = { ...lieesParCategorie };

  const prevuTotal = postes.reduce((total, poste) => total + (Number(poste.prevu) || 0), 0);

  const lignes = postes.map((poste) => {
    const prevu = Number(poste.prevu) || 0;
    // Une dépense liée est imputée au premier poste de sa catégorie.
    const impute = resteALier[poste.categorie] ?? 0;
    resteALier[poste.categorie] = 0;
    const depense = (Number(poste.depense) || 0) + impute;
    return {
      ...poste,
      prevu,
      depense,
      depenseManuelle: Number(poste.depense) || 0,
      depenseLiee: impute,
      part: prevuTotal > 0 ? (prevu / prevuTotal) * 100 : 0,
      progression: prevu > 0 ? Math.min((depense / prevu) * 100, 100) : 0,
      ecart: depense - prevu,
    };
  });

  // Une dépense liée sans poste correspondant reste comptée dans le total.
  const nonImpute = Object.values(resteALier).reduce((total, value) => total + value, 0);
  const depenseTotal = lignes.reduce((total, ligne) => total + ligne.depense, 0) + nonImpute;
  const reste = Math.max(prevuTotal - depenseTotal, 0);
  const progression = prevuTotal > 0 ? Math.min((depenseTotal / prevuTotal) * 100, 100) : 0;
  const nonAlloue = budget - prevuTotal;
  const couverture = budget > 0 ? (prevuTotal / budget) * 100 : 0;

  const postePrincipal = [...lignes].sort((a, b) => b.prevu - a.prevu)[0] ?? null;

  const termine = postes.length > 0 && prevuTotal > 0 && depenseTotal >= prevuTotal;
  const enRetard = Boolean(
    project.date_fin &&
      project.statut !== "termine" &&
      parseIsoDate(project.date_fin).getTime() < now.getTime(),
  );

  return {
    enveloppe: budget,
    finance,
    enveloppeManquante,
    financementProgression,
    prevuTotal,
    depenseTotal,
    depenseLiee: liees.reduce((total, row) => total + (Number(row.montant) || 0), 0),
    nonAlloue,
    couverture,
    progression,
    reste,
    postePrincipal: postePrincipal ? { libelle: postePrincipal.libelle, montant: postePrincipal.prevu } : null,
    lignes,
    termine,
    enRetard,
  };
}

/** Dépense minimale nécessaire pour rattacher un projet. */
export type LinkedExpenseSource = {
  project_id?: string | null;
  montant: number;
  categorie: string;
  date?: string;
  description?: string | null;
};

/**
 * Rattache les dépenses du module Dépenses à leur projet.
 * Une seule requête alimente tous les projets : aucun écrasement, aucune double saisie.
 */
export function attachLinkedExpenses<T extends { id: string }>(
  projects: T[],
  expenses: LinkedExpenseSource[],
): (T & { expenses_liees: LinkedExpenseRow[] })[] {
  const byProject = new Map<string, LinkedExpenseRow[]>();
  expenses.forEach((row) => {
    if (!row.project_id) return;
    const list = byProject.get(row.project_id) ?? [];
    list.push({
      montant: Number(row.montant) || 0,
      categorie: row.categorie || "autre",
      date: row.date,
      description: row.description ?? null,
    });
    byProject.set(row.project_id, list);
  });

  return projects.map((project) => ({
    ...project,
    expenses_liees: byProject.get(project.id) ?? [],
  }));
}

export function formatDaysRange(start: string | null, end: string | null) {
  if (!start && !end) return "Dates libres";
  if (start && !end) return `Depuis ${parseIsoDate(start).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}`;
  if (!start && end) return `Jusqu'au ${parseIsoDate(end).toLocaleDateString("fr-FR")}`;
  const startDate = parseIsoDate(start as string);
  const endDate = parseIsoDate(end as string);
  const months = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)),
  );
  return `${startDate.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} → ${endDate.toLocaleDateString(
    "fr-FR",
    { month: "short", year: "numeric" },
  )} · ${months} mois`;
}