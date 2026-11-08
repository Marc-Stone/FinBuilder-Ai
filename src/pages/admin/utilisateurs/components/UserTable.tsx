import {
  ADMIN_ROLE_LABELS,
  displayUserName,
  formatAdminDate,
  initialsOf,
  type AdminUserRow,
} from "@/lib/admin";

type UserTableProps = {
  users: AdminUserRow[];
  onSelect: (user: AdminUserRow) => void;
};

export default function UserTable({ users, onSelect }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-background-300 bg-background-50 px-4 py-12 text-center">
        <i className="ri-user-search-line text-2xl text-foreground-400" />
        <p className="mt-2 text-sm font-semibold text-foreground-800">Aucun compte ne correspond</p>
        <p className="mt-1 text-xs text-foreground-500">
          Essayez une autre recherche ou réinitialisez les filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-background-200 bg-background-100 text-left">
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                Utilisateur
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                Pays
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                Devise
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                Rôle
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                Inscription
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-background-200 transition-colors last:border-0 hover:bg-background-100/70"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-[11px] font-semibold text-primary-800">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={displayUserName(user)}
                          className="h-full w-full object-top"
                        />
                      ) : (
                        initialsOf(user)
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground-950">
                        {displayUserName(user)}
                      </p>
                      <p className="truncate text-[11px] text-foreground-500">
                        {user.email ?? "Sans email"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs text-foreground-700">{user.pays ?? "—"}</td>
                <td className="px-4 py-2.5 text-xs text-foreground-700">{user.devise ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      user.role === "admin"
                        ? "bg-foreground-950 text-background-50"
                        : "bg-secondary-100 text-secondary-900"
                    }`}
                  >
                    <i className="ri-shield-user-line text-[10px]" />
                    {ADMIN_ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-foreground-700">
                  {formatAdminDate(user.date_creation)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => onSelect(user)}
                    className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-background-300 px-2.5 py-1.5 text-[11px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
                  >
                    <i className="ri-eye-line text-[11px]" />
                    Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile : une carte par compte, plus lisible qu'un tableau à défilement horizontal. */}
      <ul className="divide-y divide-background-200 lg:hidden">
        {users.map((user) => (
          <li key={user.id} className="px-4 py-3.5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-xs font-semibold text-primary-800">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={displayUserName(user)}
                    className="h-full w-full object-top"
                  />
                ) : (
                  initialsOf(user)
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground-950">
                  {displayUserName(user)}
                </p>
                <p className="truncate text-[11px] text-foreground-500">
                  {user.email ?? "Sans email"}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      user.role === "admin"
                        ? "bg-foreground-950 text-background-50"
                        : "bg-secondary-100 text-secondary-900"
                    }`}
                  >
                    <i className="ri-shield-user-line text-[10px]" />
                    {ADMIN_ROLE_LABELS[user.role] ?? user.role}
                  </span>
                  <span className="rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-medium text-foreground-600">
                    {user.pays ?? "Pays —"}
                  </span>
                  <span className="rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-medium text-foreground-600">
                    {user.devise ?? "Devise —"}
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] text-foreground-500">
                  Inscrit le {formatAdminDate(user.date_creation)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelect(user)}
                aria-label={`Voir le compte de ${displayUserName(user)}`}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md border border-background-300 text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
              >
                <i className="ri-eye-line text-base" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}