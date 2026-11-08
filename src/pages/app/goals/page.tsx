import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useDataSync, useSyncedReload } from "@/hooks/useDataSync";
import {
  formatMoney,
  parseIsoDate,
  toIsoDate,
} from "@/lib/finance";
import { computeGoalProgress, type GoalEntry } from "@/lib/goals";
import GoalStats from "@/pages/app/goals/components/GoalStats";
import GoalFilters, { type GoalSortKey } from "@/pages/app/goals/components/GoalFilters";
import GoalList from "@/pages/app/goals/components/GoalList";
import GoalAiAdvice from "@/pages/app/goals/components/GoalAiAdvice";
import GoalFormModal from "@/pages/app/goals/components/GoalFormModal";
import DepositModal from "@/pages/app/goals/components/DepositModal";
import ConfirmDialog from "@/components/base/ConfirmDialog";
import ModalPortal from "@/components/base/ModalPortal";
import { syncProjectsFromGoal } from "@/lib/projectFunding";
import { progressFromStored } from "@/lib/projects";

const SELECT_COLUMNS =
  "id, nom, categorie, montant_objectif, montant_actuel, date_limite, priorite, statut, note";

const priorityWeight: Record<string, number> = { haute: 0, moyenne: 1, basse: 2 };

export default function GoalsPage() {
  const { session, profile } = useAuth();
  const { notifyChange } = useDataSync();
  const userId = session?.user?.id;
  const devise = profile?.devise ?? "FCFA";

  const [rows, setRows] = useState<GoalEntry[]>([]);
  const [projectsInfo, setProjectsInfo] = useState<
    Record<string, { nom: string; progression: number }>
  >({});
  const [capacite, setCapacite] = useState(0);
  const [capacityEstimated, setCapacityEstimated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statut, setStatut] = useState("tous");
  const [categorie, setCategorie] = useState("toutes");
  const [sort, setSort] = useState<GoalSortKey>("priorite");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GoalEntry | null>(null);
  const [depositGoal, setDepositGoal] = useState<GoalEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GoalEntry | null>(null);
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
      const now = new Date();
      const windowStart = toIsoDate(new Date(now.getFullYear(), now.getMonth() - 2, 1));

      const [goalsResult, incomeResult, expenseResult, projectsResult] = await Promise.all([
        supabase.from("goals").select(SELECT_COLUMNS).order("date_limite", { ascending: true, nullsFirst: false }),
        supabase.from("income").select("montant, date").gte("date", windowStart),
        supabase.from("expenses").select("montant, date").gte("date", windowStart),
        supabase.from("projects").select("id, nom, goal_id, postes, etapes"),
      ]);

      if (goalsResult.error) throw goalsResult.error;

      setRows((goalsResult.data ?? []) as GoalEntry[]);

      const projects = (projectsResult.data ?? []) as {
        id: string;
        nom: string;
        goal_id: string | null;
        postes: unknown;
        etapes: unknown;
      }[];
      const info: Record<string, { nom: string; progression: number }> = {};
      projects.forEach((project) => {
        if (!project.goal_id || info[project.goal_id]) return;
        info[project.goal_id] = {
          nom: project.nom,
          progression: progressFromStored(project.etapes, project.postes),
        };
      });
      setProjectsInfo(info);

      const incomeTotal = (incomeResult.data ?? []).reduce(
        (total, row) => total + (Number((row as { montant: number }).montant) || 0),
        0,
      );
      const expenseTotal = (expenseResult.data ?? []).reduce(
        (total, row) => total + (Number((row as { montant: number }).montant) || 0),
        0,
      );

      const monthlyIncome = incomeTotal / 3;
      const monthlyExpense = expenseTotal / 3;
      setCapacite(Math.max(Math.round(monthlyIncome - monthlyExpense), 0));
      setCapacityEstimated(incomeTotal > 0 && expenseTotal > 0);
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
    () => rows.map((goal) => ({ goal, progress: computeGoalProgress(goal) })),
    [rows],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { tous: rows.length, actif: 0, atteint: 0, retard: 0 };
    decorated.forEach(({ progress }) => {
      if (progress.statutAffiche === "atteint") counts.atteint += 1;
      else if (progress.statutAffiche === "retard") counts.retard += 1;
      else counts.actif += 1;
    });
    return counts;
  }, [decorated, rows.length]);

  const categorieCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rows.forEach((goal) => {
      counts[goal.categorie] = (counts[goal.categorie] ?? 0) + 1;
    });
    return counts;
  }, [rows]);

  const filtered = useMemo(() => {
    const list = decorated
      .filter(({ progress }) => {
        if (statut === "tous") return true;
        if (statut === "atteint") return progress.statutAffiche === "atteint";
        if (statut === "retard") return progress.statutAffiche === "retard";
        return progress.statutAffiche === "actif" || progress.statutAffiche === "sans_echeance";
      })
      .filter(({ goal }) => categorie === "toutes" || goal.categorie === categorie)
      .map(({ goal }) => goal);

    return [...list].sort((a, b) => {
      switch (sort) {
        case "echeance": {
          if (!a.date_limite && !b.date_limite) return 0;
          if (!a.date_limite) return 1;
          if (!b.date_limite) return -1;
          return parseIsoDate(a.date_limite).getTime() - parseIsoDate(b.date_limite).getTime();
        }
        case "montant-desc":
          return Number(b.montant_objectif) - Number(a.montant_objectif);
        case "progression-desc": {
          const pa = computeGoalProgress(a).progression;
          const pb = computeGoalProgress(b).progression;
          return pb - pa;
        }
        default:
          return (priorityWeight[a.priorite] ?? 1) - (priorityWeight[b.priorite] ?? 1);
      }
    });
  }, [decorated, statut, categorie, sort]);

  const aggregates = useMemo(() => {
    let objectifTotal = 0;
    let epargneTotale = 0;
    let epargneMensuelle = 0;
    let enCours = 0;
    let atteints = 0;

    decorated.forEach(({ goal, progress }) => {
      objectifTotal += Number(goal.montant_objectif) || 0;
      epargneTotale += Number(goal.montant_actuel) || 0;
      if (progress.atteint) atteints += 1;
      else {
        enCours += 1;
        epargneMensuelle += progress.epargneMensuelle;
      }
    });

    const progression =
      objectifTotal > 0 ? Math.min((epargneTotale / objectifTotal) * 100, 100) : 0;

    return { objectifTotal, epargneTotale, epargneMensuelle, enCours, atteints, progression };
  }, [decorated]);

  const hasFilters = statut !== "tous" || categorie !== "toutes";

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (goal: GoalEntry) => {
    setEditing(goal);
    setFormOpen(true);
  };

  const handleSaved = (goal: GoalEntry, mode: "create" | "update") => {
    setRows((current) =>
      mode === "create" ? [goal, ...current] : current.map((item) => (item.id === goal.id ? goal : item)),
    );
    setFormOpen(false);
    setEditing(null);
    notifyChange();
    setToast({
      message: mode === "create" ? "Objectif créé. Votre plan d'épargne est calculé." : "Objectif mis à jour.",
      tone: "success",
    });
  };

  const handleDepositSaved = (goal: GoalEntry) => {
    setRows((current) => current.map((item) => (item.id === goal.id ? goal : item)));
    setDepositGoal(null);
    const done = Number(goal.montant_actuel) >= Number(goal.montant_objectif);
    setToast({
      message: done
        ? `Objectif « ${goal.nom} » atteint. Félicitations !`
        : `Épargne enregistrée sur « ${goal.nom} ».`,
      tone: "success",
    });

    syncProjectsFromGoal(goal)
      .then((syncError) => {
        notifyChange();
        if (syncError) {
          setToast({
            message: `Épargne enregistrée, mais le projet lié n'a pas pu être synchronisé : ${syncError}`,
            tone: "error",
          });
        }
      })
      .catch(() => undefined);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const { error: deleteError } = await supabase.from("goals").delete().eq("id", pendingDelete.id);
      if (deleteError) throw deleteError;
      setRows((current) => current.filter((item) => item.id !== pendingDelete.id));
      notifyChange();
      setToast({ message: "Objectif supprimé.", tone: "success" });
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

  return (
    <div className="w-full animate-fade-up space-y-4 md:space-y-5">
      <section className="flex flex-col gap-3 rounded-lg border border-background-200 bg-background-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-700">
            <i className="ri-flag-2-line text-lg" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
              Total visé par vos objectifs
            </p>
            <p
              className="mt-0.5 truncate text-lg font-semibold text-foreground-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {formatMoney(aggregates.objectifTotal, devise)}
              <span className="ml-2 text-xs font-medium text-foreground-400">
                {rows.length} {rows.length > 1 ? "objectifs" : "objectif"}
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
          Nouvel objectif
        </button>
      </section>

      <GoalAiAdvice
        goals={rows}
        devise={devise}
        capacite={capacite}
        onEdit={openEdit}
      />

      <GoalStats
        devise={devise}
        objectifTotal={aggregates.objectifTotal}
        epargneTotale={aggregates.epargneTotale}
        progression={aggregates.progression}
        enCours={aggregates.enCours}
        atteints={aggregates.atteints}
        epargneMensuelle={aggregates.epargneMensuelle}
        capacite={capacite}
        capacityEstimated={capacityEstimated}
      />

      <GoalFilters
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

      <GoalList
        rows={filtered}
        devise={devise}
        capacite={capacite}
        projects={projectsInfo}
        loading={loading}
        error={error}
        hasFilters={hasFilters}
        onRetry={load}
        onEdit={openEdit}
        onDeposit={setDepositGoal}
        onDelete={setPendingDelete}
        onAdd={openCreate}
      />

      <section className="flex flex-col gap-3 rounded-lg border border-secondary-200 bg-secondary-100/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary-500 text-background-50">
            <i className="ri-lightbulb-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-secondary-900">Comment fonctionne le calcul</p>
            <p className="mt-0.5 text-xs leading-relaxed text-secondary-900/80">
              L'épargne mensuelle nécessaire correspond au reste à financer divisé par le nombre de
              mois avant l'échéance. Votre capacité d'épargne estime ce que vos revenus laissent
              disponible, une fois vos dépenses payées (moyenne des 3 derniers mois).
            </p>
          </div>
        </div>
        <Link
          to="/app/budget"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-foreground-900"
        >
          Voir mon budget
          <i className="ri-arrow-right-line text-xs" />
        </Link>
      </section>

      {formOpen && (
        <GoalFormModal
          initial={editing}
          devise={devise}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {depositGoal && (
        <DepositModal
          goal={depositGoal}
          devise={devise}
          onClose={() => setDepositGoal(null)}
          onSaved={handleDepositSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Supprimer cet objectif ?"
        message={
          pendingDelete
            ? `« ${pendingDelete.nom} » et sa progression (${formatMoney(
                Number(pendingDelete.montant_actuel),
                devise,
              )} épargnés) seront définitivement supprimés. Vos revenus et dépenses ne sont pas affectés.`
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