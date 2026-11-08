import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/finance";
import type { NotificationFeed } from "@/lib/notifications";

type NotificationSummaryProps = {
  feed: NotificationFeed;
  devise: string;
};

export default function NotificationSummary({ feed, devise }: NotificationSummaryProps) {
  const budgetAlerts = feed.notifications.filter((item) => item.category === "budget").length;
  const goalAlerts = feed.notifications.filter((item) => item.category === "objectif").length;
  const savingsProgress =
    feed.savingsTarget > 0 ? Math.min((feed.savings / feed.savingsTarget) * 100, 100) : 0;

  const tiles = [
    {
      label: "À traiter en priorité",
      value: `${feed.counts.urgent}`,
      hint: feed.counts.urgent > 0 ? "Action recommandée cette semaine" : "Rien d'urgent, tout est à jour",
      icon: "ri-alarm-warning-line",
      tone: feed.counts.urgent > 0 ? "bg-accent-100 text-accent-900" : "bg-primary-50 text-primary-700",
    },
    {
      label: "Alertes budget",
      value: `${budgetAlerts}`,
      hint: `${formatMoney(feed.spending, devise)} dépensés ce mois-ci`,
      icon: "ri-pie-chart-2-line",
      tone: "bg-secondary-100 text-secondary-800",
    },
    {
      label: "Échéances d'objectifs",
      value: `${goalAlerts}`,
      hint:
        goalAlerts > 0
          ? "Rappels générés depuis vos dates cibles"
          : "Aucune échéance dans les 6 prochains mois",
      icon: "ri-flag-2-line",
      tone: "bg-primary-50 text-primary-700",
    },
    {
      label: "Épargne du mois",
      value: `${Math.round(savingsProgress)} %`,
      hint: `${formatMoney(feed.savings, devise)} sur ${formatMoney(feed.savingsTarget, devise)}`,
      icon: "ri-safe-2-line",
      tone: "bg-secondary-50 text-secondary-800",
    },
  ];

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <article
            key={tile.label}
            className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground-500">
                {tile.label}
              </p>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${tile.tone}`}
              >
                <i className={`${tile.icon} text-base`} />
              </span>
            </div>
            <p
              className="mt-3 text-xl font-semibold text-foreground-950 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {tile.value}
            </p>
            <p className="mt-1 text-[11px] text-foreground-400">{tile.hint}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-background-200 bg-background-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-foreground-800">Progression de l'épargne mensuelle</p>
            <span className="shrink-0 text-[11px] font-semibold text-foreground-600">
              {formatMoney(feed.savings, devise)} / {formatMoney(feed.savingsTarget, devise)}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                savingsProgress >= 100 ? "bg-primary-500" : "bg-accent-500"
              }`}
              style={{ width: `${Math.max(savingsProgress, feed.savings > 0 ? 3 : 0)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-foreground-500">
            {feed.savingsTarget <= 0
              ? "Ajoutez vos revenus pour calculer la cible de 20 %."
              : feed.savingsGap > 0
                ? `Il reste ${formatMoney(feed.savingsGap, devise)} pour atteindre la cible de 20 % de vos revenus.`
                : "Cible atteinte : affectez cette épargne à un objectif concret."}
          </p>
        </div>
        <Link
          to="/app/objectifs"
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
        >
          <i className="ri-flag-2-line text-xs" />
          Mes objectifs
        </Link>
      </div>
    </section>
  );
}