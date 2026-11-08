import { supabase } from "@/lib/supabaseClient";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type AdminUserRow = {
  id: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  pays: string | null;
  devise: string | null;
  avatar_url: string | null;
  role: string;
  admin_role_id: string | null;
  statut: string | null;
  derniere_connexion: string | null;
  date_creation: string;
};

export type AdminLogRow = {
  id: string;
  user_id: string | null;
  email: string | null;
  action: string;
  cible: string | null;
  resultat: string;
  ip: string | null;
  details: Record<string, unknown> | null;
  date_creation: string;
};

export type AdminCounter = { label: string; value: number };

export type AdminOverviewData = {
  totalUsers: number;
  newThisMonth: number;
  adminCount: number;
  roleBreakdown: AdminCounter[];
  countryBreakdown: AdminCounter[];
  deviseBreakdown: AdminCounter[];
  logs30d: number;
  failures30d: number;
  recentLogs: AdminLogRow[];
  aiRequests30d: number;
  aiTokens30d: number;
  aiCost30d: number;
  aiMonthlyBudget: number;
  contentsCount: number;
  announcementsCount: number;
  subscriptionCount: number;
};

/* ------------------------------------------------------------------ */
/* Libellés                                                            */
/* ------------------------------------------------------------------ */

export const ADMIN_ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  user: "Utilisateur",
};

export const ADMIN_ACTION_LABELS: Record<string, string> = {
  acces_administration: "Ouverture de l'administration",
  export_utilisateurs: "Export de la liste des utilisateurs",
  consultation_utilisateur: "Consultation d'une fiche utilisateur",
  creer_contenu: "Création d'une fiche pédagogique",
  modifier_contenu: "Modification d'une fiche pédagogique",
  publier_contenu: "Publication d'une fiche pédagogique",
  depublier_contenu: "Retrait d'une fiche pédagogique",
  supprimer_contenu: "Suppression d'une fiche pédagogique",
  apercu_contenu: "Aperçu d'une fiche pédagogique",
  creer_annonce: "Création d'une annonce",
  modifier_annonce: "Modification d'une annonce",
  envoyer_annonce: "Diffusion d'une annonce",
  programmer_annonce: "Programmation d'une annonce",
  retirer_annonce: "Retrait d'une annonce",
  supprimer_annonce: "Suppression d'une annonce",
  apercu_annonce: "Aperçu d'une annonce",
  modifier_parametres: "Modification des paramètres de l'application",
  activer_maintenance: "Activation du mode maintenance",
  desactiver_maintenance: "Désactivation du mode maintenance",
  creer_role: "Création d'un rôle d'administrateur",
  modifier_role: "Modification d'un rôle d'administrateur",
  supprimer_role: "Suppression d'un rôle d'administrateur",
  attribuer_role: "Attribution d'un rôle",
  changer_role: "Changement de rôle d'un compte",
  retirer_role: "Retrait d'un accès à la console",
  reinitialiser_mot_de_passe: "Réinitialisation d'un mot de passe",
  definir_role: "Ouverture d'un accès à la console",
  supprimer_utilisateur: "Suppression d'un compte utilisateur",
  supprimer_compte: "Suppression de son propre compte",
};

/* ------------------------------------------------------------------ */
/* Mise en forme                                                       */
/* ------------------------------------------------------------------ */

export function displayUserName(user: AdminUserRow | null): string {
  if (!user) return "Utilisateur inconnu";
  const parts = [user.prenom, user.nom].filter(Boolean);
  return parts.join(" ") || user.email || "Sans nom";
}

export function initialsOf(user: AdminUserRow | null): string {
  if (!user) return "?";
  const first = user.prenom?.trim().charAt(0) ?? "";
  const last = user.nom?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();
  if (initials) return initials;
  if (user.email) return user.email.charAt(0).toUpperCase();
  return "?";
}

export function formatAdminDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatAdminDateTime(iso: string | null): string {
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

export function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 31) return `il y a ${days} j`;
  const months = Math.round(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  return `il y a ${Math.round(months / 12)} an(s)`;
}

export function formatAdminNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(value));
}

export function formatAdminMoney(value: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(value));
}

/* ------------------------------------------------------------------ */
/* Accès administrateur                                                */
/* ------------------------------------------------------------------ */

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

/* ------------------------------------------------------------------ */
/* Lectures                                                            */
/* ------------------------------------------------------------------ */

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nom, prenom, email, telephone, pays, devise, avatar_url, role, admin_role_id, statut, derniere_connexion, date_creation")
    .order("date_creation", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminUserRow[];
}

export async function fetchAdminLogs(limit = 120): Promise<AdminLogRow[]> {
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("id, user_id, email, action, cible, resultat, ip, details, date_creation")
    .order("date_creation", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AdminLogRow[];
}

function countBy<T extends string>(values: (T | null)[]): AdminCounter[] {
  const map = new Map<string, number>();
  values.forEach((value) => {
    const key = (value ?? "Non renseigné").trim() || "Non renseigné";
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export async function fetchAdminOverview(): Promise<AdminOverviewData> {
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    usersResult,
    recentLogsResult,
    logs30Result,
    failures30Result,
    aiUsageResult,
    aiSettingsResult,
    contentsResult,
    announcementsResult,
    subscriptionsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nom, prenom, email, telephone, pays, devise, avatar_url, role, admin_role_id, statut, derniere_connexion, date_creation")
      .order("date_creation", { ascending: false }),
    supabase
      .from("admin_audit_logs")
      .select("id, user_id, email, action, cible, resultat, ip, details, date_creation")
      .order("date_creation", { ascending: false })
      .limit(6),
    supabase
      .from("admin_audit_logs")
      .select("*", { count: "exact", head: true })
      .gte("date_creation", since30),
    supabase
      .from("admin_audit_logs")
      .select("*", { count: "exact", head: true })
      .gte("date_creation", since30)
      .eq("resultat", "echec"),
    supabase.from("admin_ai_usage").select("requetes, tokens, cout").gte("date_creation", since30),
    supabase.from("admin_ai_settings").select("budget_mensuel").eq("id", 1).maybeSingle(),
    supabase.from("admin_contents").select("*", { count: "exact", head: true }),
    supabase.from("admin_notifications").select("*", { count: "exact", head: true }).eq("statut", "envoye"),
    supabase.from("admin_subscriptions").select("*", { count: "exact", head: true }),
  ]);

  if (usersResult.error) throw usersResult.error;

  const users = (usersResult.data ?? []) as AdminUserRow[];
  const aiRows = (aiUsageResult.data ?? []) as { requetes: number | null; tokens: number | null; cout: number | null }[];

  return {
    totalUsers: users.length,
    newThisMonth: users.filter((user) => user.date_creation >= startOfMonth).length,
    adminCount: users.filter((user) => user.role === "admin" || Boolean(user.admin_role_id)).length,
    roleBreakdown: countBy(users.map((user) => user.role)),
    countryBreakdown: countBy(users.map((user) => user.pays)).slice(0, 6),
    deviseBreakdown: countBy(users.map((user) => user.devise)).slice(0, 6),
    logs30d: logs30Result.count ?? 0,
    failures30d: failures30Result.count ?? 0,
    recentLogs: (recentLogsResult.data ?? []) as AdminLogRow[],
    aiRequests30d: aiRows.reduce((total, row) => total + (row.requetes ?? 0), 0),
    aiTokens30d: aiRows.reduce((total, row) => total + (row.tokens ?? 0), 0),
    aiCost30d: aiRows.reduce((total, row) => total + Number(row.cout ?? 0), 0),
    aiMonthlyBudget: Number(aiSettingsResult.data?.budget_mensuel ?? 0),
    contentsCount: contentsResult.count ?? 0,
    announcementsCount: announcementsResult.count ?? 0,
    subscriptionCount: subscriptionsResult.count ?? 0,
  };
}

/* ------------------------------------------------------------------ */
/* Journal d'audit                                                     */
/* ------------------------------------------------------------------ */

export type RecordAdminActionInput = {
  action: string;
  cible?: string | null;
  email?: string | null;
  userId?: string | null;
  resultat?: "succes" | "echec";
  details?: Record<string, unknown> | null;
};

export async function recordAdminAction(input: RecordAdminActionInput): Promise<void> {
  try {
    await supabase.from("admin_audit_logs").insert({
      action: input.action,
      cible: input.cible ?? null,
      email: input.email ?? null,
      user_id: input.userId ?? null,
      resultat: input.resultat ?? "succes",
      details: input.details ?? null,
    });
  } catch {
    // Le journal ne doit jamais bloquer une action de l'administrateur.
  }
}

/* ------------------------------------------------------------------ */
/* Export CSV                                                          */
/* ------------------------------------------------------------------ */

function escapeCsv(value: string | null): string {
  const safe = (value ?? "").replace(/"/g, '""');
  return `"${safe}"`;
}

export function exportUsersCsv(rows: AdminUserRow[]): void {
  const header = ["Nom", "Prénom", "Email", "Téléphone", "Pays", "Devise", "Rôle", "Inscription"];
  const lines = rows.map((row) => [
    escapeCsv(row.nom),
    escapeCsv(row.prenom),
    escapeCsv(row.email),
    escapeCsv(row.telephone),
    escapeCsv(row.pays),
    escapeCsv(row.devise),
    escapeCsv(ADMIN_ROLE_LABELS[row.role] ?? row.role),
    escapeCsv(formatAdminDate(row.date_creation)),
  ]);

  const csv = [header.map((cell) => escapeCsv(cell)).join(";"), ...lines.map((line) => line.join(";"))].join(
    "\r\n",
  );

  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `finbuilder-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}