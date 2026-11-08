import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { permissionDef } from "@/lib/roles";

type RequireAdminPermissionProps = {
  permission: string;
  children: ReactNode;
};

export default function RequireAdminPermission({
  permission,
  children,
}: RequireAdminPermissionProps) {
  const { loading, can } = useAdminAccess();
  const def = permissionDef(permission);

  if (loading) {
    return (
      <div className="w-full space-y-3">
        <div className="h-[124px] animate-pulse rounded-lg bg-background-200" />
        <div className="h-[240px] animate-pulse rounded-lg bg-background-200" />
      </div>
    );
  }

  if (!can(permission)) {
    return (
      <div className="mx-auto w-full max-w-lg animate-fade-up rounded-lg border border-background-200 bg-background-50 p-6 md:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent-100 text-accent-800">
          <i className="ri-lock-2-line text-xl" />
        </span>
        <h1
          className="mt-4 text-lg font-semibold text-foreground-950"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Module non autorisé
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground-600">
          Votre profil d'administrateur ne dispose pas du droit «&nbsp;
          {def?.label ?? permission}&nbsp;». Demandez à un administrateur d'ajuster votre
          rôle si vous avez besoin d'accéder à cet écran.
        </p>
        <Link
          to="/admin"
          className="mt-5 inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-arrow-left-line text-xs" />
          Retour à la vue d'ensemble
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}