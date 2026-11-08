import { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/base/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import {
  displayUserName,
  fetchAdminUsers,
  formatAdminDate,
  formatAdminNumber,
  recordAdminAction,
  type AdminUserRow,
} from "@/lib/admin";
import {
  CONSOLE_PERMISSIONS,
  assignRoleToUser,
  createRole,
  deleteRole,
  fetchRoles,
  findRole,
  hasConsoleAccess,
  isConsoleOwner,
  setUserPassword,
  updateRole,
  type AdminRole,
  type RoleDraft,
} from "@/lib/roles";
import RoleCard from "@/pages/admin/roles/components/RoleCard";
import RoleFormModal from "@/pages/admin/roles/components/RoleFormModal";
import RoleMemberList from "@/pages/admin/roles/components/RoleMemberList";
import MemberPanel from "@/pages/admin/roles/components/MemberPanel";

type Notice = { tone: "success" | "error"; message: string } | null;

type AccessFilter = "all" | "console" | "none" | "owner" | `role:${string}`;

export default function AdminRolesPage() {
  const { profile, session } = useAuth();
  const { reload: reloadAccess, fullAccess } = useAdminAccess();

  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRole | null>(null);
  const [draftPreset, setDraftPreset] = useState<RoleDraft | null>(null);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<AdminRole | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [roleRows, userRows] = await Promise.all([fetchRoles(), fetchAdminUsers()]);
      setRoles(roleRows);
      setUsers(userRows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Les rôles d'administration n'ont pas pu être chargés.",
      );
      setRoles([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 5200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const author = () => ({
    email: profile?.email ?? null,
    userId: session?.user?.id ?? null,
  });

  const memberCounts = useMemo(() => {
    const map = new Map<string, number>();
    users.forEach((user) => {
      if (!user.admin_role_id) return;
      map.set(user.admin_role_id, (map.get(user.admin_role_id) ?? 0) + 1);
    });
    return map;
  }, [users]);

  const stats = useMemo(() => {
    const consoleRights = new Set<string>();
    roles.forEach((role) => role.permissions.forEach((key) => consoleRights.add(key)));
    return {
      roles: roles.length,
      accounts: users.length,
      console: users.filter((user) => hasConsoleAccess(user)).length,
      rights: consoleRights.size,
    };
  }, [roles, users]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    const rows = users.filter((user) => {
      if (term) {
        const haystack = [user.prenom, user.nom, user.email]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      if (accessFilter === "console") return hasConsoleAccess(user);
      if (accessFilter === "none") return !hasConsoleAccess(user);
      if (accessFilter === "owner") return isConsoleOwner(user);
      if (accessFilter.startsWith("role:")) {
        return user.admin_role_id === accessFilter.slice(5);
      }
      return true;
    });

    return rows.sort((a, b) => {
      const rank = (user: AdminUserRow) =>
        isConsoleOwner(user) ? 0 : user.admin_role_id ? 1 : 2;
      const diff = rank(a) - rank(b);
      if (diff !== 0) return diff;
      return displayUserName(a).localeCompare(displayUserName(b), "fr");
    });
  }, [users, search, accessFilter]);

  const openCreate = () => {
    setEditing(null);
    setDraftPreset(null);
    setFormOpen(true);
  };

  const openEdit = (role: AdminRole) => {
    setEditing(role);
    setDraftPreset(null);
    setFormOpen(true);
  };

  const openDuplicate = (role: AdminRole) => {
    setEditing(null);
    setDraftPreset({
      nom: `${role.nom} (copie)`,
      description: role.description ?? "",
      permissions: [...role.permissions],
    });
    setFormOpen(true);
  };

  const handleSubmitRole = async (draft: RoleDraft) => {
    setSaving(true);
    try {
      if (editing) {
        await updateRole(editing.id, draft);
        recordAdminAction({
          action: "modifier_role",
          cible: draft.nom,
          ...author(),
          details: { droits: draft.permissions },
        });
        setNotice({ tone: "success", message: `Le rôle « ${draft.nom} » a été mis à jour.` });
      } else {
        await createRole(draft);
        recordAdminAction({
          action: "creer_role",
          cible: draft.nom,
          ...author(),
          details: { droits: draft.permissions },
        });
        setNotice({
          tone: "success",
          message: `Le rôle « ${draft.nom} » est créé : attribuez-le depuis la fiche d'un compte.`,
        });
      }
      setFormOpen(false);
      setEditing(null);
      setDraftPreset(null);
      setReloadKey((value) => value + 1);
      reloadAccess();
    } catch (saveError) {
      setNotice({
        tone: "error",
        message:
          saveError instanceof Error ? saveError.message : "L'enregistrement du rôle a échoué.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteRole(toDelete.id);
      recordAdminAction({ action: "supprimer_role", cible: toDelete.nom, ...author() });
      setToDelete(null);
      setNotice({ tone: "success", message: `Le rôle « ${toDelete.nom} » a été supprimé.` });
      setReloadKey((value) => value + 1);
    } catch (deleteError) {
      setNotice({
        tone: "error",
        message: deleteError instanceof Error ? deleteError.message : "La suppression a échoué.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleAssignRole = async (target: AdminUserRow, roleId: string | null) => {
    const previousRoleId = target.admin_role_id;
    await assignRoleToUser(target.id, roleId);

    const role = findRole(roles, roleId);
    recordAdminAction({
      action: roleId ? (previousRoleId ? "changer_role" : "attribuer_role") : "retirer_role",
      cible: displayUserName(target),
      ...author(),
      details: { role: role?.nom ?? null },
    });

    const nextRole = roleId ? target.role : "user";
    setUsers((previous) =>
      previous.map((item) =>
        item.id === target.id ? { ...item, admin_role_id: roleId, role: nextRole } : item,
      ),
    );
    setSelectedUser((previous) =>
      previous && previous.id === target.id
        ? { ...previous, admin_role_id: roleId, role: nextRole }
        : previous,
    );

    if (target.id === session?.user?.id) reloadAccess();
  };

  const handleResetPassword = async (target: AdminUserRow, password: string) => {
    await setUserPassword(target.id, password);
    recordAdminAction({
      action: "reinitialiser_mot_de_passe",
      cible: displayUserName(target),
      ...author(),
      details: { email: target.email },
    });
  };

  const roleNames = roles.map((role) => role.nom);

  return (
    <div className="w-full animate-fade-up space-y-4">
      <section className="rounded-lg border border-background-200 bg-background-100 px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-700">
              Administration
            </p>
            <h1
              className="mt-1.5 text-xl font-semibold leading-tight text-foreground-950 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Rôles et accès
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-foreground-600 md:text-sm">
              Ouvrez la fiche d'un compte pour changer son rôle, définir un nouveau mot de passe ou
              retirer son accès à la console — sans jamais toucher à ses données personnelles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              disabled={loading}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800 disabled:cursor-wait disabled:opacity-70"
            >
              <i className={loading ? "ri-loader-4-line animate-spin text-xs" : "ri-refresh-line text-xs"} />
              Actualiser
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-add-line text-xs" />
              Nouveau rôle
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            { label: "Rôles", value: stats.roles, icon: "ri-shield-user-line" },
            { label: "Comptes", value: stats.accounts, icon: "ri-group-line" },
            { label: "Accès console", value: stats.console, icon: "ri-shield-check-line" },
            { label: "Droits distincts", value: stats.rights, icon: "ri-key-2-line" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-background-200 bg-background-50 px-3 py-2"
            >
              <div className="flex items-center gap-1.5">
                <i className={`${item.icon} text-[11px] text-primary-600`} />
                <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-500">
                  {item.label}
                </p>
              </div>
              <p className="mt-1 text-base font-semibold leading-none text-foreground-950">
                {formatAdminNumber(item.value)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {notice && (
        <div
          className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 ${
            notice.tone === "success"
              ? "border-primary-200 bg-primary-50"
              : "border-accent-300 bg-accent-50"
          }`}
        >
          <i
            className={`mt-0.5 text-base ${
              notice.tone === "success"
                ? "ri-check-double-line text-primary-700"
                : "ri-error-warning-line text-accent-800"
            }`}
          />
          <p
            className={`text-[11px] leading-relaxed ${
              notice.tone === "success" ? "text-primary-900" : "text-accent-900"
            }`}
          >
            {notice.message}
          </p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Masquer le message"
            className="ml-auto flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-foreground-400 hover:bg-background-100"
          >
            <i className="ri-close-line text-xs" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-accent-300 bg-accent-50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <i className="ri-error-warning-line mt-0.5 text-base text-accent-800" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent-900">Rôles indisponibles</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-accent-800">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((value) => value + 1)}
                className="mt-2 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
              >
                <i className="ri-refresh-line text-xs" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      <section>
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground-900">Comptes</h2>
            <p className="mt-0.5 text-[11px] text-foreground-500">
              {formatAdminNumber(filteredUsers.length)} compte(s) affiché(s) sur{" "}
              {formatAdminNumber(users.length)}.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
            <div className="relative">
              <i className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nom ou email"
                className="w-full box-border rounded-md border border-background-300 bg-background-50 py-1.5 pl-9 pr-3 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-primary-400 sm:w-56"
              />
            </div>
            <select
              value={accessFilter}
              onChange={(event) => setAccessFilter(event.target.value as AccessFilter)}
              className="w-full box-border cursor-pointer rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-xs font-medium text-foreground-800 outline-none transition-colors focus:border-primary-400 sm:w-48"
            >
              <option value="all">Tous les comptes</option>
              <option value="console">Avec accès console</option>
              <option value="none">Sans accès</option>
              <option value="owner">Admin (accès total)</option>
              {roles.map((role) => (
                <option key={role.id} value={`role:${role.id}`}>
                  Rôle : {role.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div className="space-y-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-[64px] animate-pulse rounded-lg bg-background-200" />
            ))}
          </div>
        ) : (
          <RoleMemberList
            users={filteredUsers}
            roles={roles}
            currentUserId={session?.user?.id ?? null}
            selectedId={selectedUser?.id ?? null}
            onOpen={setSelectedUser}
          />
        )}
      </section>

      <section>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground-900">Profils disponibles</h2>
          <p className="text-[11px] text-foreground-500">
            {CONSOLE_PERMISSIONS.length} modules contrôlables dans la console
          </p>
        </div>

        {loading && roles.length === 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-[220px] animate-pulse rounded-lg bg-background-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                memberCount={memberCounts.get(role.id) ?? 0}
                onEdit={() => openEdit(role)}
                onDuplicate={() => openDuplicate(role)}
                onDelete={() => setToDelete(role)}
              />
            ))}
            <button
              type="button"
              onClick={openCreate}
              className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-background-300 bg-background-50 p-4 text-center transition-colors hover:border-primary-300 hover:bg-primary-50/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background-100 text-foreground-500">
                <i className="ri-add-line text-lg" />
              </span>
              <span className="text-xs font-semibold text-foreground-800">Créer un rôle</span>
              <span className="max-w-[220px] text-[10px] leading-relaxed text-foreground-500">
                Choisissez précisément les modules accessibles pour ce profil.
              </span>
            </button>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary-100 text-secondary-900">
            <i className="ri-information-line text-sm" />
          </span>
          <h2 className="text-sm font-semibold text-foreground-900">Comment fonctionnent les droits</h2>
        </div>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            "Chaque compte de la plateforme est listé : recherchez-le puis ouvrez sa fiche.",
            "Changer le rôle prend effet immédiatement, sans que la personne se reconnecte.",
            "Le menu de gauche se réduit automatiquement aux modules autorisés.",
            "Un rôle encore attribué à un compte ne peut pas être supprimé.",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2 rounded-md bg-background-100 px-3 py-2">
              <i className="ri-check-line mt-0.5 text-[11px] text-primary-700" />
              <span className="text-[11px] leading-relaxed text-foreground-700">{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-[11px] leading-relaxed text-foreground-400">
        {formatAdminNumber(stats.roles)} rôle(s) · {formatAdminNumber(stats.accounts)} compte(s) ·
        dernière vérification {formatAdminDate(new Date().toISOString())}
      </p>

      {formOpen && (
        <RoleFormModal
          key={editing?.id ?? draftPreset?.nom ?? "nouveau-role"}
          role={editing}
          preset={draftPreset}
          existingNames={roleNames}
          saving={saving}
          onClose={() => {
            if (saving) return;
            setFormOpen(false);
            setEditing(null);
            setDraftPreset(null);
          }}
          onSubmit={handleSubmitRole}
        />
      )}

      {selectedUser && (
        <MemberPanel
          key={selectedUser.id}
          user={selectedUser}
          roles={roles}
          currentUserId={session?.user?.id ?? null}
          canManage={fullAccess}
          onClose={() => setSelectedUser(null)}
          onAssignRole={(roleId) => handleAssignRole(selectedUser, roleId)}
          onResetPassword={(password) => handleResetPassword(selectedUser, password)}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer ce rôle ?"
        message={
          toDelete
            ? `${toDelete.nom} sera définitivement supprimé. ${
                (memberCounts.get(toDelete.id) ?? 0) > 0
                  ? "Ce rôle est encore attribué à un compte : retirez-le d'abord."
                  : "Aucun compte n'utilise ce rôle."
              }`
            : ""
        }
        confirmLabel="Supprimer"
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={
          toDelete && (memberCounts.get(toDelete.id) ?? 0) === 0
            ? handleDeleteRole
            : () => setToDelete(null)
        }
      />

      <p className="sr-only">Rôles d'administration</p>
    </div>
  );
}