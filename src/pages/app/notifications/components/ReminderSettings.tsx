import { channelLabels, type NotificationCategory } from "@/lib/notifications";

type ReminderSettingsProps = {
  channels: Record<NotificationCategory, boolean>;
  onToggle: (channel: NotificationCategory) => void;
};

export default function ReminderSettings({ channels, onToggle }: ReminderSettingsProps) {
  const activeCount = Object.values(channels).filter(Boolean).length;

  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground-950">Rappels actifs</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-foreground-500">
            Choisissez les alertes que vous voulez voir dans ce centre.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-secondary-100 px-2.5 py-1 text-[10px] font-semibold text-secondary-900">
          {activeCount}/3
        </span>
      </div>

      <ul className="mt-3.5 space-y-1.5">
        {channelLabels.map((channel) => {
          const active = channels[channel.key];
          return (
            <li key={channel.key}>
              <button
                type="button"
                onClick={() => onToggle(channel.key)}
                aria-pressed={active}
                className="flex w-full cursor-pointer items-start gap-2.5 rounded-md border border-background-200 bg-background-50 px-3 py-2.5 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/40"
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                    active ? "bg-primary-50 text-primary-700" : "bg-background-100 text-foreground-400"
                  }`}
                >
                  <i className={`${channel.icon} text-sm`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-foreground-900">
                    {channel.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-foreground-500">
                    {channel.hint}
                  </span>
                </span>
                <span
                  className={`mt-1 flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                    active ? "bg-primary-500" : "bg-background-300"
                  }`}
                >
                  <span
                    className={`h-3 w-3 rounded-full bg-background-50 transition-transform duration-200 ${
                      active ? "translate-x-3" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}