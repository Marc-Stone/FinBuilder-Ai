import { Link } from "react-router-dom";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { getFinancialProfileBlueprint } from "@/lib/financialProfiles";
import { formatMoney } from "@/lib/finance";
import { useAuth } from "@/hooks/useAuth";

export default function FinancialSituationCard() {
  const { financialProfile } = useFinancialProfile();
  const { profile } = useAuth();
  const blueprint = getFinancialProfileBlueprint(financialProfile?.profile_type);
  const devise = profile?.devise ?? "FCFA";

  return (
    <div className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
              blueprint ? blueprint.bubble : "bg-primary-50 text-primary-700"
            }`}
          >
            <i className={`${blueprint ? blueprint.icon : "ri-user-star-line"} text-base`} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground-950">
              {blueprint ? `Profil financier : ${blueprint.label}` : "Profil financier non défini"}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-foreground-600">
              {blueprint
                ? blueprint.tagline
                : "Choisissez votre situation pour personnaliser le tableau de bord, les objectifs et les conseils du coach IA."}
            </p>
            {blueprint && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-medium text-foreground-600">
                  {blueprint.incomeLabel} :{" "}
                  {financialProfile && financialProfile.monthly_income > 0
                    ? formatMoney(financialProfile.monthly_income, devise)
                    : "non renseigné"}
                </span>
                {financialProfile?.income_type && (
                  <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-medium text-secondary-900">
                    {financialProfile.income_type}
                  </span>
                )}
                {financialProfile && (
                  <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-medium text-accent-900">
                    {financialProfile.family_size} personne
                    {financialProfile.family_size > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <Link
          to="/app/profil-financier"
          className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-primary-300 bg-primary-50 px-4 py-2.5 text-xs font-semibold text-primary-800 transition-colors hover:bg-primary-100"
        >
          <i className="ri-edit-2-line text-sm" />
          {blueprint ? "Changer de situation" : "Définir mon profil"}
        </Link>
      </div>
    </div>
  );
}