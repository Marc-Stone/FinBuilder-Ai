import { formatMoney } from "@/lib/finance";
import type { BudgetGroupResult } from "@/lib/budget";

type BudgetGroupsProps = {
  groups: BudgetGroupResult[];
  devise: string;
  reference: number;
  layout?: "grid" | "stack";
};

export default function BudgetGroups({
  groups,
  devise,
  reference,
  layout = "grid",
}: BudgetGroupsProps) {
  return (
    <section
      className={
        layout === "stack"
          ? "space-y-4"
          : "grid grid-cols-1 gap-4 lg:grid-cols-3"
      }
    >
      {groups.map((group) => {
        const part = group.meta.percent;
        const share = group.recommande > 0 ? (group.reel / group.recommande) * 100 : 0;
        const over = group.ecart > 0;
        const isSavings = group.meta.key === "epargne";
        const statusColor = isSavings
          ? group.reel >= group.recommande
            ? "text-primary-700"
            : "text-foreground-500"
          : over
            ? "text-accent-800"
            : "text-primary-700";

        return (
          <article
            key={group.meta.key}
            className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${group.meta.soft} ${group.meta.tone}`}
                >
                  <i className={`${group.meta.icon} text-base`} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground-950">
                    {group.meta.label}
                  </p>
                  <p className="text-[11px] text-foreground-400">{part} % du revenu</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-background-300 bg-background-100 px-2 py-0.5 text-[10px] font-semibold text-foreground-600">
                {reference > 0 ? "Calculé" : "—"}
              </span>
            </div>

            <div className="mt-3.5 flex items-baseline gap-1.5">
              <p
                className="text-xl font-semibold text-foreground-950"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {formatMoney(group.recommande, devise)}
              </p>
              <span className="text-[11px] text-foreground-400">recommandé</span>
            </div>

            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
              <div
                className={`h-full rounded-full ${over && !isSavings ? "bg-accent-500" : group.meta.bar} transition-all duration-700`}
                style={{ width: `${Math.min(Math.max(share, group.reel > 0 ? 3 : 0), 100)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <p className={`text-[11px] font-semibold ${statusColor}`}>
                {group.reel > 0 ? `${formatMoney(group.reel, devise)} réels` : "Aucune dépense"}
              </p>
              <p className={`text-[11px] font-semibold ${statusColor}`}>
                {group.reel === 0
                  ? "—"
                  : over
                    ? `+${formatMoney(group.ecart, devise)}`
                    : `${formatMoney(Math.abs(group.ecart), devise)} de marge`}
              </p>
            </div>

            <p className="mt-2.5 border-t border-background-200 pt-2.5 text-[11px] leading-relaxed text-foreground-500">
              {group.meta.description}
            </p>
          </article>
        );
      })}
    </section>
  );
}