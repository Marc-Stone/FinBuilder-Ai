type AdminKpiCardProps = {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "accent" | "secondary" | "neutral";
};

const toneClasses: Record<NonNullable<AdminKpiCardProps["tone"]>, string> = {
  primary: "bg-primary-100 text-primary-800",
  accent: "bg-accent-100 text-accent-800",
  secondary: "bg-secondary-100 text-secondary-900",
  neutral: "bg-background-200 text-foreground-800",
};

export default function AdminKpiCard({
  icon,
  label,
  value,
  hint,
  tone = "primary",
}: AdminKpiCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-background-200 bg-background-50 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
          {label}
        </p>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${toneClasses[tone]}`}>
          <i className={`${icon} text-base`} />
        </span>
      </div>
      <div className="mt-3">
        <p
          className="text-2xl font-semibold leading-none text-foreground-950"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {value}
        </p>
        {hint && <p className="mt-1.5 text-[11px] leading-relaxed text-foreground-500">{hint}</p>}
      </div>
    </div>
  );
}