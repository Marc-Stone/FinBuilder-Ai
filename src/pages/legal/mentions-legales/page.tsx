import LegalPage, { type LegalSection } from "@/pages/legal/components/LegalPage";

const CONTACT_EMAIL = "mrwim74@gmail.com";

const sections: LegalSection[] = [
  {
    id: "editeur",
    title: "Éditeur du site",
    paragraphs: [
      "Le site FinBuilder AI et l'application associée (accessible sur finbuilderai.vercel.app et installable sur smartphone) sont édités par FinBuilder, établi en Côte d'Ivoire.",
      "Directeur de la publication : M. Goude Marc, fondateur de FinBuilder AI.",
      `Contact : ${CONTACT_EMAIL}.`,
    ],
  },
  {
    id: "hebergement",
    title: "Hébergement",
    paragraphs: ["Le service s'appuie sur les hébergeurs suivants :"],
    bullets: [
      "Application web : Vercel Inc., États-Unis — vercel.com.",
      "Base de données, authentification, fichiers (photos de profil) et fonctions serveur : Supabase Inc. — supabase.com. Serveurs situés aux États-Unis (Californie du Nord).",
      "Les coordonnées complètes de chaque hébergeur sont disponibles sur son site officiel.",
    ],
  },
  {
    id: "service",
    title: "Nature du service",
    paragraphs: [
      "FinBuilder AI est un outil de gestion financière personnelle : suivi des revenus et des dépenses, budget intelligent (règles 50/30/20 ou 80/20), objectifs, projets, simulations, rapports et Coach IA.",
      "Le service est gratuit pour l'ensemble des modules présentés sur le site. Il ne nécessite aucune connexion bancaire et ne réalise aucune opération financière à la place de l'utilisateur.",
    ],
  },
  {
    id: "propriete",
    title: "Propriété intellectuelle",
    paragraphs: [
      "La marque FinBuilder AI, le logo, l'interface, les textes, les visuels, les fiches d'éducation financière et les éléments logiciels du site sont protégés par le droit de la propriété intellectuelle.",
      "Toute reproduction, représentation ou réutilisation, totale ou partielle, sans autorisation écrite préalable de l'éditeur est interdite.",
      "Les données saisies par les utilisateurs leur appartiennent.",
    ],
  },
  {
    id: "responsabilite",
    title: "Responsabilité",
    paragraphs: [
      "FinBuilder AI met à disposition des outils d'analyse et d'organisation budgétaire. Les informations fournies, y compris les réponses du Coach IA, sont générales et ne constituent pas un conseil financier, fiscal, juridique ou en investissement.",
      "Les calculs et simulations reposent sur les montants saisis par l'utilisateur. L'éditeur ne peut être tenu responsable des décisions prises sur cette base.",
      "Le site peut contenir des liens vers des sites tiers, sur le contenu desquels l'éditeur n'exerce aucun contrôle.",
    ],
  },
  {
    id: "donnees",
    title: "Données personnelles",
    paragraphs: [
      "Le traitement des données personnelles, les prestataires utilisés et vos droits sont décrits dans la politique de confidentialité, accessible depuis le pied de page de chaque page du site.",
      "En cas de difficulté, vous pouvez saisir l'ARTCI (Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire) ou l'autorité de protection des données de votre pays de résidence.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    paragraphs: [`Pour toute question relative à ces mentions légales : ${CONTACT_EMAIL}.`],
  },
];

const pending: string[] = [];

export default function LegalNoticePage() {
  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Mentions légales"
      intro="Ce document identifie l'éditeur du site FinBuilder AI, les hébergeurs de l'application et les règles d'usage des contenus publiés."
      updated="10 novembre 2026"
      sections={sections}
      pending={pending}
    />
  );
}
