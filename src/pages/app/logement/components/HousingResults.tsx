import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/finance";
import { buildHousingAdvice, type HousingResult } from "@/lib/housing";

type HousingResultsProps = {
  result: HousingResult;
  devise: string;
};

const toneClasses: Record<string, { wrap: string; badge: string; text: string }> = {
  primary: { wrap: "bg-primary-50 border-primary-200", badge: "bg-primary-500 text-background-50", text: "text-primary-900" },
  accent: { wrap: "bg-accent-50 border-accent-200", badge: "bg-accent-500 text-foreground-950", text: "text-accent-900" },
  secondary: { wrap: "bg-secondary-100 border-secondary-200", badge: "bg-secondary-500 text-background-50", text: "text-secondary-900" },
};

export default function HousingResults({ result, devise }: HousingResultsProps) {
  const advice = buildHousingAdvice(result, devise);
  const ratio = Math.max(Math.min(result.ratioActuel, 50), 0);
  const barWidth = (ratio / 50) * 100;

  const verdictTone =
    result.verdict === "confort"
      ? { bg: "bg-primary-50", border: "border-primary-200", text: "text-primary-900", icon: "ri-checkbox-circle-line", iconBg: "bg-primary-500 text-background-50" }
      : result.verdict === "limite"
        ? { bg: "bg-secondary-100", border: "border-secondary-200", text: "text-secondary-900", icon: "ri-error-warning-line", iconBg: "bg-secondary-500 text-background-50" }
        : { bg: "bg-accent-50", border: "border-accent-200", text: "text-accent-900", icon: "ri-alert-line", iconBg: "bg-accent-500 text-foreground-950" };

  return (
    <div className="space-y-3">
      <section className="relative overflow-hidden rounded-lg bg-primary-950 p-5 md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-accent-500/20 blur-3xl" />

        <div className="relative z-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-300">
            Capacité d'emprunt estimée
          </p>
          <p
            className="mt-2 text-2xl font-semibold leading-none text-background-50 md:text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {formatMoney(result.capitalEmpruntable, devise)}
          </p>
          <p className="mt-1.5 text-xs text-background-50/60">
            {result.revenu > 0
              ? `Soit ${Math.round((result.mensualiteMax / Math.max(result.revenu, 1)) * 100)} % de vos revenus nets, sur la durée choisie.`
              : "Renseignez vos revenus pour affiner l'estimation."}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="min-w-0 rounded-md border border-background-50/10 bg-background-50/5 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-background-50/55">
                Budget d'achat
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-background-50">
                {formatMoney(result.prixMax, devise)}
              </p>
              <p className="mt-0.5 text-[10px] text-background-50/50">hors frais d'acquisition</p>
            </div>
            <div className="min-w-0 rounded-md border border-background-50/10 bg-background-50/5 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-background-50/55">
                Loyer soutenable
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-accent-200">
                {formatMoney(result.loyerRecommande, devise)}
              </p>
              <p className="mt-0.5 text-[10px] text-background-50/50">30 % des revenus, charges comprises</p>
            </div>
            <div className="min-w-0 rounded-md border border-background-50/10 bg-background-50/5 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-background-50/55">
                Frais estimés
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-background-50">
                {formatMoney(result.fraisAcquisition, devise)}
              </p>
              <p className="mt-0.5 text-[10px] text-background-50/50">7 % du budget</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2
              className="text-sm font-semibold text-foreground-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Poids du logement actuel
            </h2>
            <p className="mt-0.5 text-xs text-foreground-500">
              {formatMoney(result.loyerActuelTotal, devise)} par mois, soit{" "}
              {result.revenu > 0 ? `${Math.round(result.ratioActuel)} %` : "—"} de vos revenus.
            </p>
          </div>
          <span
            className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${verdictTone.bg} ${verdictTone.border} ${verdictTone.text}`}
          >
            {result.verdictLabel}
          </span>
        </div>

        <div className="mt-4">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-background-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                result.verdict === "confort"
                  ? "bg-primary-500"
                  : result.verdict === "limite"
                    ? "bg-secondary-500"
                    : "bg-accent-500"
              }`}
              style={{ width: `${Math.max(barWidth, result.ratioActuel > 0 ? 2 : 0)}%` }}
            />
            <span className="absolute inset-y-0 left-[60%] w-px bg-background-50/80" />
            <span className="absolute inset-y-0 left-[80%] w-px bg-background-50/80" />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-foreground-400">
            <span>0 %</span>
            <span className="text-foreground-600">30 % recommandé</span>
            <span>40 % plafond</span>
            <span>50 %</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div className="min-w-0 rounded-md bg-background-100 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
              Reste à vivre aujourd'hui
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground-950">
              {formatMoney(result.resteAVivre, devise)}
            </p>
          </div>
          <div
            className={`min-w-0 rounded-md px-3 py-2.5 ${
              result.resteAVivreApres >= 0 ? "bg-primary-50" : "bg-accent-50"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
              Reste à vivre après emprunt
            </p>
            <p
              className={`mt-0.5 truncate text-sm font-semibold ${
                result.resteAVivreApres >= 0 ? "text-primary-800" : "text-accent-900"
              }`}
            >
              {formatMoney(result.resteAVivreApres, devise)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <h2
          className="text-sm font-semibold text-foreground-950"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Votre bien à {formatMoney(result.prixCible, devise)}
        </h2>

        {result.mensualiteCible <= 0 ? (
          <div className="mt-3 rounded-md border border-dashed border-background-300 bg-background-50 px-4 py-8 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <i className="ri-building-2-line text-lg" />
            </span>
            <p className="mt-2 text-sm font-semibold text-foreground-950">
              Indiquez un prix de bien visé
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-foreground-500">
              Saisissez le prix d'un logement dans le panneau de gauche pour obtenir la mensualité,
              le coût total et le poids sur votre budget.
            </p>
          </div>
        ) : (
          <>
            <ul className="mt-3 divide-y divide-background-200">
              <li className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-xs font-medium text-foreground-600">Mensualité du crédit</span>
                <span className="text-xs font-semibold text-foreground-950">
                  {formatMoney(result.mensualiteCible, devise)}
                </span>
              </li>
              <li className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-xs font-medium text-foreground-600">Poids sur vos revenus</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    result.ratioCible <= 33
                      ? "bg-primary-50 text-primary-800"
                      : "bg-accent-50 text-accent-900"
                  }`}
                >
                  {Math.round(result.ratioCible)} %
                </span>
              </li>
              <li className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-xs font-medium text-foreground-600">Intérêts totaux</span>
                <span className="text-xs font-semibold text-accent-900">
                  {formatMoney(result.interetsCible, devise)}
                </span>
              </li>
              <li className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-xs font-medium text-foreground-600">Coût total du crédit</span>
                <span className="text-xs font-semibold text-foreground-950">
                  {formatMoney(result.coutTotalCible, devise)}
                </span>
              </li>
            </ul>

            <p className="mt-2.5 flex items-start gap-2 rounded-md bg-background-100 px-3 py-2.5 text-[11px] leading-relaxed text-foreground-600">
              <i
                className={`mt-0.5 text-sm ${
                  result.ratioCible <= 33 ? "ri-checkbox-circle-line text-primary-600" : "ri-error-warning-line text-accent-700"
                }`}
              />
              <span className="min-w-0">
                {result.ratioCible <= 33
                  ? "Cette mensualité reste dans la zone acceptée par la plupart des prêteurs."
                  : "Cette mensualité dépasse 33 % de vos revenus : le dossier risque d'être refusé, ou de peser sur votre épargne."}
              </span>
            </p>
          </>
        )}
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <h2
          className="text-sm font-semibold text-foreground-950"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Les conseils FinBuilder
        </h2>
        <ul className="mt-3 space-y-2">
          {advice.map((item) => {
            const tone = toneClasses[item.tone] ?? toneClasses.secondary;
            return (
              <li
                key={item.title}
                className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 ${tone.wrap}`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${tone.badge}`}>
                  <i className={`${item.icon} text-sm`} />
                </span>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${tone.text}`}>{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-600">{item.text}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/app/projets"
            className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-building-4-line text-sm" />
            Créer un projet logement
          </Link>
          <Link
            to="/app/simulations"
            className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3.5 py-2 text-xs font-semibold text-foreground-800 transition-colors hover:border-primary-300 hover:text-primary-800"
          >
            <i className="ri-git-branch-line text-sm" />
            Simuler un changement
          </Link>
        </div>
      </section>
    </div>
  );
}