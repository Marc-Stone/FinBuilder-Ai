import { Link } from "react-router-dom";
import type { FinancialProfileBlueprint } from "@/lib/financialProfiles";
import type { FinancialProfileRow } from "@/hooks/useFinancialProfile";
import { formatMoney } from "@/lib/finance";

type ProfileAdviceCardProps = {
  blueprint: FinancialProfileBlueprint;
  financialProfile: FinancialProfileRow;
  devise: string;
};

export default function ProfileAdviceCard({
  blueprint,
  financialProfile,
  devise,
}: ProfileAdviceCardProps) {
  const monthlyGoalTarget = financialProfile.monthly_income > 0
    ? Math.round(financialProfile.monthly_income * 0.15)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <section className="rounded-lg border border-accent-200 bg-accent-50 p-4 md:p-5 lg:col-span-2">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-500 text-foreground-950">
            <i className="ri-sparkling-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-900/70">
              Conseils IA · profil {blueprint.label}
            </p>
            <h2
              className="mt-1 text-sm font-semibold text-accent-900 md:text-base"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {blueprint.adviceTitle}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-accent-900/85">{blueprint.advice}</p>
          </div>
        </div>

        <ul className="mt-3.5 space-y-2">
          {blueprint.tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/25 text-accent-900">
                <i className="ri-check-line text-[11px]" />
              </span>
              <p className="min-w-0 text-[11px] leading-relaxed text-accent-900/85">{tip}</p>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/app/assistant"
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-foreground-900"
          >
            <i className="ri-robot-2-line text-sm" />
            Discuter avec mon coach
          </Link>
          <Link
            to="/app/simulations"
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-accent-300 bg-background-50 px-3.5 py-2 text-xs font-semibold text-accent-900 transition-colors hover:bg-accent-100"
          >
            <i className="ri-git-branch-line text-sm" />
            Tester un scénario
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
          Priorités de votre situation
        </p>
        <ul className="mt-2.5 space-y-2">
          {blueprint.focus.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
              <p className="min-w-0 text-[11px] leading-relaxed text-foreground-700">{item}</p>
            </li>
          ))}
        </ul>

        <div className="mt-3.5 rounded-md bg-secondary-100/70 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary-900/70">
            Repère d'épargne
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground-950">
            {monthlyGoalTarget > 0
              ? `${formatMoney(monthlyGoalTarget, devise)} / mois`
              : "À calculer"}
          </p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-secondary-900/75">
            {monthlyGoalTarget > 0
              ? "Soit environ 15 % de votre revenu déclaré. Ajustable selon vos charges."
              : "Renseignez votre revenu mensuel pour obtenir un repère personnalisé."}
          </p>
        </div>
      </section>
    </div>
  );
}