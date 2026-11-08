import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { getFinancialProfileBlueprint } from "@/lib/financialProfiles";
import ProfileIdentityCard from "@/pages/app/profil-financier/components/ProfileIdentityCard";
import ProfileAdviceCard from "@/pages/app/profil-financier/components/ProfileAdviceCard";
import ProfileGoalsSection from "@/pages/app/profil-financier/components/ProfileGoalsSection";
import FinancialProfileWizard from "@/pages/app/profil-financier/components/FinancialProfileWizard";

export default function FinancialProfilePage() {
  const { profile } = useAuth();
  const { financialProfile, loading, error, reload } = useFinancialProfile();
  const [editing, setEditing] = useState(false);
  const devise = profile?.devise ?? "FCFA";
  const blueprint = getFinancialProfileBlueprint(financialProfile?.profile_type);

  return (
    <div className="w-full animate-fade-up space-y-4 md:space-y-5">
      {error && (
        <div className="rounded-lg border border-accent-300 bg-accent-50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <i className="ri-error-warning-line mt-0.5 text-base text-accent-800" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent-900">
                Votre profil financier n'a pas pu être chargé
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-accent-800">{error}</p>
              <button
                type="button"
                onClick={() => reload()}
                className="mt-2 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
              >
                <i className="ri-refresh-line text-xs" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <section className="rounded-lg border border-background-200 bg-background-50 p-5">
          <div className="flex items-center gap-2.5">
            <i className="ri-loader-4-line animate-spin text-base text-primary-600" />
            <p className="text-xs font-medium text-foreground-600">
              Chargement de votre profil financier…
            </p>
          </div>
        </section>
      )}

      {!loading && !financialProfile && (
        <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-6">
          <div className="mb-4 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
              <i className="ri-user-star-line text-lg" />
            </span>
            <div className="min-w-0">
              <h1
                className="text-lg font-semibold text-foreground-950 md:text-xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Mon profil financier
              </h1>
              <p className="mt-1 text-xs leading-relaxed text-foreground-500">
                Votre situation financière personnalise le tableau de bord, les objectifs proposés et
                les conseils de votre coach IA. Cela prend moins d'une minute.
              </p>
            </div>
          </div>
          <FinancialProfileWizard />
        </section>
      )}

      {!loading && financialProfile && blueprint && (
        <>
          {editing ? (
            <section className="rounded-lg border border-primary-200 bg-background-50 p-4 md:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1
                    className="text-lg font-semibold text-foreground-950 md:text-xl"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Modifier mon profil financier
                  </h1>
                  <p className="mt-1 text-xs leading-relaxed text-foreground-500">
                    Changez de situation ou mettez à jour vos montants : votre tableau de bord
                    s'adapte immédiatement.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  aria-label="Fermer la modification"
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-background-100"
                >
                  <i className="ri-close-line text-base" />
                </button>
              </div>
              <FinancialProfileWizard
                initial={financialProfile}
                onSaved={() => setEditing(false)}
                onCancel={() => setEditing(false)}
              />
            </section>
          ) : (
            <ProfileIdentityCard
              blueprint={blueprint}
              financialProfile={financialProfile}
              devise={devise}
              onEdit={() => setEditing(true)}
            />
          )}

          <ProfileAdviceCard
            blueprint={blueprint}
            financialProfile={financialProfile}
            devise={devise}
          />

          <ProfileGoalsSection
            blueprint={blueprint}
            devise={devise}
            declaredGoals={financialProfile.financial_goals}
          />

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                to: "/app",
                icon: "ri-dashboard-3-line",
                title: "Tableau de bord adapté",
                text: `Vos indicateurs ${blueprint.label.toLowerCase()} sont affichés en priorité.`,
              },
              {
                to: "/app/objectifs",
                icon: "ri-flag-2-line",
                title: "Suivre mes objectifs",
                text: "Progression, échéances et épargne mensuelle nécessaire.",
              },
              {
                to: "/app/profil",
                icon: "ri-user-settings-line",
                title: "Compte et devise",
                text: "Nom, photo et devise utilisée dans tous les calculs.",
              },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-start gap-2.5 rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-primary-300"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-800">
                  <i className={`${item.icon} text-sm`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground-900">{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">
                    {item.text}
                  </p>
                </div>
                <i className="ri-arrow-right-line mt-1 text-sm text-foreground-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </section>
        </>
      )}
    </div>
  );
}