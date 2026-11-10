import LegalPage, { type LegalSection } from "@/pages/legal/components/LegalPage";

const CONTACT_EMAIL = "mrwim74@gmail.com";

const sections: LegalSection[] = [
  {
    id: "responsable",
    title: "Responsable du traitement",
    paragraphs: [
      "Le responsable du traitement des données est FinBuilder, établi en Côte d'Ivoire.",
      `Pour toute question ou demande relative à vos données personnelles : ${CONTACT_EMAIL}.`,
    ],
  },
  {
    id: "donnees-collectees",
    title: "Données collectées",
    paragraphs: [
      "FinBuilder AI ne collecte que les données nécessaires au fonctionnement du service :",
    ],
    bullets: [
      "Identité et compte : prénom, nom, adresse email, mot de passe (stocké uniquement sous forme chiffrée par notre prestataire d'authentification), pays et devise.",
      "Numéro de téléphone et photo de profil, uniquement si vous choisissez de les ajouter.",
      "Données financières que vous saisissez : revenus, dépenses et leurs catégories, objectifs d'épargne, projets, simulations, profil financier et règle de budget choisie (50/30/20 ou 80/20).",
      "Questions posées au Coach IA, uniquement le temps de générer la réponse (voir section 6).",
      "Compteur d'utilisation du Coach IA : nombre de questions posées par jour, sans leur contenu.",
      "Abonnement aux notifications, si vous les activez : adresse technique de votre appareil fournie par votre navigateur et type de navigateur.",
      "Adresse email d'inscription à la lettre financière, si vous vous y abonnez.",
    ],
  },
  {
    id: "finalites",
    title: "Pourquoi nous utilisons vos données",
    bullets: [
      "Créer, sécuriser et gérer votre compte personnel.",
      "Afficher votre tableau de bord, votre budget, vos objectifs, vos projets et vos rapports.",
      "Calculer vos alertes (dépassement de budget, objectifs atteints, rappels) et vous les envoyer en notification si vous l'avez accepté.",
      "Générer les réponses personnalisées du Coach IA à partir de votre situation.",
      "Vous adresser les emails de service et, si vous y avez consenti, la lettre financière.",
      "Assurer la sécurité du service, limiter les abus (quota quotidien du Coach IA) et prévenir les usages frauduleux.",
    ],
  },
  {
    id: "base-legale",
    title: "Base légale",
    paragraphs: [
      "Ces traitements reposent sur l'exécution du service que vous avez demandé en créant votre compte, sur notre intérêt légitime à sécuriser le service, et sur votre consentement pour les notifications et la lettre financière, que vous pouvez retirer à tout moment.",
    ],
  },
  {
    id: "non-revente",
    title: "Ce que nous ne faisons pas",
    bullets: [
      "Nous ne vendons pas et ne louons pas vos données personnelles ou financières.",
      "Nous n'affichons pas de publicité ciblée et n'utilisons pas de traceurs publicitaires.",
      "Nous ne demandons jamais vos codes bancaires, numéros de carte ou mots de passe de comptes externes.",
    ],
  },
  {
    id: "coach-ia",
    title: "Coach IA et intelligence artificielle",
    paragraphs: [
      "Lorsque vous posez une question libre au Coach IA, celle-ci est transmise, avec un résumé de votre situation financière, à notre fournisseur d'intelligence artificielle (Google, via l'API Gemini) afin de générer la réponse.",
      "Le résumé transmis contient : les totaux de vos revenus, dépenses et épargne du mois et leur répartition par catégorie, vos objectifs et projets (nom, montants, échéance), votre devise, votre pays et votre profil financier.",
      "Ne sont jamais transmis : votre nom, votre adresse email, votre téléphone, ni le libellé ou le détail de vos dépenses.",
      "Nous utilisons l'offre payante de l'API Gemini : selon les conditions de Google, vos questions et les réponses ne sont pas utilisées pour entraîner ou améliorer ses modèles. Google peut les conserver brièvement pour détecter les abus.",
      "FinBuilder AI ne conserve pas l'historique de vos conversations sur ses serveurs : il disparaît lorsque vous quittez la page ou démarrez une nouvelle conversation.",
      "Les réponses du Coach IA sont des informations générales et ne constituent pas un conseil financier, fiscal ou juridique personnalisé.",
    ],
  },
  {
    id: "appareil",
    title: "Données stockées sur votre appareil",
    paragraphs: [
      "FinBuilder AI n'utilise pas de cookies publicitaires. Certaines informations sont enregistrées dans le stockage local de votre navigateur pour le bon fonctionnement de l'application :",
    ],
    bullets: [
      "Votre session de connexion, pour ne pas vous redemander votre mot de passe à chaque visite.",
      "Votre adresse email, uniquement si vous cochez « Se souvenir de moi ».",
      "Vos préférences d'affichage : règle de budget, alertes déjà lues, son des notifications, choix concernant la bannière d'installation.",
      "Les fichiers de l'application (code, styles, icônes), mis en cache pour un chargement rapide et un fonctionnement hors connexion. Aucune donnée financière n'est mise dans ce cache.",
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    paragraphs: [
      "Les notifications ne sont envoyées que si vous les activez vous-même depuis la page Notifications, après l'autorisation de votre navigateur.",
      "Leur contenu reste volontairement général (par exemple « Une de vos catégories a dépassé le budget prévu ») : aucun montant ne s'affiche sur l'écran de votre téléphone.",
      "Les notifications transitent par le service d'envoi de votre navigateur (Google pour Chrome et Android, Apple pour Safari et iPhone, Mozilla pour Firefox).",
      "Vous pouvez les désactiver à tout moment depuis l'application ou les réglages de votre navigateur. Elles sont aussi désactivées automatiquement sur l'appareil lorsque vous vous déconnectez.",
    ],
  },
  {
    id: "sous-traitants",
    title: "Prestataires et transferts de données",
    paragraphs: [
      "Pour fonctionner, le service fait appel aux prestataires suivants, qui traitent les données uniquement pour notre compte :",
    ],
    bullets: [
      "Supabase : base de données, authentification, stockage des photos de profil et fonctions serveur. Région d'hébergement : États-Unis (Californie du Nord).",
      "Vercel : hébergement et diffusion de l'application web.",
      "Google (API Gemini) : génération des réponses du Coach IA.",
      "Readdy : réception des inscriptions à la lettre financière (adresse email).",
      "Google Fonts et Cloudflare (cdnjs) : diffusion des polices et des icônes de l'interface, qui reçoivent l'adresse IP de votre appareil lors du chargement.",
      "Services d'envoi de notifications des navigateurs (Google, Apple, Mozilla), si vous activez les notifications.",
    ],
  },
  {
    id: "transferts",
    title: "Transferts hors de votre pays",
    paragraphs: [
      "Vos données sont hébergées aux États-Unis (Californie du Nord) par notre prestataire de base de données. D'autres prestataires peuvent traiter des données aux États-Unis ou dans l'Union européenne.",
      "Ces transferts hors de Côte d'Ivoire et de votre pays de résidence sont encadrés par les garanties contractuelles proposées par ces prestataires, et limités aux données nécessaires au fonctionnement du service.",
    ],
  },
  {
    id: "conservation",
    title: "Durée de conservation",
    paragraphs: [
      "Vos données sont conservées tant que votre compte est actif, jusqu'à ce que vous le supprimiez.",
      "Lorsque vous supprimez votre compte depuis votre profil, votre profil, vos revenus, vos dépenses, vos objectifs, vos projets, votre photo, vos abonnements aux notifications et votre compteur d'utilisation du Coach IA sont supprimés immédiatement.",
      "Seule une trace de la suppression (votre adresse email et la date) est conservée dans notre journal de sécurité, comme les autres opérations de sécurité, pendant une durée comprise entre six mois et un an, afin de pouvoir justifier que votre demande a bien été exécutée.",
      "Les questions posées au Coach IA ne sont pas conservées par FinBuilder AI.",
    ],
  },
  {
    id: "securite",
    title: "Sécurité",
    bullets: [
      "Toutes les communications passent par une connexion chiffrée (HTTPS).",
      "Vos données sont isolées par compte : des règles d'accès appliquées directement dans la base de données garantissent que chaque enregistrement n'est lisible et modifiable que par son propriétaire.",
      "Les clés d'accès aux services sensibles (intelligence artificielle, notifications) sont conservées uniquement sur nos serveurs, jamais dans l'application.",
      "La photo de profil est stockée dans un espace accessible par lien direct : n'ajoutez pas de photo si vous ne le souhaitez pas.",
    ],
  },
  {
    id: "droits",
    title: "Vos droits",
    paragraphs: [
      "Vous disposez d'un droit d'accès, de rectification, de suppression, d'opposition, de limitation et de portabilité de vos données, ainsi que du droit de retirer votre consentement à tout moment.",
      "Vous pouvez consulter et corriger vos données directement dans l'application. La suppression est immédiate depuis votre profil grâce au bouton « Supprimer mon compte et mes données ».",
      `Pour toute autre demande, écrivez à ${CONTACT_EMAIL}. Nous nous engageons à répondre à toute demande relative aux données personnelles dans un délai maximum d'un (1) mois à compter de sa réception.`,
      "Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à l'autorité de protection des données personnelles : en Côte d'Ivoire, l'ARTCI (Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire), ou l'autorité équivalente de votre pays de résidence.",
    ],
  },
  {
    id: "modifications",
    title: "Modifications de cette politique",
    paragraphs: [
      "Nous pouvons faire évoluer cette politique, notamment lors de l'ajout de nouvelles fonctionnalités. La date de dernière mise à jour figure en haut de cette page ; en cas de changement important, vous en serez informé dans l'application ou par email.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    paragraphs: [`Pour exercer vos droits ou poser une question sur ce document : ${CONTACT_EMAIL}.`],
  },
];

const pending: string[] = [];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Données personnelles"
      title="Politique de confidentialité"
      intro="Cette page explique quelles données FinBuilder AI collecte, pourquoi, avec qui elles sont partagées, combien de temps elles sont conservées et comment exercer vos droits."
      updated="10 novembre 2026"
      sections={sections}
      pending={pending}
    />
  );
}
