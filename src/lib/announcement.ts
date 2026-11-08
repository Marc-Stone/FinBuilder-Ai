import { supabase } from "@/lib/supabaseClient";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type AnnouncementType = "info" | "important" | "reussite" | "mise_a_jour";

export type AnnouncementStatut = "brouillon" | "programme" | "envoye";

export type AnnouncementAudience = "tous" | "utilisateur";

export type AnnouncementRow = {
  id: string;
  titre: string;
  message: string;
  audience: string;
  user_id: string | null;
  type: string;
  statut: string;
  date_envoi: string | null;
  date_creation: string;
  updated_at: string;
};

export type AnnouncementDraft = {
  titre: string;
  message: string;
  type: AnnouncementType;
  audience: AnnouncementAudience;
  userId: string | null;
  statut: AnnouncementStatut;
  scheduledAt: string | null;
};

/* ------------------------------------------------------------------ */
/* Référentiels                                                        */
/* ------------------------------------------------------------------ */

export const ANNOUNCEMENT_TYPE_ORDER: AnnouncementType[] = [
  "info",
  "important",
  "reussite",
  "mise_a_jour",
];

export const ANNOUNCEMENT_TYPE_META: Record<
  AnnouncementType,
  { label: string; icon: string; hint: string; chip: string; bubble: string }
> = {
  info: {
    label: "Information",
    icon: "ri-information-line",
    hint: "Un message neutre, affiché sans urgence.",
    chip: "border-secondary-200 bg-secondary-100 text-secondary-900",
    bubble: "bg-secondary-100 text-secondary-900",
  },
  important: {
    label: "Important",
    icon: "ri-alert-line",
    hint: "Met en avant une action ou une information critique.",
    chip: "border-accent-300 bg-accent-100 text-accent-900",
    bubble: "bg-accent-100 text-accent-900",
  },
  reussite: {
    label: "Bonne nouvelle",
    icon: "ri-trophy-line",
    hint: "Nouveauté, réussite ou remerciement aux utilisateurs.",
    chip: "border-primary-200 bg-primary-50 text-primary-800",
    bubble: "bg-primary-100 text-primary-800",
  },
  mise_a_jour: {
    label: "Mise à jour",
    icon: "ri-refresh-line",
    hint: "Évolution de l'application ou maintenance planifiée.",
    chip: "border-background-300 bg-background-100 text-foreground-700",
    bubble: "bg-background-100 text-foreground-800",
  },
};

export const ANNOUNCEMENT_STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  programme: "Programmée",
  envoye: "Envoyée",
};

export const ANNOUNCEMENT_STATUS_STYLES: Record<string, string> = {
  brouillon: "border-background-300 bg-background-100 text-foreground-700",
  programme: "border-accent-300 bg-accent-100 text-accent-900",
  envoye: "border-primary-200 bg-primary-100 text-primary-800",
};

export const ANNOUNCEMENT_AUDIENCE_LABELS: Record<string, string> = {
  tous: "Tous les utilisateurs",
  utilisateur: "Un utilisateur précis",
};

export function isAnnouncementType(value: string): value is AnnouncementType {
  return ANNOUNCEMENT_TYPE_ORDER.includes(value as AnnouncementType);
}

export function announcementTypeMeta(value: string) {
  return isAnnouncementType(value) ? ANNOUNCEMENT_TYPE_META[value] : ANNOUNCEMENT_TYPE_META.info;
}

/* ------------------------------------------------------------------ */
/* Brouillons                                                          */
/* ------------------------------------------------------------------ */

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Convertit une date ISO en valeur lisible par un champ date/heure local. */
export function toDatetimeLocal(iso: string | null): string {
  const date = iso ? new Date(iso) : new Date(Date.now() + 60 * 60 * 1000);
  const safe = Number.isNaN(date.getTime()) ? new Date(Date.now() + 60 * 60 * 1000) : date;
  return `${safe.getFullYear()}-${pad(safe.getMonth() + 1)}-${pad(safe.getDate())}T${pad(
    safe.getHours(),
  )}:${pad(safe.getMinutes())}`;
}

/** Date proposée par défaut : une heure après l'ouverture du formulaire. */
export function defaultScheduleValue(): string {
  return toDatetimeLocal(null);
}

export function emptyAnnouncementDraft(): AnnouncementDraft {
  return {
    titre: "",
    message: "",
    type: "info",
    audience: "tous",
    userId: null,
    statut: "brouillon",
    scheduledAt: defaultScheduleValue(),
  };
}

export function draftFromAnnouncement(row: AnnouncementRow): AnnouncementDraft {
  const audience: AnnouncementAudience = row.audience === "utilisateur" ? "utilisateur" : "tous";
  const statut: AnnouncementStatut =
    row.statut === "envoye" ? "envoye" : row.statut === "programme" ? "programme" : "brouillon";
  return {
    titre: row.titre,
    message: row.message ?? "",
    type: isAnnouncementType(row.type) ? row.type : "info",
    audience,
    userId: row.user_id,
    statut,
    scheduledAt: toDatetimeLocal(row.date_envoi),
  };
}

/* ------------------------------------------------------------------ */
/* Mise en forme                                                       */
/* ------------------------------------------------------------------ */

export function formatAnnouncementDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatAnnouncementDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function announcementStats(rows: AnnouncementRow[]) {
  return {
    total: rows.length,
    envoyees: rows.filter((row) => row.statut === "envoye").length,
    programmees: rows.filter((row) => row.statut === "programme").length,
    brouillons: rows.filter((row) => row.statut === "brouillon").length,
    cibles: rows.filter((row) => row.audience === "utilisateur").length,
  };
}

/** Une annonce programmée dont l'heure est passée est considérée comme diffusée. */
export function isAnnouncementDue(row: AnnouncementRow, now = Date.now()): boolean {
  if (row.statut !== "programme") return false;
  if (!row.date_envoi) return false;
  const time = new Date(row.date_envoi).getTime();
  return !Number.isNaN(time) && time <= now;
}

/* ------------------------------------------------------------------ */
/* Lecture administration                                              */
/* ------------------------------------------------------------------ */

const ANNOUNCEMENT_COLUMNS =
  "id, titre, message, audience, user_id, type, statut, date_envoi, date_creation, updated_at";

export async function fetchAdminAnnouncements(): Promise<AnnouncementRow[]> {
  const { data, error } = await supabase
    .from("admin_notifications")
    .select(ANNOUNCEMENT_COLUMNS)
    .order("date_creation", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AnnouncementRow[];
}

/* ------------------------------------------------------------------ */
/* Écriture administration                                             */
/* ------------------------------------------------------------------ */

function resolveDateEnvoi(draft: AnnouncementDraft): string | null {
  if (draft.statut === "envoye") return new Date().toISOString();
  if (draft.statut === "programme") {
    if (!draft.scheduledAt) return null;
    const date = new Date(draft.scheduledAt);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

function draftToRow(draft: AnnouncementDraft, previous?: AnnouncementRow | null) {
  const targeted = draft.audience === "utilisateur";
  const dejaEnvoyee = previous?.statut === "envoye" && draft.statut === "envoye";
  return {
    titre: draft.titre.trim(),
    message: draft.message.trim(),
    type: draft.type,
    audience: targeted ? "utilisateur" : "tous",
    user_id: targeted ? draft.userId : null,
    statut: draft.statut,
    date_envoi: dejaEnvoyee
      ? previous?.date_envoi ?? new Date().toISOString()
      : resolveDateEnvoi(draft),
    updated_at: new Date().toISOString(),
  };
}

export async function createAnnouncement(draft: AnnouncementDraft): Promise<void> {
  const { error } = await supabase.from("admin_notifications").insert(draftToRow(draft));
  if (error) throw error;
}

export async function updateAnnouncement(
  id: string,
  draft: AnnouncementDraft,
  previous?: AnnouncementRow | null,
): Promise<void> {
  const { error } = await supabase
    .from("admin_notifications")
    .update(draftToRow(draft, previous))
    .eq("id", id);
  if (error) throw error;
}

/**
 * Diffuse les annonces programmées dont l'heure est arrivée.
 * La lecture côté utilisateur fonctionne déjà sans cette étape (règle d'accès sur la date) ;
 * cette bascule garde simplement le statut cohérent dans la console.
 */
export async function promoteDueAnnouncements(): Promise<number> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("admin_notifications")
    .update({ statut: "envoye", updated_at: now })
    .eq("statut", "programme")
    .lte("date_envoi", now)
    .select("id");
  if (error) return 0;
  return (data ?? []).length;
}

export async function updateAnnouncementStatus(
  id: string,
  statut: AnnouncementStatut,
): Promise<void> {
  const { error } = await supabase
    .from("admin_notifications")
    .update({
      statut,
      date_envoi: statut === "envoye" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from("admin_notifications").delete().eq("id", id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* État « lu » des messages de l'équipe (partagé)                      */
/* ------------------------------------------------------------------ */

export const ANNOUNCEMENTS_SEEN_EVENT = "finbuilder:annonces-seen";

export function announcementsSeenKey(userId: string): string {
  return `finbuilder_annonces_seen_v1:${userId}`;
}

export function readAnnouncementsSeen(userId: string): string[] {
  try {
    const raw = window.localStorage.getItem(announcementsSeenKey(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeAnnouncementsSeen(userId: string, ids: string[]): void {
  try {
    window.localStorage.setItem(
      announcementsSeenKey(userId),
      JSON.stringify(Array.from(new Set(ids))),
    );
  } catch {
    // Stockage indisponible : l'état reste en mémoire.
  }
  window.dispatchEvent(new CustomEvent(ANNOUNCEMENTS_SEEN_EVENT));
}

/* ------------------------------------------------------------------ */
/* Lecture côté utilisateur                                            */
/* ------------------------------------------------------------------ */

export async function fetchMyAnnouncements(userId: string): Promise<AnnouncementRow[]> {
  try {
    const { data, error } = await supabase
      .from("admin_notifications")
      .select(ANNOUNCEMENT_COLUMNS)
      .in("statut", ["envoye", "programme"])
      .order("date_envoi", { ascending: false })
      .limit(20);
    if (error) return [];
    return ((data ?? []) as AnnouncementRow[]).filter(
      (row) =>
        (row.audience !== "utilisateur" || row.user_id === userId) &&
        (row.statut === "envoye" || isAnnouncementDue(row)),
    );
  } catch {
    return [];
  }
}