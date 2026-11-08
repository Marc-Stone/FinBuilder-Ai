import { Link, useLocation } from "react-router-dom";

type AppMobileNavProps = {
  onOpenMenu: () => void;
};

const items = [
  { to: "/app", label: "Accueil", icon: "ri-dashboard-3-line" },
  { to: "/app/revenus", label: "Revenus", icon: "ri-arrow-down-line" },
  { to: "/app/depenses", label: "Dépenses", icon: "ri-arrow-up-line" },
  { to: "/app/projets", label: "Projets", icon: "ri-building-4-line" },
];

/**
 * Barre d'onglets fixe, réservée au mobile et aux tablettes étroites.
 * Elle complète — sans le remplacer — le menu latéral complet : les quatre
 * écrans les plus consultés sont accessibles en un geste, et « Menu » ouvre
 * la navigation détaillée.
 */
export default function AppMobileNav({ onOpenMenu }: AppMobileNavProps) {
  const location = useLocation();

  const isActive = (to: string) =>
    to === "/app" ? location.pathname === "/app" : location.pathname.startsWith(to);

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="fixed inset-x-0 bottom-0 z-40 w-full border-t border-background-200 bg-background-50/95 backdrop-blur-md lg:hidden"
    >
      <ul className="bottom-nav-safe grid w-full grid-cols-5">
        {items.map((item) => {
          const active = isActive(item.to);
          return (
            <li key={item.to} className="min-w-0">
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-semibold transition-colors ${
                  active ? "text-primary-800" : "text-foreground-500"
                }`}
              >
                {active && (
                  <span className="absolute left-1/2 top-0 h-[2px] w-6 -translate-x-1/2 rounded-full bg-primary-600" />
                )}
                <span
                  className={`flex h-6 w-6 items-center justify-center ${
                    active ? "text-primary-700" : "text-foreground-500"
                  }`}
                >
                  <i className={`${item.icon} text-lg`} />
                </span>
                <span className="w-full truncate text-center">{item.label}</span>
              </Link>
            </li>
          );
        })}

        <li className="min-w-0">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Ouvrir tous les modules"
            className="flex min-h-[56px] w-full cursor-pointer flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-semibold text-foreground-500 transition-colors hover:text-primary-700"
          >
            <span className="flex h-6 w-6 items-center justify-center">
              <i className="ri-menu-2-line text-lg" />
            </span>
            <span className="w-full truncate text-center">Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}