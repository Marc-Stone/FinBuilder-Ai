# FinBuilder AI — Build your financial future

## 1. Description du projet

**Positionnement** : assistant financier intelligent (SaaS) qui agit comme un coach financier personnel pour les particuliers, en priorité sur des revenus en FCFA.

**Public cible** : salariés, freelances et petits entrepreneurs souhaitant suivre leurs revenus/dépenses, construire une épargne et financer un projet (logement, voiture, mariage, business).

**Valeur principale** : transformer des chiffres dispersés en un plan financier clair, chiffré et actionnable, grâce à une analyse IA personnalisée.

## 2. Structure des pages

### Partie publique
- `/` — Landing page
- `/fonctionnalites` — Détail des fonctionnalités
- `/mode-demploi` — Mode d'emploi : comment fonctionne chaque onglet de l'application
- `/a-propos` — À propos : mission, principes, histoire et équipe

### Authentification (après connexion du backend)
- `/connexion` — Connexion (email mémorisé, alerte Verr. Maj, encart d'aide, retour au site)
- `/inscription` — Inscription
- `/mot-de-passe-oublie` — Réinitialisation

### Espace privé
- `/app` — Tableau de bord
- `/app/revenus` — Revenus
- `/app/depenses` — Dépenses
- `/app/budget` — Budget intelligent
- `/app/objectifs` — Objectifs financiers
- `/app/projets` — Projets / planificateur
- `/app/assistant` — Assistant IA FinBuilder
- `/app/logement` — Conseiller logement
- `/app/simulations` — Simulations financières
- `/app/education` — Éducation financière (bibliothèque de fiches)
- `/app/notifications` — Notifications
- `/app/rapports` — Rapports mensuels et export PDF
- `/app/profil` — Profil utilisateur
- `/app/profil-financier` — Mon profil financier (situation, statistiques, objectifs adaptés, conseils IA)
- `/admin` — Administration (réservé aux administrateurs) — Vue d'ensemble
- `/admin/utilisateurs` — Liste des comptes (recherche, filtres, fiche, export CSV et PDF)
- `/admin/contenus` — Contenus pédagogiques (création, édition, publication des fiches)
- `/admin/annonces` — Annonces diffusées dans le centre de notifications des utilisateurs (envoi immédiat ou programmé)
- `/admin/parametres` — Paramètres de la plateforme (nom, couleur principale, mode maintenance)
- `/admin/journal` — Journal d'activité (audit des actions d'administration)

## 3. Fonctionnalités principales

- [x] Site public (accueil, fonctionnalités, mode d'emploi)
- [x] Inscription / connexion / déconnexion / mot de passe oublié (Supabase Auth)
- [x] Profil utilisateur (nom, prénom, email, téléphone, pays, devise, avatar) + upload de photo (Supabase Storage, bucket `avatars`)
- [x] Coquille de l'espace privé (navigation latérale, menu compte, garde d'accès)
- [x] Tableau de bord : revenus, dépenses, épargne, score financier, graphique d'évolution revenus / dépenses sur 6 mois (données réelles)
- [x] Module revenus (CRUD + filtres par type et période, recherche, tri)
- [x] Module dépenses (CRUD + filtres par catégorie et période, recherche, tri, répartition par catégorie)
- [x] Budget intelligent avec répartition recommandée (50/30/20) calculée sur les revenus réels, comparaison recommandé/réel et score de santé
- [x] Objectifs financiers (montant restant, épargne mensuelle nécessaire, progression, épargne réelle enregistrée, capacité d'épargne comparée)
- [x] Projets avec répartition budgétaire générée
- [x] Carte « Projets en cours » au tableau de bord (avancement des étapes, progression budgétaire, déjà financé, reste à financer)
- [x] Liaison projet ↔ objectif d'épargne : le reste à financer est alimenté automatiquement par les dépôts d'épargne
- [x] Assistant IA conversationnel : une phrase → objectif (destination) puis projet (chemin), création réelle des deux et liaison automatique
- [x] Conseiller logement (simulateur de charges)
- [x] Simulations « Et si… » avec comparaison avant/après
- [x] Bibliothèque d'éducation financière
- [x] Centre de notifications et alertes
- [x] Rapports mensuels PDF (synthèse revenus / dépenses)
- [x] Synchronisation globale des données : toute création / modification / suppression se répercute immédiatement sur toutes les vues (tableau de bord, budget, rapports, notifications, objectifs, projets, simulations, logement, assistant) sans rechargement et sans clignotement, plus resynchronisation au retour sur l'onglet.
- [x] Mode d'emploi téléchargeable en PDF (A4, charte de la marque, contenu repris automatiquement de la page `/mode-demploi`).
- [x] Fenêtres modales affichées au-dessus de toute l'application (centrées, jamais rognées par la barre de navigation).
- [x] Profil financier utilisateur (6 situations : étudiant, salarié, entrepreneur, freelance, famille, retraité) : étape de choix à la première connexion, page « Mon profil financier », tableau de bord, objectifs et coach IA personnalisés.
- [ ] Dashboard administrateur

> **Pas d'abonnement** : l'application ne comporte aucun plan payant. Tous les modules sont accessibles dès l'inscription, sans carte bancaire et sans limite de durée. La page publique `/mode-demploi` explique, onglet par onglet, à quoi sert chaque espace et comment l'utiliser ; les anciennes URL `/offres` et `/tarifs` redirigent vers elle.

## 4. Modèle de données (Supabase / PostgreSQL)

### Interconnexion des modules (version 43)

Tous les modules partagent désormais le même socle de calcul : `hooks/useFinancialOverview.ts` charge en une requête revenus, dépenses, objectifs et projets, puis recalcule ensemble référence de revenu, budget 50/30/20, score, capacité d'épargne, progression des objectifs, avancement des projets et diagnostic IA. Toute écriture déclenche `notifyChange()` : le tableau de bord, le budget, les objectifs, les projets, les notifications, les simulations, le logement, les rapports et l'assistant se rafraîchissent en silence.

- **Dépenses ↔ Projets** : nouvelle colonne `expenses.project_id` (FK `projects.id`, `ON DELETE SET NULL`) + index. Une dépense rattachée à un projet augmente automatiquement son budget consommé, la ligne du poste de même catégorie et sa progression (`attachLinkedExpenses`, `computeProjectMetrics` accepte les dépenses liées). Le formulaire de dépense propose le projet concerné.
- **Objectifs → Tableau de bord** : carte « Mes objectifs en cours » (progression, reste, échéance, effort mensuel).
- **Budget → Tableau de bord** : carte « Budget intelligent » (recommandé, consommé, restant, postes en dépassement).
- **Conseil IA du jour** : généré depuis le diagnostic réel (revenus manquants, déficit, épargne faible, envies, besoins, budget équilibré) avec lien d'action contextuel.
- **Alertes automatiques** : dépassement par catégorie (« budget Transport dépassé de 12 % »), dépassement de bloc, échéances d'objectifs, déficit du mois, épargne manquante ou atteinte, clôture et échéance de projet.
- **Vues SQL** (security invoker, respectent la RLS) : `v_user_monthly_finance` (revenus / dépenses / épargne / solde par mois), `v_project_spending` (dépenses liées par projet), `admin_platform_stats` (compteurs globaux pour la console).
- Index ajoutés : `expenses(user_id, date)`, `expenses(project_id)`, `income(user_id, date)`, `goals(user_id, statut)`, `projects(user_id, statut)`.

### profiles
| Champ | Type | Description |
|-------|------|-------------|
| id | uuid PK | Référence auth.users |
| nom | text | Nom |
| prenom | text | Prénom |
| email | text | Email |
| telephone | text | Téléphone |
| pays | text | Pays |
| devise | text | Devise (FCFA par défaut) |
| avatar_url | text | Avatar |
| role | text | user / admin |
| date_creation | timestamptz | Création |

### income
| Champ | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK profiles |
| source | text | Libellé |
| montant | numeric | Montant |
| date | date | Date |
| type | text | salaire / business / freelance / investissement / autre |

### expenses
| Champ | Type | Description |
|-------|------|-------------|
| id | uuid PK | Clé primaire |
| user_id | uuid | FK profiles |
| description | text | Libellé |
| montant | numeric | Montant |
| date | date | Date |
| categorie | text | logement / alimentation / transport / factures / sante / education / famille / loisirs / shopping / epargne / autre |
| mode_paiement | text | espèces / mobile money / carte / virement / prélèvement |
| note | text | Note optionnelle |
| recurrent | boolean | Charge mensuelle récurrente |
| date_creation / updated_at | timestamptz | Horodatage |

### budgets
| Champ | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK profiles |
| mois | date | Mois concerné |
| revenu_mensuel | numeric | Revenu de référence |
| repartition | jsonb | Répartition par catégorie |
| score | integer | Santé financière 0-100 |

### goals
| Champ | Type | Description |
|-------|------|-------------|
| id | uuid PK | Clé primaire |
| user_id | uuid | FK auth.users |
| nom | text | Nom de l'objectif |
| categorie | text | fonds_urgence / logement / vehicule / mariage / business / education / voyage / autre |
| montant_objectif | numeric | Cible |
| montant_actuel | numeric | Déjà épargné |
| date_limite | date | Échéance (optionnelle) |
| priorite | text | haute / moyenne / basse |
| statut | text | actif / atteint |
| note | text | Note optionnelle |
| date_creation / updated_at | timestamptz | Horodatage |

### projects
| Champ | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK auth.users |
| nom | text | Nom du projet |
| categorie | text | logement / vehicule / mariage / business / education / voyage / autre |
| description | text | Description optionnelle |
| budget_total | numeric | Enveloppe totale |
| montant_finance | numeric | Montant déjà financé |
| goal_id | uuid | FK goals — objectif d'épargne qui finance le projet (optionnel) |
| postes | jsonb | Postes budgétaires : `{ id, libelle, categorie, prevu, depense }` |
| etapes | jsonb | Étapes du plan d'action : `{ id, libelle, statut }` (statut : a_faire / en_cours / termine) |
| documents | jsonb | Documents rattachés : `{ id, nom, url }` |
| date_debut / date_fin | date | Période (optionnelle) |
| statut | text | preparation / en_cours / termine / suspendu |
| priorite | text | haute / moyenne / basse |
| note | text | Note optionnelle |
| date_creation / updated_at | timestamptz | Horodatage |

### notifications
| Champ | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK profiles |
| titre | text | Titre |
| message | text | Contenu |
| type | text | alerte / info / succes |
| lue | boolean | Lue |
| date_creation | timestamptz | Création |

### financial_advice
| Champ | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK profiles |
| conseil | text | Conseil généré |
| categorie | text | Catégorie |
| date_creation | timestamptz | Création |

### chat_messages
| Champ | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK profiles |
| role | text | user / assistant |
| contenu | text | Message |
| date_creation | timestamptz | Création |

Chaque table applicative est protégée par RLS : l'utilisateur n'accède qu'à ses propres lignes (`auth.uid() = user_id`).

### financial_profiles (version 57)
| Champ | Type | Description |
|-------|------|-------------|
| id | uuid PK | Clé primaire |
| user_id | uuid UNIQUE | Propriétaire (une ligne par compte) |
| profile_type | text | student / employee / entrepreneur / freelancer / family / retired |
| monthly_income | numeric | Revenu mensuel déclaré |
| income_type | text | Nature du revenu |
| family_size | integer | Personnes au foyer (1 à 30) |
| financial_goals | text[] | Objectifs déclarés |
| created_at / updated_at | timestamptz | Horodatage |

RLS actif, 4 politiques (select / insert / update / delete) limitées à `auth.uid() = user_id`, plus un index sur `user_id`.

> **État réel de la base (vérifié)** : seules les tables `profiles`, `income`, `expenses`, `goals` et `projects` existent, toutes avec RLS actif et 4 politiques par table. Le bucket Storage `avatars` (public) est créé pour les photos de profil.
>
> Les tables `budgets`, `notifications`, `financial_advice`, `subscriptions` et `chat_messages` décrites ci-dessus sont **anticipées** et ne sont pas encore créées : le budget, les notifications/alertes, les recommandations de fiches et la progression de lecture sont **calculés côté navigateur** à partir des données `income` / `expenses` / `goals`, et mémorisés localement (localStorage) quand un état doit être conservé (alertes lues, canaux, fiches lues). Elles seront créées si l'on souhaite synchroniser ces états entre appareils.

## 5. Backend et intégrations

- **Base de données / Auth / Storage** : SaaS Supabase (choix de l'utilisateur) — à connecter avant la Phase 2.
- **IA** : Edge Function Supabase appelant l'API OpenAI (clé stockée en secret côté serveur).
- **Paiements** : aucun. Aucun abonnement, aucune intégration de paiement dans l'application.
- **Rapports** : génération côté navigateur d'un PDF A4 avec jsPDF (`lib/reportPdf.ts`), à partir des agrégats de `lib/reports.ts`.

## 6. Plan de développement

### Phase 1 — Site public (TERMINÉE)
- Objectif : valider l'identité visuelle et le discours produit.
- Livrables : landing page complète, page fonctionnalités, page mode d'emploi (les 13 onglets expliqués), page à propos (mission, histoire, équipe, engagements).

### Phase 2 — Authentification et coquille applicative (TERMINÉE)
- Objectif : comptes utilisateurs fonctionnels.
- Livrables : inscription, connexion, déconnexion, mot de passe oublié, profil, layout du dashboard + navigation latérale.

### Phase 3 — Revenus et dépenses (TERMINÉE)
- Revenus : table `income`, RLS, page `/app/revenus`, formulaire de création/modification, suppression confirmée, filtres par type/période, recherche, tri.
- Dépenses : table `expenses`, RLS, page `/app/depenses`, CRUD complet, filtres par catégorie/période, recherche, tri, indicateurs et répartition graphique par catégorie.

### Phase 4 — Budget, objectifs et projets (TERMINÉE)
- Objectif : passer du constat au plan.
- Budget intelligent : TERMINÉ — page `/app/budget`, répartition 50/30/20 calculée sur le revenu réel (mois en cours, sinon moyenne des 3 derniers mois), comparaison recommandé/réel par groupe et par poste, marge disponible et score de santé `/100`.
- Planificateur de projets : TERMINÉ — table `projects` + RLS, page `/app/projets`, CRUD complet, répartition budgétaire par poste (jsonb), génération d'une répartition recommandée selon le type de projet, suivi prévu / dépensé / reste par poste, filtres par statut et type, tri, et synthèse de l'enveloppe globale.
- Objectifs : TERMINÉ — table `goals` + RLS, page `/app/objectifs`, CRUD complet, filtres par statut/catégorie, tri, calcul de l'épargne mensuelle nécessaire selon l'échéance, progression globale, enregistrement d'épargne et comparaison avec la capacité d'épargne réelle (revenus − dépenses des 3 derniers mois).
- Tableau de bord : graphique d'évolution revenus / dépenses sur 6 mois (recharts) + totaux et solde net.
- Carte « Projets en cours » : budget et financement, plus l'avancement des étapes du plan de chaque projet actif (ratio terminées, barre de progression, prochaine étape).
- Financement croisé projets / objectifs : TERMINÉ — colonne `projects.goal_id`, sélection de l'objectif dans le formulaire projet, synchronisation de la cible (enveloppe) et de l'épargne (montant financé), et mise à jour automatique des projets lors d'un dépôt d'épargne. Carte « Projets en cours » sur `/app` avec avancement budgétaire et reste à financer.

- Simulateur d'épargne dans le panneau projet : TERMINÉ — composant `ProjectSavingsSimulator` dans `ProjectDetailModal` : durée (préréglages 6/12/18/24/36 mois + saisie libre), calage automatique sur la date de fin du projet, effort mensuel, équivalents hebdomadaire et annuel, date du dernier versement et rappel de l'objectif lié.

- Création d'objectif depuis le formulaire projet : TERMINÉ — `createGoalFromProject` / `buildGoalDraftFromProject` dans `lib/projectFunding.ts` : objectif prérempli (nom « Projet — épargne », cible = enveloppe, déjà épargné = montant financé, échéance = fin prévue, catégorie mappée depuis le type de projet), créé puis sélectionné automatiquement, avec messages d'erreur et de confirmation.

- Séparation des modules Objectifs / Projets : TERMINÉ
  - Navigation distincte : groupes « Objectifs » et « Projets » séparés dans la barre latérale, titres de page explicites (« Mes objectifs » / « Mes projets »).
  - Bandeaux d'identité sur chaque module : « Un objectif, c'est la destination » / « Un projet, c'est le chemin », avec renvoi croisé.
  - Objectifs = vision : montant cible, échéance, progression, épargne déjà constituée, priorité, statut. Catégories alignées sur le parcours utilisateur (maison, voiture, mariage, voyage, formation, épargne, investissement, création d'entreprise, fonds d'urgence, autre).
  - Projets = plan d'action : enveloppe, postes de dépenses, suivi du réel, étapes, planning et documents. Colonnes `projects.etapes` et `projects.documents` ajoutées (jsonb + RLS existante).
  - Étapes de plan : générées automatiquement selon le type de projet à la création, puis éditables (ajout, renommage, suppression, statut à faire / en cours / terminé) dans le panneau projet, avec avancement affiché sur la carte (« ✅ / ⏳ / ⬜ »).
  - Documents : ajout d'une référence (nom + lien optionnel) et suppression dans le panneau projet.
  - Relation lisible : la carte objectif affiche l'avancement du projet associé (« Votre projet associé avance à X % ») et la carte projet indique l'objectif auquel il répond.
  - Panneau « Recommandation FinBuilder IA » sur les objectifs : épargne mensuelle nécessaire pour l'objectif le plus exigeant, comparaison avec la capacité d'épargne réelle, et proposition de créer le projet associé.

### Phase 5 — Intelligence artificielle (TERMINÉE, hors appel OpenAI réel)
- Objectif : personnaliser les conseils.
- Assistant conversationnel : TERMINÉ — page `/app/assistant` + entrée dédiée dans la navigation. Le module `lib/assistant.ts` analyse la phrase (catégorie, montant, durée), en déduit un objectif puis un projet préremplis, et compare l'effort mensuel à la capacité d'épargne réelle (revenus − dépenses sur 3 mois). La carte « Plan proposé » permet d'ajuster cible, épargne de départ et durée, puis de créer l'objectif seul ou l'objectif + le projet lié (postes budgétaires et étapes générés selon le type).
- Simulations « et si » et conseiller logement : livrés en Phase 6.
- Livrable restant : conseil du jour contextualisé (aujourd'hui une carte de conseil statique calculée sur le score s'affiche au tableau de bord).

### Phase 6 — Éducation, notifications, rapports (TERMINÉE)
- Objectif : engager et fidéliser.
- Conseiller logement : TERMINÉ — page `/app/logement` + module `lib/housing.ts`. Revenu et charge logement préremplis depuis les données réelles (revenus et dépenses de catégorie logement sur 3 mois), apport, prix du bien visé, taux d'intérêt, durée (5 à 30 ans) et taux d'endettement (25 / 30 / 33 / 35 %). Résultats : mensualité maximale, capital empruntable (somme actualisée), budget d'achat, frais d'acquisition à 7 %, loyer soutenable à 30 %, poids du logement actuel avec repères 30 % / 40 %, reste à vivre avant et après emprunt, mensualité et coût total du crédit pour le bien visé, conseils contextuels et liens vers Projets / Simulations.
- Simulations « et si » : TERMINÉ — page `/app/simulations` + module `lib/simulations.ts`. Point de départ prérempli (revenus du mois ou moyenne, dépenses hors épargne sur 3 mois), leviers (variation de revenus, réduction de dépenses, versement d'épargne automatique), horizon 6 / 12 / 24 / 36 / 60 mois, quatre scénarios prêts à l'emploi. Résultats : capacité d'épargne avant / après, gain mensuel, capital accumulé sur l'horizon, écart cumulé, taux d'épargne, courbe de capital comparée (recharts), tableau de comparaison ligne par ligne et impact sur le délai d'un objectif sélectionné.
- Centre de notifications : TERMINÉ — page `/app/notifications` + module `lib/notifications.ts`. Alertes calculées à partir des données réelles : échéances d'objectifs (dépassée, ≤ 2 mois, ≤ 6 mois, objectif sans date limite), dépassements par bloc budgétaire (besoins / envies) et par poste, déficit du mois, épargne mensuelle manquante ou atteinte. Filtres Toutes / Urgentes / Objectifs / Budget / Épargne, marquage comme lu (stockage local par utilisateur), restauration des alertes lues et trois canaux de rappels activables. Diagnostic du point faible (revenus absents, déficit, épargne faible, envies ou besoins au-dessus de la cible, budget équilibré) avec comparaison bloc par bloc et recommandation automatique de 2 fiches d'éducation financière ouvertes directement via `/app/education?fiche=<id>`. Un bloc « Messages de l'équipe » affiche en tête les annonces diffusées depuis la console d'administration. Une cloche persistante dans la barre supérieure (composant `pages/app/components/NotificationBell.tsx` + hook `hooks/useTeamMessages.ts`, cache partagé) signale les messages internes non lus avec un compteur, ouvre un aperçu des 4 derniers messages et renvoie vers le centre de notifications ; le même compteur apparaît sur l'entrée « Notifications » du menu latéral. L'état « lu » reste mémorisé par utilisateur (clé `finbuilder_annonces_seen_v1:<userId>`, helpers `readAnnouncementsSeen` / `writeAnnouncementsSeen` dans `lib/announcement.ts`) et se synchronise entre la page et la cloche via un événement navigateur.
- Interpellation de l'utilisateur : TERMINÉ — `hooks/useAlertFeed.ts` (cache partagé des alertes financières : une seule série de requêtes pour la cloche, le menu et le résumé, rafraîchie chaque minute, au retour sur l'onglet et à chaque écriture via `notifyChange`), `lib/attention.ts` (état « lu », canaux, préférence de son, résumé du jour, carillon généré par Web Audio — aucun fichier son) et `pages/app/components/WelcomeDigest.tsx`. La cloche additionne désormais les messages de l'équipe **et** les alertes financières non lues, s'anime discrètement (halo + oscillation) et carillonne — son désactivable et mémorisé par compte — dès qu'une nouvelle notification arrive pendant la session ; le badge du menu latéral suit le même total. À la première visite de la journée, un résumé d'accueil interpelle l'utilisateur par son prénom (« Bonjour Awa, 3 notifications méritent votre attention ») avec les trois plus importantes, un accès direct à chacune et un renvoi vers le centre. Le marquage « lu » écrit la même clé que la page Notifications (`finbuilder_notifs_dismissed_v1:<userId>`) et diffuse l'événement `finbuilder:alertes-seen` : page, cloche et menu restent synchronisés en direct.
- Rapports : TERMINÉ — page `/app/rapports` + modules `lib/reports.ts` et `lib/reportPdf.ts`. Sélection du mois (12 derniers mois + mois contenant des données), indicateurs revenus / dépenses / solde / taux d'épargne avec variation par rapport au mois précédent, courbe comparée sur 6 mois (recharts), synthèse rédigée et points clés calculés (premier poste, plus grosse dépense, évolution des dépenses), répartition par catégorie et par source, détail des opérations avec filtres. Export PDF A4 (jsPDF) paramétrable : synthèse et points clés, répartition des dépenses, détail des opérations, en-tête de marque et pagination.
- Éducation financière : TERMINÉ — page `/app/education` + données statiques `src/mocks/education.ts` (14 fiches courtes : bases, budget, épargne, projets, crédit, investissement, comportement). Recherche, filtres par catégorie et « non lues », fiche à la une, progression de lecture stockée localement par utilisateur, panneau de lecture complet (résumé, à retenir, exemple chiffré) et liens directs vers les modules concernés (budget, objectifs, projets, simulations, logement, rapports, assistant).

### Phase 7 — Administration (livrée en version 30, socle exploitable)
- Objectif : piloter la plateforme.
- Livrables : dashboard admin (utilisateurs, statistiques, logs). Aucun système d'abonnement ni de paiement : l'accès complet est donné dès l'inscription.
- Contrôle d'accès : TERMINÉ — `components/feature/AdminGuard.tsx` vérifie l'appartenance à la table `admins` (et le rôle `admin` du profil) avant tout rendu ; écran « Accès réservé » sinon. Lien « Administration » ajouté au menu du compte dans l'espace personnel, uniquement pour les administrateurs.
- Coquille d'administration : TERMINÉ — `pages/admin/components/AdminShell.tsx` + `AdminSidebar` + `AdminTopbar`, barre latérale dédiée (264 px). Plus aucun module « à venir / bientôt » : toutes les entrées affichées sont actives.
- Vue d'ensemble : TERMINÉ — `pages/admin/page.tsx`. Indicateurs : comptes inscrits, nouveaux du mois, administrateurs, actions des 30 jours et échecs. Répartitions par pays et par devise, consommation de l'assistant IA sur 30 jours (requêtes, tokens, coût estimé face au budget mensuel), volumétrie contenus / annonces / abonnements, activité récente et accès rapides. Chaque ouverture de console est journalisée une fois par jour.
- Utilisateurs : TERMINÉ — `pages/admin/utilisateurs/page.tsx`. Recherche plein texte (nom, email, téléphone, pays), filtres rôle et pays, tris (inscription récente / ancienne, nom), compteurs, fiche détaillée en lecture seule et export CSV (séparateur `;`, BOM UTF-8) journalisé. Export PDF A4 de l'annuaire filtré (`lib/adminUsersPdf.ts`) : en-tête de marque, indicateurs, synthèse, filtres appliqués, répartition par pays, tableau paginé des comptes et mention de confidentialité — les deux exports sont journalisés dans `admin_audit_logs`.
- Journal d'activité : TERMINÉ — `pages/admin/journal/page.tsx` + `lib/admin.ts` (`fetchAdminLogs`, `recordAdminAction`). Filtres par action, résultat et recherche libre, compteurs (total, aujourd'hui, échecs, comptes concernés), affichage des détails et horodatage relatif. Le journal est en lecture seule.
- Contenus pédagogiques : TERMINÉ — `pages/admin/contenus/page.tsx` + `lib/content.ts`. Liste filtrable (recherche, statut, catégorie), compteurs (fiches, publiées, brouillons, catégories), éditeur complet (titre, résumé 500 caractères, catégorie, module lié, niveau, durée, icône, libellé d'action, page cible, points clés dynamiques, exemple chiffré, statut brouillon / publiée), aperçu de lecture identique à celui des utilisateurs, publication et retrait en un clic, suppression confirmée. Les 14 fiches historiques ont été importées dans `admin_contents` comme fiches publiées.
- Alimentation de la bibliothèque : TERMINÉ — l'onglet Éducation lit les fiches publiées (`fetchPublishedFiches`) via la fonction serveur `public-fiches` (service role, uniquement les fiches au statut `publie`), avec repli sur `src/mocks/education.ts` si la lecture échoue. Les brouillons ne sont visibles que dans la console.
- Annonces : TERMINÉ — `pages/admin/annonces/page.tsx` + `lib/announcement.ts`. Liste filtrable (recherche, statut, type, audience), compteurs (annonces, envoyées, programmées, brouillons, ciblées), éditeur (titre, message 500 caractères, type Information / Important / Bonne nouvelle / Mise à jour, audience tous les utilisateurs ou un destinataire précis, envoi immédiat, programmé ou brouillon), aperçu identique au rendu utilisateur, envoi et retrait en un clic, suppression confirmée. Une annonce envoyée apparaît dans le bloc « Messages de l'équipe » du centre de notifications (`/app/notifications`), en tête des alertes automatiques, avec compteur dans l'en-tête et marquage comme lu par appareil. Politique RLS ajoutée : un utilisateur ne peut lire que les annonces au statut `envoye` qui le concernent.
- Diffusion programmée des annonces : TERMINÉ — statut `programme` + `date_envoi` utilisée comme échéance. Une seconde politique RLS (`annonces_programmees_lues`) rend l'annonce lisible automatiquement dès que `date_envoi <= now()`, sans intervention humaine ni tâche planifiée. La console propose un sélecteur date/heure (validation : date future obligatoire), affiche le statut « Programmée » avec l'heure prévue, permet d'envoyer immédiatement sans attendre ou d'annuler la programmation (retour en brouillon). `promoteDueAnnouncements()` aligne le statut en base à l'ouverture de la console, et `fetchMyAnnouncements` filtre les échéances non atteintes.
- Paramètres de la plateforme : TERMINÉ — `pages/admin/parametres/page.tsx` + `lib/settings.ts` + `hooks/useAppSettings.tsx`. Carte Identité (nom de l'application, emails de contact et de support, langue, fuseau), carte Couleur principale (8 teintes proposées, code hexadécimal libre, sélecteur visuel, déclinaison des 11 nuances, avertissement de contraste), carte Mode maintenance (bascule avec confirmation) et aperçu en direct du menu et des boutons. Le nom et la couleur sont appliqués instantanément à toute l'application via les variables CSS `--primary-*` (conversion hexadécimal → OKLCH) et le fournisseur `AppSettingsProvider`; la navigation (site public, espace personnel, console) reprend le nom configuré. Politique RLS ajoutée pour la lecture publique de la ligne `id = 1` (aucune donnée sensible : ni revenus, ni secrets).
- Mode maintenance : TERMINÉ — `components/feature/MaintenanceGate.tsx` enveloppe l'espace personnel (`/app`). Les comptes non administrateurs voient un écran d'information (réessayer, support, accueil, déconnexion) ; les administrateurs (table `admins` ou rôle `admin`) conservent l'accès. Le site public reste disponible, aucune donnée n'est supprimée.
- Compte à rebours des annonces programmées : TERMINÉ — `hooks/useCountdown.ts` + `components/base/ScheduleCountdown.tsx`, réutilisés dans la liste des annonces et dans l'aperçu. Chaque annonce programmée affiche « Diffusion dans X j X h » (ou en minutes/secondes sous l'heure), passe à « Diffusion imminente » à l'échéance et déclenche un rafraîchissement automatique de la liste pour aligner le statut.
- Module Rôles : TERMINÉ — `pages/admin/roles/page.tsx` + `lib/roles.ts` + `hooks/useAdminAccess.tsx` + `pages/admin/roles/components/{RoleMemberList,MemberPanel}.tsx`. Toute la plateforme est couverte : la liste affiche l'ensemble des comptes (recherche libre + filtre par état d'accès ou par rôle) et chaque ligne ouvre un panneau latéral dédié (identité, rôle, mot de passe, informations du compte). Source de vérité unique : `profiles.admin_role_id` (la table `admins` ne sert plus que de marqueur d'accès pour les politiques RLS), ce qui rend le changement de rôle réellement effectif — l'ancienne logique lisait un `admins.role_id` non modifiable. Révocation = `admin_role_id` vidé + `role` remis à `user` + ligne `admins` supprimée ; le compte admin d'origine est protégé. Réinitialisation de mot de passe : fonction serveur `admin-set-password` (clients séparés anon pour vérifier le jeton, service role pour `auth.admin.updateUserById`), qui contrôle elle-même que l'appelant est le compte admin d'origine (rôle affiché « Admin ») ou détient le droit `security`, refuse l'auto-modification et impose 8 à 72 caractères. Côté interface : générateur de mot de passe, indicateur de robustesse, double saisie, confirmation avant application, message renvoyant la responsabilité de transmission. Audits ajoutés : `changer_role`, `reinitialiser_mot_de_passe`. Catalogue de droits (7 modules de console + 7 droits étendus conservés pour la suite) repris des clés déjà présentes dans `admin_roles` ; création, modification, duplication et suppression de rôles (suppression bloquée si le rôle est attribué ; le rôle unique `superadmin` a été retiré, seuls `admin` et `support` subsistent — le rôle `admin` détient désormais les 14 droits, y compris `security`, et affiche l'étiquette « Console complète »), attribution d'un rôle à un compte existant, changement de rôle et retrait de l'accès. Le menu de la console et chaque route (`components/feature/RequireAdminPermission.tsx`) sont filtrés par les droits du rôle ; un membre sans rôle conserve l'accès total. Colonne `profiles.admin_role_id` + politiques RLS d'insertion/suppression sur `admins` pour l'administrateur principal ; toutes les actions sont journalisées.
- Règles de confidentialité respectées : l'administration ne peut pas lire les revenus, dépenses, objectifs ou projets d'un utilisateur (aucune politique RLS ne l'autorise) et ne peut pas modifier ses informations personnelles. Elle peut en revanche supprimer un compte sur décision explicite — jamais un compte administrateur. Seul le module Assistant IA reste à activer (tables déjà présentes).

## 7. Audit technique (version 41+)

Audit complet du code et du schéma réel de la base, puis correctifs appliqués :

- **Conseiller logement** : `HousingResult` n'exposait pas l'apport alors que les conseils l'affichent — le montant s'affichait `undefined` (et le typage était faux). L'apport est désormais calculé, typé et renvoyé.
- **Bibliothèque d'éducation** : la grille filtrait avec un `useMemo` qui ne dépendait pas de la liste des fiches — une fiche publiée depuis la console n'apparaissait jamais dans la liste. La dépendance est ajoutée, et les fiches publiées complètent désormais la bibliothèque d'origine au lieu de la remplacer (les liens de recommandation `?fiche=` continuent de fonctionner).
- **Accès console** : le lien « Administration » du menu compte ne s'affichait que pour `role = admin`. Il s'affiche aussi pour les comptes dotés d'un rôle d'administration (`admin_role_id`), qui pouvaient ouvrir la console sans aucun lien pour y entrer. Le badge de la page profil suit la même règle.
- **Réinitialisation de mot de passe** : la page concluait à un « lien invalide » avant que Supabase ait fini de traiter la session contenue dans l'URL. Elle écoute désormais `onAuthStateChange` (`PASSWORD_RECOVERY` / `SIGNED_IN`) et affiche un état de vérification.
- **Comptage des administrateurs** : la carte « Administrateurs » et le compteur de la page Utilisateurs ne comptaient que `role = admin` (et la table `admins` n'expose que sa propre ligne via RLS). Le décompte s'appuie maintenant sur les profils et inclut les rôles d'administration personnalisés.
- **Photo de profil** : le client acceptait 10 Mo alors que le bucket `avatars` plafonne à 5 Mo (échec d'envoi tardif). La limite est alignée à 5 Mo.
- **Notifications** : la pastille « urgente » se basait sur toutes les alertes calculées, y compris celles déjà marquées comme lues. Elle suit désormais les alertes réellement affichées.
- **Dernière connexion** : la colonne `profiles.derniere_connexion` n'était jamais alimentée (la console affichait « Jamais »). Elle est mise à jour à chaque connexion réussie.
- **Navigation** : les titres de groupe de la barre latérale ne contiennent plus d'émojis, pour rester cohérents avec le reste de l'interface.

> **Arbitrage sécurité — RÉSOLU** : les politiques permissives `admin_read_all_income`, `admin_read_all_expenses`, `admin_read_all_goals` et `admin_read_all_projects` ne peuvent pas être supprimées via l'outil SQL (DROP POLICY non autorisé). Elles sont neutralisées par des politiques **RESTRICTIVE** (`restrict_income_to_owner`, `restrict_expenses_to_owner`, `restrict_goals_to_owner`, `restrict_projects_to_owner`) qui imposent `auth.uid() = user_id` en lecture pour tous les rôles : en RLS PostgreSQL les politiques restrictives se combinent en ET, elles annulent donc l'effet des politiques permissives. `admin_platform_stats` est passée en `security_invoker = false` pour continuer à produire des compteurs agrégés (aucune ligne individuelle).

## Durcissement de la sécurité (TERMINÉ)

- **Élévation de privilèges bloquée** : le déclencheur `guard_profile_privileges_trg` (BEFORE INSERT OR UPDATE sur `profiles`) interdit toute modification de `role`, `admin_role_id`, `statut`, `id` et `date_creation` par un appelant authentifié non propriétaire de la console ; à l'insertion, les colonnes de droits sont forcées à `user` / `NULL`. Seul le compte administrateur principal (`role = 'admin'` et `admin_role_id IS NULL`) ou un appel service_role peut les modifier.
- **Attribution des rôles hors du navigateur** : nouvelle fonction serveur `admin-assign-role` (anon pour identifier l'appelant, service role pour écrire) qui contrôle les droits (`security`), protège le compte principal, valide l'existence du rôle, met à jour `profiles` + `admins` et journalise `attribuer_role` / `revoquer_acces`. `assignRoleToUser()` passe désormais par elle.
- **Fonctions serveur** : `public-fiches` exige une session valide (plus d'endpoint ouvert utilisant la clé service). `admin-set-password` refuse la réinitialisation du compte administrateur principal et journalise `reinitialiser_mot_de_passe`.
- **Navigateur** : `Content-Security-Policy` (scripts, styles, images, connexions limités aux origines réellement utilisées, `object-src 'none'`, `base-uri 'self'`), `Referrer-Policy: strict-origin-when-cross-origin`, et redirection post-connexion restreinte aux chemins internes (`safeRedirect`).

## 8. Suppression de compte (version 49)

Deux chemins de suppression, une seule règle de sécurité : **un compte administrateur ne peut jamais être supprimé**.

- **Libre-service** (`pages/app/profile/components/DeleteAccountCard.tsx`) : carte « Supprimer mon compte » en bas de la page Profil, ouverte par une modale qui liste les données perdues et exige la saisie du mot « SUPPRIMER ». Après succès : déconnexion locale et retour à l'accueil.
- **Console** (`pages/admin/utilisateurs`) : bouton « Supprimer ce compte » dans la fiche utilisateur, affiché uniquement pour les comptes sans rôle d'administration, avec confirmation explicite. La liste est rechargée et un message de confirmation indique le compte supprimé.

Côté serveur, la fonction `delete-account` (clients séparés : anon pour valider le jeton, service role pour agir) vérifie l'identité de l'appelant, refuse toute cible `role = admin` ou dotée de `admin_role_id`, et n'autorise la suppression d'un tiers qu'au compte admin d'origine ou à un rôle possédant le droit `users`. Elle supprime dans l'ordre `expenses`, `income`, `goals`, `projects`, la ligne `admins`, la photo `avatars/<id>/avatar.jpg`, puis écrit la trace `supprimer_compte` / `supprimer_utilisateur` dans `admin_audit_logs` (email et initiateur conservés, `user_id` à NULL), supprime le profil et enfin l'utilisateur d'authentification. Les tables liées par `ON DELETE CASCADE` (`admin_notifications`, `admin_subscriptions`, `admin_payments`) se vident automatiquement.

## 9. Page de connexion (version 50)

Refonte du parcours de connexion, à périmètre fonctionnel inchangé (Supabase Auth).

- **Mémorisation de l'email** (`pages/auth/login/page.tsx`) : case « Se souvenir de moi » cochée par défaut dès qu'une adresse a été mémorisée. L'adresse est préremplie à la visite suivante ; décocher efface la valeur (`localStorage`, clé `finbuilder:remembered-email`). Le mot de passe n'est jamais stocké.
- **Alerte Verr. Maj** (`pages/auth/components/AuthField.tsx`, prop `warnCapsLock`) : lecture de `getModifierState("CapsLock")` à la frappe, message discret sous le champ, effacé à la sortie du champ. Activée uniquement sur le mot de passe de la connexion.
- **Repères de navigation** (`pages/auth/components/AuthLayout.tsx`) : barre supérieure visible sur ordinateur avec « Comment ça marche » et « Retour au site » ; la version mobile conserve son en-tête.
- **Encart d'aide** : sous le formulaire, carte « Besoin d'aide pour vous connecter ? » (mode d'emploi, écrire à l'équipe) et rappel « connexion chiffrée, identifiants jamais partagés ».
- **Panneau latéral rafraîchi** : contraste renforcé (voile dégradé plus profond, texte plus lisible), bandeau d'indicateurs (250 k FCFA épargnés, score 82/100, note 4,8/5), citation retravaillée avec badge « membre vérifié » et badge « Connexion sécurisée » à côté du logo.

## 10. Profil financier utilisateur (version 57)

Module additionnel : aucune fonctionnalité existante n'est supprimée, l'authentification Supabase et les tables `profiles` / `income` / `expenses` / `goals` / `projects` restent inchangées.

- **Référentiel** (`lib/financialProfiles.ts`) : six situations documentées (étudiant, salarié, entrepreneur, freelance, famille, retraité) avec objectif, priorités, conseils IA, repères du tableau de bord, types de revenus, libellés d'indicateurs et objectifs suggérés (montant + durée).
- **Données** : table `financial_profiles` (une ligne par compte, `user_id` unique) + RLS propriétaire ; hook `hooks/useFinancialProfile.tsx` (fournisseur global dans la coquille `AppShell`, lecture, enregistrement par upsert, gestion d'erreur et rechargement).
- **Étape de choix** (`FinancialProfileGate` + `FinancialProfileWizard`) : modale affichée à la première connexion tant qu'aucun profil n'existe, avec cartes animées, puis formulaire (revenu, type de revenu, taille du foyer, objectifs). « Plus tard » mémorise le report pour la session ; la même étape est accessible depuis la page Profil et depuis `/app/profil-financier`.
- **Page « Mon profil financier »** (`/app/profil-financier`) : identité et photo, profil courant, statistiques (revenu, type, foyer, objectifs), conseils IA du profil, repères et objectifs adaptés créables en un clic (écriture réelle dans `goals` avec échéance calculée), liens vers les modules concernés, modification et changement de situation.
- **Impact sur le tableau de bord** : libellé de l'indicateur d'épargne adapté au profil (« Budget disponible », « Reste à vivre », « Trésorerie disponible »…), bandeau « Tableau de bord personnalisé » avec les priorités du profil, et nouvelle étape « Choisissez votre profil financier » dans le parcours de démarrage.
- **Impact sur le coach IA** : l'assistant reçoit le profil actif (message d'accueil personnalisé, suggestions de phrases issues du profil, rappel du profil dans l'analyse et dans le calcul de capacité d'épargne).
- **Impact sur les objectifs** : trois cibles adaptées par profil proposées sur la page, plus les objectifs personnels déclarés.

## 11. Performance du tableau de bord (version 60)

Objectif : réduire le nombre de requêtes Supabase au chargement, sans toucher au design, aux fonctionnalités ni aux politiques RLS.

- **Source de données unique** (`hooks/useFinancialData.tsx`, `FinancialDataProvider` monté dans la coquille `AppShell`) : revenus, dépenses, objectifs, projets et profil financier sont chargés une seule fois puis partagés par tous les blocs du tableau de bord. Les projets reçoivent automatiquement leurs dépenses rattachées.
- **Chargement à la demande et sélectif** : chaque écran réclame uniquement les jeux de données qu'il affiche (`demand([...])`). Le tableau de bord demande les quatre ; les graphiques de répartition (`useSharedExpenses`) ne demandent que les dépenses, y compris sur la page Budget. Un garde empêche toute requête en double pendant qu'une salve est en cours.
- **Composants branchés sur la source partagée** : `useFinancialOverview` ne fait plus aucune requête (calculs uniquement), la carte « Évolution revenus / dépenses » agrège localement les six derniers mois, le camembert filtre les dépenses du mois en cours et la carte « Projets en cours » lit projets et objectifs partagés.
- **Synchronisation conservée** : `useSyncedReload` recharge uniquement les jeux de données déjà demandés, en silence, après chaque écriture (aucun clignotement).
- **Sécurité inchangée** : aucune requête modifiée sur le plan des permissions — les politiques RLS par propriétaire et les politiques RESTRICTIVE restent la seule barrière d'accès (vérifié en base).

## 12. Historiques paginés (version 61)

Objectif : rester fluide même après plusieurs années de saisie, sans changer le design ni les fonctionnalités.

- **Tableau de bord limité à 12 mois** : la source partagée `useFinancialData` ne lit plus que les revenus et dépenses des 12 derniers mois (`date >= premier jour du mois il y a 11 mois`). Les dépenses rattachées à un projet restent chargées quelle que soit leur date (`or(date.gte…,project_id.not.is.null)`) afin que l'avancement des projets reste exact.
- **Revenus et dépenses paginés côté base** : filtres (période, type/catégorie, recherche) et tri sont désormais traduits en requête serveur, puis `.range(from, to)` ne ramène que les 20 lignes de la page courante, avec `count: exact` pour le total.
- **Résumé allégé** : deux requêtes ne ramenant que quelques colonnes alimentent les indicateurs (montant + date sur tout l'historique) et les compteurs de type/catégorie + le total affiché (montant + type/catégorie sur le périmètre filtré). Les chiffres affichés restent identiques à avant.
- **Chargement progressif** : cache des pages déjà visitées (retour instantané), requêtes suivies par identifiant (aucune réponse obsolète ne remplace une page récente), rechargement silencieux après chaque écriture via `useSyncedReload`.
- **Projets paginés à l'écran** : 20 cartes par page, les agrégats (enveloppe globale, statuts, catégories, étapes) restent calculés sur l'ensemble des projets pour ne pas fausser les indicateurs.
- **Composant partagé** : `components/base/HistoryPagination.tsx` (précédent / suivant, plage affichée, pages, désactivation pendant le chargement), masqué lorsqu'il n'y a qu'une page.

## 13. Mise à jour du site public (version 62)

Alignement du discours public sur les modules réellement livrés.

- **Landing page** : la grille de fonctionnalités passe de 6 à 9 cartes (ajout de « Projets planifiés », « Profil financier » et « Éducation financière »), avec un visuel animé propre à chaque carte. Le bandeau de réassurance sous l'aperçu du tableau de bord mentionne l'historique paginé (20 lignes par page).
- **Nouvelle section « Profil financier »** (`pages/home/components/ProfileSection.tsx`) : les six situations couvertes (étudiant, salarié, entrepreneur, freelance, famille, retraité), le principe d'adaptation de l'espace, les objectifs proposés en un clic, et un aperçu du parcours en deux étapes (profil sélectionné, revenu, foyer, objectifs, conseil du profil).
- **FAQ** : deux entrées ajoutées — rôle du profil financier à l'inscription, et fluidité de l'application avec plusieurs années d'historique (synthèse sur 12 mois, pagination serveur par 20).
- **Page `/fonctionnalites`** : nouveau module « Profil financier » avec panneau animé dédié (`PanelMock` variante `profile`), et deux étiquettes ajoutées (« Profil financier », « Historique paginé »).
- **Contenus mis à jour** : chiffres clés (6 profils, 14 fiches d'éducation financière) et descriptions des cartes Budget (score de santé) et Éducation.
- Aucune modification du design existant, des routes, de l'authentification ou des politiques RLS : le site public ne lit aucune donnée utilisateur.

## 14. Mode d'emploi et aperçu Projets (version 63)

- **Mode d'emploi (`/mode-demploi`)** : passage de 13 à 14 onglets. Nouveau module en tête « Profil financier » (situation, revenu, foyer, priorités, objectifs proposés, modification sans perte d'historique), puis renumérotation de tous les autres onglets. Les modules Revenus, Dépenses et Projets expliquent désormais la pagination (20 lignes par page, Précédent / Suivant, filtres et tri traités côté base, totaux calculés sur l'historique filtré) et le tableau de bord rappelle sa fenêtre de 12 mois.
- **Contenus associés** : deux nouvelles questions fréquentes (rôle du profil financier, raison des pages de 20 et périmètre des totaux), l'étape de démarrage « Créez votre compte » mentionne le profil financier, et la chaîne « Un onglet ne travaille jamais seul » commence par le profil financier. Compteurs et export PDF (`lib/guidePdf.ts`) alignés sur les 14 onglets.
- **Nouvelle section landing « Projets planifiés »** (`pages/home/components/ProjectsSection.tsx`, placée entre Profil financier et Assistant IA) : aperçu du module avec enveloppe de 12 000 000 FCFA, épargne constituée et reste à financer, quatre postes budgétaires chiffrés avec leur part, trois étapes datées avec leurs statuts, et un simulateur d'épargne interactif (12 / 24 / 36 mois → effort mensuel et hebdomadaire). Trois accroches expliquent postes, étapes et simulateur, avec deux appels à l'action (inscription, page Fonctionnalités).
- **Données de démonstration** : `projectPreview` dans `src/mocks/landing.ts` (statique, aucun accès Supabase).

## 15. Audit responsive, mobile first et préparation PWA (version 64)

Audit complet de l'application (publique, authentification, espace privé, console) sur 320 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920 px. Aucune fonctionnalité supprimée, aucune logique métier modifiée, aucune politique RLS touchée.

**Structure vérifiée avant modification**
- `AppShell` (barre latérale 264 px ≥ 1024 px + tiroir mobile) et `AdminShell` ; `AuthGuard` → `MaintenanceGate` → `AppShell` ; `AdminGuard` → `RequireAdminPermission` → pages.
- Tables `profiles`, `income`, `expenses`, `goals`, `projects`, `financial_profiles` : toutes en RLS propriétaire (`auth.uid() = user_id`), plus politiques RESTRICTIVE ; les écritures de profil ne touchent jamais `role` / `admin_role_id` (attribution de rôle uniquement via la fonction serveur `admin-assign-role`).

**Navigation mobile (nouveau)**
- `pages/app/components/AppMobileNav.tsx` : barre d'onglets fixe sous 1024 px (Tableau de bord, Revenus, Dépenses, Projets, Menu), 56 px de haut, `env(safe-area-inset-bottom)`, état actif avec `aria-current="page"`, badge de page active. Le menu latéral complet reste accessible via « Menu » et via la barre supérieure.
- Le pied de page de l'espace privé réserve la hauteur de la barre : plus aucun contenu masqué.

**Correctifs responsive**
- Colonnes de bureau remplacées par des cartes sur mobile : tableaux Utilisateurs et Journal d'administration (le tableau reste affiché à partir de 1024 px, plus de défilement horizontal sur téléphone) ; détail des opérations des rapports (la date passe sous le libellé, largeurs bornées, plus de débordement à 320 px).
- Panneau de simulation de la page Fonctionnalités : colonnes proportionnelles (`minmax`) pour éviter les libellés coupés.
- Filet de sécurité global : `overflow-x: clip` sur `body` (n'interrompt pas les en-têtes collants), `-webkit-text-size-adjust: 100 %`.

**Expérience mobile**
- Cibles tactiles portées à 44 px minimum sur mobile : menu et fermeture des tiroirs, actions de ligne (revenus, dépenses, objectifs, projets), pagination, recherche et filtre Éducation ; les boutons de fermeture de modales sont agrandis par une règle CSS ciblée (`aria-label="Fermer"`).
- Champs de formulaire à 16 px sous 768 px : iOS ne zoome plus automatiquement à la saisie. Mise en page compacte conservée sur ordinateur.
- Modales déjà en feuille pleine largeur sur mobile (`items-end` + `max-h-[92vh]`) ; aucun changement de comportement.

**Graphiques**
- `hooks/useChartTheme.ts` : couleurs lues depuis les variables du StyleSystem (`primary-500`, `accent-500`, `background-200`, `foreground-500`, `background-50`). Les axes, grilles et infobulles des graphiques Évolution et Répartition ne sont plus codés en hexadécimal : ils restent lisibles après un changement de palette et en cas de thème sombre. `ResponsiveContainer` conservé partout.

**Accessibilité**
- Lien d'évitement « Aller au contenu principal » (`#contenu-principal`) dans l'espace privé ; `aria-current` sur les navigations latérales et publiques ; contours `:focus-visible` conservés ; contrastes des textes secondaires renforcés (`--foreground-400` 0,705 → 0,625 ; `--foreground-500` 0,585 → 0,522) ; libellés des boutons icône conservés.

**Performance**
- Découpage des routes (`src/router/config.tsx`) : chaque page est chargée à la demande via `Suspense` + `RouteFallback`. La page d'accueil publique ne télécharge plus le code de l'espace privé ni de la console d'administration.
- Image du héros en `fetchPriority="high"`, images sous la ligne de flottaison en `loading="lazy"` + `decoding="async"`, animations déjà neutralisées par `prefers-reduced-motion`.

**Préparation PWA (documentée, pas simulée)**
- `index.html` : `viewport-fit=cover`, `color-scheme: light`, `format-detection`, `theme-color`, `apple-mobile-web-app-*`, `apple-touch-icon` 180 px.
- `public/manifest.webmanifest` : `id`, `name`, `short_name`, `start_url`, `scope`, `display: standalone`, `display_override`, `orientation`, couleurs, `categories`, `shortcuts` (Tableau de bord, Revenus, Dépenses), icônes `any` 192/512 et `maskable` 512.
- `public/sw.js` : réseau prioritaire pour la navigation, cache de secours hors connexion (`offline.html`), pré-cache des ressources statiques uniquement, aucune interception de Supabase — enregistré par `lib/pwa.ts` (désactivé en prévisualisation et hors contexte sécurisé).
- **Icônes (version 67)** : quatre visuels PNG de marque générés et branchés — `192x192` (manifeste + favicon), `512x512` (manifeste, `purpose: any`), `maskable 512x512` (fond plein sans coins arrondis, zone sûre large) et `apple-touch-icon 180x180`. Le favicon cassé (`/vite.svg`, fichier absent) est remplacé par l'icône 192 PNG. Les `src` pointent vers le CDN d'images de la plateforme, qui sert bien des PNG : la plateforme n'écrit pas de fichier binaire dans le dépôt, donc aucune copie locale n'est possible pour l'instant.
- **Reste à faire pour une installabilité 100 % autonome** : si les fichiers PNG peuvent être déposés dans `public/pwa/` (par un dépôt Git ou un envoi manuel), il suffira de remplacer les `src` du manifeste et le `href` de l'`apple-touch-icon` par `./pwa/icon-192.png`, `./pwa/icon-512.png` et `./pwa/maskable-512.png`. Ajouter aussi `screenshots` (`wide` et `narrow`) pour l'écran d'installation enrichi.

## 16. Véracité des contenus et pages légales (version 65)

Objectif : aucun chiffre, témoignage ou promesse de sécurité non vérifiable sur le site public. Aucune fonctionnalité, route protégée ou politique RLS modifiée.

- **Chiffres retirés** : « 12 800+ utilisateurs », « 3,2 Md FCFA », « +18 pts », « 4,8/5 » (landing, page À propos, panneau d'authentification). La bande de chiffres du héros affiche désormais trois faits vérifiables : 6 profils financiers, FCFA par défaut, aucune connexion bancaire requise.
- **Cas d'usage** : les trois témoignages avec portraits et notes sont remplacés par `useCases` (`src/mocks/landing.ts`), trois scénarios rédigés sans nom ni photo, chacun portant la mention « Exemple fictif ».
- **Aperçu du tableau de bord** : libellé « Aperçu avec données d'exemple ». Tous les pourcentages et totaux sont calculés à l'exécution depuis `previewMonth`, `previewCategories` et `previewGoal` : objectif « Apport maison » à 68 % (2 040 000 / 3 000 000), parts par catégorie et total des dépenses, variations mensuelles, et cohérence revenus − dépenses = 170 000 FCFA = épargne 100 000 + reste à affecter 70 000.
- **Compteurs** : `AnimatedCounter` affiche la valeur finale dès le premier rendu ; seule une apparition douce est animée, neutralisée par `prefers-reduced-motion`. Le chiffre exact ne dépend plus de JavaScript.
- **Formulations** : « où le placer » devient « combien mettre de côté chaque mois ». La mention « Informations générales, ne constitue pas un conseil en investissement. » figure sous l'assistant de la landing, sous chaque réponse de l'assistant dans l'application et dans les pages légales.
- **Sécurité, formulations exactes** : « Données chiffrées » remplacé partout par « Connexion sécurisée (HTTPS) · Données isolées par compte ». La FAQ sur les données n'affirme que le HTTPS, l'isolation par compte via les règles de la base, le transfert des questions au fournisseur d'IA, et laisse `[À CONFIRMER : aucune revente des données]`.
- **Pages légales** : `/mentions-legales`, `/confidentialite`, `/cgu` (`src/pages/legal/...`, mise en page commune `LegalPage`), chargées à la demande, liées depuis le pied de page. Les champs à compléter sont visibles dans le texte et récapitulés dans un encart : `[NOM DE L'ENTITÉ]`, `[ADRESSE]`, `[HÉBERGEUR]`, `[DURÉE]`. L'email de contact `mrwim74@gmail.com` est renseigné.
- **Lettre financière** : case de consentement obligatoire avec lien vers la politique de confidentialité ; l'email de contact `mrwim74@gmail.com` est affiché dans le pied de page, la page À propos, le mode d'emploi et l'export PDF du guide.
- **Profil** : le bouton de suppression devient « Supprimer mon compte et mes données » (même fonction serveur `delete-account`, aucune règle modifiée).

## 17. Audit sécurité, fonctionnalités et robustesse (version 66)

Audit mené sur le code et le schéma réel de la base (SaaS Supabase). Aucune fonctionnalité, route, logique métier ni politique RLS supprimée.

**Sécurité — état vérifié en base**
- RLS active sur **toutes** les tables existantes (`profiles`, `income`, `expenses`, `goals`, `projects`, `financial_profiles`, `admins`, `admin_roles`, `admin_*`). Chaque table financière porte 4 politiques propriétaire (`auth.uid() = user_id` / `= id`) plus une politique RESTRICTIVE qui neutralise les politiques permissives `admin_read_all_*`.
- `profiles` : aucune escalade possible. Le déclencheur `guard_profile_privileges_trg` (SECURITY DEFINER) force `role`, `admin_role_id` et `statut` à l'insertion et refuse toute modification de ces colonnes par un appelant qui n'est pas le compte admin principal. `AdminGuard` vérifie en plus l'appartenance réelle à la table `admins` ou un rôle `admin` non falsifiable.
- Aucune clé service ni secret dans le front : seul `VITE_PUBLIC_SUPABASE_ANON_KEY` est exposé (`.env`), toutes les opérations privilégiées passent par les fonctions serveur (`delete-account`, `admin-assign-role`, `admin-set-password`, `public-fiches`) avec séparation client anon (validation du jeton) / client service role (écriture).
- Déconnexion : `AppShell` (donc `FinancialDataProvider`, caches de pages, `useFinancialProfile`) est démonté par `AuthGuard` dès la perte de session ; `signOut` remet le profil à `null`.
- **Contraintes CHECK ajoutées** (NOT VALID : elles s'appliquent aux nouvelles écritures sans bloquer l'existant) : longueurs de `income.source` (2–120), `expenses.description` (2–120), `goals.nom`, `projects.nom` (2–120), notes ≤ 500, description projet ≤ 2000, montants ≤ 1 000 000 000 000, `projects.budget_total` / `montant_finance` ≥ 0, `financial_profiles.monthly_income` ≥ 0, longueurs `profiles` (nom/prénom ≤ 80, téléphone ≤ 30, devise ≤ 10). Les colonnes de date sont typées `date` : une date invalide est rejetée par PostgreSQL.
- **Limitation des tentatives** : verrouillage de 60 s après 5 échecs de connexion (`pages/auth/login/page.tsx`, message générique) ; délai de 30 s entre deux inscriptions à la lettre financière (pied de page), en complément du honeypot et du consentement. Les limites serveur de Supabase Auth restent la protection de référence.

**Fonctionnalités annoncées — état**
- Pagination serveur par 20 : opérationnelle sur Revenus et Dépenses (`range()` + `count: exact`), pagination d'affichage sur Projets (agrégats calculés sur l'ensemble).
- Filtres / recherche / tri côté serveur : opérationnels sur Revenus et Dépenses ; Objectifs et Projets filtrent côté client à partir de la liste déjà chargée.
- Moyenne lissée des revenus variables : implémentée sur 3 mois (`resolveReferenceIncome`), conformément au mode d'emploi. Aucune promesse de 12 mois n'existe sur le site.
- Six profils, étapes de projet datées avec statut, choix de la devise : opérationnels.
- Documents de projet : référence nom + lien (pas d'envoi de fichier binaire).
- Import de fichier : **non implémenté** et **non annoncé** sur le site — aucune promesse à retirer.

**Robustesse**
- Revenus, Dépenses, Budget, Objectifs, Projets, Notifications, Rapports et tableau de bord disposent tous d'un état de chargement, d'un état vide et d'un état d'erreur avec bouton « Réessayer ». Le tableau de bord affiche un bandeau d'erreur non bloquant issu de `useFinancialData`.
- Aucune valeur financière codée en dur dans l'espace privé : uniquement `devise ?? "FCFA"` comme valeur par défaut et des placeholders de saisie. Les seuls montants figés sont les données de démonstration explicitement marquées « données d'exemple » (landing) et les cibles d'objectifs proposées par les profils financiers.