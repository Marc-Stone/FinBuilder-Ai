import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/finance";
import { buildProjection, type SimulationResult } from "@/lib/simulations";

type ResultProps = {
  result: SimulationResult;
  devise: string;
};

function useTokenColors() {
  const [colors, setColors] = useState({
    primary: "oklch(0.45 0.09 160)",
    accent: "oklch(0.7 0.13 75)",
    grid: "oklch(0.92 0.01 100)",
  });

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) => {
      const raw = styles.getPropertyValue(name).trim();
      return raw ? `oklch(${raw})` : fallback;
    };
    setColors({
      primary: read("--primary-500", "oklch(0.45 0.09 160)"),
      accent: read("--accent-500", "oklch(0.7 0.13 75)"),
      grid: read("--background-200", "oklch(0.92 0.01 100)"),
    });
  }, []);

  return colors;
}

const compact = (value: number) =>
  new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export default function SimulationResultPanel({ result, devise }: ResultProps) {
  const colors = useTokenColors();

  const projection = useMemo(
    () => buildProjection(result, result.horizonMois),
    [result],
  );

  const horizonLabel =
    result.horizonMois < 12
      ? `${result.horizonMois} mois`
      : `${Math.round((result.horizonMois / 12) * 10) / 10} an${result.horizonMois >= 24 ? "s" : ""}`;

  const rows = [
    {
      label: "Revenus mensuels",
      actuel: result.revenuActuel,
      scenario: result.revenuFinal,
      positiveIsGood: true,
    },
    {
      label: "Dépenses mensuelles",
      actuel: result.depensesActuelles,
      scenario: result.depensesFinales,
      positiveIsGood: false,
    },
    {
      label: "Capacité d'épargne",
      actuel: result.capaciteActuelle,
      scenario: result.capaciteFinale,
      positiveIsGood: true,
    },
    {
      label: `Capital sur ${horizonLabel}`,
      actuel: result.capitalActuel,
      scenario: result.capitalScenario,
      positiveIsGood: true,
    },
  ];

  return (
    <div className="space-y-3">
      <section className="relative overflow-hidden rounded-lg bg-primary-950 p-5 md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-accent-500/20 blur-3xl" />

        <div className="relative z-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-300">
            Résultat du scénario · {horizonLabel}
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
            <p
              className="text-2xl font-semibold leading-none text-background-50 md:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {formatMoney(result.capaciteFinale, devise)}
            </p>
            <p className="text-xs font-medium text-background-50/60">d'épargne possible par mois</p>
          </div>

          <div
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              result.gainMensuel > 0
                ? "bg-primary-500 text-background-50"
                : result.gainMensuel < 0
                  ? "bg-accent-500 text-foreground-950"
                  : "bg-background-50/15 text-background-50"
            }`}
          >
            <i className={result.gainMensuel >= 0 ? "ri-arrow-up-line" : "ri-arrow-down-line"} />
            {result.gainMensuel === 0
              ? "Aucun changement par rapport à aujourd'hui"
              : `${result.gainMensuel > 0 ? "+" : ""}${formatMoney(result.gainMensuel, devise)} par mois`}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="min-w-0 rounded-md border border-background-50/10 bg-background-50/5 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-background-50/55">
                Capital à l'horizon
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-background-50">
                {formatMoney(result.capitalScenario, devise)}
              </p>
            </div>
            <div className="min-w-0 rounded-md border border-background-50/10 bg-background-50/5 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-background-50/55">
                Gain cumulé
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-accent-200">
                {result.ecartCapital >= 0 ? "+" : ""}
                {formatMoney(result.ecartCapital, devise)}
              </p>
            </div>
            <div className="min-w-0 rounded-md border border-background-50/10 bg-background-50/5 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-background-50/55">
                Taux d'épargne
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-background-50">
                {Math.round(result.tauxEpargneActuel)} % → {Math.round(result.tauxEpargneFinal)} %
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2
              className="text-sm font-semibold text-foreground-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Capital accumulé : maintenant vs scénario
            </h2>
            <p className="mt-0.5 text-xs text-foreground-500">
              Épargne cumulée si vous tenez le rythme jusqu'au bout.
            </p>
          </div>
          <span className="shrink-0 text-[11px] font-medium text-foreground-400">
            Sans intérêts ni placement
          </span>
        </div>

        <div className="mt-3 h-[220px] w-full md:h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projection} margin={{ top: 8, right: 6, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="simActuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={colors.accent} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="simScenario" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.primary} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={colors.primary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "oklch(0.55 0.01 100)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => compact(Number(value))}
                tick={{ fontSize: 10, fill: "oklch(0.55 0.01 100)" }}
                width={52}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e7e4dd",
                  background: "#ffffff",
                  fontSize: 12,
                  padding: "8px 10px",
                }}
                labelStyle={{ fontSize: 11, color: "#6b6b63", marginBottom: 2 }}
                formatter={(value, name) => [
                  formatMoney(Number(value), devise),
                  name === "actuel" ? "Sans changement" : "Avec scénario",
                ]}
              />
              <Legend
                verticalAlign="top"
                height={26}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ fontSize: 11, color: "#6b6b63" }}>
                    {value === "actuel" ? "Sans changement" : "Avec scénario"}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="actuel"
                stroke={colors.accent}
                strokeWidth={2}
                fill="url(#simActuel)"
              />
              <Area
                type="monotone"
                dataKey="scenario"
                stroke={colors.primary}
                strokeWidth={2}
                fill="url(#simScenario)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <h2
          className="text-sm font-semibold text-foreground-950"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Comparaison ligne par ligne
        </h2>
        <p className="mt-0.5 text-xs text-foreground-500">
          Ce qui change concrètement dans votre budget mensuel.
        </p>

        <ul className="mt-3 divide-y divide-background-200">
          {rows.map((row) => {
            const delta = row.scenario - row.actuel;
            const improved = row.positiveIsGood ? delta > 0 : delta < 0;
            const neutral = Math.round(delta) === 0;

            return (
              <li key={row.label} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground-700">
                  {row.label}
                </span>
                <span className="shrink-0 whitespace-nowrap text-[11px] text-foreground-500">
                  {formatMoney(row.actuel, devise)}
                </span>
                <i className="ri-arrow-right-line shrink-0 text-[11px] text-foreground-300" />
                <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-foreground-950">
                  {formatMoney(row.scenario, devise)}
                </span>
                <span
                  className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    neutral
                      ? "bg-background-100 text-foreground-500"
                      : improved
                        ? "bg-primary-50 text-primary-800"
                        : "bg-accent-50 text-accent-900"
                  }`}
                >
                  {neutral ? "=" : `${delta > 0 ? "+" : ""}${formatMoney(delta, devise)}`}
                </span>
              </li>
            );
          })}
        </ul>

        {result.capaciteFinale < 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-accent-300 bg-accent-50 px-3 py-2.5">
            <i className="ri-error-warning-line mt-0.5 text-sm text-accent-800" />
            <p className="min-w-0 text-[11px] leading-relaxed text-accent-900">
              Avec ce scénario, vos dépenses dépassent encore vos revenus de{" "}
              <strong className="font-semibold">{formatMoney(Math.abs(result.capaciteFinale), devise)}</strong>{" "}
              par mois. Réduisez davantage les dépenses avant de compter sur une épargne.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}