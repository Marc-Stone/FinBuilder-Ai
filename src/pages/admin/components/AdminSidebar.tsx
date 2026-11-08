import { Link, useLocation } from "react-router-dom";
import { adminNavGroups } from "@/mocks/adminNav";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useAdminAccess } from "@/hooks/useAdminAccess";

type AdminSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const { settings } = useAppSettings();
  const { loading: accessLoading, can, role, fullAccess } = useAdminAccess();

  const groups = adminNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => accessLoading || can(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  const content = (
    <div className="flex h-full w-full flex-col bg-background-50">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-background-200 px-4">
        <Link to="/admin" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground-950 text-background-50">
            <i className="ri-shield-keyhole-line text-lg" />
          </span>
          <span className="min-w-0">
            <span
              className="block truncate text-sm font-semibold leading-tight tracking-tight text-foreground-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {settings.nom_application}
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-700">
              Administration
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le menu"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-foreground-500 hover:bg-background-100 lg:hidden"
        >
          <i className="ri-close-line text-lg" />
        </button>
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-400">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.to === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(item.to);

                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex min-h-[44px] items-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm font-medium transition-colors duration-200 lg:min-h-0 lg:py-2 ${
                        active
                          ? "bg-primary-50 font-semibold text-primary-800"
                          : "text-foreground-700 hover:bg-background-100 hover:text-foreground-950"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary-600" />
                      )}
                      <span className="flex h-5 w-5 items-center justify-center">
                        <i className={`${item.icon} text-base`} />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

      </nav>

      <div className="shrink-0 border-t border-background-200 p-3">
        <div className="rounded-lg border border-background-200 bg-background-100 p-3.5">
          <div className="flex items-center gap-2">
            <i className="ri-shield-user-line text-base text-primary-700" />
            <p className="truncate text-xs font-semibold text-foreground-900">
              {fullAccess ? "Accès complet" : role?.nom ?? "Accès limité"}
            </p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-foreground-600">
            {fullAccess
              ? "Vous disposez de tous les droits de la console. Chaque action est enregistrée dans le journal d'activité."
              : "Votre profil n'affiche que les modules autorisés. Contactez un administrateur pour ajuster vos droits."}
          </p>
        </div>
        <Link
          to="/app"
          onClick={onClose}
          className="mt-2.5 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
        >
          <i className="ri-arrow-left-line text-xs" />
          Retour à mon espace
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-background-200 lg:block">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={onClose}
            className="absolute inset-0 cursor-pointer bg-foreground-950/40"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] animate-fade-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
}