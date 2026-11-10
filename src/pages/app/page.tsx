import { Link } from "react-router-dom";
import { getDisplayName, useAuth } from "@/hooks/useAuth";
import { useFinancialOverview } from "@/hooks/useFinancialOverview";
import { useBudgetRule } from "@/hooks/useBudgetRule";
import { budgetRuleLabel } from "@/lib/budget";
import { formatMoney } from "@/lib/finance";
import MonthlyTrendChart from "@/pages/app/components/MonthlyTrendChart";
import ExpenseDonutChart from "@/pages/app/components/ExpenseDonutChart";
import ActiveProjectsCard from "@/pages/app/components/ActiveProjectsCard";
import BudgetOverviewCard from "@/pages/app/components/BudgetOverviewCard";
import GoalsOverviewCard from "@/pages/app/components/GoalsOverviewCard";
import FinancialProfileFocus from "@/pages/app/components/FinancialProfileFocus";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { getFinancialProfileBlueprint } from "@/lib/financialProfiles";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { rule } = useBudgetRule();
  const ruleLabel = budgetRuleLabel(rule);
  const devise = profile?.devise ?? "FCFA";
  const overview = useFinancialOverview();
  const { financialProfile } = useFinancialProfile();
  const blueprint = getFinancialProfileBlueprint(financialProfile?.profile_type);
  const { mois, score } = overview;
  const available = mois.revenus - mois.depenses;

  const stats = [
    {
      label: "Revenus du mois",
      value: formatMoney(mois.revenus, devise),
      icon: "ri-arrow-down-line",
      tone: "bg-primary-50 text-primary-700",
      hint:
        mois.revenusCount > 0
          ? `${mois.revenusCount} ${mois.revenusCount > 1 ? "entrées enregistrées" : "entrée enregistrée"}`
          : "Aucun revenu enregistré",
    },
    {
      label: "Dépenses du mois",
      value: formatMoney(mois.depenses, devise),
      icon: "ri-arrow-up-line",
      tone: "bg-accent-50 text-accent-700",
      hint:
        mois.depensesCount > 0
          ? `${mois.depensesCount} ${mois.depensesCount > 1 ? "dépenses enregistrées" : "dépense enregistrée"}`
          : "Aucune dépense enregistrée",
    },
    {
      label: blueprint?.availableLabel ?? "Épargne disponible",
      value: formatMoney(available, devise),
      icon: "ri-safe-2-line",
      tone: "bg-secondary-100 text-secondary-800",
      hint:
        mois.revenus > 0
          ? available >= 0
            ? "Revenus moins dépenses du mois"
            : "Vos dépenses dépassent vos revenus"
          : "Ajoutez vos revenus pour calculer",
    },
    {
      label: "Score financier",
      value: mois.revenus > 0 ? `${score.score} / 100` : "— / 100",
      icon: "ri-award-line",
      tone: "bg-primary-50 text-primary-700",
      hint: mois.revenus > 0 ? score.label : "Calculé dès votre premier revenu",
    },
  ];

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const profileFields = [profile?.prenom, profile?.nom, profile?.telephone, profile?.pays, profile?.devise];
  const filled = profileFields.filter((value) => Boolean(value && String(value).trim())).length;
  const completion = Math.round((filled / profileFields.length) * 100);

  const steps = [
    {
      title: "Choisissez votre profil financier",
      text: "Étudiant, salarié, freelance… pour personnaliser tout le tableau de bord.",
      done: Boolean(financialProfile),
      action: { label: "Choisir", to: "/app/profil-financier" },
    },
    {
      title: "Complétez votre profil financier",
      text: "Nom, téléphone et devise pour personnaliser tous les calculs.",
      done: completion >= 80,
      action: { label: "Compléter", to: "/app/profil" },
    },
    {
      title: "Ajoutez vos revenus",
      text: "Salaire, freelance ou business : la base de votre plan budgétaire.",
      done: mois.revenusCount > 0,
      action: { label: "Revenus", to: "/app/revenus" },
    },
    {
      title: "Enregistrez vos dépenses",
      text: "Pour identifier où part votre argent chaque mois.",
      done: mois.depensesCount > 0,
      action: { label: "Dépenses", to: "/app/depenses" },
    },
    {
      title: "Consultez votre budget intelligent",
      text: `Une répartition ${ruleLabel} calculée sur vos revenus.`,
      done: mois.revenus > 0 && mois.revenusCount > 0,
      action: { label: "Budget", to: "/app/budget" },
    },
  ];

  return (
    <div className="w-full animate-fade-up space-y-6">
      {overview.error && (
        <div className="rounded-lg border border-accent-300 bg-accent-50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <i className="ri-error-warning-line mt-0.5 text-base text-accent-800" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent-900">
                Certaines données n'ont pas pu être chargées
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-accent-800">
                {overview.error}
              </p>
              <button
                type="button"
                onClick={() => overview.reload()}
                className="mt-2 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
              >
                <i className="ri-refresh-line text-xs" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden rounded-lg bg-primary-950 px-5 py-7 md:px-8 md:py-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-accent-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent-300">
              {today}
            </p>
            <h1
              className="mt-2 text-2xl font-semibold leading-tight text-background-50 md:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Bonjour {getDisplayName(profile) || "et bienvenue"} 
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-background-50/70">
              Suivez vos revenus et vos dépenses, puis laissez FinBuilder AI calculer votre budget,
              votre capacité d'épargne et votre score financier.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Link
                to="/app/profil"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
              >
                <i className="ri-user-settings-line text-base" />
                Compléter mon profil
              </Link>
              <Link
                to="/app/rapports"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-50/25 bg-background-50/10 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-background-50/20"
              >
                <i className="ri-file-chart-line text-base" />
                Voir mes rapports
              </Link>
            </div>
          </div>

          <div className="w-full max-w-[260px] shrink-0 rounded-lg border border-background-50/10 bg-background-50/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-background-50/60">
                Profil complété
              </p>
              <span className="text-sm font-semibold text-accent-300">{completion}%</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-background-50/15">
              <div
                className="h-full rounded-full bg-accent-400 transition-all duration-700"
                style={{ width: `${Math.max(completion, 4)}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-background-50/60">
              Un profil complet améliore la précision des recommandations IA.
            </p>
          </div>
        </div>
      </section>

      {blueprint && <FinancialProfileFocus blueprint={blueprint} />}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-primary-200 md:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground-500">
                {stat.label}
              </p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${stat.tone}`}>
                <i className={`${stat.icon} text-base`} />
              </span>
            </div>
            <p
              className="mt-3 text-xl font-semibold text-foreground-950 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-[11px] text-foreground-400">{stat.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BudgetOverviewCard budget={overview.budget} epargne={mois.epargne} devise={devise} />
        <GoalsOverviewCard goals={overview.goals} devise={devise} />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonthlyTrendChart />
        <ExpenseDonutChart />
      </div>

      <ActiveProjectsCard />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground-950 md:text-base">
                Vos premiers pas
              </h2>
              <p className="mt-0.5 text-xs text-foreground-500">
                {steps.length} étapes pour activer votre coach financier.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700">
              {steps.filter((step) => step.done).length}/{steps.length}
            </span>
          </div>

          <ul className="mt-4 space-y-2">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="flex items-start gap-3 rounded-md border border-background-200 bg-background-50 px-3.5 py-3"
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    step.done
                      ? "bg-primary-500 text-background-50"
                      : "bg-background-100 text-foreground-500"
                  }`}
                >
                  {step.done ? <i className="ri-check-line text-xs" /> : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      step.done ? "text-foreground-500 line-through" : "text-foreground-900"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-foreground-500">{step.text}</p>
                </div>
                {step.action ? (
                  <Link
                    to={step.action.to}
                    className="shrink-0 whitespace-nowrap rounded-md border border-primary-300 bg-primary-50 px-2.5 py-1.5 text-[11px] font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                  >
                    {step.action.label}
                  </Link>
                ) : (
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-background-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground-400">
                    Prochaine étape
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
          <h2 className="text-sm font-semibold text-foreground-950 md:text-base">
            Accès rapide
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">
            Vos modules actifs, à portée de clic.
          </p>
          <ul className="mt-4 space-y-2">
            {[
              {
                to: "/app/assistant",
                icon: "ri-sparkling-line",
                title: "Assistant IA",
                text: "Dites ce que vous voulez accomplir : objectif puis projet.",
              },
              {
                to: "/app/logement",
                icon: "ri-home-5-line",
                title: "Conseiller logement",
                text: "Loyer soutenable et capacité d'emprunt chiffrées.",
              },
              {
                to: "/app/simulations",
                icon: "ri-git-branch-line",
                title: "Simulations",
                text: "Testez un changement avant de le décider.",
              },
              {
                to: "/app/rapports",
                icon: "ri-file-chart-line",
                title: "Rapports",
                text: "Synthèse mensuelle exportable en PDF.",
              },
              {
                to: "/app/education",
                icon: "ri-book-open-line",
                title: "Éducation financière",
                text: "Fiches courtes reliées à vos modules.",
              },
              {
                to: "/app/notifications",
                icon: "ri-notification-3-line",
                title: "Notifications",
                text: "Échéances, dépassements de budget et rappels d'épargne.",
              },
              {
                to: "/app/objectifs",
                icon: "ri-flag-2-line",
                title: "Objectifs",
                text: "Cibles, épargne mensuelle nécessaire et progression.",
              },
              {
                to: "/app/projets",
                icon: "ri-building-4-line",
                title: "Projets",
                text: "Enveloppe et répartition budgétaire par poste.",
              },
              {
                to: "/app/depenses",
                icon: "ri-arrow-up-line",
                title: "Dépenses",
                text: "Sorties par catégorie, recherche et répartition.",
              },
              {
                to: "/app/budget",
                icon: "ri-pie-chart-2-line",
                title: "Budget intelligent",
                text: `Répartition recommandée ${ruleLabel}.`,
              },
              {
                to: "/app/revenus",
                icon: "ri-arrow-down-line",
                title: "Revenus",
                text: "Salaires, freelance et revenus business.",
              },
              {
                to: "/app/profil",
                icon: "ri-user-settings-line",
                title: "Mon profil",
                text: "Informations, devise et photo de profil.",
              },
            ].map((module) => (
              <li key={module.to}>
                <Link
                  to={module.to}
                  className="flex items-start gap-2.5 rounded-md border border-transparent px-1.5 py-1.5 transition-colors hover:border-background-200 hover:bg-background-100/70"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-800">
                    <i className={`${module.icon} text-sm`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground-900">{module.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">
                      {module.text}
                    </p>
                  </div>
                  <i className="ri-arrow-right-s-line mt-1 text-sm text-foreground-400" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-accent-200 bg-accent-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-500 text-foreground-950">
            <i className={`${overview.advice.icon} text-base`} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-900">
              {overview.advice.title}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-accent-800">
              {overview.advice.text}
            </p>
            <p className="mt-1.5 text-[11px] font-medium text-accent-900/80">
              {mois.revenus > 0
                ? `Score ${score.score}/100 (${score.label}) · ${overview.alertes} alerte${overview.alertes > 1 ? "s" : ""} active${overview.alertes > 1 ? "s" : ""}`
                : "Commencez par vos revenus et vos dépenses du mois."}
            </p>
          </div>
        </div>
        <Link
          to={overview.advice.to}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-foreground-900"
        >
          {overview.advice.actionLabel}
          <i className="ri-arrow-right-line text-xs" />
        </Link>
      </section>
    </div>
  );
}