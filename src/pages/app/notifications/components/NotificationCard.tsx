import { Link } from "react-router-dom";
import { severityMeta, type AppNotification } from "@/lib/notifications";

type NotificationCardProps = {
  notification: AppNotification;
  onDismiss: () => void;
};

export default function NotificationCard({ notification, onDismiss }: NotificationCardProps) {
  const meta = severityMeta[notification.severity];

  return (
    <article className={`rounded-lg border p-4 transition-colors md:p-5 ${meta.card}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background-50/80 text-foreground-800">
          <i className={`${notification.icon} text-base`} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="min-w-0 text-sm font-semibold leading-snug text-foreground-950">
              {notification.title}
            </h3>
            <div className="flex shrink-0 items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.chip}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Marquer comme lu"
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-foreground-400 transition-colors hover:bg-background-100 hover:text-foreground-700"
              >
                <i className="ri-close-line text-sm" />
              </button>
            </div>
          </div>

          <p className="mt-1.5 text-xs leading-relaxed text-foreground-600">{notification.message}</p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-background-100/80 px-2 py-0.5 text-[10px] font-semibold text-foreground-600">
              <i className="ri-record-circle-line text-[10px] text-foreground-400" />
              {notification.meta}
            </span>
            <Link
              to={notification.to}
              className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
            >
              {notification.actionLabel}
              <i className="ri-arrow-right-line text-[11px]" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}