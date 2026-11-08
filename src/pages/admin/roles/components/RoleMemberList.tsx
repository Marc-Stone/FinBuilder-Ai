import type { AdminUserRow } from "@/lib/admin";
import {
  findRole,
  hasConsoleAccess,
  isConsoleOwner,
  permissionIcon,
  permissionLabel,
  type AdminRole,
} from "@/lib/roles";

type RoleMemberListProps = {
  users: AdminUserRow[];
  roles: AdminRole[];
  currentUserId: string | null;
  selectedId: string | null;
  onOpen: (user: AdminUserRow) => void;
};

function displayName(user: AdminUserRow): string {
  const parts = [user.prenom, user.nom].filter(Boolean);
  return parts.join(" ") || user.email || "Compte sans nom";
}

function initials(user: AdminUserRow): string {
  const first = user.prenom?.trim().charAt(0) ?? "";
  const last = user.nom?.trim().charAt(0) ?? "";
  return (`${first}${last}`.toUpperCase() || (user.email?.charAt(0) ?? "?")).toUpperCase();
}

export default function RoleMemberList({
  users,
  roles,
  currentUserId,
  selectedId,
  onOpen,
}: RoleMemberListProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-background-300 bg-background-50 px-4 py-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background-100 text-foreground-500">
          <i className="ri-user-search-line text-xl" />
        </span>
        <p className="mt-2.5 text-sm font-semibold text-foreground-950">Aucun compte trouvé</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-foreground-500">
          Ajustez la recherche ou le filtre pour afficher des comptes.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
      <div className="hidden grid-cols-12 gap-3 border-b border-background-200 bg-background-100 px-4 py-2.5 lg:grid">
        <span className="col-span-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
          Compte
        </span>
        <span className="col-span-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
          Rôle actuel
        </span>
        <span className="col-span-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
          Droits effectifs
        </span>
        <span className="col-span-1 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
          Gérer
        </span>
      </div>

      <ul className="divide-y divide-background-200">
        {users.map((user) => {
          const isOwner = isConsoleOwner(user);
          const role = findRole(roles, user.admin_role_id);
          const isSelf = user.id === currentUserId;
          const isSelected = selectedId === user.id;
          const permissions = role?.permissions ?? [];
          const access = hasConsoleAccess(user);

          return (
            <li
              key={user.id}
              className={`grid grid-cols-1 gap-2.5 px-4 py-3 transition-colors lg:grid-cols-12 lg:items-center ${
                isSelected ? "bg-primary-50/60" : "hover:bg-background-100/60"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5 lg:col-span-4">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                    access
                      ? "bg-foreground-950 text-background-50"
                      : "bg-background-200 text-foreground-600"
                  }`}
                >
                  {initials(user)}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground-950">
                    <span className="truncate">{displayName(user)}</span>
                    {isSelf && (
                      <span className="shrink-0 rounded-full bg-background-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-foreground-500">
                        Vous
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[11px] text-foreground-500">{user.email ?? "—"}</p>
                </div>
              </div>

              <div className="min-w-0 lg:col-span-3">
                {isOwner ? (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-800">
                    <i className="ri-shield-star-line text-[10px]" />
                    Admin
                  </span>
                ) : role ? (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-secondary-200 bg-secondary-50 px-2 py-0.5 text-[10px] font-semibold text-secondary-900">
                    <i className="ri-shield-user-line text-[10px]" />
                    {role.nom}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-background-300 bg-background-100 px-2 py-0.5 text-[10px] font-medium text-foreground-600">
                    <i className="ri-user-line text-[10px]" />
                    Aucun accès
                  </span>
                )}
              </div>

              <div className="min-w-0 lg:col-span-4">
                {isOwner ? (
                  <p className="text-[11px] text-foreground-500">Accès complet à tous les modules.</p>
                ) : permissions.length === 0 ? (
                  <p className="text-[11px] text-foreground-500">
                    {access ? "Aucun droit : console bloquée." : "Compte utilisateur standard."}
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-1">
                    {permissions.slice(0, 3).map((key) => (
                      <li
                        key={key}
                        className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-secondary-200 bg-secondary-50 px-1.5 py-0.5 text-[10px] font-medium text-secondary-900"
                      >
                        <i className={`${permissionIcon(key)} text-[10px]`} />
                        {permissionLabel(key)}
                      </li>
                    ))}
                    {permissions.length > 3 && (
                      <li className="inline-flex items-center whitespace-nowrap rounded-md bg-background-100 px-1.5 py-0.5 text-[10px] font-semibold text-foreground-600">
                        +{permissions.length - 3}
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div className="flex items-center lg:col-span-1 lg:justify-end">
                <button
                  type="button"
                  onClick={() => onOpen(user)}
                  title="Gérer le rôle et le mot de passe"
                  className="inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-[11px] font-semibold text-foreground-800 transition-colors hover:border-primary-300 hover:text-primary-800"
                >
                  <i className="ri-settings-3-line text-[11px]" />
                  Gérer
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}