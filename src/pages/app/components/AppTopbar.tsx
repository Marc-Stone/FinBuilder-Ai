import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getDisplayName, getInitials, useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/pages/app/components/NotificationBell";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/app": { title: "Tableau de bord", subtitle: "Vue d'ensemble de votre santé financière" },
  "/app/revenus": { title: "Revenus", subtitle: "Enregistrez et pilotez vos entrées d'argent" },
  "/app/depenses": { title: "Dépenses", subtitle: "Suivez vos sorties par catégorie" },
  "/app/budget": { title: "Budget intelligent", subtitle: "Votre répartition recommandée selon vos revenus" },
  "/app/objectifs": {
    title: "Mes objectifs",
    subtitle: "Ce que vous voulez atteindre : cible, échéance et épargne",
  },
  "/app/projets": {
    title: "Mes projets",
    subtitle: "Comment y arriver : budget par poste, étapes et planning",
  },
  "/app/assistant": {
    title: "Assistant IA",
    subtitle: "Une phrase, un objectif, puis le projet qui le finance",
  },
  "/app/logement": {
    title: "Conseiller logement",
    subtitle: "Loyer soutenable, capacité d'emprunt et budget d'achat",
  },
  "/app/simulations": {
    title: "Simulations",
    subtitle: "Et si… : mesurez l'effet d'un changement avant de le décider",
  },
  "/app/rapports": {
    title: "Rapports",
    subtitle: "Synthèse mensuelle de vos revenus et dépenses, exportable en PDF",
  },
  "/app/education": {
    title: "Éducation financière",
    subtitle: "Fiches courtes reliées à chacun de vos modules",
  },
  "/app/notifications": {
    title: "Notifications",
    subtitle: "Messages internes, échéances, dépassements de budget et rappels d'épargne",
  },
  "/app/profil": { title: "Mon profil", subtitle: "Vos informations personnelles et préférences" },
  "/app/profil-financier": {
    title: "Mon profil financier",
    subtitle: "Votre situation, vos objectifs et les conseils adaptés",
  },
};

type AppTopbarProps = {
  onOpenMenu: () => void;
};

export default function AppTopbar({ onOpenMenu }: AppTopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const meta = titles[location.pathname] ?? { title: "Espace personnel", subtitle: "FinBuilder AI" };

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
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md border border-background-200 text-foreground-700 hover:bg-background-100 lg:hidden"
        >
          <i className="ri-menu-line text-lg" />
        </button>

        <div className="min-w-0">
          <h2
            className="truncate text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {meta.title}
          </h2>
          <p className="hidden truncate text-xs text-foreground-500 sm:block">{meta.subtitle}</p>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="hidden items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700 md:inline-flex">
            <i className="ri-shield-check-line text-xs" />
            Données sécurisées
          </span>

          <NotificationBell />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Ouvrir le menu du compte"
              className="flex cursor-pointer items-center gap-2 rounded-md border border-background-200 py-1 pl-1 pr-2 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary-500 text-[11px] font-semibold text-background-50">
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
                {getDisplayName(profile) || "Mon compte"}
              </span>
              <i className="ri-arrow-down-s-line text-sm text-foreground-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-60 animate-fade-in rounded-lg border border-background-200 bg-background-50 p-1.5">
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-semibold text-foreground-950">
                    {getDisplayName(profile) || "Mon compte"}
                  </p>
                  <p className="truncate text-xs text-foreground-500">{profile?.email}</p>
                </div>
                <div className="my-1 h-px bg-background-200" />
                <Link
                  to="/app/profil"
                  className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground-700 transition-colors hover:bg-background-100 hover:text-foreground-950"
                >
                  <i className="ri-user-settings-line text-base" />
                  Mon profil
                </Link>
                <Link
                  to="/fonctionnalites"
                  className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground-700 transition-colors hover:bg-background-100 hover:text-foreground-950"
                >
                  <i className="ri-compass-3-line text-base" />
                  Fonctionnalités
                </Link>
                {(profile?.role === "admin" || Boolean(profile?.admin_role_id)) && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-primary-800 transition-colors hover:bg-primary-50"
                  >
                    <i className="ri-shield-keyhole-line text-base" />
                    Administration
                  </Link>
                )}
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