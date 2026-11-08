import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalPortal from "@/components/base/ModalPortal";
import { useAuth } from "@/hooks/useAuth";
import { deleteMyAccount } from "@/lib/account";

const CONFIRM_WORD = "SUPPRIMER";

const LOSSES = [
  "Votre profil et vos informations personnelles",
  "Tous vos revenus et toutes vos dépenses",
  "Vos objectifs d'épargne et vos projets",
  "Vos rapports et simulations enregistrés",
];

export default function DeleteAccountCard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, deleting]);

  const closeModal = () => {
    if (deleting) return;
    setOpen(false);
    setTyped("");
    setError("");
  };

  const handleDelete = async () => {
    if (typed.trim().toUpperCase() !== CONFIRM_WORD) {
      setError(`Saisissez « ${CONFIRM_WORD} » pour confirmer la suppression.`);
      return;
    }

    setDeleting(true);
    setError("");
    try {
      await deleteMyAccount();
      try {
        await signOut();
      } catch {
        // Le compte n'existe plus : la session locale est déjà invalidée.
      }
      navigate("/", { replace: true });
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "La suppression n'a pas abouti. Réessayez dans un instant.",
      );
      setDeleting(false);
    }
  };

  const canConfirm = typed.trim().toUpperCase() === CONFIRM_WORD && !deleting;

  return (
    <>
      <div className="rounded-lg border border-accent-200 bg-accent-50/60 p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-800">
              <i className="ri-delete-bin-6-line text-base" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground-950">
                Supprimer mon compte et mes données
              </p>
              <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-foreground-600">
                Vous pouvez quitter FinBuilder à tout moment. Votre profil et vos données
                financières seront définitivement supprimés. Une trace anonyme est conservée dans
                le journal de sécurité.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-accent-300 bg-background-50 px-3.5 py-2 text-xs font-semibold text-accent-800 transition-colors hover:border-accent-400 hover:bg-accent-100"
          >
            <i className="ri-user-unfollow-line text-xs" />
            Supprimer mon compte et mes données
          </button>
        </div>
      </div>

      {open && (
        <ModalPortal>
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <button
              type="button"
              aria-label="Fermer"
              onClick={closeModal}
              className="absolute inset-0 cursor-pointer bg-foreground-950/50"
            />
            <div className="relative z-10 max-h-[92vh] w-full max-w-md animate-fade-up overflow-y-auto rounded-t-xl border border-background-200 bg-background-50 sm:rounded-lg">
              <div className="flex items-start gap-3 border-b border-background-200 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-800">
                  <i className="ri-error-warning-line text-lg" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-foreground-950">
                    Suppression définitive du compte
                  </h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-foreground-600">
                    Cette action est immédiate et irréversible. Elle ne peut pas être annulée.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Fermer"
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-500 hover:bg-background-100"
                >
                  <i className="ri-close-line text-base" />
                </button>
              </div>

              <div className="px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                  Ce qui sera supprimé
                </p>
                <ul className="mt-2 space-y-1.5">
                  {LOSSES.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-foreground-700">
                      <i className="ri-close-circle-line mt-0.5 text-[13px] text-accent-700" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <label
                  htmlFor="delete-account-confirm"
                  className="mt-4 block text-xs font-semibold text-foreground-800"
                >
                  Tapez « {CONFIRM_WORD} » pour confirmer
                </label>
                <input
                  id="delete-account-confirm"
                  name="delete-account-confirm"
                  type="text"
                  value={typed}
                  onChange={(event) => setTyped(event.target.value)}
                  disabled={deleting}
                  autoComplete="off"
                  placeholder={CONFIRM_WORD}
                  className="box-border mt-1.5 w-full min-w-0 rounded-md border border-background-300 bg-background-50 px-3.5 py-2.5 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-300 focus:border-accent-400 disabled:opacity-60"
                />

                {error && (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-accent-300 bg-accent-50 px-3 py-2 text-xs leading-relaxed text-accent-900">
                    <i className="ri-error-warning-line mt-0.5 text-sm" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 border-t border-background-200 px-5 py-3.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={deleting}
                  className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2 text-xs font-semibold text-foreground-800 transition-colors hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!canConfirm}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-600 px-4 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting && <i className="ri-loader-4-line animate-spin text-sm" />}
                  {deleting ? "Suppression…" : "Supprimer définitivement"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}