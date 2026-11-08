import { formatMoney, formatPercent } from "@/lib/finance";

type IncomeStatsProps = {
  devise: string;
  monthTotal: number;
  previousTotal: number;
  evolution: number | null;
  count: number;
  average: number;
};

export default function IncomeStats({
  devise,
  monthTotal,
  previousTotal,
  evolution,
  count,
  average,
}: IncomeStatsProps) {
  const positive = (evolution ?? 0) >= 0;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="relative overflow-hidden rounded-lg bg-primary-950 p-4 md:p-5">
        <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary-500/30 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-background-50/60">
              Revenus du mois
            </p>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background-50/10 text-accent-300">
              <i className="ri-arrow-down-line text-base" />
            </span>
          </div>
          <p
            className="mt-3 text-xl font-semibold text-background-50 md:text-2xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {formatMoney(monthTotal, devise)}
          </p>
          <p className="mt-1 text-[11px] text-background-50/55">
            {monthTotal > 0 ? "Total encaissé ce mois-ci" : "Aucun revenu ce mois-ci"}
          </p>
        </div>
      </article>

      <article className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground-500">
            Évolution
          </p>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
              positive ? "bg-primary-50 text-primary-700" : "bg-accent-50 text-accent-700"
            }`}
          >
            <i className={positive ? "ri-arrow-up-line text-base" : "ri-arrow-down-line text-base"} />
          </span>
        </div>
        <p
          className={`mt-3 text-xl font-semibold md:text-2xl ${
            positive ? "text-primary-700" : "text-accent-700"
          }`}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {evolution === null ? "—" : formatPercent(evolution)}
        </p>
        <p className="mt-1 text-[11px] text-foreground-400">
          {previousTotal > 0
            ? `vs ${formatMoney(previousTotal, devise)} le mois dernier`
            : "Pas encore de comparaison"}
        </p>
      </article>

      <article className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground-500">
            Entrées enregistrées
          </p>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-800">
            <i className="ri-list-check-2 text-base" />
          </span>
        </div>
        <p
          className="mt-3 text-xl font-semibold text-foreground-950 md:text-2xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {count}
        </p>
        <p className="mt-1 text-[11px] text-foreground-400">
          {count > 1 ? "revenus dans votre historique" : "revenu dans votre historique"}
        </p>
      </article>

      <article className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground-500">
            Revenu moyen
          </p>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-700">
            <i className="ri-scales-3-line text-base" />
          </span>
        </div>
        <p
          className="mt-3 text-xl font-semibold text-foreground-950 md:text-2xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {formatMoney(average, devise)}
        </p>
        <p className="mt-1 text-[11px] text-foreground-400">Moyenne par entrée de revenu</p>
      </article>
    </section>
  );
}