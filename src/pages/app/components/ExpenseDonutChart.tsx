import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useSharedExpenses } from "@/hooks/useFinancialData";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useChartTheme } from "@/hooks/useChartTheme";
import { formatMoney, getExpenseCategory, parseIsoDate } from "@/lib/finance";
import { monthKey } from "@/lib/budget";

type ExpenseRow = { montant: number; categorie: string };

type Slice = {
  key: string;
  label: string;
  value: number;
  share: number;
  color: string;
};

const FALLBACK_PALETTE = [
  "oklch(0.45 0.09 160)",
  "oklch(0.7 0.13 75)",
  "oklch(0.55 0.04 100)",
  "oklch(0.58 0.12 160)",
  "oklch(0.78 0.14 75)",
  "oklch(0.68 0.03 100)",
  "oklch(0.35 0.07 160)",
  "oklch(0.62 0.16 75)",
  "oklch(0.45 0.03 100)",
];

/**
 * Palette construite à partir des rôles du StyleSystem (primary, accent, secondary)
 * afin que le camembert suive le thème, y compris après un changement de couleur
 * effectué depuis les paramètres de l'application.
 */
function useCategoryPalette() {
  const { settings } = useAppSettings();
  const [palette, setPalette] = useState<string[]>(FALLBACK_PALETTE);

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string) => {
      const raw = styles.getPropertyValue(name).trim();
      return raw ? `oklch(${raw})` : "";
    };
    const roles = ["primary", "accent", "secondary"];
    const steps = [500, 600, 700, 400, 800, 300];
    const next: string[] = [];
    steps.forEach((step) => {
      roles.forEach((role) => {
        const value = read(`--${role}-${step}`);
        if (value) next.push(value);
      });
    });
    if (next.length >= 3) setPalette(next);
  }, [settings.couleur_principale]);

  return palette;
}

type ExpenseDonutChartProps = {
  title?: string;
  hint?: string;
  className?: string;
};

export default function ExpenseDonutChart({
  title = "Répartition des dépenses",
  hint = "Par catégorie de dépense · mois en cours",
  className = "",
}: ExpenseDonutChartProps) {
  const { profile } = useAuth();
  const devise = profile?.devise ?? "FCFA";
  const palette = useCategoryPalette();
  const theme = useChartTheme();
  const { expenses, loading, error, reload } = useSharedExpenses();

  // Les dépenses du mois en cours sont extraites de la source partagée :
  // plus aucune requête dédiée à ce graphique.
  const rows = useMemo<ExpenseRow[]>(() => {
    const currentKey = monthKey(new Date());
    return expenses
      .filter((row) => monthKey(parseIsoDate(row.date)) === currentKey)
      .map((row) => ({
        montant: Number(row.montant) || 0,
        categorie: row.categorie,
      }));
  }, [expenses]);

  const slices = useMemo<Slice[]>(() => {
    const totals: Record<string, number> = {};
    rows.forEach((row) => {
      const meta = getExpenseCategory(row.categorie);
      totals[meta.value] = (totals[meta.value] ?? 0) + (Number(row.montant) || 0);
    });

    const total = Object.values(totals).reduce((sum, value) => sum + value, 0);

    return Object.entries(totals)
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([key, value], index) => ({
        key,
        label: getExpenseCategory(key).label,
        value: Math.round(value),
        share: total > 0 ? (value / total) * 100 : 0,
        color: palette[index % palette.length],
      }));
  }, [rows, palette]);

  const total = useMemo(() => slices.reduce((sum, slice) => sum + slice.value, 0), [slices]);
  const isEmpty = slices.length === 0;

  return (
    <section
      className={`flex flex-col rounded-lg border border-background-200 bg-background-50 p-4 md:p-5 ${className}`}
    >
      <div className="min-w-0">
        <h2
          className="text-sm font-semibold text-foreground-950 md:text-base"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-foreground-500">{hint}</p>
      </div>

      {loading ? (
        <div className="mt-5 flex flex-1 items-center justify-center">
          <div className="h-[168px] w-[168px] animate-pulse rounded-full bg-background-200" />
        </div>
      ) : error ? (
        <div className="mt-4 rounded-md border border-accent-300 bg-accent-50 px-3.5 py-3">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-accent-900">
            <i className="ri-error-warning-line mt-0.5 text-sm" />
            <span>Impossible de charger la répartition : {error}</span>
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
        <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-md border border-dashed border-background-300 px-4 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <i className="ri-pie-chart-2-line text-xl" />
          </span>
          <p className="mt-2.5 text-sm font-semibold text-foreground-950">
            Aucune dépense ce mois-ci
          </p>
          <p className="mx-auto mt-1 max-w-[220px] text-xs leading-relaxed text-foreground-500">
            Ajoutez une dépense : le camembert se remplit automatiquement par catégorie.
          </p>
        </div>
      ) : (
        <>
          <div className="relative mt-3 h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="62%"
                  outerRadius="92%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {slices.map((slice) => (
                    <Cell key={slice.key} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${theme.border}`,
                    background: theme.surface,
                    boxShadow: "none",
                    color: theme.tick,
                    fontSize: 12,
                    padding: "8px 10px",
                  }}
                  itemStyle={{ fontSize: 11, color: theme.tick }}
                  formatter={(value) => formatMoney(Number(value), devise)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-foreground-400">
                Total dépensé
              </p>
              <p
                className="mt-0.5 max-w-[124px] truncate text-base font-semibold text-foreground-950"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {formatMoney(total, devise)}
              </p>
              <p className="text-[10px] text-foreground-400">
                {slices.length} {slices.length > 1 ? "catégories" : "catégorie"}
              </p>
            </div>
          </div>

          <ul className="mt-2 max-h-[190px] space-y-1.5 overflow-y-auto pr-1">
            {slices.map((slice) => (
              <li key={slice.key} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ background: slice.color }}
                />
                <span className="min-w-0 flex-1 truncate text-xs text-foreground-700">
                  {slice.label}
                </span>
                <span className="shrink-0 text-[11px] font-semibold text-foreground-500">
                  {Math.round(slice.share)} %
                </span>
                <span className="w-[84px] shrink-0 truncate text-right text-[11px] font-semibold text-foreground-950">
                  {formatMoney(slice.value, devise)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}