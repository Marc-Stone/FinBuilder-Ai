import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useChartTheme } from "@/hooks/useChartTheme";
import { formatMoney, parseIsoDate } from "@/lib/finance";
import { monthKey } from "@/lib/budget";

type MonthPoint = {
  key: string;
  label: string;
  revenus: number;
  depenses: number;
};

function compactNumber(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function MonthlyTrendChart() {
  const { profile } = useAuth();
  const devise = profile?.devise ?? "FCFA";
  const colors = useChartTheme();
  const { income, expenses, loading, error, reload } = useFinancialData();

  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
      return { key, date };
    });
  }, []);

  // Agrégation locale : aucune requête supplémentaire, les revenus et dépenses
  // proviennent déjà de la source partagée du tableau de bord.
  const points = useMemo<MonthPoint[]>(() => {
    const incomeByMonth: Record<string, number> = {};
    income.forEach((row) => {
      const key = monthKey(parseIsoDate(row.date));
      incomeByMonth[key] = (incomeByMonth[key] ?? 0) + (Number(row.montant) || 0);
    });

    const expenseByMonth: Record<string, number> = {};
    expenses.forEach((row) => {
      const key = monthKey(parseIsoDate(row.date));
      expenseByMonth[key] = (expenseByMonth[key] ?? 0) + (Number(row.montant) || 0);
    });

    return months.map((month) => ({
      key: month.key,
      label: month.date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""),
      revenus: Math.round(incomeByMonth[month.key] ?? 0),
      depenses: Math.round(expenseByMonth[month.key] ?? 0),
    }));
  }, [income, expenses, months]);

  const totals = useMemo(
    () =>
      points.reduce(
        (acc, point) => ({
          revenus: acc.revenus + point.revenus,
          depenses: acc.depenses + point.depenses,
        }),
        { revenus: 0, depenses: 0 },
      ),
    [points],
  );

  const solde = totals.revenus - totals.depenses;
  const isEmpty = points.every((point) => point.revenus === 0 && point.depenses === 0);

  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950 md:text-base"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Évolution revenus / dépenses
          </h2>
          <p className="mt-0.5 text-xs text-foreground-500">
            Comparaison mensuelle sur les 6 derniers mois.
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

      {loading ? (
        <div className="mt-5 flex h-[240px] items-end gap-3 md:h-[280px]">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex h-full flex-1 items-end gap-1.5">
              <div
                className="w-1/2 animate-pulse rounded-t-md bg-background-200"
                style={{ height: `${40 + ((item * 13) % 45)}%` }}
              />
              <div
                className="w-1/2 animate-pulse rounded-t-md bg-background-200/70"
                style={{ height: `${28 + ((item * 19) % 40)}%` }}
              />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-md border border-accent-300 bg-accent-50 px-3.5 py-3">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-accent-900">
            <i className="ri-error-warning-line mt-0.5 text-sm" />
            <span>Impossible de charger l'historique : {error}</span>
          </p>
          <button
            type="button"
            onClick={() => reload()}
            className="mt-2.5 inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
          >
            <i className="ri-refresh-line text-xs" />
            Réessayer
          </button>
        </div>
      ) : isEmpty ? (
        <div className="mt-4 rounded-md border border-dashed border-background-300 bg-background-50 px-4 py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <i className="ri-bar-chart-2-line text-xl" />
          </span>
          <p className="mt-2.5 text-sm font-semibold text-foreground-950">
            Pas encore de données à comparer
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-foreground-500">
            Enregistrez vos revenus et vos dépenses : la courbe se remplit automatiquement mois après
            mois.
          </p>
        </div>
      ) : (
        <div className="mt-4 h-[240px] w-full md:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: -18 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: colors.tick }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => compactNumber(Number(value))}
                tick={{ fontSize: 11, fill: colors.tick }}
                width={56}
              />
              <Tooltip
                cursor={{ fill: "oklch(0.5 0 0 / 0.06)" }}
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                  boxShadow: "none",
                  color: colors.tick,
                  fontSize: 12,
                  padding: "8px 10px",
                }}
                labelStyle={{ fontSize: 11, color: colors.tick, marginBottom: 2 }}
                formatter={(value) => formatMoney(Number(value), devise)}
              />
              <Bar dataKey="revenus" name="Revenus" fill={colors.primary} radius={[4, 4, 0, 0]} maxBarSize={26} />
              <Bar dataKey="depenses" name="Dépenses" fill={colors.accent} radius={[4, 4, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div className="min-w-0 rounded-md bg-background-100 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
              Revenus sur 6 mois
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground-950">
              {formatMoney(totals.revenus, devise)}
            </p>
          </div>
          <div className="min-w-0 rounded-md bg-background-100 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
              Dépenses sur 6 mois
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground-950">
              {formatMoney(totals.depenses, devise)}
            </p>
          </div>
          <div
            className={`min-w-0 rounded-md px-3 py-2.5 ${
              solde >= 0 ? "bg-primary-50" : "bg-accent-50"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
              Solde net
            </p>
            <p
              className={`mt-0.5 truncate text-sm font-semibold ${
                solde >= 0 ? "text-primary-800" : "text-accent-900"
              }`}
            >
              {formatMoney(solde, devise)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}