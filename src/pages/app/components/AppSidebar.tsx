import { Link, useLocation } from "react-router-dom";
import { appNavGroups } from "@/mocks/appNav";
import { getDisplayName, getInitials, useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useTeamMessages } from "@/hooks/useTeamMessages";
import { useAlertFeed } from "@/hooks/useAlertFeed";

type AppSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export default function AppSidebar({ mobileOpen, onClose }: AppSidebarProps) {
  const location = useLocation();
  const { profile, session } = useAuth();
  const { settings } = useAppSettings();
  const { unreadCount } = useTeamMessages(session?.user?.id ?? null);
  const { unreadCount: alertCount } = useAlertFeed();
  const notificationsCount = unreadCount + alertCount;

  const content = (
    <div className="flex h-full w-full flex-col bg-background-50">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-background-200 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-500 text-background-50">
            <i className="ri-line-chart-line text-lg" />
          </span>
          <span
            className="text-base font-semibold tracking-tight text-foreground-950"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="truncate">{settings.nom_application}</span>
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
        {appNavGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-400">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = location.pathname === item.to;

                if (!item.enabled) {
                  return (
                    <li key={item.to}>
                      <div
                        aria-disabled="true"
                        className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-foreground-400"
                      >
                        <span className="flex h-5 w-5 items-center justify-center">
                          <i className={`${item.icon} text-base`} />
                        </span>
                        <span className="truncate">{item.label}</span>
                        <span className="ml-auto shrink-0 rounded-full bg-background-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-foreground-400">
                          Bientôt
                        </span>
                      </div>
                    </li>
                  );
                }

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
                      {item.to === "/app/notifications" && notificationsCount > 0 ? (
                        <span className="ml-auto shrink-0 rounded-full bg-accent-500 px-1.5 py-0.5 text-[9px] font-bold leading-none text-background-50">
                          {notificationsCount > 9 ? "9+" : notificationsCount}
                        </span>
                      ) : (
                        active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-background-200 p-3">
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-3.5">
          <div className="flex items-center gap-2">
            <i className="ri-checkbox-circle-line text-base text-primary-700" />
            <p className="text-xs font-semibold text-primary-900">Tous les modules inclus</p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-primary-800">
            Revenus, budget, assistant IA, simulations et rapports PDF : tout est accessible sans
            abonnement.
          </p>
          <Link
            to="/fonctionnalites"
            className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            Voir les fonctionnalités
            <i className="ri-arrow-right-line text-xs" />
          </Link>
        </div>

        <div className="mt-3 flex items-center gap-2.5 rounded-md px-1 py-1.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-xs font-semibold text-primary-800">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Photo de profil"
                className="h-full w-full object-top"
              />
            ) : (
              getInitials(profile)
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground-900">
              {getDisplayName(profile) || "Mon compte"}
            </p>
            <p className="truncate text-[10px] text-foreground-500">{profile?.email}</p>
          </div>
        </div>
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