import { supabase } from "@/lib/supabaseClient";
import { educationModules, getEducationModule, type Fiche } from "@/lib/education";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ContentStatus = "brouillon" | "publie" | "archive";

export type FichePayload = {
  module: string;
  icon: string;
  minutes: number;
  niveau: string;
  points: string[];
  exemple: string;
  action: string;
};

export type ContentRow = {
  id: string;
  type: string;
  titre: string;
  resume: string | null;
  contenu: string | null;
  categorie: string | null;
  statut: string;
  url: string | null;
  date_publication: string | null;
  date_creation: string;
  updated_at: string;
};

export type ContentDraft = {
  titre: string;
  resume: string;
  categorie: string;
  statut: ContentStatus;
  url: string;
  module: string;
  icon: string;
  minutes: number;
  niveau: string;
  points: string[];
  exemple: string;
  action: string;
};

type PublicFicheRow = {
  id: string;
  titre: string;
  resume: string | null;
  contenu: string | null;
  categorie: string | null;
  url: string | null;
  date_publication: string | null;
};

/* ------------------------------------------------------------------ */
/* Référentiels                                                        */
/* ------------------------------------------------------------------ */

export const CONTENT_STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  publie: "Publiée",
  archive: "Archivée",
};

export const CONTENT_STATUS_STYLES: Record<string, string> = {
  brouillon: "border-background-300 bg-background-100 text-foreground-700",
  publie: "border-primary-200 bg-primary-100 text-primary-800",
  archive: "border-secondary-200 bg-secondary-100 text-secondary-900",
};

export const CONTENT_NIVEAUX = ["Débutant", "Intermédiaire", "Avancé"];

export const CONTENT_CATEGORIES = [
  "Bases",
  "Budget",
  "Épargne",
  "Projets",
  "Crédit",
  "Investissement",
  "Comportement",
];

export const CONTENT_ICONS = [
  "ri-article-line",
  "ri-pie-chart-2-line",
  "ri-shield-star-line",
  "ri-wallet-3-line",
  "ri-drop-line",
  "ri-route-line",
  "ri-calculator-line",
  "ri-building-4-line",
  "ri-bank-line",
  "ri-git-branch-line",
  "ri-timer-flash-line",
  "ri-line-chart-line",
  "ri-file-chart-line",
  "ri-arrow-up-double-line",
  "ri-sparkling-line",
  "ri-lightbulb-line",
];

/* ------------------------------------------------------------------ */
/* Sérialisation du contenu complémentaire                             */
/* ------------------------------------------------------------------ */

const defaultPayload: FichePayload = {
  module: "budget",
  icon: "ri-article-line",
  minutes: 4,
  niveau: "Débutant",
  points: [],
  exemple: "",
  action: "Ouvrir mon espace",
};

export function parseFichePayload(contenu: string | null): FichePayload {
  if (!contenu) return { ...defaultPayload };

  try {
    const parsed = JSON.parse(contenu) as Partial<FichePayload> | null;
    if (!parsed || typeof parsed !== "object") return { ...defaultPayload };

    return {
      module: typeof parsed.module === "string" ? parsed.module : defaultPayload.module,
      icon: typeof parsed.icon === "string" && parsed.icon ? parsed.icon : defaultPayload.icon,
      minutes: Number.isFinite(Number(parsed.minutes)) ? Number(parsed.minutes) : defaultPayload.minutes,
      niveau: typeof parsed.niveau === "string" && parsed.niveau ? parsed.niveau : defaultPayload.niveau,
      points: Array.isArray(parsed.points)
        ? parsed.points.filter((point): point is string => typeof point === "string")
        : [],
      exemple: typeof parsed.exemple === "string" ? parsed.exemple : "",
      action: typeof parsed.action === "string" && parsed.action ? parsed.action : defaultPayload.action,
    };
  } catch {
    // Ancien contenu en texte libre : chaque ligne devient un point clé.
    const lines = contenu
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return { ...defaultPayload, points: lines };
  }
}

export function serializeFichePayload(payload: FichePayload): string {
  return JSON.stringify(payload);
}

export function emptyDraft(): ContentDraft {
  const first = educationModules[0];
  return {
    titre: "",
    resume: "",
    categorie: "Bases",
    statut: "brouillon",
    url: first.to,
    module: first.value,
    icon: "ri-article-line",
    minutes: 4,
    niveau: "Débutant",
    points: ["", "", ""],
    exemple: "",
    action: "Ouvrir mon espace",
  };
}

export function draftFromRow(row: ContentRow): ContentDraft {
  const payload = parseFichePayload(row.contenu);
  return {
    titre: row.titre,
    resume: row.resume ?? "",
    categorie: row.categorie ?? "Bases",
    statut: row.statut === "publie" ? "publie" : row.statut === "archive" ? "archive" : "brouillon",
    url: row.url ?? getEducationModule(payload.module).to,
    module: payload.module,
    icon: payload.icon,
    minutes: payload.minutes,
    niveau: payload.niveau,
    points: payload.points.length > 0 ? payload.points : [""],
    exemple: payload.exemple,
    action: payload.action,
  };
}

export function contentToFiche(row: PublicFicheRow | ContentRow): Fiche {
  const payload = parseFichePayload(row.contenu);
  const meta = getEducationModule(payload.module);
  return {
    id: row.id,
    titre: row.titre,
    categorie: row.categorie ?? "Bases",
    modules: [meta.value],
    icon: payload.icon,
    minutes: payload.minutes,
    niveau: payload.niveau,
    resume: row.resume ?? "",
    points: payload.points,
    exemple: payload.exemple,
    action: payload.action,
    to: row.url || meta.to,
  };
}

/* ------------------------------------------------------------------ */
/* Lecture administration                                              */
/* ------------------------------------------------------------------ */

const CONTENT_COLUMNS =
  "id, type, titre, resume, contenu, categorie, statut, url, date_publication, date_creation, updated_at";

export async function fetchAdminContents(): Promise<ContentRow[]> {
  const { data, error } = await supabase
    .from("admin_contents")
    .select(CONTENT_COLUMNS)
    .eq("type", "fiche")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContentRow[];
}

/* ------------------------------------------------------------------ */
/* Écriture administration                                             */
/* ------------------------------------------------------------------ */

function draftToRow(draft: ContentDraft) {
  const cleanedPoints = draft.points.map((point) => point.trim()).filter(Boolean);
  return {
    type: "fiche",
    titre: draft.titre.trim(),
    resume: draft.resume.trim(),
    contenu: serializeFichePayload({
      module: draft.module,
      icon: draft.icon || "ri-article-line",
      minutes: Math.max(1, Math.min(60, Math.round(draft.minutes) || 4)),
      niveau: draft.niveau,
      points: cleanedPoints,
      exemple: draft.exemple.trim(),
      action: draft.action.trim() || "Ouvrir mon espace",
    }),
    categorie: draft.categorie,
    statut: draft.statut,
    url: draft.url,
  };
}

export async function createContent(draft: ContentDraft): Promise<void> {
  const row = draftToRow(draft);
  const { error } = await supabase.from("admin_contents").insert({
    ...row,
    date_publication: draft.statut === "publie" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function updateContent(id: string, draft: ContentDraft): Promise<void> {
  const row = draftToRow(draft);
  const { error } = await supabase
    .from("admin_contents")
    .update({
      ...row,
      date_publication: draft.statut === "publie" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function updateContentStatus(id: string, statut: ContentStatus): Promise<void> {
  const { error } = await supabase
    .from("admin_contents")
    .update({
      statut,
      date_publication: statut === "publie" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteContent(id: string): Promise<void> {
  const { error } = await supabase.from("admin_contents").delete().eq("id", id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Lecture côté application                                            */
/* ------------------------------------------------------------------ */

export async function fetchPublishedFiches(): Promise<Fiche[]> {
  try {
    const { data, error } = await supabase.functions.invoke("public-fiches");
    if (!error && Array.isArray(data)) {
      return (data as PublicFicheRow[]).map((row) => contentToFiche(row));
    }
  } catch {
    // La fonction serveur peut être indisponible : on tente la lecture directe.
  }

  try {
    const { data, error } = await supabase
      .from("admin_contents")
      .select("id, titre, resume, contenu, categorie, url, date_publication")
      .eq("type", "fiche")
      .eq("statut", "publie")
      .order("date_publication", { ascending: false });
    if (error) return [];
    return ((data ?? []) as PublicFicheRow[]).map((row) => contentToFiche(row));
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Mise en forme                                                       */
/* ------------------------------------------------------------------ */

export function formatContentDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function contentStats(rows: ContentRow[]) {
  return {
    total: rows.length,
    publies: rows.filter((row) => row.statut === "publie").length,
    brouillons: rows.filter((row) => row.statut === "brouillon").length,
    categories: new Set(rows.map((row) => row.categorie ?? "Non classée")).size,
  };
}