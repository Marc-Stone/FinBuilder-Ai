import { supabase } from "@/lib/supabaseClient";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type PermissionKey =
  | "dashboard"
  | "users"
  | "contents"
  | "notifications"
  | "audit"
  | "settings"
  | "security"
  | "subscriptions"
  | "revenue"
  | "analytics"
  | "goals"
  | "projects"
  | "ai"
  | "reports";

export type PermissionGroup = "console" | "plateforme";

export type PermissionDef = {
  key: PermissionKey;
  label: string;
  description: string;
  icon: string;
  group: PermissionGroup;
  route?: string;
};

export type AdminRole = {
  id: string;
  nom: string;
  description: string | null;
  permissions: string[];
  date_creation: string;
};

export type ConsoleMember = {
  id: string;
  email: string | null;
  prenom: string | null;
  nom: string | null;
  role: string;
  admin_role_id: string | null;
  date_creation: string;
};

/* ------------------------------------------------------------------ */
/* Catalogue des droits                                                */
/* ------------------------------------------------------------------ */

export const PERMISSIONS: PermissionDef[] = [
  {
    key: "dashboard",
    label: "Vue d'ensemble",
    description: "Indicateurs de la plateforme, répartitions et activité récente.",
    icon: "ri-dashboard-3-line",
    group: "console",
    route: "/admin",
  },
  {
    key: "users",
    label: "Utilisateurs",
    description: "Rechercher un compte, ouvrir sa fiche détaillée et exporter la liste.",
    icon: "ri-group-line",
    group: "console",
    route: "/admin/utilisateurs",
  },
  {
    key: "contents",
    label: "Contenus",
    description: "Créer, publier et retirer les fiches de la bibliothèque d'éducation.",
    icon: "ri-article-line",
    group: "console",
    route: "/admin/contenus",
  },
  {
    key: "notifications",
    label: "Annonces",
    description: "Rédiger, programmer et diffuser des messages aux utilisateurs.",
    icon: "ri-megaphone-line",
    group: "console",
    route: "/admin/annonces",
  },
  {
    key: "settings",
    label: "Paramètres",
    description: "Identité de l'application, couleur principale et mode maintenance.",
    icon: "ri-settings-3-line",
    group: "console",
    route: "/admin/parametres",
  },
  {
    key: "audit",
    label: "Journal d'activité",
    description: "Consulter la traçabilité des actions d'administration.",
    icon: "ri-history-line",
    group: "console",
    route: "/admin/journal",
  },
  {
    key: "security",
    label: "Rôles et accès",
    description: "Créer des profils d'administrateurs et gérer leurs droits.",
    icon: "ri-shield-user-line",
    group: "console",
    route: "/admin/roles",
  },
  {
    key: "subscriptions",
    label: "Abonnements",
    description: "Droit réservé au futur module de suivi des abonnements.",
    icon: "ri-vip-crown-line",
    group: "plateforme",
  },
  {
    key: "revenue",
    label: "Revenus",
    description: "Droit réservé au futur module de revenus.",
    icon: "ri-line-chart-line",
    group: "plateforme",
  },
  {
    key: "analytics",
    label: "Analytique",
    description: "Droit réservé au futur module d'analyse d'usage.",
    icon: "ri-bar-chart-2-line",
    group: "plateforme",
  },
  {
    key: "goals",
    label: "Objectifs",
    description: "Droit réservé au futur module de suivi des objectifs.",
    icon: "ri-flag-line",
    group: "plateforme",
  },
  {
    key: "projects",
    label: "Projets",
    description: "Droit réservé au futur module de suivi des projets.",
    icon: "ri-folder-chart-line",
    group: "plateforme",
  },
  {
    key: "ai",
    label: "Assistant IA",
    description: "Droit réservé au futur module de pilotage de l'assistant.",
    icon: "ri-sparkling-line",
    group: "plateforme",
  },
  {
    key: "reports",
    label: "Rapports",
    description: "Droit réservé au futur module de rapports exportables.",
    icon: "ri-file-chart-line",
    group: "plateforme",
  },
];

export const CONSOLE_PERMISSIONS = PERMISSIONS.filter((item) => item.group === "console");
export const PLATFORM_PERMISSIONS = PERMISSIONS.filter((item) => item.group === "plateforme");

export const FULL_ACCESS_KEYS: string[] = PERMISSIONS.map((item) => item.key);

export function permissionDef(key: string): PermissionDef | undefined {
  return PERMISSIONS.find((item) => item.key === key);
}

export function permissionLabel(key: string): string {
  return permissionDef(key)?.label ?? key;
}

export function permissionIcon(key: string): string {
  return permissionDef(key)?.icon ?? "ri-checkbox-circle-line";
}

/** Valide une liste de droits reçue de la base (jsonb : tableau ou objet). */
export function parsePermissions(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((item): item is string => typeof item === "string");
  if (raw && typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .filter(([, value]) => value === true)
      .map(([key]) => key);
  }
  return [];
}

export function hasPermission(permissions: string[], key: string): boolean {
  return permissions.includes(key);
}

/* ------------------------------------------------------------------ */
/* Lecture                                                             */
/* ------------------------------------------------------------------ */

const ROLE_COLUMNS = "id, nom, description, permissions, date_creation";

export async function fetchRoles(): Promise<AdminRole[]> {
  const { data, error } = await supabase
    .from("admin_roles")
    .select(ROLE_COLUMNS)
    .order("date_creation", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: (row as { id: string }).id,
    nom: (row as { nom: string }).nom,
    description: (row as { description: string | null }).description ?? null,
    date_creation: (row as { date_creation: string }).date_creation,
    permissions: parsePermissions((row as { permissions: unknown }).permissions),
  }));
}

export async function fetchConsoleMembers(): Promise<ConsoleMember[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, prenom, nom, role, admin_role_id, date_creation")
    .or("role.eq.admin,admin_role_id.not.is.null")
    .order("date_creation", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ConsoleMember[];
}

export async function fetchMyAdminRole(userId: string): Promise<{
  member: boolean;
  roleId: string | null;
  role: AdminRole | null;
}> {
  try {
    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select("role, admin_role_id")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) throw profileError;

    const roleId = (profileRow as { admin_role_id: string | null } | null)?.admin_role_id ?? null;
    const member =
      (profileRow as { role: string | null } | null)?.role === "admin" || Boolean(roleId);

    if (!roleId) return { member, roleId: null, role: null };

    const { data: roleRow, error: roleError } = await supabase
      .from("admin_roles")
      .select(ROLE_COLUMNS)
      .eq("id", roleId)
      .maybeSingle();
    if (roleError) throw roleError;

    if (!roleRow) return { member, roleId, role: null };

    return {
      member,
      roleId,
      role: {
        id: (roleRow as { id: string }).id,
        nom: (roleRow as { nom: string }).nom,
        description: (roleRow as { description: string | null }).description ?? null,
        date_creation: (roleRow as { date_creation: string }).date_creation,
        permissions: parsePermissions((roleRow as { permissions: unknown }).permissions),
      },
    };
  } catch {
    return { member: false, roleId: null, role: null };
  }
}

/* ------------------------------------------------------------------ */
/* État d'accès d'un compte                                            */
/* ------------------------------------------------------------------ */

export type AccessAccount = {
  role: string;
  admin_role_id: string | null;
};

/** Le compte peut-il ouvrir la console d'administration ? */
export function hasConsoleAccess(user: AccessAccount): boolean {
  return user.role === "admin" || Boolean(user.admin_role_id);
}

/** Compte administrateur d'origine : accès total, non modifiable depuis cette page. */
export function isConsoleOwner(user: AccessAccount): boolean {
  return user.role === "admin" && !user.admin_role_id;
}

export function findRole(roles: AdminRole[], roleId: string | null): AdminRole | null {
  if (!roleId) return null;
  return roles.find((role) => role.id === roleId) ?? null;
}

export function accessLevelLabel(roles: AdminRole[], user: AccessAccount): string {
  if (isConsoleOwner(user)) return "Admin";
  const role = findRole(roles, user.admin_role_id);
  if (role) return role.nom;
  return "Aucun accès à la console";
}

/* ------------------------------------------------------------------ */
/* Écriture des rôles                                                  */
/* ------------------------------------------------------------------ */

export type RoleDraft = {
  nom: string;
  description: string;
  permissions: string[];
};

export async function createRole(draft: RoleDraft): Promise<void> {
  const { error } = await supabase.from("admin_roles").insert({
    nom: draft.nom.trim(),
    description: draft.description.trim() || null,
    permissions: draft.permissions,
  });
  if (error) throw error;
}

export async function updateRole(id: string, draft: RoleDraft): Promise<void> {
  const { error } = await supabase
    .from("admin_roles")
    .update({
      nom: draft.nom.trim(),
      description: draft.description.trim() || null,
      permissions: draft.permissions,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRole(id: string): Promise<void> {
  const { error } = await supabase.from("admin_roles").delete().eq("id", id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Attribution                                                         */
/* ------------------------------------------------------------------ */

/**
 * Attribue (ou retire) un accès à la console.
 * Opération privilégiée : les colonnes de droits ne sont plus modifiables
 * depuis le navigateur, elle passe par une fonction serveur qui vérifie
 * elle-même les droits de l'appelant.
 */
export async function assignRoleToUser(
  userId: string,
  roleId: string | null,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke("admin-assign-role", {
    body: { userId, roleId },
  });

  if (error) {
    let message = error.message;
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === "function") {
      const payload = await context.json().catch(() => null);
      if (payload && typeof payload.error === "string" && payload.error.trim()) {
        message = payload.error;
      }
    }
    throw new Error(message || "Le changement d'accès a échoué.");
  }

  const payload = data as { ok?: boolean; error?: string } | null;
  if (payload?.error) throw new Error(payload.error);
  if (!payload?.ok) {
    throw new Error("Le changement d'accès a échoué.");
  }
}

export async function revokeConsoleAccess(userId: string): Promise<void> {
  await assignRoleToUser(userId, null);
}

/**
 * Définit un nouveau mot de passe pour un compte.
 * Opération privilégiée : elle passe par une fonction serveur qui vérifie
 * elle-même les droits de l'appelant avant d'agir.
 */
export async function setUserPassword(userId: string, password: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke("admin-set-password", {
    body: { userId, password },
  });

  if (error) {
    let message = error.message;
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === "function") {
      const payload = await context.json().catch(() => null);
      if (payload && typeof payload.error === "string" && payload.error.trim()) {
        message = payload.error;
      }
    }
    throw new Error(message || "La réinitialisation du mot de passe a échoué.");
  }

  const payload = data as { ok?: boolean; error?: string } | null;
  if (payload?.error) throw new Error(payload.error);
  if (!payload?.ok) {
    throw new Error("La réinitialisation du mot de passe a échoué.");
  }
}

export function generatePassword(length = 14): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#%&*";
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

export function passwordScore(password: string): {
  score: 1 | 2 | 3 | 4;
  label: string;
  tone: "weak" | "medium" | "strong";
} {
  let points = 0;
  if (password.length >= 8) points += 1;
  if (password.length >= 12) points += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) points += 1;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) points += 1;

  if (points <= 1) return { score: 1, label: "Faible", tone: "weak" };
  if (points === 2) return { score: 2, label: "Moyen", tone: "medium" };
  if (points === 3) return { score: 3, label: "Solide", tone: "strong" };
  return { score: 4, label: "Très solide", tone: "strong" };
}

export function memberName(member: ConsoleMember): string {
  const parts = [member.prenom, member.nom].filter(Boolean);
  return parts.join(" ") || member.email || "Compte sans nom";
}

export function memberInitials(member: ConsoleMember): string {
  const first = member.prenom?.trim().charAt(0) ?? "";
  const last = member.nom?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();
  if (initials) return initials;
  return (member.email?.charAt(0) ?? "?").toUpperCase();
}