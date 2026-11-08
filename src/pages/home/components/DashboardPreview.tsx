import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { balanceSeries, previewCategories, previewGoal, previewMonth } from "@/mocks/landing";
import AnimatedCounter from "@/components/base/AnimatedCounter";
import Reveal from "@/components/base/Reveal";
import TiltCard from "@/components/base/TiltCard";
import { useInView } from "@/hooks/useInView";

function formatCfa(value: number) {
  return Math.round(value).toLocaleString("fr-FR");
}

function formatShort(value: number) {
  return `${Math.round(value / 1000)}k`;
}

/* Toutes les valeurs dérivées sont recalculées à partir des montants sources. */
const expenseTotal = previewCategories.reduce((total, item) => total + item.amount, 0);
const remainingIncome = previewMonth.income - expenseTotal;
const unallocated = remainingIncome - previewMonth.savings;
const maxCategory = Math.max(...previewCategories.map((item) => item.amount));
const goalPercent = Math.round((previewGoal.saved / previewGoal.target) * 100);

function formatTrend(current: number, previous: number) {
  if (!previous) return null;
  const delta = Math.round(((current - previous) / previous) * 100);
  return {
    label: `${delta > 0 ? "+" : ""}${delta} % vs mois précédent`,
    positive: delta >= 0,
  };
}

const kpis = [
  {
    label: "Revenus du mois",
    value: previewMonth.income,
    trend: formatTrend(previewMonth.income, previewMonth.previousIncome),
    icon: "ri-arrow-up-line",
    tone: "primary",
  },
  {
    label: "Dépenses du mois",
    value: expenseTotal,
    trend: formatTrend(expenseTotal, previewMonth.previousExpenses),
    icon: "ri-arrow-down-line",
    tone: "foreground",
  },
  {
    label: "Épargne",
    value: previewMonth.savings,
    trend: formatTrend(previewMonth.savings, previewMonth.previousSavings),
    icon: "ri-safe-2-line",
    tone: "accent",
  },
];

export default function DashboardPreview() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12 });

  return (
    <section className="relative z-20 w-full px-4 md:px-6">
      <div ref={ref} className="mx-auto w-full max-w-6xl">
        <Reveal direction="up" distance={36} duration={780} threshold={0.05}>
          <div className="anim-float-soft">
            <TiltCard
              max={2.4}
              className="overflow-hidden rounded-lg border border-background-200 bg-background-50"
            >
              <div className="flex flex-col gap-3 border-b border-background-200 bg-background-100/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-500 text-background-50">
                    <i className="ri-line-chart-line text-sm" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground-900">
                      Tableau de bord · Octobre 2026
                    </p>
                    <p className="text-[11px] text-foreground-500">Aperçu avec données d'exemple</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-1 text-[11px] font-medium text-primary-800">
                    <i className="ri-checkbox-circle-line text-xs" />
                    Score <AnimatedCounter value={82} />/100
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-medium text-accent-900">
                    <i className="ri-eye-line text-xs" />
                    Aperçu
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3 md:gap-4 md:p-6">
                {kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="group rounded-lg border border-background-200 bg-background-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-foreground-500">{kpi.label}</p>
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-md transition-transform duration-300 group-hover:scale-110 ${
                          kpi.tone === "primary"
                            ? "bg-primary-100 text-primary-700"
                            : kpi.tone === "accent"
                              ? "bg-accent-100 text-accent-800"
                              : "bg-background-200 text-foreground-700"
                        }`}
                      >
                        <i className={`${kpi.icon} text-sm`} />
                      </span>
                    </div>
                    <p
                      className="mt-2 text-xl font-semibold tracking-tight text-foreground-950"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      <AnimatedCounter value={kpi.value} format={formatCfa} />
                      <span className="ml-1 text-xs font-medium text-foreground-500">FCFA</span>
                    </p>
                    {kpi.trend && (
                      <p
                        className={`mt-1 text-[11px] ${
                          kpi.trend.positive ? "text-primary-700" : "text-foreground-600"
                        }`}
                      >
                        {kpi.trend.label}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="px-4 pb-4 md:px-6 md:pb-6">
                <div className="flex flex-col gap-1 rounded-md border border-background-200 bg-background-100/60 px-3 py-2.5 text-[11px] leading-relaxed text-foreground-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
                  <span className="inline-flex items-center gap-1.5">
                    <i className="ri-subtract-line text-xs text-primary-600" />
                    Revenus − dépenses = {formatCfa(remainingIncome)} FCFA
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <i className="ri-safe-2-line text-xs text-accent-600" />
                    Épargne : {formatCfa(previewMonth.savings)} FCFA
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground-800">
                    <i className="ri-wallet-3-line text-xs text-secondary-700" />
                    Reste à affecter : {formatCfa(unallocated)} FCFA
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 px-4 pb-4 md:grid-cols-5 md:px-6 md:pb-6">
                <div className="rounded-lg border border-background-200 p-4 md:col-span-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground-900">Évolution du solde</p>
                    <span className="text-[11px] text-foreground-500">7 derniers mois</span>
                  </div>
                  <div className="mt-3 h-44 w-full">
                    {inView && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={balanceSeries} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
                          <defs>
                            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="oklch(0.62 0.16 152)" stopOpacity={0.35} />
                              <stop offset="100%" stopColor="oklch(0.62 0.16 152)" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.938 0.009 150)" vertical={false} />
                          <XAxis
                            dataKey="mois"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: "oklch(0.582 0.012 255)" }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatShort}
                            tick={{ fontSize: 11, fill: "oklch(0.582 0.012 255)" }}
                          />
                          <Tooltip
                            formatter={(value: number) => [`${value.toLocaleString("fr-FR")} FCFA`, "Solde"]}
                            contentStyle={{
                              borderRadius: 8,
                              border: "1px solid oklch(0.938 0.009 150)",
                              fontSize: 12,
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="solde"
                            stroke="oklch(0.62 0.16 152)"
                            strokeWidth={2.5}
                            fill="url(#balanceFill)"
                            animationBegin={180}
                            animationDuration={1600}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="mt-3 rounded-lg border border-background-200 bg-background-100/60 p-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1.5 font-medium text-foreground-800">
                        <i className="ri-flag-2-line text-xs text-accent-600" />
                        Objectif · {previewGoal.label}
                      </span>
                      <span className="font-semibold text-foreground-900">{goalPercent} %</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-[width] duration-[1600ms] ease-out"
                        style={{ width: `${goalPercent}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] text-foreground-500">
                      {formatCfa(previewGoal.saved)} / {formatCfa(previewGoal.target)} FCFA
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-background-200 p-4 md:col-span-2">
                  <p className="text-sm font-semibold text-foreground-900">Dépenses par catégorie</p>
                  <ul className="mt-3 space-y-3">
                    {previewCategories.map((category) => (
                      <li key={category.label}>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-foreground-700">{category.label}</span>
                          <span className="font-medium text-foreground-900">
                            {formatCfa(category.amount)}
                            <span className="ml-1.5 text-foreground-500">
                              {Math.round((category.amount / expenseTotal) * 100)} %
                            </span>
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
                          <div
                            className={`h-full rounded-full ${
                              category.tone === "primary"
                                ? "bg-primary-500"
                                : category.tone === "accent"
                                  ? "bg-accent-500"
                                  : "bg-secondary-400"
                            }`}
                            style={{ width: `${Math.round((category.amount / maxCategory) * 100)}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 border-t border-background-200 pt-2.5 text-[11px] text-foreground-600">
                    Total dépenses :{" "}
                    <span className="font-semibold text-foreground-900">{formatCfa(expenseTotal)} FCFA</span>
                  </p>
                </div>
              </div>
            </TiltCard>
          </div>
        </Reveal>
      </div>
    </section>
  );
}