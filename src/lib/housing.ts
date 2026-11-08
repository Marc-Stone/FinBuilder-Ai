/**
 * Housing advisor: rent affordability and borrowing capacity.
 * All maths are done locally, no external service.
 */

export const FRAIS_ACQUISITION_RATE = 0.07;

export type HousingInput = {
  revenu: number;
  loyerActuel: number;
  charges: number;
  apport: number;
  prixCible: number;
  tauxAnnuel: number;
  dureeAnnees: number;
  tauxEndettement: number;
};

export type HousingResult = {
  revenu: number;
  /** Apport personnel pris en compte dans le budget d'achat. */
  apport: number;
  mensualiteMax: number;
  capitalEmpruntable: number;
  fraisAcquisition: number;
  budgetAchat: number;
  prixMax: number;
  loyerRecommande: number;
  loyerActuelTotal: number;
  ratioActuel: number;
  ratioCible: number;
  resteAVivre: number;
  resteAVivreApres: number;
  mensualiteCible: number;
  prixCible: number;
  coutTotalCible: number;
  interetsCible: number;
  effortEpargneApport: number;
  verdict: "confort" | "limite" | "risque";
  verdictLabel: string;
  verdictDetail: string;
};

const safe = (value: number) => (Number.isFinite(value) ? value : 0);
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function monthlyPayment(capital: number, tauxAnnuel: number, dureeAnnees: number) {
  const principal = Math.max(safe(capital), 0);
  const months = Math.max(Math.round(safe(dureeAnnees) * 12), 1);
  const rate = Math.max(safe(tauxAnnuel), 0) / 100 / 12;
  if (principal === 0) return 0;
  if (rate === 0) return principal / months;
  return (principal * rate) / (1 - Math.pow(1 + rate, -months));
}

export function borrowingCapacity(
  mensualiteMax: number,
  tauxAnnuel: number,
  dureeAnnees: number,
) {
  const payment = Math.max(safe(mensualiteMax), 0);
  const months = Math.max(Math.round(safe(dureeAnnees) * 12), 1);
  const rate = Math.max(safe(tauxAnnuel), 0) / 100 / 12;
  if (payment === 0) return 0;
  if (rate === 0) return payment * months;
  return (payment * (1 - Math.pow(1 + rate, -months))) / rate;
}

export function computeHousingPlan(input: HousingInput): HousingResult {
  const revenu = Math.max(safe(input.revenu), 0);
  const loyerActuel = Math.max(safe(input.loyerActuel), 0);
  const charges = Math.max(safe(input.charges), 0);
  const apport = Math.max(safe(input.apport), 0);
  const prixCible = Math.max(safe(input.prixCible), 0);
  const tauxAnnuel = clamp(safe(input.tauxAnnuel), 0, 40);
  const dureeAnnees = clamp(Math.round(safe(input.dureeAnnees)), 1, 40);
  const tauxEndettement = clamp(safe(input.tauxEndettement), 10, 50);

  const mensualiteMax = (revenu * tauxEndettement) / 100;
  const capitalEmpruntable = borrowingCapacity(mensualiteMax, tauxAnnuel, dureeAnnees);
  const budgetAchat = capitalEmpruntable + apport;
  const prixMax = budgetAchat / (1 + FRAIS_ACQUISITION_RATE);
  const fraisAcquisition = budgetAchat - prixMax;

  const loyerRecommande = revenu * 0.3;
  const loyerActuelTotal = loyerActuel + charges;
  const ratioActuel = revenu > 0 ? (loyerActuelTotal / revenu) * 100 : 0;

  const mensualiteCible = monthlyPayment(prixCible, tauxAnnuel, dureeAnnees);
  const coutTotalCible = mensualiteCible * dureeAnnees * 12;
  const interetsCible = Math.max(coutTotalCible - prixCible, 0);
  const ratioCible = revenu > 0 ? (mensualiteCible / revenu) * 100 : 0;

  const resteAVivre = revenu - loyerActuelTotal;
  const resteAVivreApres = revenu - mensualiteMax - charges;
  const effortEpargneApport = prixMax > 0 ? (apport / prixMax) * 100 : 0;

  let verdict: HousingResult["verdict"] = "confort";
  let verdictLabel = "Confortable";
  let verdictDetail = "Votre logement actuel reste dans la zone recommandée.";

  if (revenu <= 0) {
    verdict = "limite";
    verdictLabel = "À renseigner";
    verdictDetail = "Ajoutez un revenu mensuel pour évaluer votre situation.";
  } else if (ratioActuel > 40) {
    verdict = "risque";
    verdictLabel = "Sous tension";
    verdictDetail = "Votre logement pèse trop lourd : plus de 40 % de vos revenus.";
  } else if (ratioActuel > 33) {
    verdict = "limite";
    verdictLabel = "À surveiller";
    verdictDetail = "Vous dépassez la règle des 30 % : peu de marge pour épargner.";
  }

  return {
    revenu,
    apport: Math.round(apport),
    mensualiteMax: Math.round(mensualiteMax),
    capitalEmpruntable: Math.round(capitalEmpruntable),
    fraisAcquisition: Math.round(fraisAcquisition),
    budgetAchat: Math.round(budgetAchat),
    prixMax: Math.round(prixMax),
    loyerRecommande: Math.round(loyerRecommande),
    loyerActuelTotal: Math.round(loyerActuelTotal),
    ratioActuel,
    ratioCible,
    resteAVivre: Math.round(resteAVivre),
    resteAVivreApres: Math.round(resteAVivreApres),
    mensualiteCible: Math.round(mensualiteCible),
    prixCible: Math.round(prixCible),
    coutTotalCible: Math.round(coutTotalCible),
    interetsCible: Math.round(interetsCible),
    effortEpargneApport,
    verdict,
    verdictLabel,
    verdictDetail,
  };
}

export type HousingAdvice = {
  icon: string;
  tone: "primary" | "accent" | "secondary";
  title: string;
  text: string;
};

export function buildHousingAdvice(result: HousingResult, devise: string): HousingAdvice[] {
  const money = (value: number) =>
    `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(value))} ${devise}`;
  const advice: HousingAdvice[] = [];

  if (result.revenu <= 0) {
    return [
      {
        icon: "ri-information-line",
        tone: "secondary",
        title: "Commencez par vos revenus",
        text: "La capacité d'emprunt et le loyer soutenable se calculent à partir de votre revenu net mensuel.",
      },
    ];
  }

  if (result.ratioActuel > 33) {
    advice.push({
      icon: "ri-alert-line",
      tone: "accent",
      title: "Réduisez la charge du logement",
      text: `Votre logement absorbe ${Math.round(result.ratioActuel)} % de vos revenus. L'idéal est de rester sous 30 %, soit ${money(result.loyerRecommande)} charges comprises.`,
    });
  } else {
    advice.push({
      icon: "ri-checkbox-circle-line",
      tone: "primary",
      title: "Votre logement est soutenable",
      text: `Vous êtes à ${Math.round(result.ratioActuel)} % de vos revenus, sous le plafond de 33 %. La marge peut financer votre épargne.`,
    });
  }

  if (result.resteAVivreApres < 0) {
    advice.push({
      icon: "ri-error-warning-line",
      tone: "accent",
      title: "Mensualité maximale trop élevée",
      text: `En empruntant au plafond, il ne resterait rien pour vivre après ${money(result.mensualiteMax)} de mensualité et vos charges. Visez une mensualité plus basse.`,
    });
  } else {
    advice.push({
      icon: "ri-wallet-3-line",
      tone: "secondary",
      title: "Reste à vivre estimé",
      text: `Après une mensualité de ${money(result.mensualiteMax)} et vos charges, il resterait ${money(result.resteAVivreApres)} par mois pour le reste du quotidien.`,
    });
  }

  advice.push({
    icon: "ri-building-2-line",
    tone: "primary",
    title: "Votre budget d'achat réaliste",
    text: `Avec ${money(result.apport)} d'apport, vous pouvez viser un bien autour de ${money(result.prixMax)} (dont ${money(result.fraisAcquisition)} de frais d'acquisition à 7 %).`,
  });

  if (result.effortEpargneApport < 20) {
    advice.push({
      icon: "ri-hand-coin-line",
      tone: "secondary",
      title: "Renforcez l'apport",
      text: `Votre apport ne couvre que ${Math.round(result.effortEpargneApport)} % du prix. Viser 20 % réduit le coût du crédit et rassure le prêteur.`,
    });
  }

  return advice;
}