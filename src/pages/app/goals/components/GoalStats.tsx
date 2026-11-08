import { formatMoney } from "@/lib/finance";

type GoalStatsProps = {
  devise: string;
  objectifTotal: number;
  epargneTotale: number;
  progression: number;
  enCours: number;
  atteints: number;
  epargneMensuelle: number;
  capacite: number;
  capacityEstimated: boolean;
};

export default function GoalStats({
  devise,
  objectifTotal,
  epargneTotale,
  progression,
  enCours,
  atteints,
  epargneMensuelle,
  capacite,
  capacityEstimated,
}: GoalStatsProps) {
  const reste = Math.max(objectifTotal - epargneTotale, 0);
  const couverture = epargneMensuelle > 0 ? Math.round((capacite / epargneMensuelle) * 100) : 0;

  const cards = [
    {
      label: "Objectifs suivis",
      value: `${enCours + atteints}`,
      icon: "ri-flag-2-line",
      tone: "bg-primary-50 text-primary-700",
      hint:
        atteints > 0
          ? `${atteints} ${atteints > 1 ? "objectifs atteints" : "objectif atteint"}`
          : "Aucun objectif atteint pour le moment",
    },
    {
      label: "Total épargné",
      value: formatMoney(epargneTotale, devise),
      icon: "ri-safe-2-line",
      tone: "bg-secondary-100 text-secondary-800",
      hint: `sur ${formatMoney(objectifTotal, devise)} visés`,
    },
    {
      label: "Épargne mensuelle nécessaire",
      value: formatMoney(epargneMensuelle, devise),
      icon: "ri-calendar-check-line",
      tone: "bg-accent-50 text-accent-700",
      hint:
        epargneMensuelle > 0
          ? "Pour tenir toutes vos échéances"
          : "Aucune échéance à financer",
    },
    {
      label: "Capacité d'épargne",
      value: formatMoney(capacite, devise),
      icon: "ri-line-chart-line",
      tone: "bg-primary-100 text-primary-800",
      hint: capacityEstimated
        ? "Moyenne de vos 3 derniers mois"
        : "Ajoutez revenus et dépenses pour l'estimer",
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
              Progression globale de vos objectifs
            </h2>
            <p className="mt-0.5 text-xs text-foreground-500">
              {objectifTotal > 0
                ? `Il reste ${formatMoney(reste, devise)} à financer.`
                : "Créez votre premier objectif pour lancer votre plan d'épargne."}
            </p>
          </div>
          <div className="flex shrink-0 items-baseline gap-1.5">
            <span
              className="text-2xl font-semibold text-primary-700"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {Math.round(progression)}%
            </span>
            <span className="text-[11px] font-medium text-foreground-400">financé</span>
          </div>
        </div>

        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-background-200">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-700"
            style={{ width: `${Math.max(progression, objectifTotal > 0 ? 2 : 0)}%` }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-foreground-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            {formatMoney(epargneTotale, devise)} épargnés
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-background-300" />
            {formatMoney(objectifTotal, devise)} visés
          </span>
          {epargneMensuelle > 0 && capacite > 0 && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-semibold ${
                couverture >= 100
                  ? "border-primary-200 bg-primary-50 text-primary-800"
                  : "border-accent-300 bg-accent-50 text-accent-900"
              }`}
            >
              <i className="ri-pulse-line text-[11px]" />
              {couverture >= 100
                ? "Vos échéances sont couvertes par votre capacité d'épargne"
                : `Votre capacité couvre ${couverture}% de l'effort demandé`}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}