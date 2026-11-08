import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background-50">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500 text-background-50">
          <i className="ri-line-chart-line text-xl" />
        </span>
        <div className="flex items-center gap-2 text-sm text-foreground-600">
          <i className="ri-loader-4-line animate-spin text-base text-primary-600" />
          Vérification de votre session…
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}