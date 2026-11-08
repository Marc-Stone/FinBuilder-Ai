import { useEffect } from "react";
import ModalPortal from "@/components/base/ModalPortal";
import { getEducationModule } from "@/lib/education";
import {
  CONTENT_STATUS_LABELS,
  CONTENT_STATUS_STYLES,
  contentToFiche,
  formatContentDate,
  type ContentRow,
} from "@/lib/content";

type ContentPreviewModalProps = {
  row: ContentRow;
  onClose: () => void;
  onEdit: () => void;
};

export default function ContentPreviewModal({ row, onClose, onEdit }: ContentPreviewModalProps) {
  const fiche = contentToFiche(row);
  const meta = getEducationModule(fiche.modules[0]);
  const published = row.statut === "publie";

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <button
          type="button"
          aria-label="Fermer l'aperçu"
          onClick={onClose}
          className="absolute inset-0 cursor-pointer bg-foreground-950/50"
        />

        <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl animate-fade-up flex-col overflow-hidden rounded-t-xl border border-background-200 bg-background-50 sm:rounded-lg">
          <div className="flex items-start gap-3 border-b border-background-200 px-4 py-4 md:px-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
              <i className={`${fiche.icon} text-lg`} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-semibold text-foreground-600">
                  {fiche.categorie}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-foreground-400">
                  <i className="ri-time-line text-[10px]" />
                  {fiche.minutes} min
                </span>
                <span className="text-[10px] font-medium text-foreground-400">· {fiche.niveau}</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    CONTENT_STATUS_STYLES[row.statut] ?? CONTENT_STATUS_STYLES.brouillon
                  }`}
                >
                  {CONTENT_STATUS_LABELS[row.statut] ?? row.statut}
                </span>
              </div>
              <h2
                className="mt-1 text-base font-semibold leading-snug text-foreground-950"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {fiche.titre}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-500 hover:bg-background-100"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>

          <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4 md:px-5">
            <p className="text-xs leading-relaxed text-foreground-600 md:text-sm">{fiche.resume}</p>

            <h3 className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-400">
              À retenir
            </h3>
            {fiche.points.length === 0 ? (
              <p className="mt-2 text-xs text-foreground-500">Aucun point clé renseigné.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {fiche.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-800">
                      <i className="ri-check-line text-[9px]" />
                    </span>
                    <p className="text-xs leading-relaxed text-foreground-700">{point}</p>
                  </li>
                ))}
              </ul>
            )}

            {fiche.exemple && (
              <div className="mt-4 rounded-md border border-accent-200 bg-accent-50 px-3.5 py-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-800">
                  <i className="ri-lightbulb-line text-xs" />
                  Exemple chiffré
                </p>
                <p className="mt-1 text-xs leading-relaxed text-accent-900">{fiche.exemple}</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.chip}`}>
                <i className={`${meta.icon} text-xs`} />
                {meta.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-background-300 px-2.5 py-1 text-[11px] font-medium text-foreground-600">
                <i className="ri-link text-xs" />
                {fiche.to}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-background-300 px-2.5 py-1 text-[11px] font-medium text-foreground-600">
                <i className="ri-cursor-line text-xs" />
                {fiche.action}
              </span>
            </div>

            <p className="mt-4 text-[10px] leading-relaxed text-foreground-400">
              {published
                ? `Publiée le ${formatContentDate(row.date_publication)} — visible par tous les utilisateurs.`
                : "Brouillon : cette fiche n'est pas encore visible dans la bibliothèque des utilisateurs."}
            </p>
          </div>

          <div className="flex flex-col gap-2 border-t border-background-200 px-4 py-3 sm:flex-row sm:justify-end md:px-5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3.5 py-2 text-xs font-semibold text-foreground-800 transition-colors hover:bg-background-100"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-edit-line text-xs" />
              Modifier cette fiche
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}