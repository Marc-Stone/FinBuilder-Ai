import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/finance";
import type { BudgetOverrun } from "@/hooks/useFinancialOverview";

type BudgetOverviewCardProps = {
  budget: {
    recommande: number;
    consomme: number;
    restant: number;
    partConsommee: number;
    overruns: BudgetOverrun[];
  };
  epargne: number;
  devise: string;
};

export default function BudgetOverviewCard({ budget, epargne, devise }: BudgetOverviewCardProps) {
  const hasReference = budget.recommande > 0;
  const depassement = budget.restant < 0;

  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Budget intelligent
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">
            Calculé chaque jour sur vos revenus et vos dépenses réels.
          </p>
        </div>
        <Link
          to="/app/budget"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-primary-300 bg-primary-50 px-3 py-1.5 text-[11px] font-semibold text-primary-800 transition-colors hover:bg-primary-100"
        >
          <i className="ri-pie-chart-2-line text-sm" />
          Détail du budget
        </Link>
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="min-w-0 rounded-md bg-background-100 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
            Recommandé
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground-950">
            {formatMoney(budget.recommande, devise)}
          </p>
        </div>
        <div className="min-w-0 rounded-md bg-accent-50 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
            Consommé
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-accent-900">
            {formatMoney(budget.consomme, devise)}
          </p>
        </div>
        <div
          className={`min-w-0 rounded-md px-3 py-2.5 ${depassement ? "bg-accent-100" : "bg-primary-50"}`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
            Restant
          </p>
          <p
            className={`mt-0.5 truncate text-sm font-semibold ${
              depassement ? "text-accent-900" : "text-primary-800"
            }`}
          >
            {formatMoney(budget.restant, devise)}
          </p>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background-200">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            depassement ? "bg-accent-500" : "bg-primary-500"
          }`}
          style={{ width: `${Math.min(Math.max(budget.partConsommee, hasReference ? 2 : 0), 100)}%` }}
        />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="text-foreground-500">
          {hasReference
            ? `${Math.round(budget.partConsommee)} % de votre revenu de référence`
            : "Ajoutez un revenu pour activer le calcul"}
        </span>
        <span className="font-semibold text-primary-700">
          Épargne du mois : {formatMoney(epargne, devise)}
        </span>
      </div>

      {budget.overruns.length > 0 ? (
        <ul className="mt-3 space-y-1.5 border-t border-background-200 pt-3">
          <li className="flex items-center gap-1.5 text-[11px] font-semibold text-accent-900">
            <i className="ri-alarm-warning-line text-xs" />
            {budget.overruns.length} poste{budget.overruns.length > 1 ? "s" : ""} au-dessus de la
            cible
          </li>
          {budget.overruns.map((overrun) => (
            <li
              key={overrun.label}
              className="flex flex-wrap items-center gap-2 rounded-md bg-accent-50 px-2.5 py-1.5 text-[11px]"
            >
              <i className={`${overrun.icon} text-xs text-accent-800`} />
              <span className="min-w-0 flex-1 truncate font-medium text-accent-900">
                {overrun.label}
              </span>
              <span className="shrink-0 font-semibold text-accent-900">+{overrun.percent} %</span>
              <span className="shrink-0 text-accent-800">
                {formatMoney(overrun.montant, devise)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 flex items-start gap-1.5 border-t border-background-200 pt-3 text-[11px] leading-relaxed text-foreground-500">
          <i className="ri-checkbox-circle-line mt-0.5 text-xs text-primary-600" />
          <span>
            {hasReference
              ? "Aucun poste ne dépasse sa cible pour le moment. Votre répartition est respectée."
              : "Votre budget apparaîtra dès votre premier revenu enregistré."}
          </span>
        </p>
      )}
    </section>
  );
}