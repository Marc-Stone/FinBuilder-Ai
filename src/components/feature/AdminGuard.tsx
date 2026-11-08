import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { checkIsAdmin } from "@/lib/admin";

type AccessState = "checking" | "allowed" | "denied";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth();
  const [state, setState] = useState<AccessState>("checking");
  const [error, setError] = useState("");

  const userId = session?.user?.id;
  const isAdminProfile = profile?.role === "admin";

  useEffect(() => {
    let mounted = true;

    if (loading) return () => undefined;
    if (!userId) {
      setState("denied");
      return () => undefined;
    }
    if (isAdminProfile) {
      setState("allowed");
      return () => undefined;
    }

    setState("checking");
    checkIsAdmin(userId)
      .then((allowed) => {
        if (!mounted) return;
        setState(allowed ? "allowed" : "denied");
      })
      .catch(() => {
        if (!mounted) return;
        setError("Votre niveau d'accès n'a pas pu être vérifié.");
        setState("denied");
      });

    return () => {
      mounted = false;
    };
  }, [loading, userId, isAdminProfile]);

  if (loading || state === "checking") {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background-50">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500 text-background-50">
          <i className="ri-shield-keyhole-line text-xl" />
        </span>
        <div className="flex items-center gap-2 text-sm text-foreground-600">
          <i className="ri-loader-4-line animate-spin text-base text-primary-600" />
          Vérification de votre accès administrateur…
        </div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background-100 px-4 py-16">
        <div className="w-full max-w-md rounded-lg border border-background-200 bg-background-50 p-6 md:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent-100 text-accent-800">
            <i className="ri-lock-2-line text-xl" />
          </span>
          <h1
            className="mt-4 text-lg font-semibold text-foreground-950"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Accès réservé
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground-600">
            Cet espace est réservé aux administrateurs de FinBuilder AI. Votre compte ne dispose pas
            de ce niveau d'accès.
          </p>
          {error && <p className="mt-2 text-xs text-accent-800">{error}</p>}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/app"
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-arrow-left-line text-xs" />
              Retour à mon espace
            </Link>
            <Link
              to="/"
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
            >
              <i className="ri-home-4-line text-xs" />
              Accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}