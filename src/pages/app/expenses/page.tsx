import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useDataSync, useSyncedReload } from "@/hooks/useDataSync";
import {
  formatMoney,
  getExpenseCategory,
  parseIsoDate,
  periodRange,
  startOfMonth,
  toIsoDate,
  type ExpenseCategory,
  type ExpenseEntry,
  type PeriodKey,
} from "@/lib/finance";
import ExpenseStats from "@/pages/app/expenses/components/ExpenseStats";
import CategoryBreakdown from "@/pages/app/expenses/components/CategoryBreakdown";
import ExpenseFilters, {
  type ExpenseSortKey,
} from "@/pages/app/expenses/components/ExpenseFilters";
import ExpenseList from "@/pages/app/expenses/components/ExpenseList";
import ExpenseFormModal from "@/pages/app/expenses/components/ExpenseFormModal";
import ConfirmDialog from "@/components/base/ConfirmDialog";
import ModalPortal from "@/components/base/ModalPortal";
import HistoryPagination from "@/components/base/HistoryPagination";

const SELECT_COLUMNS =
  "id, description, montant, date, categorie, mode_paiement, note, recurrent, project_id";
const PAGE_SIZE = 20;

type ScopeRow = { categorie: string; montant: number };
type StatRow = { montant: number; date: string };

export default function ExpensesPage() {
  const { session, profile } = useAuth();
  const { notifyChange } = useDataSync();
  const userId = session?.user?.id;
  const devise = profile?.devise ?? "FCFA";

  const [rows, setRows] = useState<ExpenseEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [scopeRows, setScopeRows] = useState<ScopeRow[]>([]);
  const [statRows, setStatRows] = useState<StatRow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categorie, setCategorie] = useState<ExpenseCategory | "toutes">("toutes");
  const [period, setPeriod] = useState<PeriodKey>("tout");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ExpenseSortKey>("date-desc");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ExpenseEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const pageCache = useRef(new Map<number, ExpenseEntry[]>());
  const pageRef = useRef(1);
  const requestRef = useRef(0);

  const searchTerm = search.trim();
  const bounds = useMemo(() => periodRange(period), [period]);
  const filterKey = `${categorie}|${period}|${searchTerm}|${sort}`;

  /** Applique période + recherche côté base : aucune lecture de tout l'historique. */
  const applyBaseFilters = useCallback(
    (query: any) => {
      let next = query;
      if (bounds.start) next = next.gte("date", toIsoDate(bounds.start));
      if (bounds.end) next = next.lt("date", toIsoDate(bounds.end));
      const term = searchTerm.replace(/[,()%\\"]/g, " ").trim();
      if (term) next = next.or(`description.ilike.%${term}%,note.ilike.%${term}%`);
      return next;
    },
    [bounds, searchTerm],
  );

  const buildPageQuery = useCallback(() => {
    let query = applyBaseFilters(
      supabase.from("expenses").select(SELECT_COLUMNS, { count: "exact" }),
    );
    if (categorie !== "toutes") query = query.eq("categorie", categorie);
    if (sort === "date-asc") return query.order("date", { ascending: true });
    if (sort === "montant-desc") {
      return query.order("montant", { ascending: false }).order("date", { ascending: false });
    }
    if (sort === "montant-asc") {
      return query.order("montant", { ascending: true }).order("date", { ascending: false });
    }
    return query.order("date", { ascending: false });
  }, [applyBaseFilters, categorie, sort]);

  const loadPage = useCallback(
    async (targetPage: number, options?: { silent?: boolean }) => {
      if (!userId) {
        setLoading(false);
        return;
      }
      const cached = pageCache.current.get(targetPage);
      if (cached) {
        setRows(cached);
        setPage(targetPage);
        pageRef.current = targetPage;
        setLoading(false);
        return;
      }
      if (!options?.silent) setLoading(true);
      setError("");
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;
      const from = (targetPage - 1) * PAGE_SIZE;
      try {
        const { data, error: fetchError, count } = await buildPageQuery().range(
          from,
          from + PAGE_SIZE - 1,
        );
        if (fetchError) throw fetchError;
        if (requestRef.current !== requestId) return;
        const nextRows = (data ?? []) as ExpenseEntry[];
        pageCache.current.set(targetPage, nextRows);
        setRows(nextRows);
        setTotal(count ?? 0);
        setPage(targetPage);
        pageRef.current = targetPage;
      } catch (loadError) {
        if (requestRef.current !== requestId) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Une erreur inattendue est survenue pendant le chargement.",
        );
      } finally {
        if (requestRef.current === requestId) setLoading(false);
      }
    },
    [userId, buildPageQuery],
  );

  const loadAggregates = useCallback(async () => {
    if (!userId) return;
    try {
      const scopeQuery = applyBaseFilters(supabase.from("expenses").select("categorie, montant"));
      const statsQuery = supabase.from("expenses").select("montant, date");
      const [scopeResult, statsResult] = await Promise.all([scopeQuery, statsQuery]);
      if (scopeResult.error) throw scopeResult.error;
      if (statsResult.error) throw statsResult.error;
      setScopeRows((scopeResult.data ?? []) as ScopeRow[]);
      setStatRows((statsResult.data ?? []) as StatRow[]);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Le résumé de vos dépenses n'a pas pu être chargé.",
      );
    }
  }, [userId, applyBaseFilters]);

  useEffect(() => {
    pageCache.current = new Map();
    pageRef.current = 1;
    void loadPage(1);
    void loadAggregates();
  }, [filterKey, loadPage, loadAggregates]);

  const syncedReload = useCallback(
    (options?: { silent?: boolean }) => {
      pageCache.current = new Map();
      void loadPage(pageRef.current, options);
      void loadAggregates();
    },
    [loadPage, loadAggregates],
  );

  useSyncedReload(syncedReload);

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (page > lastPage) void loadPage(lastPage);
  }, [page, lastPage, loadPage]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    scopeRows.forEach((entry) => {
      result[entry.categorie] = (result[entry.categorie] ?? 0) + 1;
    });
    return result;
  }, [scopeRows]);

  const breakdown = useMemo(() => {
    const map = new Map<string, { categorie: string; montant: number; count: number }>();
    scopeRows.forEach((entry) => {
      const current = map.get(entry.categorie) ?? {
        categorie: entry.categorie,
        montant: 0,
        count: 0,
      };
      current.montant += Number(entry.montant) || 0;
      current.count += 1;
      map.set(entry.categorie, current);
    });
    return [...map.values()];
  }, [scopeRows]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    let monthTotal = 0;
    let previousTotal = 0;
    let sum = 0;

    statRows.forEach((entry) => {
      const amount = Number(entry.montant) || 0;
      const date = parseIsoDate(entry.date);
      sum += amount;
      if (date >= monthStart) monthTotal += amount;
      else if (date >= previousStart && date < monthStart) previousTotal += amount;
    });

    const evolution = previousTotal > 0 ? ((monthTotal - previousTotal) / previousTotal) * 100 : null;

    return {
      monthTotal,
      previousTotal,
      evolution,
      count: statRows.length,
      average: statRows.length > 0 ? sum / statRows.length : 0,
    };
  }, [statRows]);

  const breakdownTotal = breakdown.reduce((sum, item) => sum + item.montant, 0);
  const topItem = [...breakdown].sort((a, b) => b.montant - a.montant)[0];
  const topCategory = topItem
    ? {
        label: getExpenseCategory(topItem.categorie).label,
        montant: topItem.montant,
        part: breakdownTotal > 0 ? (topItem.montant / breakdownTotal) * 100 : 0,
      }
    : null;

  const filteredTotal = useMemo(
    () =>
      scopeRows
        .filter((entry) => categorie === "toutes" || entry.categorie === categorie)
        .reduce((sum, entry) => sum + (Number(entry.montant) || 0), 0),
    [scopeRows, categorie],
  );

  const hasFilters = categorie !== "toutes" || period !== "tout" || searchTerm.length > 0;

  const retry = () => {
    pageCache.current = new Map();
    void loadPage(page, { silent: false });
    void loadAggregates();
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (entry: ExpenseEntry) => {
    setEditing(entry);
    setFormOpen(true);
  };

  const handleSaved = (_entry: ExpenseEntry, mode: "create" | "update") => {
    setFormOpen(false);
    setEditing(null);
    notifyChange();
    setToast({
      message: mode === "create" ? "Dépense ajoutée avec succès." : "Dépense mise à jour.",
      tone: "success",
    });
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from("expenses")
        .delete()
        .eq("id", pendingDelete.id);
      if (deleteError) throw deleteError;
      notifyChange();
      setToast({ message: "Dépense supprimée.", tone: "success" });
      setPendingDelete(null);
    } catch (deleteError) {
      setToast({
        message:
          deleteError instanceof Error
            ? `Suppression impossible : ${deleteError.message}`
            : "Suppression impossible. Réessayez.",
        tone: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setCategorie("toutes");
    setPeriod("tout");
    setSearch("");
  };

  const goToPage = (target: number) => {
    const next = Math.min(Math.max(1, target), lastPage);
    if (next === page) return;
    void loadPage(next);
  };

  return (
    <div className="w-full animate-fade-up space-y-4 md:space-y-5">
      <section className="flex flex-col gap-3 rounded-lg border border-background-200 bg-background-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-700">
            <i className="ri-arrow-up-line text-lg" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
              Total affiché
            </p>
            <p
              className="mt-0.5 truncate text-lg font-semibold text-foreground-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {formatMoney(filteredTotal, devise)}
              <span className="ml-2 text-xs font-medium text-foreground-400">
                {total} {total > 1 ? "dépenses" : "dépense"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Link
            to="/app/budget"
            className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-semibold text-foreground-800 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
          >
            <i className="ri-pie-chart-2-line text-base" />
            Budget intelligent
          </Link>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-add-line text-base" />
            Ajouter une dépense
          </button>
        </div>
      </section>

      <ExpenseStats
        devise={devise}
        monthTotal={stats.monthTotal}
        previousTotal={stats.previousTotal}
        evolution={stats.evolution}
        count={stats.count}
        average={stats.average}
        topCategory={topCategory}
      />

      <CategoryBreakdown rows={breakdown} total={breakdownTotal} devise={devise} />

      <ExpenseFilters
        categorie={categorie}
        onCategorieChange={setCategorie}
        period={period}
        onPeriodChange={setPeriod}
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        counts={counts}
        total={scopeRows.length}
        onReset={resetFilters}
      />

      <ExpenseList
        rows={rows}
        devise={devise}
        loading={loading}
        error={error}
        hasFilters={hasFilters}
        onRetry={retry}
        onEdit={openEdit}
        onDelete={setPendingDelete}
        onAdd={openCreate}
      />

      <HistoryPagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        loading={loading}
        unit="dépenses"
        onPageChange={goToPage}
      />

      {formOpen && (
        <ExpenseFormModal
          initial={editing}
          devise={devise}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Supprimer cette dépense ?"
        message={
          pendingDelete
            ? `« ${pendingDelete.description} » (${formatMoney(
                Number(pendingDelete.montant),
                devise,
              )}) sera définitivement supprimé de votre historique.`
            : ""
        }
        confirmLabel="Supprimer"
        cancelLabel="Conserver"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />

      {toast && (
        <ModalPortal>
        <div
          className={`fixed bottom-4 right-4 z-[70] flex max-w-[320px] items-start gap-2 rounded-lg border px-3.5 py-2.5 text-xs font-medium animate-fade-up ${
            toast.tone === "success"
              ? "border-primary-200 bg-primary-50 text-primary-800"
              : "border-accent-300 bg-accent-50 text-accent-900"
          }`}
        >
          <i
            className={`mt-0.5 text-sm ${
              toast.tone === "success" ? "ri-checkbox-circle-line" : "ri-error-warning-line"
            }`}
          />
          <span className="leading-relaxed">{toast.message}</span>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}