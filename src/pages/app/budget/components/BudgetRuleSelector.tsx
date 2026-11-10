import { budgetRules, type BudgetRule } from "@/lib/budget";

type BudgetRuleSelectorProps = {
  value: BudgetRule;
  onChange: (rule: BudgetRule) => void;
};

/* Aperçu visuel des blocs de chaque règle (largeurs = pourcentages). */
const previews: Record<BudgetRule, { width: number; className: string }[]> = {
  "50-30-20": [
    { width: 50, className: "bg-primary-600" },
    { width: 30, className: "bg-accent-500" },
    { width: 20, className: "bg-secondary-600" },
  ],
  "80-20": [
    { width: 80, className: "bg-primary-600" },
    { width: 20, className: "bg-secondary-600" },
  ],
};

/** Choix de la règle de répartition du budget intelligent. */
export default function BudgetRuleSelector({ value, onChange }: BudgetRuleSelectorProps) {
  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="min-w-0">
        <h2
          className="text-sm font-semibold text-foreground-950 md:text-base"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Règle de répartition
        </h2>
        <p className="mt-0.5 text-xs text-foreground-500">
          Choisissez la méthode qui vous convient. Vous pouvez en changer à tout moment.
        </p>
      </div>

      <div role="radiogroup" aria-label="Règle de répartition" className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {budgetRules.map((rule) => {
          const active = rule.value === value;
          return (
            <button
              key={rule.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(rule.value)}
              className={`flex min-h-[44px] w-full cursor-pointer flex-col gap-2.5 rounded-md border px-3.5 py-3 text-left transition-colors ${
                active
                  ? "border-primary-500 bg-primary-50/60 ring-1 ring-primary-500"
                  : "border-background-200 bg-background-50 hover:border-primary-200 hover:bg-primary-50/30"
              }`}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="flex min-w-0 items-baseline gap-2">
                  <span
                    className="text-base font-semibold text-foreground-950"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {rule.label}
                  </span>
                  <span className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground-500">
                    {rule.short}
                  </span>
                </span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-primary-600" : "border-background-400"
                  }`}
                  aria-hidden="true"
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
                </span>
              </span>

              <span className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
                {previews[rule.value].map((part, index) => (
                  <span key={index} className={`h-full ${part.className}`} style={{ width: `${part.width}%` }} />
                ))}
              </span>

              <span className="text-xs leading-relaxed text-foreground-600">{rule.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
