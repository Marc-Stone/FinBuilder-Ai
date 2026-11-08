import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getDisplayName, getInitials, useAuth } from "@/hooks/useAuth";
import { useAdminAccess } from "@/hooks/useAdminAccess";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Vue d'ensemble",
    subtitle: "Santé de la plateforme, comptes et activité récente",
  },
  "/admin/utilisateurs": {
    title: "Utilisateurs",
    subtitle: "Tous les comptes inscrits sur FinBuilder AI",
  },
  "/admin/contenus": {
    title: "Contenus",
    subtitle: "Fiches de la bibliothèque d'éducation financière",
  },
  "/admin/annonces": {
    title: "Annonces",
    subtitle: "Messages diffusés dans le centre de notifications",
  },
  "/admin/parametres": {
    title: "Paramètres",
    subtitle: "Identité de l'application, couleur principale et maintenance",
  },
  "/admin/roles": {
    title: "Rôles et accès",
    subtitle: "Profils d'administrateurs et droits accordés",
  },
  "/admin/journal": {
    title: "Journal d'activité",
    subtitle: "Traçabilité des actions effectuées dans l'administration",
  },
};

type AdminTopbarProps = {
  onOpenMenu: () => void;
};

export default function AdminTopbar({ onOpenMenu }: AdminTopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { fullAccess, role, loading: accessLoading } = useAdminAccess();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const meta = titles[location.pathname] ?? {
    title: "Administration",
    subtitle: "FinBuilder AI",
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate("/", { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-background-200 bg-background-50/95 backdrop-blur-md">
      <div className="flex h-16 w-full items-center gap-3 px-4 md:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Ouvrir le menu"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-background-200 text-foreground-700 hover:bg-background-100 lg:hidden"
        >
          <i className="ri-menu-line text-lg" />
        </button>

        <div className="min-w-0">
          <h1
            className="truncate text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {meta.title}
          </h1>
          <p className="hidden truncate text-xs text-foreground-500 sm:block">{meta.subtitle}</p>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <span
            className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold md:inline-flex ${
              fullAccess
                ? "border-primary-200 bg-primary-50 text-primary-700"
                : "border-secondary-200 bg-secondary-100 text-secondary-900"
            }`}
          >
            <i className={fullAccess ? "ri-shield-check-line text-xs" : "ri-shield-user-line text-xs"} />
            {accessLoading ? "Vérification…" : fullAccess ? "Accès administrateur" : role?.nom ?? "Accès limité"}
          </span>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Ouvrir le menu du compte"
              className="flex cursor-pointer items-center gap-2 rounded-md border border-background-200 py-1 pl-1 pr-2 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-foreground-950 text-[11px] font-semibold text-background-50">
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
              <span className="hidden max-w-[130px] truncate text-xs font-semibold text-foreground-800 sm:block">
                {getDisplayName(profile) || "Administrateur"}
              </span>
              <i className="ri-arrow-down-s-line text-sm text-foreground-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-60 animate-fade-in rounded-lg border border-background-200 bg-background-50 p-1.5">
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-semibold text-foreground-950">
                    {getDisplayName(profile) || "Administrateur"}
                  </p>
                  <p className="truncate text-xs text-foreground-500">{profile?.email}</p>
                </div>
                <div className="my-1 h-px bg-background-200" />
                <Link
                  to="/app"
                  className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground-700 transition-colors hover:bg-background-100 hover:text-foreground-950"
                >
                  <i className="ri-layout-4-line text-base" />
                  Mon espace personnel
                </Link>
                <Link
                  to="/app/profil"
                  className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground-700 transition-colors hover:bg-background-100 hover:text-foreground-950"
                >
                  <i className="ri-user-settings-line text-base" />
                  Mon profil
                </Link>
                <div className="my-1 h-px bg-background-200" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-accent-800 transition-colors hover:bg-accent-50 disabled:opacity-60"
                >
                  <i className="ri-logout-box-r-line text-base" />
                  {signingOut ? "Déconnexion…" : "Se déconnecter"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}