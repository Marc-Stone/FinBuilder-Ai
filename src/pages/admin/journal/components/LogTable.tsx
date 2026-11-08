import {
  ADMIN_ACTION_LABELS,
  formatAdminDateTime,
  formatRelative,
  type AdminLogRow,
} from "@/lib/admin";

type LogTableProps = {
  logs: AdminLogRow[];
};

function detailsPreview(details: Record<string, unknown> | null): string {
  if (!details || Object.keys(details).length === 0) return "";
  try {
    return Object.entries(details)
      .filter(([, value]) => value !== null && value !== "" && value !== undefined)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(" · ");
  } catch {
    return "";
  }
}

export default function LogTable({ logs }: LogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-background-300 bg-background-50 px-4 py-12 text-center">
        <i className="ri-history-line text-2xl text-foreground-400" />
        <p className="mt-2 text-sm font-semibold text-foreground-800">Aucune action enregistrée</p>
        <p className="mt-1 text-xs text-foreground-500">
          Ouvrez la console d'administration ou exportez la liste des comptes : l'action apparaîtra
          ici immédiatement.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[780px] border-collapse">
          <thead>
            <tr className="border-b border-background-200 bg-background-100 text-left">
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                Action
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                Compte
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                Cible
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                Résultat
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const preview = detailsPreview(log.details);
              const failed = log.resultat === "echec";
              return (
                <tr
                  key={log.id}
                  className="border-b border-background-200 align-top transition-colors last:border-0 hover:bg-background-100/70"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          failed ? "bg-accent-100 text-accent-800" : "bg-primary-100 text-primary-800"
                        }`}
                      >
                        <i
                          className={
                            failed ? "ri-error-warning-line text-[11px]" : "ri-check-line text-[11px]"
                          }
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground-900">
                          {ADMIN_ACTION_LABELS[log.action] ?? log.action}
                        </p>
                        {preview && (
                          <p className="mt-0.5 line-clamp-1 max-w-[280px] text-[10px] text-foreground-500">
                            {preview}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-foreground-700">
                    {log.email ?? "Compte inconnu"}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-foreground-700">{log.cible ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        failed
                          ? "bg-accent-100 text-accent-900"
                          : "bg-secondary-100 text-secondary-900"
                      }`}
                    >
                      {failed ? "Échec" : "Succès"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <p className="text-[11px] font-medium text-foreground-700">
                      {formatRelative(log.date_creation)}
                    </p>
                    <p className="text-[10px] text-foreground-400">
                      {formatAdminDateTime(log.date_creation)}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile : cartes empilées, sans défilement horizontal. */}
      <ul className="divide-y divide-background-200 lg:hidden">
        {logs.map((log) => {
          const preview = detailsPreview(log.details);
          const failed = log.resultat === "echec";

          return (
            <li key={`mobile-${log.id}`} className="px-4 py-3">
              <div className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    failed ? "bg-accent-100 text-accent-800" : "bg-primary-100 text-primary-800"
                  }`}
                >
                  <i
                    className={
                      failed ? "ri-error-warning-line text-[11px]" : "ri-check-line text-[11px]"
                    }
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground-900">
                    {ADMIN_ACTION_LABELS[log.action] ?? log.action}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-foreground-600">
                    {log.email ?? "Compte inconnu"}
                    {log.cible ? ` · ${log.cible}` : ""}
                  </p>
                  {preview && (
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-foreground-500">
                      {preview}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        failed
                          ? "bg-accent-100 text-accent-900"
                          : "bg-secondary-100 text-secondary-900"
                      }`}
                    >
                      {failed ? "Échec" : "Succès"}
                    </span>
                    <span className="text-[10px] font-medium text-foreground-500">
                      {formatRelative(log.date_creation)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}