import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/finance";
import type { TrendPoint } from "@/lib/reports";

type ReportTrendChartProps = {
  trends: TrendPoint[];
  devise: string;
};

function useTokenColors() {
  const [colors, setColors] = useState({
    primary: "oklch(0.62 0.16 152)",
    accent: "oklch(0.772 0.163 72)",
    grid: "oklch(0.94 0.01 150)",
  });

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) => {
      const raw = styles.getPropertyValue(name).trim();
      return raw ? `oklch(${raw})` : fallback;
    };
    setColors({
      primary: read("--primary-500", "oklch(0.62 0.16 152)"),
      accent: read("--accent-500", "oklch(0.772 0.163 72)"),
      grid: read("--background-200", "oklch(0.94 0.01 150)"),
    });
  }, []);

  return colors;
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export default function ReportTrendChart({ trends, devise }: ReportTrendChartProps) {
  const colors = useTokenColors();
  const isEmpty = trends.every((point) => point.revenus === 0 && point.depenses === 0);

  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Six derniers mois
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">
            Le mois analysé est le dernier de la série.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-foreground-600">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colors.primary }} />
            Revenus
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colors.accent }} />
            Dépenses
          </span>
        </div>
      </div>

      {isEmpty ? (
        <div className="mt-4 rounded-md border border-dashed border-background-300 px-4 py-10 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <i className="ri-bar-chart-grouped-line text-lg" />
          </span>
          <p className="mt-2.5 text-sm font-semibold text-foreground-950">Aucune donnée sur la période</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-foreground-500">
            Enregistrez vos revenus et vos dépenses : la comparaison apparaîtra automatiquement.
          </p>
        </div>
      ) : (
        <div className="mt-4 h-[230px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} margin={{ top: 8, right: 4, bottom: 0, left: -18 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "oklch(0.55 0.01 100)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => compactNumber(Number(value))}
                tick={{ fontSize: 11, fill: "oklch(0.55 0.01 100)" }}
                width={54}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e7e4dd",
                  background: "#ffffff",
                  fontSize: 12,
                  padding: "8px 10px",
                }}
                labelStyle={{ fontSize: 11, color: "#6b6b63", marginBottom: 2 }}
                formatter={(value) => formatMoney(Number(value), devise)}
              />
              <Bar dataKey="revenus" name="Revenus" fill={colors.primary} radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="depenses" name="Dépenses" fill={colors.accent} radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between rounded-md bg-background-100 px-3 py-2">
        <p className="text-[11px] text-foreground-500">
          Solde cumulé sur la période
        </p>
        <p className="text-xs font-semibold text-foreground-900">
          {formatMoney(
            trends.reduce((total, point) => total + point.solde, 0),
            devise,
          )}
        </p>
      </div>
    </section>
  );
}