import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { getDisplayName, useAuth } from "@/hooks/useAuth";
import { useSyncedReload } from "@/hooks/useDataSync";
import { formatMoney } from "@/lib/finance";
import {
  buildMonthOptions,
  buildMonthReport,
  monthKeyOfDate,
  type ReportExpenseRow,
  type ReportIncomeRow,
} from "@/lib/reports";
import type { ReportPdfOptions } from "@/lib/reportPdf";
import MonthSwitcher from "@/pages/app/reports/components/MonthSwitcher";
import ReportKpis from "@/pages/app/reports/components/ReportKpis";
import ReportTrendChart from "@/pages/app/reports/components/ReportTrendChart";
import ReportInsights from "@/pages/app/reports/components/ReportInsights";
import CategoryReport from "@/pages/app/reports/components/CategoryReport";
import ReportTransactions from "@/pages/app/reports/components/ReportTransactions";
import ExportPanel from "@/pages/app/reports/components/ExportPanel";

export default function ReportsPage() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const devise = profile?.devise ?? "FCFA";
  const author = [profile?.prenom, profile?.nom].filter(Boolean).join(" ") || getDisplayName(profile);

  const [income, setIncome] = useState<ReportIncomeRow[]>([]);
  const [expenses, setExpenses] = useState<ReportExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [monthKey, setMonthKey] = useState(() => monthKeyOfDate(new Date()));
  const [touchedMonth, setTouchedMonth] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [options, setOptions] = useState<ReportPdfOptions>({
    includeTransactions: true,
    includeBreakdown: true,
    includeInsights: true,
  });

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    if (!options?.silent) setLoading(true);
    setError("");
    try {
      const [incomeResult, expenseResult] = await Promise.all([
        supabase.from("income").select("id, source, montant, date, type").order("date", { ascending: false }),
        supabase
          .from("expenses")
          .select("id, description, montant, date, categorie")
          .order("date", { ascending: false }),
      ]);
      if (incomeResult.error) throw incomeResult.error;
      if (expenseResult.error) throw expenseResult.error;

      setIncome((incomeResult.data ?? []) as ReportIncomeRow[]);
      setExpenses((expenseResult.data ?? []) as ReportExpenseRow[]);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Vos opérations n'ont pas pu être chargées.",
      );
      setIncome([]);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  useSyncedReload(load);

  const months = useMemo(() => buildMonthOptions(income, expenses), [income, expenses]);

  // First load: jump to the most recent month that actually holds data.
  useEffect(() => {
    if (touchedMonth || months.length === 0) return;
    const currentKey = monthKeyOfDate(new Date());
    const hasCurrent = months.some((month) => month.key === currentKey);
    const withData = months.find(
      (month) =>
        income.some((row) => row.date.startsWith(month.key)) ||
        expenses.some((row) => row.date.startsWith(month.key)),
    );
    if (!hasCurrent && withData) setMonthKey(withData.key);
    else setMonthKey(currentKey);
  }, [months, income, expenses, touchedMonth]);

  const report = useMemo(
    () => buildMonthReport(monthKey, income, expenses, devise),
    [monthKey, income, expenses, devise],
  );

  const handleMonthChange = (key: string) => {
    setTouchedMonth(true);
    setMonthKey(key);
  };

  const toggleOption = (key: keyof ReportPdfOptions) => {
    setOptions((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  const handleExport = useCallback(() => {
    setExporting(true);
    // jsPDF (~600 Ko) n'est téléchargé qu'au moment de l'export.
    import("@/lib/reportPdf")
      .then(({ exportMonthReportPdf }) => {
        exportMonthReportPdf(report, devise, options, author);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setExporting(false);
      });
  }, [report, devise, options, author]);

  if (loading) {
    return (
      <div className="w-full animate-fade-up space-y-4">
        <div className="h-[128px] animate-pulse rounded-lg bg-background-200" />
        <div className="h-[68px] animate-pulse rounded-lg bg-background-200" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-[104px] animate-pulse rounded-lg bg-background-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="h-[320px] animate-pulse rounded-lg bg-background-200 lg:col-span-7" />
          <div className="h-[320px] animate-pulse rounded-lg bg-background-200 lg:col-span-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-up space-y-4">
      <section className="rounded-lg border border-background-200 bg-background-100 px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-700">
              Rapports
            </p>
            <h1
              className="mt-1.5 text-xl font-semibold leading-tight text-foreground-950 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Votre mois financier, en une page
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-foreground-600 md:text-sm">
              Synthèse mensuelle de vos revenus et dépenses, comparaison avec le mois précédent, et
              export PDF prêt à partager.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-background-300 bg-background-50 px-2.5 py-1 text-[11px] font-semibold text-foreground-700">
              <i className="ri-database-2-line text-xs text-primary-600" />
              {income.length + expenses.length} opérations enregistrées
            </span>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-wait disabled:opacity-70"
            >
              <i className={exporting ? "ri-loader-4-line animate-spin text-xs" : "ri-file-pdf-2-line text-xs"} />
              Exporter en PDF
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-accent-300 bg-accent-50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <i className="ri-error-warning-line mt-0.5 text-base text-accent-800" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent-900">Impossible de charger vos opérations</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-accent-800">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((value) => value + 1)}
                className="mt-2 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
              >
                <i className="ri-refresh-line text-xs" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      <MonthSwitcher months={months} monthKey={monthKey} onChange={handleMonthChange} />

      <ReportKpis report={report} devise={devise} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ReportTrendChart trends={report.trends} devise={devise} />
        </div>
        <div className="lg:col-span-5">
          <ReportInsights report={report} devise={devise} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <CategoryReport report={report} devise={devise} />
        </div>
        <div className="lg:col-span-8">
          <ReportTransactions report={report} devise={devise} />
        </div>
      </div>

      <ExportPanel
        report={report}
        devise={devise}
        options={options}
        exporting={exporting}
        onToggle={toggleOption}
        onExport={handleExport}
      />

      <section className="flex flex-col gap-3 rounded-lg border border-background-200 bg-background-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-800">
            <i className="ri-book-open-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground-900">Comment lire ce rapport ?</p>
            <p className="mt-0.5 text-xs leading-relaxed text-foreground-500">
              Un taux d'épargne sous 10 % indique que vos dépenses absorbent presque tout votre
              revenu. Comparez ensuite le poste le plus lourd à sa part recommandée (50 / 30 / 20).
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            to="/app/education"
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
          >
            <i className="ri-book-open-line text-xs" />
            Fiches pratiques
          </Link>
          <Link
            to="/app/budget"
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-foreground-900"
          >
            Voir mon budget
            <i className="ri-arrow-right-line text-xs" />
          </Link>
        </div>
      </section>

      <p className="text-[11px] text-foreground-400">
        Rapport généré à partir de vos données réelles · Période : {report.month.label} · Solde net :{" "}
        {formatMoney(report.totals.solde, devise)}
      </p>
    </div>
  );
}