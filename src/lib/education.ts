export type FicheModule =
  | "revenus"
  | "depenses"
  | "budget"
  | "objectifs"
  | "projets"
  | "simulations"
  | "logement"
  | "rapports"
  | "assistant";

export type EducationModuleMeta = {
  value: FicheModule;
  label: string;
  short: string;
  icon: string;
  to: string;
  chip: string;
};

export const educationModules: EducationModuleMeta[] = [
  {
    value: "revenus",
    label: "Revenus",
    short: "Revenus",
    icon: "ri-arrow-down-line",
    to: "/app/revenus",
    chip: "border-primary-200 bg-primary-50 text-primary-800",
  },
  {
    value: "depenses",
    label: "Dépenses",
    short: "Dépenses",
    icon: "ri-arrow-up-line",
    to: "/app/depenses",
    chip: "border-accent-200 bg-accent-50 text-accent-900",
  },
  {
    value: "budget",
    label: "Budget intelligent",
    short: "Budget",
    icon: "ri-pie-chart-2-line",
    to: "/app/budget",
    chip: "border-secondary-200 bg-secondary-100 text-secondary-900",
  },
  {
    value: "objectifs",
    label: "Mes objectifs",
    short: "Objectifs",
    icon: "ri-flag-2-line",
    to: "/app/objectifs",
    chip: "border-primary-200 bg-primary-100 text-primary-900",
  },
  {
    value: "projets",
    label: "Mes projets",
    short: "Projets",
    icon: "ri-building-4-line",
    to: "/app/projets",
    chip: "border-accent-200 bg-accent-100 text-accent-900",
  },
  {
    value: "simulations",
    label: "Simulations",
    short: "Simulations",
    icon: "ri-git-branch-line",
    to: "/app/simulations",
    chip: "border-secondary-200 bg-secondary-50 text-secondary-900",
  },
  {
    value: "logement",
    label: "Conseiller logement",
    short: "Logement",
    icon: "ri-home-5-line",
    to: "/app/logement",
    chip: "border-background-300 bg-background-100 text-foreground-700",
  },
  {
    value: "rapports",
    label: "Rapports",
    short: "Rapports",
    icon: "ri-file-chart-line",
    to: "/app/rapports",
    chip: "border-primary-200 bg-primary-50 text-primary-800",
  },
  {
    value: "assistant",
    label: "Assistant IA",
    short: "Assistant",
    icon: "ri-sparkling-line",
    to: "/app/assistant",
    chip: "border-accent-200 bg-accent-50 text-accent-900",
  },
];

export function getEducationModule(value: string): EducationModuleMeta {
  return educationModules.find((item) => item.value === value) ?? educationModules[0];
}

export const educationCategories = [
  "Tous",
  "Bases",
  "Budget",
  "Épargne",
  "Projets",
  "Crédit",
  "Investissement",
  "Comportement",
] as const;

export type EducationCategory = (typeof educationCategories)[number];

export type Fiche = {
  id: string;
  titre: string;
  categorie: string;
  modules: FicheModule[];
  icon: string;
  minutes: number;
  niveau: string;
  resume: string;
  points: string[];
  exemple: string;
  action: string;
  to: string;
};

export const readStorageKey = "finbuilder_education_read_v1";