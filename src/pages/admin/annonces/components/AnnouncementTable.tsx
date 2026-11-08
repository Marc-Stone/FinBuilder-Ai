import ScheduleCountdown from "@/components/base/ScheduleCountdown";
import {
  ANNOUNCEMENT_AUDIENCE_LABELS,
  ANNOUNCEMENT_STATUS_LABELS,
  ANNOUNCEMENT_STATUS_STYLES,
  announcementTypeMeta,
  formatAnnouncementDate,
  formatAnnouncementDateTime,
  type AnnouncementRow,
} from "@/lib/announcement";

type AnnouncementTableProps = {
  rows: AnnouncementRow[];
  busyId: string | null;
  userLabel: (userId: string | null) => string;
  onPreview: (row: AnnouncementRow) => void;
  onEdit: (row: AnnouncementRow) => void;
  onToggleStatus: (row: AnnouncementRow) => void;
  onDelete: (row: AnnouncementRow) => void;
  onScheduleDue?: () => void;
};

export default function AnnouncementTable({
  rows,
  busyId,
  userLabel,
  onPreview,
  onEdit,
  onToggleStatus,
  onDelete,
  onScheduleDue,
}: AnnouncementTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-background-300 bg-background-50 px-4 py-12 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background-100 text-foreground-500">
          <i className="ri-megaphone-line text-xl" />
        </span>
        <p className="mt-2.5 text-sm font-semibold text-foreground-950">Aucune annonce</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-foreground-500">
          Créez un message puis envoyez-le : il apparaîtra dans le centre de notifications des
          utilisateurs concernés.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
      <div className="hidden grid-cols-12 gap-3 border-b border-background-200 bg-background-100 px-4 py-2.5 lg:grid">
        <span className="col-span-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
          Annonce
        </span>
        <span className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
          Type
        </span>
        <span className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
          Audience
        </span>
        <span className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
          Statut
        </span>
        <span className="col-span-1 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
          Actions
        </span>
      </div>

      <ul className="divide-y divide-background-200">
        {rows.map((row) => {
          const meta = announcementTypeMeta(row.type);
          const busy = busyId === row.id;
          const envoye = row.statut === "envoye";
          const programme = row.statut === "programme";

          return (
            <li
              key={row.id}
              className="grid grid-cols-1 gap-3 px-4 py-3 transition-colors hover:bg-background-100/60 lg:grid-cols-12 lg:items-center"
            >
              <div className="flex min-w-0 items-start gap-2.5 lg:col-span-5">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.bubble}`}
                >
                  <i className={`${meta.icon} text-sm`} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground-950">{row.titre}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-foreground-500">
                    {row.message}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <span
                  className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.chip}`}
                >
                  <i className={`${meta.icon} text-[10px]`} />
                  {meta.label}
                </span>
              </div>

              <div className="min-w-0 lg:col-span-2">
                <p className="truncate text-[11px] font-medium text-foreground-700">
                  {ANNOUNCEMENT_AUDIENCE_LABELS[row.audience] ?? "Tous les utilisateurs"}
                </p>
                {row.audience === "utilisateur" && (
                  <p className="truncate text-[10px] text-foreground-400">{userLabel(row.user_id)}</p>
                )}
              </div>

              <div className="lg:col-span-2">
                <span
                  className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    ANNOUNCEMENT_STATUS_STYLES[row.statut] ?? ANNOUNCEMENT_STATUS_STYLES.brouillon
                  }`}
                >
                  {ANNOUNCEMENT_STATUS_LABELS[row.statut] ?? row.statut}
                </span>
                {programme ? (
                  <div className="mt-1">
                    <ScheduleCountdown iso={row.date_envoi} onDue={onScheduleDue} />
                    <p className="mt-0.5 text-[10px] text-foreground-400">
                      {`Prévue le ${formatAnnouncementDateTime(row.date_envoi)}`}
                    </p>
                  </div>
                ) : (
                  <p className="mt-0.5 text-[10px] text-foreground-400">
                    {envoye
                      ? `Envoyée le ${formatAnnouncementDate(row.date_envoi ?? row.date_creation)}`
                      : `Modifiée le ${formatAnnouncementDate(row.updated_at)}`}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 lg:col-span-1 lg:justify-end">
                <button
                  type="button"
                  onClick={() => onPreview(row)}
                  aria-label="Aperçu"
                  title="Aperçu"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-background-100 hover:text-primary-800"
                >
                  <i className="ri-eye-line text-sm" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  aria-label="Modifier"
                  title="Modifier"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-background-100 hover:text-primary-800"
                >
                  <i className="ri-edit-line text-sm" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleStatus(row)}
                  disabled={busy}
                  aria-label={envoye ? "Retirer" : programme ? "Envoyer maintenant" : "Envoyer"}
                  title={
                    envoye
                      ? "Retirer du centre de notifications"
                      : programme
                        ? "Envoyer maintenant, sans attendre l'heure prévue"
                        : "Envoyer maintenant"
                  }
                  className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors disabled:cursor-wait disabled:opacity-50 ${
                    envoye
                      ? "text-foreground-500 hover:bg-background-100 hover:text-foreground-900"
                      : "text-primary-700 hover:bg-primary-50"
                  }`}
                >
                  <i
                    className={
                      busy
                        ? "ri-loader-4-line animate-spin text-sm"
                        : envoye
                          ? "ri-arrow-go-back-line text-sm"
                          : "ri-send-plane-line text-sm"
                    }
                  />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(row)}
                  aria-label="Supprimer"
                  title="Supprimer"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-accent-50 hover:text-accent-800"
                >
                  <i className="ri-delete-bin-line text-sm" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}