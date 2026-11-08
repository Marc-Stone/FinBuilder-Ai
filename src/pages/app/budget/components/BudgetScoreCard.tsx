import { formatMoney } from "@/lib/finance";
import type { ScoreResult } from "@/lib/budget";

type BudgetScoreCardProps = {
  score: ScoreResult;
  devise: string;
  revenu: number;
  depenses: number;
  epargne: number;
};

export default function BudgetScoreCard({
  score,
  devise,
  revenu,
  depenses,
  epargne,
}: BudgetScoreCardProps) {
  const toneRing =
    score.tone === "good" ? "text-primary-700" : score.tone === "watch" ? "text-accent-700" : "text-accent-800";
  const toneBar =
    score.tone === "good" ? "bg-primary-600" : score.tone === "watch" ? "bg-accent-500" : "bg-accent-600";
  const toneBadge =
    score.tone === "good"
      ? "border-primary-200 bg-primary-50 text-primary-800"
      : score.tone === "watch"
        ? "border-accent-200 bg-accent-50 text-accent-900"
        : "border-accent-300 bg-accent-100 text-accent-900";

  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Santé financière estimée
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">
            Calculée sur votre revenu de référence et vos dépenses du mois.
          </p>
        </div>
        <span
          className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${toneBadge}`}
        >
          {score.label}
        </span>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <p
          className={`text-4xl font-semibold leading-none ${toneRing}`}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {score.score}
        </p>
        <p className="pb-1 text-sm font-medium text-foreground-400">/ 100</p>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background-200">
        <div
          className={`h-full rounded-full ${toneBar} transition-all duration-700`}
          style={{ width: `${Math.max(score.score, 3)}%` }}
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-foreground-600">{score.commentary}</p>

      <dl className="mt-4 space-y-2 border-t border-background-200 pt-3">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-xs text-foreground-500">Revenu de référence</dt>
          <dd className="text-xs font-semibold text-foreground-950">{formatMoney(revenu, devise)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-xs text-foreground-500">Dépenses du mois</dt>
          <dd className="text-xs font-semibold text-foreground-950">{formatMoney(depenses, devise)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-xs text-foreground-500">Épargne enregistrée</dt>
          <dd
            className={`text-xs font-semibold ${
              epargne > 0 ? "text-primary-700" : "text-foreground-500"
            }`}
          >
            {formatMoney(epargne, devise)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-xs text-foreground-500">Taux d'épargne</dt>
          <dd
            className={`text-xs font-semibold ${
              score.savingsRate >= 0.2
                ? "text-primary-700"
                : score.savingsRate >= 0
                  ? "text-accent-700"
                  : "text-accent-800"
            }`}
          >
            {Math.round(score.savingsRate * 100)} %
          </dd>
        </div>
      </dl>
    </section>
  );
}