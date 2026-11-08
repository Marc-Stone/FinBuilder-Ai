import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/hooks/useAppSettings";
import { checkIsAdmin } from "@/lib/admin";

export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const { settings, refresh } = useAppSettings();
  const { session, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const userId = session?.user?.id;
  const roleAdmin = profile?.role === "admin";
  const maintenance = settings.mode_maintenance;

  useEffect(() => {
    if (!maintenance) {
      setIsAdmin(true);
      setChecking(false);
      return;
    }
    if (!userId) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }
    if (roleAdmin) {
      setIsAdmin(true);
      setChecking(false);
      return;
    }

    let mounted = true;
    setChecking(true);
    checkIsAdmin(userId)
      .then((allowed) => {
        if (mounted) setIsAdmin(allowed);
      })
      .catch(() => {
        if (mounted) setIsAdmin(false);
      })
      .finally(() => {
        if (mounted) setChecking(false);
      });

    return () => {
      mounted = false;
    };
  }, [maintenance, userId, roleAdmin]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await refresh();
    } finally {
      setRetrying(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  if (!maintenance || isAdmin) {
    return <>{children}</>;
  }

  if (authLoading || checking) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background-50">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500 text-background-50">
          <i className="ri-line-chart-line text-xl" />
        </span>
        <div className="flex items-center gap-2 text-sm text-foreground-600">
          <i className="ri-loader-4-line animate-spin text-base text-primary-600" />
          Vérification de l'état de la plateforme…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background-100 px-4 py-16">
      <div className="w-full max-w-xl rounded-lg border border-background-200 bg-background-50 p-6 md:p-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-background-50">
            <i className="ri-tools-line text-lg" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-700">
              Maintenance en cours
            </p>
            <p
              className="truncate text-sm font-semibold text-foreground-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {settings.nom_application}
            </p>
          </div>
        </div>

        <h1
          className="mt-5 text-xl font-semibold leading-snug text-foreground-950 md:text-2xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Votre espace est momentanément indisponible
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground-600">
          Une opération de maintenance est en cours sur la plateforme. Vos données sont intactes :
          revenus, dépenses, objectifs et projets sont conservés et seront de nouveau accessibles dès
          la fin de l'intervention.
        </p>

        <div className="mt-5 flex items-start gap-2.5 rounded-md border border-accent-300 bg-accent-50 px-3 py-2.5">
          <i className="ri-information-line mt-0.5 text-base text-accent-800" />
          <p className="text-[11px] leading-relaxed text-accent-900">
            Les administrateurs gardent l'accès pendant la maintenance. Si vous pensez qu'il s'agit
            d'une erreur, contactez le support.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-wait disabled:opacity-70"
          >
            <i className={retrying ? "ri-loader-4-line animate-spin text-xs" : "ri-refresh-line text-xs"} />
            {retrying ? "Vérification…" : "Réessayer"}
          </button>
          {settings.email_support && (
            <a
              href={`mailto:${settings.email_support}`}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2.5 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
            >
              <i className="ri-mail-line text-xs" />
              Contacter le support
            </a>
          )}
          <Link
            to="/"
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2.5 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
          >
            <i className="ri-home-4-line text-xs" />
            Retour à l'accueil
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2.5 text-xs font-semibold text-foreground-500 transition-colors hover:text-accent-800"
          >
            <i className="ri-logout-box-r-line text-xs" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}