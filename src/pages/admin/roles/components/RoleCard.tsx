import { CONSOLE_PERMISSIONS, PLATFORM_PERMISSIONS, type AdminRole } from "@/lib/roles";

type RoleCardProps = {
  role: AdminRole;
  memberCount: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export default function RoleCard({
  role,
  memberCount,
  onEdit,
  onDuplicate,
  onDelete,
}: RoleCardProps) {
  const consoleKeys = CONSOLE_PERMISSIONS.filter((item) => role.permissions.includes(item.key));
  const platformKeys = PLATFORM_PERMISSIONS.filter((item) => role.permissions.includes(item.key));
  const fullConsole = consoleKeys.length === CONSOLE_PERMISSIONS.length;

  return (
    <article className="flex flex-col rounded-lg border border-background-200 bg-background-50 p-4">
      <div className="flex items-start gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-900">
          <i className="ri-shield-user-line text-base" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold text-foreground-950">{role.nom}</h3>
            {fullConsole && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-accent-300 bg-accent-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent-900">
                Console complète
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-foreground-500">
            {role.description || "Aucune description pour ce profil."}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-semibold text-foreground-700">
          <i className="ri-user-line text-[10px] text-foreground-400" />
          {memberCount} {memberCount > 1 ? "membres" : "membre"}
        </span>
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-semibold text-foreground-700">
          <i className="ri-key-2-line text-[10px] text-foreground-400" />
          {consoleKeys.length} droit(s) console
        </span>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {consoleKeys.length === 0 && (
          <li className="rounded-md border border-dashed border-background-300 px-2 py-1 text-[10px] text-foreground-500">
            Aucun accès à la console
          </li>
        )}
        {consoleKeys.map((item) => (
          <li
            key={item.key}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-secondary-200 bg-secondary-50 px-1.5 py-0.5 text-[10px] font-medium text-secondary-900"
          >
            <i className={`${item.icon} text-[10px]`} />
            {item.label}
          </li>
        ))}
        {platformKeys.length > 0 && (
          <li className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-background-300 bg-background-100 px-1.5 py-0.5 text-[10px] font-medium text-foreground-600">
            <i className="ri-add-circle-line text-[10px]" />
            {platformKeys.length} droit(s) réservé(s)
          </li>
        )}
      </ul>

      <div className="mt-auto flex items-center gap-1.5 pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-[11px] font-semibold text-foreground-800 transition-colors hover:border-primary-300 hover:text-primary-800"
        >
          <i className="ri-edit-line text-[11px]" />
          Modifier
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-[11px] font-semibold text-foreground-800 transition-colors hover:border-primary-300 hover:text-primary-800"
        >
          <i className="ri-file-copy-line text-[11px]" />
          Dupliquer
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Supprimer ce rôle"
          className="ml-auto inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-[11px] font-semibold text-foreground-500 transition-colors hover:bg-accent-50 hover:text-accent-800"
        >
          <i className="ri-delete-bin-line text-[11px]" />
          Supprimer
        </button>
      </div>
    </article>
  );
}