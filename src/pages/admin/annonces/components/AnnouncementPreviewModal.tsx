import { useEffect } from "react";
import ModalPortal from "@/components/base/ModalPortal";
import ScheduleCountdown from "@/components/base/ScheduleCountdown";
import {
  ANNOUNCEMENT_AUDIENCE_LABELS,
  announcementTypeMeta,
  formatAnnouncementDate,
  formatAnnouncementDateTime,
  type AnnouncementRow,
} from "@/lib/announcement";

type AnnouncementPreviewModalProps = {
  row: AnnouncementRow;
  userLabel: string;
  onClose: () => void;
  onEdit: () => void;
};

export default function AnnouncementPreviewModal({
  row,
  userLabel,
  onClose,
  onEdit,
}: AnnouncementPreviewModalProps) {
  const meta = announcementTypeMeta(row.type);
  const envoye = row.statut === "envoye";
  const programme = row.statut === "programme";

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
      <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="absolute inset-0 cursor-pointer bg-foreground-950/50"
        />

        <div className="relative z-10 flex max-h-[94vh] w-full max-w-lg animate-fade-up flex-col overflow-hidden rounded-t-xl border border-background-200 bg-background-50 sm:rounded-lg">
          <div className="flex items-start gap-3 border-b border-background-200 px-4 py-3.5 md:px-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background-100 text-foreground-800">
              <i className="ri-eye-line text-base" />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                className="text-sm font-semibold text-foreground-950"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Aperçu côté utilisateur
              </h2>
              <p className="mt-0.5 text-[11px] text-foreground-500">
                Voici exactement ce que verront les destinataires dans leur centre de notifications.
              </p>
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
            <div
              className={`flex items-start gap-2 rounded-md border px-3 py-2 ${
                envoye
                  ? "border-primary-200 bg-primary-50"
                  : programme
                    ? "border-accent-300 bg-accent-50"
                    : "border-background-300 bg-background-100"
              }`}
            >
              <i
                className={`mt-0.5 text-xs ${
                  envoye
                    ? "ri-check-double-line text-primary-700"
                    : programme
                      ? "ri-timer-line text-accent-800"
                      : "ri-draft-line text-foreground-500"
                }`}
              />
              <p
                className={`text-[11px] leading-relaxed ${
                  envoye
                    ? "text-primary-900"
                    : programme
                      ? "text-accent-900"
                      : "text-foreground-700"
                }`}
              >
                {envoye
                  ? "Annonce envoyée : elle est visible dans le centre de notifications."
                  : programme
                    ? "Annonce programmée : elle sera diffusée automatiquement à l'heure prévue."
                    : "Brouillon : cette annonce n'est encore visible par aucun utilisateur."}
              </p>
            </div>

            {programme && (
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-background-200 bg-background-50 px-3 py-2">
                <ScheduleCountdown iso={row.date_envoi} />
                <span className="text-[11px] text-foreground-500">
                  {`Prévue le ${formatAnnouncementDateTime(row.date_envoi)}`}
                </span>
              </div>
            )}

            <div className="mt-3 rounded-lg border border-background-200 bg-background-50 p-4">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${meta.bubble}`}
                >
                  <i className={`${meta.icon} text-base`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
                    Message de l'équipe · {meta.label}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold leading-snug text-foreground-950">
                    {row.titre}
                  </h3>
                  <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-foreground-600">
                    {row.message}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-semibold text-foreground-600">
                      <i className="ri-calendar-line text-[10px] text-foreground-400" />
                      {formatAnnouncementDate(row.date_envoi ?? row.date_creation)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.chip}`}
                    >
                      <i className={`${meta.icon} text-[10px]`} />
                      Annonce FinBuilder
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-md bg-background-100 px-3 py-2">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-foreground-500">
                  Destinataires
                </dt>
                <dd className="mt-0.5 text-[11px] font-medium text-foreground-800">
                  {ANNOUNCEMENT_AUDIENCE_LABELS[row.audience] ?? "Tous les utilisateurs"}
                  {row.audience === "utilisateur" ? ` · ${userLabel}` : ""}
                </dd>
              </div>
              <div className="rounded-md bg-background-100 px-3 py-2">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-foreground-500">
                  Dernière modification
                </dt>
                <dd className="mt-0.5 text-[11px] font-medium text-foreground-800">
                  {formatAnnouncementDate(row.updated_at)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-background-200 px-4 py-3 md:px-5">
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
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-edit-line text-xs" />
              Modifier
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}