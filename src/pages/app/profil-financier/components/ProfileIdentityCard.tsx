import { getDisplayName, getInitials, useAuth } from "@/hooks/useAuth";
import { formatMoney } from "@/lib/finance";
import type { FinancialProfileBlueprint } from "@/lib/financialProfiles";
import type { FinancialProfileRow } from "@/hooks/useFinancialProfile";

type ProfileIdentityCardProps = {
  blueprint: FinancialProfileBlueprint;
  financialProfile: FinancialProfileRow;
  devise: string;
  onEdit: () => void;
};

export default function ProfileIdentityCard({
  blueprint,
  financialProfile,
  devise,
  onEdit,
}: ProfileIdentityCardProps) {
  const { profile } = useAuth();
  const displayName = getDisplayName(profile) || "Mon compte";

  const stats = [
    {
      label: blueprint.incomeLabel,
      value:
        financialProfile.monthly_income > 0
          ? formatMoney(financialProfile.monthly_income, devise)
          : "Non renseigné",
      icon: "ri-money-dollar-circle-line",
      tone: "bg-primary-50 text-primary-700",
    },
    {
      label: "Type de revenu",
      value: financialProfile.income_type || "À préciser",
      icon: "ri-exchange-dollar-line",
      tone: "bg-secondary-100 text-secondary-800",
    },
    {
      label: "Personnes au foyer",
      value: `${financialProfile.family_size}`,
      icon: "ri-group-line",
      tone: "bg-accent-50 text-accent-800",
    },
    {
      label: "Objectifs déclarés",
      value: `${financialProfile.financial_goals.length}`,
      icon: "ri-flag-2-line",
      tone: "bg-background-100 text-foreground-700",
    },
  ];

  return (
    <section className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
      <div className="relative overflow-hidden bg-primary-950 px-5 py-6 md:px-7 md:py-7">
        <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-primary-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-accent-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-background-50/20 bg-background-50/10 text-base font-semibold text-background-50">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`Photo de ${displayName}`}
                  className="h-full w-full object-top"
                />
              ) : (
                getInitials(profile)
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-300">
                Mon profil financier
              </p>
              <h1
                className="mt-1 truncate text-xl font-semibold text-background-50 md:text-2xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {displayName}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-background-50/12 px-2.5 py-1 text-[10px] font-semibold text-background-50">
                  <i className={`${blueprint.icon} text-[11px]`} />
                  Profil {blueprint.label}
                </span>
                <span className="hidden truncate text-[10px] text-background-50/60 sm:inline">
                  {profile?.email}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-edit-2-line text-base" />
            Modifier mon profil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:p-5 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-lg border border-background-200 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-500">
                {stat.label}
              </p>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${stat.tone}`}
              >
                <i className={`${stat.icon} text-sm`} />
              </span>
            </div>
            <p className="mt-2 truncate text-sm font-semibold text-foreground-950 md:text-base">
              {stat.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}