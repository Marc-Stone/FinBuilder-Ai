import { announcementTypeMeta, formatAnnouncementDate, type AnnouncementRow } from "@/lib/announcement";

type AnnouncementCardProps = {
  announcement: AnnouncementRow;
  onDismiss: () => void;
};

export default function AnnouncementCard({ announcement, onDismiss }: AnnouncementCardProps) {
  const meta = announcementTypeMeta(announcement.type);

  return (
    <article className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${meta.bubble}`}
        >
          <i className={`${meta.icon} text-base`} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
                Message de l'équipe · {meta.label}
              </p>
              <h3 className="mt-1 text-sm font-semibold leading-snug text-foreground-950">
                {announcement.titre}
              </h3>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Marquer comme lu"
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-400 transition-colors hover:bg-background-100 hover:text-foreground-700"
            >
              <i className="ri-close-line text-sm" />
            </button>
          </div>

          <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-foreground-600">
            {announcement.message}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-semibold text-foreground-600">
              <i className="ri-calendar-line text-[10px] text-foreground-400" />
              {formatAnnouncementDate(announcement.date_envoi ?? announcement.date_creation)}
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
    </article>
  );
}