import { useEffect, useState } from "react";
import ModalPortal from "@/components/base/ModalPortal";
import ConfirmDialog from "@/components/base/ConfirmDialog";
import { deleteUserAccount } from "@/lib/account";
import {
  ADMIN_ROLE_LABELS,
  displayUserName,
  formatAdminDate,
  formatAdminDateTime,
  initialsOf,
  type AdminUserRow,
} from "@/lib/admin";

type UserDetailModalProps = {
  user: AdminUserRow;
  onClose: () => void;
  canDelete?: boolean;
  onDeleted?: () => void;
};

export default function UserDetailModal({
  user,
  onClose,
  canDelete = false,
  onDeleted,
}: UserDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteUserAccount(user.id);
      setConfirmOpen(false);
      onDeleted?.();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "La suppression n'a pas abouti. Réessayez dans un instant.",
      );
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleCopy = async () => {
    if (!user.email) return;
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const rows: { label: string; value: string }[] = [
    { label: "Email", value: user.email ?? "Non renseigné" },
    { label: "Téléphone", value: user.telephone ?? "Non renseigné" },
    { label: "Pays", value: user.pays ?? "Non renseigné" },
    { label: "Devise", value: user.devise ?? "Non renseignée" },
    { label: "Rôle", value: ADMIN_ROLE_LABELS[user.role] ?? user.role },
    { label: "Inscription", value: formatAdminDate(user.date_creation) },
  ];

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
        <button
          type="button"
          aria-label="Fermer la fiche"
          onClick={onClose}
          className="absolute inset-0 cursor-pointer bg-foreground-950/50"
        />
        <div className="relative z-10 max-h-[92vh] w-full max-w-lg animate-fade-up overflow-y-auto rounded-t-xl border border-background-200 bg-background-50 sm:rounded-lg">
          <div className="flex items-start gap-3 border-b border-background-200 px-5 py-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-sm font-semibold text-primary-800">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={displayUserName(user)} className="h-full w-full object-top" />
              ) : (
                initialsOf(user)
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground-950">
                {displayUserName(user)}
              </p>
              <p className="truncate text-xs text-foreground-500">{user.email ?? "Sans email"}</p>
              <span
                className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  user.role === "admin"
                    ? "bg-foreground-950 text-background-50"
                    : "bg-secondary-100 text-secondary-900"
                }`}
              >
                <i className="ri-shield-user-line text-[10px]" />
                {ADMIN_ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-500 hover:bg-background-100"
            >
              <i className="ri-close-line text-base" />
            </button>
          </div>

          <div className="px-5 py-4">
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {rows.map((row) => (
                <div key={row.label} className="rounded-md border border-background-200 bg-background-100 px-3 py-2">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-foreground-500">
                    {row.label}
                  </dt>
                  <dd className="mt-0.5 truncate text-xs font-medium text-foreground-900">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-3 rounded-md border border-background-200 bg-background-100 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-500">
                Identifiant technique
              </p>
              <p className="mt-0.5 break-all text-[11px] font-medium text-foreground-700">{user.id}</p>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-foreground-500">
              Fiche en lecture seule. Les données financières personnelles d'un compte ne sont pas
              consultables depuis l'administration : chaque utilisateur reste seul à voir ses revenus,
              dépenses, objectifs et projets.
            </p>

            {canDelete && (
              <div className="mt-3 rounded-md border border-accent-200 bg-accent-50/70 px-3 py-2.5">
                <p className="text-[11px] font-semibold text-accent-900">Suppression du compte</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-600">
                  Le profil et toutes les données financières seront supprimés définitivement. Une
                  trace anonyme restera dans le journal d'audit.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-background-200 px-5 py-3.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!user.email}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3.5 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className={copied ? "ri-check-line text-xs" : "ri-file-copy-line text-xs"} />
              {copied ? "Email copié" : "Copier l'email"}
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  setDeleteError("");
                  setConfirmOpen(true);
                }}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-accent-300 bg-background-50 px-3.5 py-2 text-xs font-semibold text-accent-800 transition-colors hover:border-accent-400 hover:bg-accent-100"
              >
                <i className="ri-delete-bin-6-line text-xs" />
                Supprimer ce compte
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              Fermer
            </button>
          </div>

          <p className="px-5 pb-4 text-[10px] text-foreground-400">
            Dernière synchronisation : {formatAdminDateTime(user.date_creation)}
          </p>
        </div>

        {deleteError && (
          <div className="fixed bottom-4 left-1/2 z-[70] w-[min(92vw,420px)] -translate-x-1/2 rounded-md border border-accent-300 bg-background-50 px-3.5 py-2.5 text-xs leading-relaxed text-accent-900">
            <div className="flex items-start gap-2">
              <i className="ri-error-warning-line mt-0.5 text-sm" />
              <span>{deleteError}</span>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={confirmOpen}
          title="Supprimer définitivement ce compte ?"
          message={`Les revenus, dépenses, objectifs, projets et le profil de ${displayUserName(
            user,
          )} seront supprimés. Le compte ne pourra plus se connecter. Une trace anonyme est conservée dans le journal d'audit.`}
          confirmLabel="Supprimer définitivement"
          cancelLabel="Annuler"
          loading={deleting}
          onCancel={() => {
            if (!deleting) setConfirmOpen(false);
          }}
          onConfirm={handleDelete}
        />
      </div>
    </ModalPortal>
  );
}