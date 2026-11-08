import { useEffect } from "react";
import ModalPortal from "@/components/base/ModalPortal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
        <button
          type="button"
          aria-label="Fermer"
          onClick={onCancel}
          className="absolute inset-0 cursor-pointer bg-foreground-950/45 backdrop-blur-[2px]"
        />
        <div className="relative z-10 w-full max-w-sm animate-fade-up rounded-lg border border-background-200 bg-background-50 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-700">
              <i className="ri-error-warning-line text-lg" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground-950">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-foreground-600">{message}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-background-50 transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <i className="ri-loader-4-line animate-spin text-base" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}