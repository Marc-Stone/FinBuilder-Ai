export type GuideModule = {
  id: string;
  step: string;
  title: string;
  icon: string;
  tagline: string;
  purpose: string;
  needs: string;
  steps: string[];
  tip: string;
  link: string;
  linkLabel: string;
};

export const guideModules: GuideModule[] = [
  {
    id: "profil-financier",
    step: "01",
    title: "Profil financier",
    icon: "ri-user-star-line",
    tagline: "La situation sur laquelle tout le reste s'aligne",
    purpose:
      "Juste après l'inscription, vous indiquez votre situation (étudiant, salarié, entrepreneur, freelance, famille, retraité), votre revenu, la composition de votre foyer et vos priorités. L'application adapte ensuite les libellés de vos indicateurs, votre parcours de démarrage, les conseils du coach et les objectifs qu'elle vous propose.",
    needs:
      "Aucun prérequis : ces informations peuvent être reprises à tout moment sans perdre vos données.",
    steps: [
      "Choisissez la situation qui décrit le mieux votre quotidien.",
      "Renseignez votre revenu net habituel et la taille de votre foyer.",
      "Sélectionnez deux ou trois priorités : fonds d'urgence, apport logement, matériel professionnel, formation.",
      "Lisez le conseil de votre profil, puis créez les objectifs proposés en un clic.",
      "Revenez sur cet onglet dès qu'un changement important survient : la saisie met tout à jour, sans recalcul manuel.",
    ],
    tip: "Le profil ne vous enferme dans rien. Si votre situation évolue — passage en freelance, naissance, retraite — modifiez-la : les conseils et les objectifs par défaut s'adaptent, votre historique reste intact.",
    link: "/app/profil-financier",
    linkLabel: "Voir mon profil financier",
  },
  {
    id: "tableau-de-bord",
    step: "02",
    title: "Tableau de bord",
    icon: "ri-dashboard-3-line",
    tagline: "Votre situation en une seule vue",
    purpose:
      "C'est la première page après la connexion. Elle rassemble vos revenus du mois, vos dépenses, votre capacité d'épargne, votre score financier sur 100 et la courbe de vos six derniers mois. Pour rester rapide, elle ne lit que les douze derniers mois de votre historique.",
    needs: "Un revenu enregistré suffit pour que tous les calculs se remplissent.",
    steps: [
      "Lisez les quatre indicateurs du haut : revenus, dépenses, épargne possible et score.",
      "Descendez sur la courbe des six derniers mois pour repérer les mois où votre épargne a baissé.",
      "Ouvrez la carte d'un projet actif pour voir sa progression réelle.",
      "Utilisez le parcours de démarrage si une étape reste grisée : il vous indique quoi ajouter.",
    ],
    tip: "Le score n'est pas une note morale : il compare simplement votre taux d'épargne, votre part de charges fixes et la régularité de vos saisies.",
    link: "/app",
    linkLabel: "Ouvrir le tableau de bord",
  },
  {
    id: "revenus",
    step: "03",
    title: "Revenus",
    icon: "ri-arrow-down-line",
    tagline: "Tout ce qui entre, daté et catégorisé",
    purpose:
      "Enregistrez chaque entrée d'argent : salaire, mission freelance, vente, aide familiale. Tout le reste de l'application s'appuie sur ces montants. L'historique est affiché par pages de 20 lignes pour rester rapide, même après plusieurs années de saisie.",
    needs: "Rien. C'est le premier module à remplir.",
    steps: [
      "Cliquez sur « Ajouter un revenu ».",
      "Choisissez le type : salaire, freelance, business, location, don ou autre.",
      "Renseignez le montant, la date et cochez « récurrent » si le revenu revient chaque mois.",
      "Filtrez par période ou par type, puis triez par date ou par montant : le filtre s'applique à tout l'historique, pas seulement à la page visible.",
      "Utilisez les boutons Précédent et Suivant sous la liste : vous avancez de 20 lignes à la fois, et une page déjà consultée reste instantanée.",
    ],
    tip: "Saisissez le montant net réellement reçu, pas le brut annoncé sur le contrat. Vos calculs n'en seront que plus justes.",
    link: "/app/revenus",
    linkLabel: "Gérer mes revenus",
  },
  {
    id: "depenses",
    step: "04",
    title: "Dépenses",
    icon: "ri-arrow-up-line",
    tagline: "Chaque sortie d'argent, avec sa catégorie",
    purpose:
      "Dix catégories couvrent le quotidien : logement, alimentation, transport, santé, éducation, loisirs, communications, famille, épargne et autres. Chaque dépense peut être marquée récurrente, et l'historique est chargé par pages de 20 lignes avec filtres et tri côté serveur.",
    needs: "Aucun prérequis, mais ce module est décisif pour la qualité du budget.",
    steps: [
      "Cliquez sur « Ajouter une dépense ».",
      "Choisissez la catégorie, puis le moyen de paiement (espèces, mobile money, carte, virement).",
      "Saisissez le montant et la date, et cochez « charge récurrente » pour un loyer ou un abonnement.",
      "Filtrez par période ou par catégorie, puis parcourez l'historique avec les boutons Précédent et Suivant (20 lignes par page).",
      "Regardez la répartition par catégorie : elle porte sur la période filtrée entière, pas sur la seule page affichée.",
    ],
    tip: "Mieux vaut une saisie approximative que pas de saisie du tout. Ajoutez vos dépenses une fois par semaine, en cinq minutes.",
    link: "/app/depenses",
    linkLabel: "Gérer mes dépenses",
  },
  {
    id: "budget",
    step: "05",
    title: "Budget intelligent",
    icon: "ri-pie-chart-2-line",
    tagline: "La règle 50 / 30 / 20 appliquée à vos chiffres",
    purpose:
      "Le budget répartit votre revenu du mois en trois blocs : 50 % pour les besoins, 30 % pour les envies, 20 % pour l'épargne. Il compare ensuite cette répartition idéale à vos dépenses réelles, poste par poste.",
    needs: "Au moins un revenu sur le mois en cours. Sinon, la moyenne des trois derniers mois est utilisée.",
    steps: [
      "Vérifiez le revenu de référence affiché en haut : vous pouvez changer le mois consulté.",
      "Lisez les trois blocs : le montant recommandé, le montant réel et l'écart.",
      "Ouvrez un bloc pour voir les postes concernés et repérer celui qui dépasse.",
      "Suivez la marge restante et le score : vous savez immédiatement si le mois est tenable.",
    ],
    tip: "Un dépassement sur les « envies » n'est pas grave s'il est compensé par le bloc épargne. Regardez l'équilibre global, pas une seule ligne.",
    link: "/app/budget",
    linkLabel: "Voir mon budget",
  },
  {
    id: "objectifs",
    step: "06",
    title: "Objectifs",
    icon: "ri-flag-2-line",
    tagline: "Une cible, une date, un effort mensuel",
    purpose:
      "Un objectif est un montant à atteindre dans un temps donné : fonds d'urgence, apport logement, matériel professionnel, voyage. L'application calcule l'épargne mensuelle nécessaire et suit votre progression.",
    needs: "Aucun. Un objectif peut exister avant même d'avoir un projet.",
    steps: [
      "Cliquez sur « Nouveau objectif » et nommez-le clairement.",
      "Saisissez le montant cible et la date souhaitée.",
      "Lisez l'effort mensuel proposé, puis ajustez la date si l'effort est trop élevé.",
      "Chaque mois, utilisez « Déposer » pour enregistrer ce que vous avez réellement mis de côté.",
    ],
    tip: "Un dépôt met aussi à jour le projet lié. Si vous tenez un projet et un objectif sur le même achat, un seul dépôt suffit, pas deux.",
    link: "/app/objectifs",
    linkLabel: "Voir mes objectifs",
  },
  {
    id: "projets",
    step: "07",
    title: "Projets",
    icon: "ri-building-4-line",
    tagline: "Le budget détaillé d'un achat important",
    purpose:
      "Un projet découpe un achat en postes de dépenses (terrain, construction, notaire, ameublement) et en étapes datées. Il gère aussi une enveloppe, des documents et un simulateur d'épargne. La liste est présentée par pages de 20 projets, tandis que les totaux restent calculés sur l'ensemble de vos projets.",
    needs: "Aucun. Vous pouvez lier un objectif pour suivre les deux ensemble.",
    steps: [
      "Créez le projet, choisissez son type et son enveloppe globale.",
      "Ajoutez les postes budgétaires : le total doit rester cohérent avec l'enveloppe.",
      "Renseignez les étapes (devis, achat, travaux) avec leurs dates cibles.",
      "Ouvrez le simulateur d'épargne pour voir combien mettre de côté chaque mois et l'effet d'un apport de départ.",
      "Quand la liste s'allonge, naviguez avec Précédent et Suivant : 20 projets par page, sans perdre les statistiques globales.",
    ],
    tip: "Attachez vos devis et reçus dans la section documents : tout reste au même endroit, dans le projet concerné.",
    link: "/app/projets",
    linkLabel: "Voir mes projets",
  },
  {
    id: "assistant",
    step: "08",
    title: "Assistant IA",
    icon: "ri-sparkling-line",
    tagline: "Une phrase suffit pour repartir avec un plan",
    purpose:
      "Décrivez votre intention en langage naturel. L'assistant en déduit un objectif, un projet, un montant cible et l'effort mensuel, puis vous propose de tout créer en un clic.",
    needs: "Un revenu enregistré améliore nettement la pertinence de l'effort mensuel proposé.",
    steps: [
      "Écrivez une phrase concrète : « Je veux acheter une voiture à 6 000 000 FCFA en 2 ans ».",
      "Lisez la carte de plan : objectif, projet, échéance et montant mensuel.",
      "Ajustez les valeurs proposées si elles ne correspondent pas à votre réalité.",
      "Cliquez sur « Créer » : l'objectif et le projet apparaissent dans leurs onglets respectifs, déjà liés.",
    ],
    tip: "Plus votre phrase contient un montant et une durée, plus le plan est précis. « Je veux épargner » donne un plan trop vague.",
    link: "/app/assistant",
    linkLabel: "Parler à l'assistant",
  },
  {
    id: "logement",
    step: "09",
    title: "Conseiller logement",
    icon: "ri-home-5-line",
    tagline: "Savoir ce que vous pouvez vraiment payer",
    purpose:
      "Le conseiller calcule le loyer soutenable, la mensualité maximale, la capacité d'emprunt et le budget d'achat, à partir de vos revenus et de votre charge logement actuelle.",
    needs: "Vos revenus, préremplis automatiquement depuis l'onglet Revenus.",
    steps: [
      "Vérifiez les revenus préremplis et corrigez-les si un mois est atypique.",
      "Indiquez votre charge logement actuelle et votre apport disponible.",
      "Lisez la jauge 30 / 40 % : elle indique si votre loyer reste dans la zone raisonnable.",
      "Descendez sur la capacité d'emprunt et le budget d'achat pour connaître votre plafond réaliste.",
    ],
    tip: "La jauge compte le logement seul. Si vous avez déjà un crédit à la consommation, retirez-le de votre capacité avant de signer.",
    link: "/app/logement",
    linkLabel: "Calculer mon logement",
  },
  {
    id: "simulations",
    step: "10",
    title: "Simulations",
    icon: "ri-git-branch-line",
    tagline: "Tester un choix avant de l'engager",
    purpose:
      "Trois curseurs suffisent : revenus, dépenses et effort d'épargne. L'outil projette quatre scénarios sur cinq horizons et montre l'effet d'un changement sur le délai d'un de vos objectifs.",
    needs: "Un objectif existant pour voir l'impact sur son délai.",
    steps: [
      "Choisissez l'objectif dont vous voulez tester le délai.",
      "Déplacez les curseurs de revenus et de dépenses pour simuler une hausse de salaire ou une baisse de charges.",
      "Comparez les quatre scénarios : prudent, actuel, ambitieux, optimiste.",
      "Lisez l'impact sur le délai : combien de mois vous gagnez ou perdez.",
    ],
    tip: "Un scénario n'est pas une prévision. Testez toujours un scénario pessimiste : c'est celui qui vous protège.",
    link: "/app/simulations",
    linkLabel: "Lancer une simulation",
  },
  {
    id: "education",
    step: "11",
    title: "Éducation financière",
    icon: "ri-graduation-cap-line",
    tagline: "Quatorze fiches courtes, reliées à vos chiffres",
    purpose:
      "Chaque fiche explique une notion (fonds d'urgence, taux d'endettement, épargne de précaution) en quelques minutes, avec un exemple en FCFA et un lien vers l'onglet concerné.",
    needs: "Aucun. La progression de lecture est mémorisée sur votre appareil.",
    steps: [
      "Filtrez par thème ou cherchez un mot-clé.",
      "Ouvrez la fiche à la une : elle correspond souvent à votre point faible du moment.",
      "Lisez la fiche jusqu'au bout : elle est marquée comme lue et votre progression avance.",
      "Suivez le lien de fin de fiche pour appliquer directement dans le module concerné.",
    ],
    tip: "Une fiche lue sans action ne change rien. Terminez toujours par le lien d'application affiché en bas de la fiche.",
    link: "/app/education",
    linkLabel: "Ouvrir les fiches",
  },
  {
    id: "notifications",
    step: "12",
    title: "Notifications",
    icon: "ri-notification-3-line",
    tagline: "Ce qui mérite votre attention maintenant",
    purpose:
      "Le centre d'alertes signale les échéances proches, les dépassements par bloc de budget, l'épargne manquante et un éventuel déficit mensuel. Un panneau latéral identifie votre point faible et propose deux fiches.",
    needs: "Des revenus, dépenses ou objectifs pour qu'il y ait quelque chose à signaler.",
    steps: [
      "Parcourez les alertes, classées par urgence.",
      "Filtrez par type ou affichez uniquement les non lues.",
      "Marquez une alerte comme lue une fois traitée, ou restaurez-la si elle revient.",
      "Réglez les canaux souhaités : dans l'application, par email, ou rappel hebdomadaire.",
    ],
    tip: "Le statut « lu » et vos canaux sont conservés sur cet appareil. Sur un autre téléphone, vous repartez des alertes non lues.",
    link: "/app/notifications",
    linkLabel: "Voir mes alertes",
  },
  {
    id: "rapports",
    step: "13",
    title: "Rapports",
    icon: "ri-file-chart-line",
    tagline: "Le mois terminé, résumé et exportable",
    purpose:
      "Choisissez un mois et obtenez quatre indicateurs avec leur variation, une synthèse rédigée, la répartition par catégorie et le détail des opérations. Le tout s'exporte en PDF au format A4.",
    needs: "Au moins une opération sur le mois sélectionné.",
    steps: [
      "Sélectionnez le mois dans le sélecteur en haut de page.",
      "Lisez les quatre indicateurs et leur variation par rapport au mois précédent.",
      "Parcourez la synthèse rédigée et les points clés : ils pointent la cause des variations.",
      "Cliquez sur « Exporter en PDF » : le fichier se télécharge, prêt à être partagé.",
    ],
    tip: "Exportez votre rapport le dernier jour du mois : vous gardez une trace datée de votre situation, utile pour un dossier de crédit.",
    link: "/app/rapports",
    linkLabel: "Ouvrir mes rapports",
  },
  {
    id: "profil",
    step: "14",
    title: "Profil",
    icon: "ri-user-settings-line",
    tagline: "Vos informations et votre devise",
    purpose:
      "Le profil contient votre nom, votre téléphone, votre pays, votre devise d'affichage et votre photo. Tous les montants de l'application suivent la devise choisie.",
    needs: "Aucun, mais complétez-le dès l'inscription.",
    steps: [
      "Modifiez vos informations puis enregistrez.",
      "Ajoutez une photo : le fichier doit être une image, dans un format courant.",
      "Changez la devise si votre situation évolue, puis vérifiez l'affichage dans Revenus.",
      "Vérifiez votre adresse email : elle sert à la connexion et à la récupération du mot de passe.",
    ],
    tip: "Chaque compte ne voit que ses propres données. Aucun autre utilisateur ne peut lire vos montants, même en connaissant votre email.",
    link: "/app/profil",
    linkLabel: "Modifier mon profil",
  },
];

export const guideStartSteps = [
  {
    step: "1",
    title: "Créez votre compte",
    text: "Nom, email, mot de passe, puis votre profil financier. Aucune carte bancaire, aucun module verrouillé.",
    icon: "ri-user-add-line",
  },
  {
    step: "2",
    title: "Ajoutez un revenu",
    text: "Votre salaire ou votre revenu moyen du mois. C'est la base de tous les calculs.",
    icon: "ri-arrow-down-line",
  },
  {
    step: "3",
    title: "Saisissez vos dépenses",
    text: "Même approximatives. Le budget et les alertes deviennent réellement utiles.",
    icon: "ri-arrow-up-line",
  },
  {
    step: "4",
    title: "Fixez un objectif",
    text: "Un montant, une date. L'application calcule l'effort mensuel et le suit pour vous.",
    icon: "ri-flag-2-line",
  },
];

export const guideFlow = [
  {
    icon: "ri-user-star-line",
    title: "Profil financier",
    text: "La situation et le revenu déclarés au départ calibrent les libellés, les conseils et les objectifs proposés.",
  },
  {
    icon: "ri-arrow-down-line",
    title: "Revenus",
    text: "Le point de départ : sans revenu, aucun pourcentage ne peut être calculé.",
  },
  {
    icon: "ri-arrow-up-line",
    title: "Dépenses",
    text: "Elles mesurent l'écart entre ce que vous gagnez et ce que vous vivez.",
  },
  {
    icon: "ri-pie-chart-2-line",
    title: "Budget",
    text: "Il compare cet écart à la règle 50 / 30 / 20 et désigne le poste à corriger.",
  },
  {
    icon: "ri-notification-3-line",
    title: "Alertes",
    text: "Elles remontent les dépassements et les échéances avant qu'il ne soit trop tard.",
  },
  {
    icon: "ri-book-open-line",
    title: "Fiches",
    text: "Elles expliquent la notion qui pose problème, puis renvoient vers l'action.",
  },
];

export const guideFaq = [
  {
    question: "Par quel onglet dois-je commencer ?",
    answer:
      "Par Profil financier, puis Revenus, Dépenses et Budget. Les autres familles (objectifs, projets, outils) ne deviennent précises qu'une fois ces quatre-là remplis.",
  },
  {
    question: "À quoi sert le profil financier, et faut-il le refaire souvent ?",
    answer:
      "Il donne à l'application le contexte de vos chiffres : votre situation, votre revenu habituel, votre foyer et vos priorités. Il n'est pas à refaire chaque mois. Modifiez-le seulement quand votre réalité change — un passage en freelance, une naissance, un déménagement — et vos indicateurs, conseils et objectifs proposés s'ajustent aussitôt.",
  },
  {
    question: "Pourquoi mes historiques s'affichent-ils par pages de 20 ?",
    answer:
      "Pour rester rapide quelle que soit l'ancienneté de votre compte. Revenus, dépenses et projets sont chargés 20 éléments à la fois, directement depuis la base, avec les filtres, la recherche et le tri traités côté serveur. Les boutons Précédent et Suivant changent de page, et une page déjà consultée revient instantanément.",
  },
  {
    question: "Les totaux affichés ne portent-ils que sur la page visible ?",
    answer:
      "Non. Les indicateurs du haut (total, répartition par catégorie, statistiques de projets) sont calculés sur l'ensemble de l'historique filtré, pas seulement sur les 20 lignes affichées. Le tableau de bord, lui, se limite volontairement aux douze derniers mois.",
  },
  {
    question: "Dois-je remplir tous les onglets pour que l'application serve à quelque chose ?",
    answer:
      "Non. Revenus, Dépenses et Budget suffisent déjà à reprendre le contrôle d'un mois. Objectifs et Projets s'ajoutent quand vous préparez un achat précis.",
  },
  {
    question: "Pourquoi certains montants changent d'un onglet à l'autre ?",
    answer:
      "Chaque onglet regarde une période différente : le tableau de bord et le budget travaillent sur le mois en cours, les rapports sur le mois que vous sélectionnez, les simulations sur une projection.",
  },
  {
    question: "Puis-je utiliser l'application sans connexion internet ?",
    answer:
      "Non. Les données sont enregistrées sur votre compte et non dans le navigateur : une connexion est nécessaire pour lire et enregistrer vos montants.",
  },
  {
    question: "Comment repartir d'une situation propre si je me suis trompé ?",
    answer:
      "Corrigez ou supprimez les opérations concernées depuis Revenus ou Dépenses : le budget, le score et les alertes se recalculent automatiquement, sans manipulation supplémentaire.",
  },
];