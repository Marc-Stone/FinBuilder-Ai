export const featureModules = [
  {
    id: "revenus",
    kicker: "Module revenus",
    title: "Tous vos revenus, une seule vue",
    description:
      "Salaire, business, freelance, investissement ou revenus ponctuels : enregistrez chaque entrée d'argent avec sa source, sa date et son type. Filtrez par période pour comprendre vos mois réels, y compris quand vos revenus sont irréguliers.",
    bullets: [
      "5 types de revenus prédéfinis",
      "Filtre par mois, trimestre et année",
      "Moyenne lissée pour les revenus variables",
    ],
    icon: "ri-wallet-3-line",
    visual: "income",
  },
  {
    id: "depenses",
    kicker: "Module dépenses",
    title: "Chaque sortie d'argent, classée",
    description:
      "10 catégories prêtes à l'emploi, de la nourriture aux factures en passant par la famille et les loisirs. Recherchez, filtrez, modifiez : votre historique reste lisible et exploitable.",
    bullets: [
      "10 catégories avec icônes",
      "Recherche instantanée par description",
      "Modes de paiement : espèces, mobile money, carte, virement",
    ],
    icon: "ri-shopping-bag-3-line",
    visual: "expenses",
  },
  {
    id: "budget",
    kicker: "Module budget",
    title: "Un budget recommandé, pas imposé",
    description:
      "Indiquez votre revenu mensuel : FinBuilder propose une répartition équilibrée (logement 30 %, nourriture 20 %, transport 10 %, épargne 20 %, projets 10 %, loisirs 10 %) et calcule votre jauge de santé financière.",
    bullets: [
      "Répartition calculée automatiquement",
      "Ajustement poste par poste",
      "Jauge de santé financière sur 100",
    ],
    icon: "ri-pie-chart-2-line",
    visual: "budget",
  },
  {
    id: "objectifs",
    kicker: "Module objectifs",
    title: "Une date d'arrivée pour chaque projet",
    description:
      "Maison, voiture, mariage, voyage, formation ou création d'entreprise : définissez un montant cible et une échéance. FinBuilder calcule le montant restant, l'épargne mensuelle nécessaire et votre progression.",
    bullets: [
      "Calcul automatique de l'effort mensuel",
      "Progression visuelle par objectif",
      "Alerte en cas de retard ou d'avance",
    ],
    icon: "ri-flag-2-line",
    visual: "goals",
  },
  {
    id: "projets",
    kicker: "Module projets",
    title: "Votre projet découpé en postes concrets",
    description:
      "« Ouvrir une boutique — 2 000 000 FCFA » : l'application génère une répartition réaliste (local, stock, marketing, imprévus) que vous pouvez ajuster selon votre réalité terrain.",
    bullets: [
      "Répartition budgétaire proposée",
      "Postes modifiables et réutilisables",
      "Suivi de la préparation à l'ouverture",
    ],
    icon: "ri-building-2-line",
    visual: "projects",
  },
  {
    id: "profil-financier",
    kicker: "Module profil financier",
    title: "Un espace calibré sur votre situation",
    description:
      "Étudiant, salarié, entrepreneur, freelance, famille ou retraité : vous choisissez votre situation à la première connexion, puis indiquez votre revenu, la composition de votre foyer et vos priorités. FinBuilder AI adapte alors les libellés de vos indicateurs, votre parcours de démarrage, les conseils de votre coach et les objectifs qu'il vous propose — créables en un clic.",
    bullets: [
      "6 situations couvertes",
      "Étape de choix à la première connexion",
      "Objectifs chiffrés créés en un clic",
    ],
    icon: "ri-user-star-line",
    visual: "profile",
  },
  {
    id: "simulations",
    kicker: "Module simulations",
    title: "Décidez après avoir vu l'impact",
    description:
      "Augmentation, déménagement, achat de voiture, crédit, investissement : simulez le scénario et comparez votre situation avant et après, avec graphiques et indicateurs clés.",
    bullets: [
      "5 scénarios prêts à tester",
      "Comparaison avant / après",
      "Recommandation IA sur le scénario",
    ],
    icon: "ri-line-chart-line",
    visual: "simulation",
  },
];

export const moduleChips = [
  "Revenus",
  "Dépenses",
  "Budget",
  "Objectifs",
  "Projets",
  "Profil financier",
  "Assistant IA",
  "Conseiller logement",
  "Simulations",
  "Éducation financière",
  "Notifications",
  "Rapports",
  "Historique paginé",
];

export const housingEstimate = [
  { label: "Loyer", amount: "135 000", note: "30 % du revenu" },
  { label: "Eau", amount: "8 500", note: "Estimation locale" },
  { label: "Électricité", amount: "14 000", note: "Climatisation incluse" },
  { label: "Internet", amount: "19 000", note: "Fibre 20 Mb" },
  { label: "Transport", amount: "22 000", note: "Trajet domicile-travail" },
];

export const educationCategories = [
  { name: "Budget", lessons: 8, icon: "ri-pie-chart-line" },
  { name: "Épargne", lessons: 6, icon: "ri-safe-2-line" },
  { name: "Investissement", lessons: 9, icon: "ri-funds-line" },
  { name: "Immobilier", lessons: 5, icon: "ri-home-5-line" },
  { name: "Entrepreneuriat", lessons: 7, icon: "ri-briefcase-4-line" },
];