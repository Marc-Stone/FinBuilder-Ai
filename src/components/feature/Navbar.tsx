import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppSettings } from "@/hooks/useAppSettings";

const navigation = [
  { to: "/", label: "Accueil" },
  { to: "/fonctionnalites", label: "Fonctionnalités" },
  { to: "/mode-demploi", label: "Mode d'emploi" },
  { to: "/a-propos", label: "À propos" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { settings } = useAppSettings();

  const isHome = location.pathname === "/";
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full transition-all duration-300 ${
        transparent
          ? "bg-transparent"
          : "border-b border-background-200 bg-background-50/95 backdrop-blur-md"
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between px-4 md:h-20 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-md text-lg ${
              transparent ? "bg-background-50/15 text-background-50" : "bg-primary-500 text-background-50"
            }`}
          >
            <i className="ri-line-chart-line text-lg" />
          </span>
          <span
            className={`truncate text-base font-semibold tracking-tight md:text-lg ${
              transparent ? "text-background-50" : "text-foreground-950"
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {settings.nom_application}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                  transparent
                    ? active
                      ? "text-background-50"
                      : "text-background-50/75 hover:text-background-50"
                    : active
                      ? "bg-primary-50 text-primary-700"
                      : "text-foreground-600 hover:text-foreground-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/connexion"
            className={`whitespace-nowrap text-sm font-semibold transition-colors ${
              transparent ? "text-background-50/85 hover:text-background-50" : "text-foreground-700 hover:text-foreground-950"
            }`}
          >
            Connexion
          </Link>
          <Link
            to="/inscription"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-all duration-200 hover:bg-primary-600 active:scale-[0.98]"
          >
            Essayer gratuitement
            <i className="ri-arrow-right-line text-sm" />
          </Link>
        </div>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={() => setMobileOpen((v) => !v)}
          className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors md:hidden ${
            transparent ? "text-background-50" : "text-foreground-900"
          }`}
        >
          <i className={mobileOpen ? "ri-close-line text-2xl" : "ri-menu-line text-2xl"} />
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-background-200 bg-background-50 px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={location.pathname === item.to ? "page" : undefined}
                className="flex min-h-[44px] items-center rounded-md px-3 py-2.5 text-sm font-medium text-foreground-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              to="/connexion"
              className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md border border-background-300 px-4 py-2.5 text-sm font-semibold text-foreground-900"
            >
              Connexion
            </Link>
            <Link
              to="/inscription"
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50"
            >
              Essayer gratuitement
              <i className="ri-arrow-right-line text-sm" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}