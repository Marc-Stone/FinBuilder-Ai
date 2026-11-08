type FilterValue = "toutes" | "urgent" | "budget" | "objectif" | "epargne";

type NotificationFiltersProps = {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  counts: Record<FilterValue, number>;
};

const filters: { value: FilterValue; label: string; icon: string }[] = [
  { value: "toutes", label: "Toutes", icon: "ri-notification-3-line" },
  { value: "urgent", label: "Urgentes", icon: "ri-alarm-warning-line" },
  { value: "objectif", label: "Objectifs", icon: "ri-flag-2-line" },
  { value: "budget", label: "Budget", icon: "ri-pie-chart-2-line" },
  { value: "epargne", label: "Épargne", icon: "ri-safe-2-line" },
];

export default function NotificationFilters({ value, onChange, counts }: NotificationFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-1 rounded-full border border-background-200 bg-background-100 p-1">
        {filters.map((filter) => {
          const active = value === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange(filter.value)}
              className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                active
                  ? "bg-background-50 text-foreground-950"
                  : "text-foreground-600 hover:text-foreground-900"
              }`}
            >
              <i className={`${filter.icon} text-xs`} />
              {filter.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  active ? "bg-primary-50 text-primary-800" : "bg-background-200 text-foreground-600"
                }`}
              >
                {counts[filter.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}