import { formatMoney } from "@/lib/finance";

type ProjectStatsProps = {
  devise: string;
  projets: number;
  enCours: number;
  termines: number;
  budgetTotal: number;
  alloue: number;
  depense: number;
  reste: number;
};

export default function ProjectStats({
  devise,
  projets,
  enCours,
  termines,
  budgetTotal,
  alloue,
  depense,
  reste,
}: ProjectStatsProps) {
  const nonAlloue = budgetTotal - alloue;
  const progression = alloue > 0 ? Math.min((depense / alloue) * 100, 100) : 0;
  const couverture = budgetTotal > 0 ? Math.min((alloue / budgetTotal) * 100, 100) : 0;

  const cards = [
    {
      label: "Projets planifiés",
      value: `${projets}`,
      icon: "ri-building-4-line",
      tone: "bg-primary-50 text-primary-700",
      hint:
        projets === 0
          ? "Créez votre premier projet"
          : `${enCours} en cours · ${termines} ${termines > 1 ? "terminés" : "terminé"}`,
    },
    {
      label: "Enveloppe globale",
      value: formatMoney(budgetTotal, devise),
      icon: "ri-wallet-3-line",
      tone: "bg-secondary-100 text-secondary-800",
      hint: "Somme des budgets déclarés",
    },
    {
      label: "Alloué par poste",
      value: formatMoney(alloue, devise),
      icon: "ri-list-check-2",
      tone: "bg-primary-100 text-primary-800",
      hint:
        budgetTotal > 0
          ? `${Math.round(couverture)}% de l'enveloppe répartie`
          : "Aucun budget déclaré",
    },
    {
      label: "Déjà dépensé",
      value: formatMoney(depense, devise),
      icon: "ri-arrow-up-line",
      tone: "bg-accent-50 text-accent-700",
      hint: `${Math.round(progression)}% des postes consommés`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-primary-200 md:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground-500">
                {card.label}
              </p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${card.tone}`}>
                <i className={`${card.icon} text-base`} />
              </span>
            </div>
            <p
              className="mt-3 truncate text-xl font-semibold text-foreground-950 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {card.value}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-foreground-400">{card.hint}</p>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2
              className="text-sm font-semibold text-foreground-950 md:text-base"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              État de vos enveloppes budgétaires
            </h2>
            <p className="mt-0.5 text-xs text-foreground-500">
              {budgetTotal > 0
                ? nonAlloue >= 0
                  ? `${formatMoney(nonAlloue, devise)} de votre enveloppe restent à répartir entre les postes.`
                  : `Vous avez réparti ${formatMoney(Math.abs(nonAlloue), devise)} de plus que votre enveloppe.`
                : "Déclarez un budget projet pour suivre sa répartition par poste."}
            </p>
          </div>
          <div className="flex shrink-0 items-baseline gap-1.5">
            <span
              className="text-2xl font-semibold text-primary-700"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {Math.round(couverture)}%
            </span>
            <span className="text-[11px] font-medium text-foreground-400">alloué</span>
          </div>
        </div>

        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-background-200">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-700"
            style={{ width: `${Math.max(couverture, budgetTotal > 0 ? 2 : 0)}%` }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-foreground-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            {formatMoney(alloue, devise)} répartis
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-background-300" />
            {formatMoney(budgetTotal, devise)} d'enveloppe
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent-500" />
            {formatMoney(reste, devise)} restent à financer
          </span>
        </div>
      </section>
    </div>
  );
}