export const heroStats = [
  { value: "6", label: "profils financiers couverts" },
  { value: "FCFA", label: "devise par défaut" },
  { value: "Aucune", label: "connexion bancaire requise" },
];

export const trustBadges = [
  "Mobile Money",
  "Virements bancaires",
  "Espèces",
  "Carte bancaire",
  "Freelance & business",
];

export const steps = [
  {
    number: "01",
    title: "Renseignez vos revenus",
    description:
      "Salaire, missions freelance, business ou revenus locatifs : ajoutez vos entrées d'argent en moins de deux minutes.",
    icon: "ri-wallet-3-line",
  },
  {
    number: "02",
    title: "L'IA analyse votre situation",
    description:
      "FinBuilder calcule votre capacité d'épargne réelle, compare vos postes de dépenses et repère les fuites invisibles.",
    icon: "ri-sparkling-line",
  },
  {
    number: "03",
    title: "Suivez votre plan chaque mois",
    description:
      "Budget, objectifs et projets sont chiffrés. Vous savez exactement combien mettre de côté chaque mois.",
    icon: "ri-route-line",
  },
];

export const featureCards = [
  {
    icon: "ri-sparkling-line",
    title: "Assistant IA FinBuilder",
    description:
      "Posez une question concrète — « Puis-je louer à 150 000 FCFA ? » — et recevez une analyse chiffrée avec un plan d'action.",
    tag: "IA",
  },
  {
    icon: "ri-pie-chart-2-line",
    title: "Budget intelligent",
    description:
      "Votre revenu réparti automatiquement selon les standards de votre profil, ajustable poste par poste, avec un score de santé sur 100.",
    tag: "Budget",
  },
  {
    icon: "ri-flag-2-line",
    title: "Objectifs financiers",
    description:
      "Maison, voiture, mariage, formation : FinBuilder calcule l'effort mensuel nécessaire et suit votre progression.",
    tag: "Épargne",
  },
  {
    icon: "ri-building-4-line",
    title: "Projets planifiés",
    description:
      "Enveloppe, postes de dépenses, étapes datées, documents et simulateur d'épargne mensuelle : votre projet suivi jusqu'à l'ouverture.",
    tag: "Projets",
  },
  {
    icon: "ri-user-star-line",
    title: "Profil financier",
    description:
      "Six situations couvertes — étudiant, salarié, entrepreneur, freelance, famille, retraité — pour un espace calibré sur votre réalité.",
    tag: "Personnalisation",
  },
  {
    icon: "ri-line-chart-line",
    title: "Simulations « Et si… »",
    description:
      "Testez un déménagement, un crédit ou une augmentation avant de décider, avec comparaison avant / après.",
    tag: "Décision",
  },
  {
    icon: "ri-home-4-line",
    title: "Conseiller logement",
    description:
      "Loyer, eau, électricité, internet, transport : le vrai coût du logement estimé selon votre ville et votre foyer.",
    tag: "Logement",
  },
  {
    icon: "ri-book-open-line",
    title: "Éducation financière",
    description:
      "Des fiches courtes sur le budget, l'épargne, le crédit et l'investissement, avec exemples en FCFA et renvoi vers le module concerné.",
    tag: "Apprentissage",
  },
  {
    icon: "ri-file-chart-line",
    title: "Rapports & exports",
    description:
      "Rapport mensuel et annuel prêts à imprimer, export de vos données pour votre comptable ou votre banque.",
    tag: "Reporting",
  },
];

export const financialProfileTypes = [
  {
    label: "Étudiant",
    icon: "ri-graduation-cap-line",
    tagline: "Budget limité, formation à financer",
  },
  {
    label: "Salarié",
    icon: "ri-briefcase-4-line",
    tagline: "Salaire fixe, patrimoine à construire",
  },
  {
    label: "Entrepreneur",
    icon: "ri-store-2-line",
    tagline: "Trésorerie et activité séparées",
  },
  {
    label: "Freelance",
    icon: "ri-computer-line",
    tagline: "Revenus irréguliers à lisser",
  },
  {
    label: "Famille",
    icon: "ri-parent-line",
    tagline: "Charges du foyer et objectifs communs",
  },
  {
    label: "Retraité",
    icon: "ri-user-heart-line",
    tagline: "Revenus fixes et patrimoine à protéger",
  },
];

export const profilePreview = {
  income: "450 000",
  family: "4 personnes",
  goals: ["Apport maison", "Voiture", "Fonds d'urgence"],
  advice:
    "Avec un salaire fixe, automatisez une épargne de 10 à 20 % dès la paie. Le reste devient votre budget de vie, et vos primes financent vos projets plutôt que le train de vie.",
};

export const projectPreview = {
  name: "Terrain + construction",
  type: "Immobilier",
  envelope: "12 000 000",
  saved: "4 350 000",
  remaining: "7 650 000",
  progress: 36,
  postes: [
    { label: "Terrain", amount: "4 500 000", share: 38, tone: "primary" },
    { label: "Construction", amount: "5 800 000", share: 48, tone: "primary" },
    { label: "Notaire & frais", amount: "1 200 000", share: 10, tone: "accent" },
    { label: "Ameublement", amount: "500 000", share: 4, tone: "secondary" },
  ],
  etapes: [
    { label: "Devis et vérification du terrain", date: "Mars 2026", state: "done" },
    { label: "Achat du terrain", date: "Août 2026", state: "current" },
    { label: "Démarrage des travaux", date: "Janvier 2027", state: "next" },
  ],
  savings: [
    { months: 12, monthly: "637 500", weekly: "147 115" },
    { months: 24, monthly: "318 750", weekly: "73 558" },
    { months: 36, monthly: "212 500", weekly: "49 038" },
  ],
};

/* Données de démonstration du tableau de bord : les montants sont les seules
   valeurs sources, tous les pourcentages et totaux sont recalculés à l'affichage. */
export const previewMonth = {
  income: 450000,
  savings: 100000,
  previousIncome: 424528,
  previousExpenses: 291667,
  previousSavings: 84746,
};

export const previewCategories = [
  { label: "Logement", amount: 120000, tone: "primary" },
  { label: "Nourriture", amount: 68000, tone: "primary" },
  { label: "Transport", amount: 35000, tone: "accent" },
  { label: "Loisirs", amount: 32000, tone: "accent" },
  { label: "Factures", amount: 25000, tone: "secondary" },
];

export const previewGoal = {
  label: "Apport maison",
  saved: 2040000,
  target: 3000000,
};

export const balanceSeries = [
  { mois: "Jan", solde: 210000 },
  { mois: "Fév", solde: 268000 },
  { mois: "Mar", solde: 254000 },
  { mois: "Avr", solde: 342000 },
  { mois: "Mai", solde: 398000 },
  { mois: "Juin", solde: 486000 },
  { mois: "Juil", solde: 552000 },
];

export const savingsSeries = [
  { mois: "Jan", epargne: 45000 },
  { mois: "Fév", solde: 0, epargne: 72000 },
  { mois: "Mar", epargne: 60000 },
  { mois: "Avr", epargne: 95000 },
  { mois: "Mai", epargne: 88000 },
  { mois: "Juin", epargne: 112000 },
];

export const chatPreview = [
  {
    role: "user",
    text: "Puis-je louer une maison à 150 000 FCFA avec mon salaire de 450 000 FCFA ?",
  },
  {
    role: "assistant",
    text: "Avec 450 000 FCFA de revenus, un loyer de 150 000 FCFA représente 33 % de votre revenu : c'est dans la zone recommandée (max 30-35 %). En intégrant charges estimées (eau, électricité, internet : 28 000 FCFA), votre reste à vivre serait de 272 000 FCFA. Votre capacité d'épargne passerait de 100 000 à 72 000 FCFA par mois — votre objectif « Apport maison » serait atteint avec 4 mois de retard. Plan d'action : négociez 135 000 FCFA ou étalez l'apport sur 26 mois.",
  },
];

/* Cas d'usage rédigés comme des scénarios. Aucun nom, aucune photo, aucune
   personne réelle : chaque carte affiche la mention « Exemple fictif ». */
export const useCases = [
  {
    id: "freelance",
    icon: "ri-computer-line",
    title: "Freelance aux revenus irréguliers",
    situation:
      "Un graphiste indépendant encaisse entre 300 000 et 900 000 FCFA selon les mois, sans réserve de trésorerie.",
    scenario:
      "Chaque facture encaissée est enregistrée, FinBuilder lisse l'année, puis fixe un revenu mensuel de référence. Le simulateur d'épargne indique l'effort tenable pendant les mois creux.",
    focus: "Lissage sur douze mois",
  },
  {
    id: "famille",
    icon: "ri-parent-line",
    title: "Famille qui prépare un apport",
    situation:
      "Un couple salarié veut réunir 12 000 000 FCFA pour un terrain, avec deux salaires et des charges partagées.",
    scenario:
      "Le projet est découpé en postes — terrain, construction, notaire —, chaque étape est datée, et l'épargne mensuelle nécessaire est recalculée à chaque versement.",
    focus: "Projet découpé en postes",
  },
  {
    id: "jeune-salarie",
    icon: "ri-briefcase-4-line",
    title: "Premier emploi, premier fonds d'urgence",
    situation:
      "Une jeune salariée veut mettre de côté trois mois de charges sans sacrifier son quotidien.",
    scenario:
      "Le budget répartit son revenu par poste, l'objectif fonds d'urgence affiche sa progression, et les dépenses inhabituelles sont signalées avant la fin du mois.",
    focus: "Budget réparti par poste",
  },
];

export const faqItems = [
  {
    question: "FinBuilder AI remplace-t-il un conseiller financier ?",
    answer:
      "Non. FinBuilder AI vous donne une lecture claire et chiffrée de votre situation, des recommandations d'organisation et des simulations. Pour des décisions d'investissement complexes, un professionnel reste indispensable : l'application vous aide surtout à poser les bonnes questions.",
  },
  {
    question: "Mes données financières sont-elles protégées ?",
    answer:
      "Les échanges entre votre navigateur et FinBuilder AI passent par une connexion sécurisée (HTTPS). Vos données sont isolées par compte : chaque enregistrement n'est lisible que par son propriétaire, grâce à des règles d'accès appliquées au niveau de la base de données. [À CONFIRMER : aucune revente des données.] Vos questions sont transmises à notre fournisseur d'IA pour générer la réponse.",
  },
  {
    question: "Puis-je utiliser l'application avec des revenus irréguliers ?",
    answer:
      "Oui, c'est un cas prévu. Vous pouvez enregistrer autant de revenus que nécessaire (freelance, business, saisonnier) et FinBuilder calcule une moyenne lissée sur l'année pour déterminer votre capacité d'épargne réelle.",
  },
  {
    question: "Dans quelle devise travaillent les calculs ?",
    answer:
      "Le FCFA est la devise par défaut, mais vous pouvez choisir votre devise dans votre profil. Tous les budgets, objectifs et simulations s'affichent ensuite dans cette devise.",
  },
  {
    question: "Ai-je besoin de connecter mon compte bancaire ?",
    answer:
      "Aucune connexion bancaire n'est requise. Vous saisissez vos montants manuellement, ou les importez depuis un fichier. Cela reste volontairement simple et sans partage d'identifiants bancaires.",
  },
  {
    question: "À quoi sert le profil financier demandé à l'inscription ?",
    answer:
      "Vous choisissez votre situation — étudiant, salarié, entrepreneur, freelance, famille ou retraité — puis indiquez votre revenu, la composition de votre foyer et vos priorités. FinBuilder adapte ensuite les libellés de vos indicateurs, votre parcours de démarrage, les conseils de votre coach et les objectifs qu'il vous propose, créables en un clic.",
  },
  {
    question: "L'application reste-t-elle rapide avec plusieurs années d'historique ?",
    answer:
      "Oui. Le tableau de bord se limite aux 12 derniers mois, et les historiques de revenus, de dépenses et de projets sont chargés page par page, 20 éléments à la fois, directement depuis la base. Les filtres, la recherche et le tri sont traités côté serveur : inutile de télécharger des années de données pour consulter un mois.",
  },
];

export const numbersFacts = [
  { value: "2 min", label: "Pour configurer son budget" },
  { value: "6", label: "Profils financiers couverts" },
  { value: "14", label: "Fiches d'éducation financière" },
];

export const problemCards = [
  {
    icon: "ri-emotion-sad-line",
    title: "Le mois se termine avant le salaire",
    text: "Sans visibilité, les petites dépenses du quotidien pèsent plus lourd que le loyer.",
  },
  {
    icon: "ri-question-line",
    title: "Impossible de savoir si c'est raisonnable",
    text: "« Puis-je louer à 150 000 FCFA ? » Sans calcul, la réponse reste une intuition.",
  },
  {
    icon: "ri-time-line",
    title: "Les projets reculent d'année en année",
    text: "Maison, voiture, formation : sans montant mensuel, aucune date d'arrivée.",
  },
];