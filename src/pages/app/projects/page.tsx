import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useDataSync, useSyncedReload } from "@/hooks/useDataSync";
import { formatMoney, parseIsoDate } from "@/lib/finance";
import {
  attachLinkedExpenses,
  computeProjectMetrics,
  computeEtapesProgress,
  parseDocuments,
  parseEtapes,
  parsePostes,
  type LinkedExpenseSource,
  type ProjectEntry,
} from "@/lib/projects";
import ProjectStats from "@/pages/app/projects/components/ProjectStats";
import ProjectFilters, { type ProjectSortKey } from "@/pages/app/projects/components/ProjectFilters";
import ProjectList from "@/pages/app/projects/components/ProjectList";
import ProjectFormModal from "@/pages/app/projects/components/ProjectFormModal";
import ProjectDetailModal from "@/pages/app/projects/components/ProjectDetailModal";
import ConfirmDialog from "@/components/base/ConfirmDialog";
import ModalPortal from "@/components/base/ModalPortal";
import HistoryPagination from "@/components/base/HistoryPagination";

const PAGE_SIZE = 20;

const SELECT_COLUMNS =
  "id, nom, categorie, description, budget_total, montant_finance, goal_id, postes, etapes, documents, date_debut, date_fin, statut, priorite, note";

const priorityWeight: Record<string, number> = { haute: 0, moyenne: 1, basse: 2 };

type RawProject = Omit<ProjectEntry, "postes"> & { postes: unknown };

export default function ProjectsPage() {
  const { session, profile } = useAuth();
  const { notifyChange } = useDataSync();
  const userId = session?.user?.id;
  const devise = profile?.devise ?? "FCFA";

  const [rows, setRows] = useState<ProjectEntry[]>([]);
  const [goalNames, setGoalNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statut, setStatut] = useState("tous");
  const [categorie, setCategorie] = useState("toutes");
  const [sort, setSort] = useState<ProjectSortKey>("recent");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectEntry | null>(null);
  const [detail, setDetail] = useState<ProjectEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProjectEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    if (!options?.silent) setLoading(true);
    setError("");
    try {
      const [projectsResult, goalsResult, expensesResult] = await Promise.all([
        supabase.from("projects").select(SELECT_COLUMNS).order("date_creation", { ascending: false }),
        supabase.from("goals").select("id, nom"),
        supabase
          .from("expenses")
          .select("project_id, montant, categorie, date, description")
          .not("project_id", "is", null),
      ]);
      const fetchError = projectsResult.error;
      if (fetchError) throw fetchError;

      const normalized = ((projectsResult.data ?? []) as RawProject[]).map((row) => ({
        ...row,
        postes: parsePostes(row.postes),
        etapes: parseEtapes(row.etapes),
        documents: parseDocuments(row.documents),
      }));
      setRows(attachLinkedExpenses(normalized, (expensesResult.data ?? []) as LinkedExpenseSource[]));

      const names: Record<string, string> = {};
      ((goalsResult.data ?? []) as { id: string; nom: string }[]).forEach((goal) => {
        names[goal.id] = goal.nom;
      });
      setGoalNames(names);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Une erreur inattendue est survenue pendant le chargement.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useSyncedReload(load);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const decorated = useMemo(
    () => rows.map((project) => ({ project, metrics: computeProjectMetrics(project) })),
    [rows],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      tous: rows.length,
      preparation: 0,
      en_cours: 0,
      termine: 0,
      suspendu: 0,
    };
    rows.forEach((project) => {
      counts[project.statut] = (counts[project.statut] ?? 0) + 1;
    });
    return counts;
  }, [rows]);

  const categorieCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rows.forEach((project) => {
      counts[project.categorie] = (counts[project.categorie] ?? 0) + 1;
    });
    return counts;
  }, [rows]);

  const filtered = useMemo(() => {
    const list = decorated
      .filter(({ project }) => statut === "tous" || project.statut === statut)
      .filter(({ project }) => categorie === "toutes" || project.categorie === categorie)
      .map(({ project }) => project);

    return [...list].sort((a, b) => {
      switch (sort) {
        case "budget-desc":
          return Number(b.budget_total) - Number(a.budget_total);
        case "progression-desc":
          return computeProjectMetrics(b).progression - computeProjectMetrics(a).progression;
        case "echeance": {
          if (!a.date_fin && !b.date_fin) return 0;
          if (!a.date_fin) return 1;
          if (!b.date_fin) return -1;
          return parseIsoDate(a.date_fin).getTime() - parseIsoDate(b.date_fin).getTime();
        }
        case "priorite":
          return (priorityWeight[a.priorite] ?? 1) - (priorityWeight[b.priorite] ?? 1);
        default:
          return 0;
      }
    });
  }, [decorated, statut, categorie, sort]);

  const aggregates = useMemo(() => {
    let budgetTotal = 0;
    let alloue = 0;
    let depense = 0;
    let reste = 0;
    let enCours = 0;
    let termines = 0;
    let etapesTotal = 0;
    let etapesTerminees = 0;

    decorated.forEach(({ project, metrics }) => {
      budgetTotal += Number(project.budget_total) || 0;
      alloue += metrics.prevuTotal;
      depense += metrics.depenseTotal;
      reste += metrics.reste;
      if (project.statut === "en_cours") enCours += 1;
      if (project.statut === "termine") termines += 1;

      const steps = computeEtapesProgress(parseEtapes(project.etapes));
      etapesTotal += steps.total;
      etapesTerminees += steps.termines;
    });

    return { budgetTotal, alloue, depense, reste, enCours, termines, etapesTotal, etapesTerminees };
  }, [decorated]);

  const hasFilters = statut !== "tous" || categorie !== "toutes";

  const lastPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Chaque changement de filtre repart de la première page.
  useEffect(() => {
    setPage(1);
  }, [statut, categorie, sort]);

  useEffect(() => {
    if (page > lastPage) setPage(lastPage);
  }, [page, lastPage]);

  // Seuls les projets de la page courante sont rendus : la liste reste légère
  // même après plusieurs années, alors que les agrégats portent sur l'ensemble.
  const pageRows = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (project: ProjectEntry) => {
    setDetail(null);
    setEditing(project);
    setFormOpen(true);
  };

  const handleSaved = (project: ProjectEntry, mode: "create" | "update") => {
    setRows((current) =>
      mode === "create" ? [project, ...current] : current.map((item) => (item.id === project.id ? project : item)),
    );
    setFormOpen(false);
    setEditing(null);
    notifyChange();
    setToast({
      message:
        mode === "create"
          ? "Projet créé. Votre budget est réparti par poste."
          : "Projet mis à jour.",
      tone: "success",
    });
  };

  const handleDetailSaved = (project: ProjectEntry) => {
    setRows((current) => current.map((item) => (item.id === project.id ? project : item)));
    setDetail(project);
    notifyChange();
    setToast({ message: "Projet mis à jour.", tone: "success" });
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const { error: deleteError } = await supabase.from("projects").delete().eq("id", pendingDelete.id);
      if (deleteError) throw deleteError;
      setRows((current) => current.filter((item) => item.id !== pendingDelete.id));
      notifyChange();
      setToast({ message: "Projet supprimé.", tone: "success" });
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
    setStatut("tous");
    setCategorie("toutes");
  };

  const pendingMetrics = pendingDelete ? computeProjectMetrics(pendingDelete) : null;

  return (
    <div className="w-full animate-fade-up space-y-4 md:space-y-5">
      <section className="flex flex-col gap-3 rounded-lg border border-background-200 bg-background-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
            <i className="ri-building-4-line text-lg" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
              Enveloppe globale de vos projets
            </p>
            <p
              className="mt-0.5 truncate text-lg font-semibold text-foreground-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {formatMoney(aggregates.budgetTotal, devise)}
              <span className="ml-2 text-xs font-medium text-foreground-400">
                {rows.length} {rows.length > 1 ? "projets" : "projet"}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-add-line text-base" />
          Nouveau projet
        </button>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-primary-200 bg-primary-50/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-500 text-background-50">
            <i className="ri-route-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary-900">Un projet, c'est le chemin</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-primary-900/80">
              Budget détaillé par poste, étapes du plan, planning et documents. L'objectif dit où vous
              allez, le projet dit comment vous y arrivez.
              {aggregates.etapesTotal > 0 && (
                <span className="ml-1 font-semibold">
                  {aggregates.etapesTerminees}/{aggregates.etapesTotal} étapes déjà terminées.
                </span>
              )}
            </p>
          </div>
        </div>
        <Link
          to="/app/objectifs"
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-primary-300 bg-background-50 px-3.5 py-2 text-xs font-semibold text-primary-800 transition-colors hover:bg-primary-100"
        >
          <i className="ri-flag-2-line text-sm" />
          Mes objectifs
        </Link>
      </section>

      <ProjectStats
        devise={devise}
        projets={rows.length}
        enCours={aggregates.enCours}
        termines={aggregates.termines}
        budgetTotal={aggregates.budgetTotal}
        alloue={aggregates.alloue}
        depense={aggregates.depense}
        reste={aggregates.reste}
      />
      <ProjectFilters
        statut={statut}
        onStatutChange={setStatut}
        categorie={categorie}
        onCategorieChange={setCategorie}
        sort={sort}
        onSortChange={setSort}
        statusCounts={statusCounts}
        categorieCounts={categorieCounts}
        total={rows.length}
        onReset={resetFilters}
        hasFilters={hasFilters}
      />

      <ProjectList
        rows={pageRows}
        devise={devise}
        goalNames={goalNames}
        loading={loading}
        error={error}
        hasFilters={hasFilters}
        onRetry={load}
        onOpen={setDetail}
        onEdit={openEdit}
        onDelete={setPendingDelete}
        onAdd={openCreate}
      />

      <HistoryPagination
        page={page}
        pageSize={PAGE_SIZE}
        total={filtered.length}
        unit="projets"
        onPageChange={setPage}
      />

      <section className="flex flex-col gap-3 rounded-lg border border-secondary-200 bg-secondary-100/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary-500 text-background-50">
            <i className="ri-lightbulb-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-secondary-900">Comment répartir un budget projet</p>
            <p className="mt-0.5 text-xs leading-relaxed text-secondary-900/80">
              Déclarez l'enveloppe, puis appuyez sur « Répartition recommandée » : FinBuilder propose
              des postes adaptés à votre type de projet (terrain, travaux, imprévus…). Ajustez ensuite
              chaque montant et suivez les dépenses réelles poste par poste.
            </p>
          </div>
        </div>
        <Link
          to="/app/objectifs"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-foreground-900"
        >
          Voir mes objectifs
          <i className="ri-arrow-right-line text-xs" />
        </Link>
      </section>

      {formOpen && (
        <ProjectFormModal
          initial={editing}
          devise={devise}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {detail && (
        <ProjectDetailModal
          project={detail}
          devise={devise}
          goalName={detail.goal_id ? goalNames[detail.goal_id] : undefined}
          onClose={() => setDetail(null)}
          onEdit={openEdit}
          onSaved={handleDetailSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Supprimer ce projet ?"
        message={
          pendingDelete
            ? `« ${pendingDelete.nom} » et sa répartition (${pendingMetrics?.lignes.length ?? 0} postes, ${formatMoney(
                Number(pendingDelete.budget_total) || 0,
                devise,
              )}) seront définitivement supprimés. Vos revenus, dépenses et objectifs ne sont pas affectés.`
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