/**
 * "What if" simulation engine.
 * Everything is computed locally from the user's real monthly baseline.
 */

export type SimulationBaseline = {
  revenu: number;
  depenses: number;
};

export type SimulationInput = SimulationBaseline & {
  /** Variation of income in percent (can be negative). */
  revenuVariation: number;
  /** Reduction of expenses in percent (positive = money saved). */
  depensesReduction: number;
  /** Extra amount put aside each month, on top of the resulting capacity. */
  epargneAdditionnelle: number;
  /** Horizon of the projection, in months. */
  horizonMois: number;
};

export type SimulationResult = {
  revenuActuel: number;
  depensesActuelles: number;
  capaciteActuelle: number;
  revenuFinal: number;
  depensesFinales: number;
  capaciteFinale: number;
  gainMensuel: number;
  tauxEpargneActuel: number;
  tauxEpargneFinal: number;
  capitalActuel: number;
  capitalScenario: number;
  ecartCapital: number;
  horizonMois: number;
};

const safe = (value: number) => (Number.isFinite(value) ? value : 0);
const bounded = (value: number, min: number, max: number) =>
  Math.min(Math.max(safe(value), min), max);

export function computeSimulation(input: SimulationInput): SimulationResult {
  const revenuActuel = Math.max(safe(input.revenu), 0);
  const depensesActuelles = Math.max(safe(input.depenses), 0);
  const revenuFinal = Math.max(revenuActuel * (1 + bounded(input.revenuVariation, -80, 200) / 100), 0);
  const depensesFinales = Math.max(
    depensesActuelles * (1 - bounded(input.depensesReduction, 0, 100) / 100),
    0,
  );
  const horizonMois = Math.max(Math.round(safe(input.horizonMois)), 1);

  const capaciteActuelle = revenuActuel - depensesActuelles;
  const capaciteBrute = revenuFinal - depensesFinales;
  const capaciteFinale = capaciteBrute + Math.max(safe(input.epargneAdditionnelle), 0);

  return {
    revenuActuel,
    depensesActuelles,
    capaciteActuelle,
    revenuFinal: Math.round(revenuFinal),
    depensesFinales: Math.round(depensesFinales),
    capaciteFinale: Math.round(capaciteFinale),
    gainMensuel: Math.round(capaciteFinale - capaciteActuelle),
    tauxEpargneActuel: revenuActuel > 0 ? (capaciteActuelle / revenuActuel) * 100 : 0,
    tauxEpargneFinal: revenuFinal > 0 ? (capaciteFinale / revenuFinal) * 100 : 0,
    capitalActuel: Math.round(Math.max(capaciteActuelle, 0) * horizonMois),
    capitalScenario: Math.round(Math.max(capaciteFinale, 0) * horizonMois),
    ecartCapital: Math.round((Math.max(capaciteFinale, 0) - Math.max(capaciteActuelle, 0)) * horizonMois),
    horizonMois,
  };
}

export type ProjectionPoint = {
  mois: number;
  label: string;
  actuel: number;
  scenario: number;
};

/** Cumulative savings curve for both paths, sampled to stay readable. */
export function buildProjection(
  result: SimulationResult,
  horizonMois: number,
  samples = 8,
): ProjectionPoint[] {
  const months = Math.max(Math.round(horizonMois), 1);
  const points: ProjectionPoint[] = [];
  const actuel = Math.max(result.capaciteActuelle, 0);
  const scenario = Math.max(result.capaciteFinale, 0);

  for (let index = 0; index <= samples; index += 1) {
    const mois = Math.round((months / samples) * index);
    points.push({
      mois,
      label: mois === 0 ? "Aujourd'hui" : `M+${mois}`,
      actuel: Math.round(actuel * mois),
      scenario: Math.round(scenario * mois),
    });
  }

  return points;
}

export type ScenarioPreset = {
  id: string;
  label: string;
  description: string;
  icon: string;
  revenuVariation: number;
  depensesReduction: number;
  epargneAdditionnelle: number;
};

export const scenarioPresets: ScenarioPreset[] = [
  {
    id: "envies",
    label: "Réduire mes envies de 20 %",
    description: "Sorties, shopping et abonnements ramenés à un niveau plus raisonnable.",
    icon: "ri-shopping-bag-3-line",
    revenuVariation: 0,
    depensesReduction: 20,
    epargneAdditionnelle: 0,
  },
  {
    id: "revenu",
    label: "Augmenter mes revenus de 10 %",
    description: "Négociation salariale, mission supplémentaire ou petit contrat en plus.",
    icon: "ri-arrow-up-double-line",
    revenuVariation: 10,
    depensesReduction: 0,
    epargneAdditionnelle: 0,
  },
  {
    id: "combine",
    label: "Le plan équilibré",
    description: "5 % de revenus en plus et 10 % de dépenses en moins, sans se priver.",
    icon: "ri-scales-3-line",
    revenuVariation: 5,
    depensesReduction: 10,
    epargneAdditionnelle: 0,
  },
  {
    id: "discipliné",
    label: "Discipline d'épargne",
    description: "Un versement automatique fixe en début de mois, coûte que coûte.",
    icon: "ri-safe-2-line",
    revenuVariation: 0,
    depensesReduction: 0,
    epargneAdditionnelle: 25000,
  },
];

/**
 * Months needed to reach a target with a given monthly effort.
 * Returns Infinity when the effort cannot reach the target.
 */
export function monthsToTarget(target: number, deja: number, mensuel: number): number {
  const restant = Math.max(safe(target) - safe(deja), 0);
  if (restant <= 0) return 0;
  if (mensuel <= 0) return Number.POSITIVE_INFINITY;
  return Math.ceil(restant / mensuel);
}

export function describeMonths(months: number): string {
  if (!Number.isFinite(months)) return "hors d'atteinte";
  if (months <= 0) return "déjà atteint";
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (rest === 0) return `${years} an${years > 1 ? "s" : ""}`;
  return `${years} an${years > 1 ? "s" : ""} et ${rest} mois`;
}