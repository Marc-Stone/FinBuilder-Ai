import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/finance";
import type { Fiche } from "@/lib/education";
import type { BudgetDiagnosis, NotificationFeed } from "@/lib/notifications";

type BudgetWeaknessCardProps = {
  diagnosis: BudgetDiagnosis;
  feed: NotificationFeed;
  fiches: Fiche[];
  devise: string;
};

const toneClasses: Record<BudgetDiagnosis["tone"], string> = {
  risk: "border-accent-300 bg-accent-50",
  watch: "border-secondary-200 bg-secondary-50",
  good: "border-primary-200 bg-primary-50",
};

const toneIcon: Record<BudgetDiagnosis["tone"], string> = {
  risk: "bg-accent-500 text-foreground-950",
  watch: "bg-secondary-500 text-background-50",
  good: "bg-primary-500 text-background-50",
};

export default function BudgetWeaknessCard({
  diagnosis,
  feed,
  fiches,
  devise,
}: BudgetWeaknessCardProps) {
  return (
    <section className="space-y-3">
      <div className={`rounded-lg border p-4 md:p-5 ${toneClasses[diagnosis.tone]}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
              Point faible détecté
            </p>
            <h2
              className="mt-1 text-sm font-semibold leading-snug text-foreground-950 md:text-base"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {diagnosis.label}
            </h2>
          </div>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${toneIcon[diagnosis.tone]}`}
          >
            <i className={`${diagnosis.icon} text-base`} />
          </span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-foreground-600">{diagnosis.summary}</p>

        <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-background-300 bg-background-50/80 px-2.5 py-1 text-[10px] font-semibold text-foreground-700">
          <i className="ri-scales-3-line text-[10px]" />
          {diagnosis.metric}
        </span>

        {feed.reference > 0 && (
          <ul className="mt-3.5 space-y-2">
            {feed.groups.map((group) => {
              const ratio =
                group.recommande > 0 ? Math.min((group.reel / group.recommande) * 100, 140) : 0;
              const over = group.recommande > 0 && group.reel > group.recommande;
              return (
                <li key={group.meta.key}>
                  <div className="flex items-center justify-between gap-2 text-[10px] font-semibold">
                    <span className="truncate text-foreground-700">{group.meta.label}</span>
                    <span className={over ? "shrink-0 text-accent-900" : "shrink-0 text-foreground-500"}>
                      {formatMoney(group.reel, devise)} / {formatMoney(group.recommande, devise)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        over ? "bg-accent-500" : group.meta.bar
                      }`}
                      style={{ width: `${Math.max(ratio, group.reel > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-3 text-[10px] leading-relaxed text-foreground-400">
          {feed.monthsUsed > 1
            ? `Référence : moyenne de ${feed.monthsUsed} mois de revenus.`
            : "Référence : revenus enregistrés les plus récents."}
        </p>
      </div>

      <div className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground-950">2 fiches pour corriger ce point</h2>
            <p className="mt-0.5 text-xs leading-relaxed text-foreground-500">
              Sélectionnées automatiquement selon votre budget du mois.
            </p>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-900">
            <i className="ri-book-open-line text-base" />
          </span>
        </div>

        <ul className="mt-3.5 space-y-2">
          {fiches.map((fiche) => (
            <li key={fiche.id}>
              <Link
                to={`/app/education?fiche=${fiche.id}`}
                className="group flex items-start gap-2.5 rounded-md border border-background-200 bg-background-50 px-3 py-2.5 transition-colors hover:border-primary-300 hover:bg-primary-50/40"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                  <i className={`${fiche.icon} text-sm`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold leading-snug text-foreground-900">
                    {fiche.titre}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-foreground-400">
                    <i className="ri-time-line text-[10px]" />
                    {fiche.minutes} min
                    <span className="h-1 w-1 rounded-full bg-background-300" />
                    {fiche.categorie}
                  </span>
                </span>
                <i className="ri-arrow-right-s-line mt-1 text-sm text-foreground-400 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/app/education"
          className="mt-3 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-primary-700 transition-colors hover:text-primary-800"
        >
          Toute la bibliothèque
          <i className="ri-arrow-right-line text-[11px]" />
        </Link>
      </div>
    </section>
  );
}