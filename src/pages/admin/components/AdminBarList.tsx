type AdminBarListProps = {
  title: string;
  icon: string;
  items: { label: string; value: number }[];
  total: number;
  emptyLabel: string;
  tone?: "primary" | "accent" | "secondary";
};

const barClasses: Record<NonNullable<AdminBarListProps["tone"]>, string> = {
  primary: "bg-primary-500",
  accent: "bg-accent-500",
  secondary: "bg-secondary-500",
};

export default function AdminBarList({
  title,
  icon,
  items,
  total,
  emptyLabel,
  tone = "primary",
}: AdminBarListProps) {
  const safeTotal = total > 0 ? total : 1;

  return (
    <div className="flex h-full flex-col rounded-lg border border-background-200 bg-background-50 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-background-100 text-foreground-700">
          <i className={`${icon} text-sm`} />
        </span>
        <h2 className="text-sm font-semibold text-foreground-900">{title}</h2>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-xs leading-relaxed text-foreground-500">{emptyLabel}</p>
      ) : (
        <ul className="mt-3.5 space-y-2.5">
          {items.map((item) => {
            const percent = Math.round((item.value / safeTotal) * 100);
            return (
              <li key={item.label}>
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate font-medium text-foreground-700">{item.label}</span>
                  <span className="shrink-0 tabular-nums text-foreground-500">
                    {item.value} · {percent}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
                  <div
                    className={`h-full rounded-full ${barClasses[tone]}`}
                    style={{ width: `${Math.max(percent, 3)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}