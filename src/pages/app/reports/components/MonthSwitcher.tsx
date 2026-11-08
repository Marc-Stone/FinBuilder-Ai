import type { MonthOption } from "@/lib/reports";

type MonthSwitcherProps = {
  months: MonthOption[];
  monthKey: string;
  onChange: (key: string) => void;
};

export default function MonthSwitcher({ months, monthKey, onChange }: MonthSwitcherProps) {
  const index = months.findIndex((month) => month.key === monthKey);
  const older = index >= 0 ? months[index + 1] : undefined;
  const newer = index > 0 ? months[index - 1] : undefined;
  const current = months.find((month) => month.key === monthKey) ?? months[0];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-background-200 bg-background-50 p-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
          <i className="ri-calendar-line text-base" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-400">
            Période analysée
          </p>
          <p className="truncate text-sm font-semibold text-foreground-950">{current?.label}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => older && onChange(older.key)}
          disabled={!older}
          aria-label="Mois précédent"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-background-300 text-foreground-600 transition-colors hover:border-primary-300 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <i className="ri-arrow-left-s-line text-base" />
        </button>

        <div className="relative min-w-0">
          <select
            value={monthKey}
            onChange={(event) => onChange(event.target.value)}
            aria-label="Choisir le mois"
            className="h-8 w-full cursor-pointer appearance-none rounded-md border border-background-300 bg-background-50 pl-2.5 pr-7 text-xs font-semibold text-foreground-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            {months.map((month) => (
              <option key={month.key} value={month.key}>
                {month.label}
              </option>
            ))}
          </select>
          <i className="ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-foreground-400" />
        </div>

        <button
          type="button"
          onClick={() => newer && onChange(newer.key)}
          disabled={!newer}
          aria-label="Mois suivant"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-background-300 text-foreground-600 transition-colors hover:border-primary-300 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <i className="ri-arrow-right-s-line text-base" />
        </button>
      </div>
    </div>
  );
}