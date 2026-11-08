import { useEffect, useMemo, useState, type FormEvent } from "react";
import ModalPortal from "@/components/base/ModalPortal";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { formatDateFr, formatMoney, toIsoDate } from "@/lib/finance";
import {
  buildEtapesFromTemplate,
  buildPostesFromTemplate,
  parseDocuments,
  parseEtapes,
  parsePostes,
  projectCategories,
  projectEtapeTemplates,
  projectPriorities,
  projectStatuses,
  recommendedSplitLabel,
  type ProjectDocument,
  type ProjectEntry,
  type ProjectEtape,
  type ProjectPoste,
} from "@/lib/projects";
import ProjectPostesEditor from "@/pages/app/projects/components/ProjectPostesEditor";
import {
  createGoalFromProject,
  goalCategoryForProject,
  syncGoalWithProject,
  type GoalOption,
} from "@/lib/projectFunding";

type ProjectFormModalProps = {
  initial: ProjectEntry | null;
  devise: string;
  onClose: () => void;
  onSaved: (project: ProjectEntry, mode: "create" | "update") => void;
};

const SELECT_COLUMNS =
  "id, nom, categorie, description, budget_total, montant_finance, goal_id, postes, etapes, documents, date_debut, date_fin, statut, priorite, note";

function toNumber(raw: string) {
  const value = Number(raw.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(value) ? value : 0;
}

export default function ProjectFormModal({
  initial,
  devise,
  onClose,
  onSaved,
}: ProjectFormModalProps) {
  const { session } = useAuth();

  const [nom, setNom] = useState(initial?.nom ?? "");
  const [categorie, setCategorie] = useState(initial?.categorie ?? "logement");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [budgetTotal, setBudgetTotal] = useState(initial ? String(initial.budget_total) : "");
  const [montantFinance, setMontantFinance] = useState(
    initial ? String(initial.montant_finance) : "0",
  );
  const [dateDebut, setDateDebut] = useState(initial?.date_debut ?? "");
  const [dateFin, setDateFin] = useState(initial?.date_fin ?? "");
  const [statut, setStatut] = useState(initial?.statut ?? "preparation");
  const [priorite, setPriorite] = useState(initial?.priorite ?? "moyenne");
  const [note, setNote] = useState(initial?.note ?? "");
  const [postes, setPostes] = useState<ProjectPoste[]>(initial ? parsePostes(initial.postes) : []);
  const [etapes, setEtapes] = useState<ProjectEtape[]>(initial ? parseEtapes(initial.etapes) : []);
  const [documents, setDocuments] = useState<ProjectDocument[]>(
    initial ? parseDocuments(initial.documents) : [],
  );
  const [goalId, setGoalId] = useState(initial?.goal_id ?? "");
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [goalError, setGoalError] = useState("");
  const [goalNotice, setGoalNotice] = useState("");

  const [errors, setErrors] = useState<{
    nom?: string;
    budgetTotal?: string;
    montantFinance?: string;
    dateFin?: string;
  }>({});
  const [postesError, setPostesError] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadGoals = async () => {
      const { data } = await supabase
        .from("goals")
        .select("id, nom, montant_objectif, montant_actuel")
        .order("date_creation", { ascending: false });
      if (!active) return;
      setGoals((data ?? []) as GoalOption[]);
    };
    loadGoals();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, submitting]);

  const budget = toNumber(budgetTotal);
  const alloue = postes.reduce((total, poste) => total + (Number(poste.prevu) || 0), 0);
  const depense = postes.reduce((total, poste) => total + (Number(poste.depense) || 0), 0);
  const selectedGoal = goals.find((item) => item.id === goalId) ?? null;
  const resteAFinancer = Math.max(budget - toNumber(montantFinance), 0);

  const preview = useMemo(
    () => ({
      reste: Math.max(alloue - depense, 0),
      progression: alloue > 0 ? Math.min((depense / alloue) * 100, 100) : 0,
    }),
    [alloue, depense],
  );

  const applyTemplate = () => {
    if (budget <= 0) {
      setErrors((current) => ({
        ...current,
        budgetTotal: "Indiquez d'abord l'enveloppe totale pour générer la répartition.",
      }));
      return;
    }
    setErrors((current) => ({ ...current, budgetTotal: undefined }));
    setPostes(buildPostesFromTemplate(categorie, budget));
    setPostesError("");
  };

  const handleCategorie = (value: string) => {
    setCategorie(value);
    if (postes.length === 0 && budget > 0) {
      setPostes(buildPostesFromTemplate(value, budget));
    }
  };

  const handleCreateGoal = async () => {
    setGoalError("");
    setGoalNotice("");

    if (budget <= 0) {
      setGoalError("Renseignez d'abord l'enveloppe totale : elle devient la cible de l'objectif.");
      return;
    }

    const userId = session?.user?.id;
    if (!userId) {
      setGoalError("Session expirée. Reconnectez-vous puis réessayez.");
      return;
    }

    setCreatingGoal(true);
    try {
      const { goal, error } = await createGoalFromProject({
        userId,
        nom,
        categorie,
        enveloppe: budget,
        finance: toNumber(montantFinance),
        dateLimite: dateFin || null,
        priorite,
      });
      if (error || !goal) throw new Error(error || "Création impossible.");
      setGoals((current) => [goal, ...current.filter((item) => item.id !== goal.id)]);
      setGoalId(goal.id);
      setGoalNotice(`Objectif « ${goal.nom} » créé et lié à ce projet.`);
    } catch (error) {
      setGoalError(
        error instanceof Error
          ? `Création impossible : ${error.message}`
          : "Création impossible. Réessayez dans un instant.",
      );
    } finally {
      setCreatingGoal(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");

    const cleanNom = nom.trim();
    const cleanPostes = postes
      .filter((poste) => poste.libelle.trim().length > 0)
      .map((poste) => ({
        id: poste.id,
        libelle: poste.libelle.trim(),
        categorie: poste.categorie || "autre",
        prevu: Math.max(Number(poste.prevu) || 0, 0),
        depense: Math.max(Number(poste.depense) || 0, 0),
      }));

    const nextErrors: typeof errors = {};
    if (cleanNom.length < 2) nextErrors.nom = "Donnez un nom à votre projet (2 caractères minimum).";
    if (!budgetTotal.trim()) nextErrors.budgetTotal = "Indiquez l'enveloppe totale du projet.";
    else if (budget <= 0) nextErrors.budgetTotal = "L'enveloppe doit être supérieure à zéro.";
    if (toNumber(montantFinance) < 0) nextErrors.montantFinance = "Le montant financé ne peut pas être négatif.";
    if (dateDebut && dateFin && dateFin < dateDebut)
      nextErrors.dateFin = "La fin du projet doit être postérieure au début.";

    setErrors(nextErrors);

    const cleanEtapes = etapes
      .filter((etape) => etape.libelle.trim().length > 0)
      .map((etape) => ({ id: etape.id, libelle: etape.libelle.trim(), statut: etape.statut }));
    const etapePayload =
      cleanEtapes.length > 0 ? cleanEtapes : buildEtapesFromTemplate(categorie);
    const documentPayload = documents
      .filter((document) => document.nom.trim().length > 0)
      .map((document) => ({ id: document.id, nom: document.nom.trim(), url: document.url }));

    const invalidPoste = cleanPostes.some((poste) => poste.prevu <= 0);
    setPostesError(
      invalidPoste ? "Chaque poste doit avoir un montant prévu supérieur à zéro." : "",
    );
    if (Object.keys(nextErrors).length > 0 || invalidPoste) return;

    const userId = session?.user?.id;
    if (!userId) {
      setServerError("Session expirée. Reconnectez-vous puis réessayez.");
      return;
    }

    setSubmitting(true);
    try {
      let financeValue = toNumber(montantFinance);
      const linkedGoal = goalId || null;

      if (linkedGoal) {
        const synced = await syncGoalWithProject({
          goalId: linkedGoal,
          enveloppe: budget,
          finance: financeValue,
          merge: linkedGoal !== (initial?.goal_id ?? null),
        });
        if (synced.error) throw new Error(synced.error);
        financeValue = synced.finance;
      }

      const payload = {
        nom: cleanNom,
        categorie,
        description: description.trim() ? description.trim() : null,
        budget_total: budget,
        montant_finance: financeValue,
        goal_id: linkedGoal,
        postes: cleanPostes,
        etapes: etapePayload,
        documents: documentPayload,
        date_debut: dateDebut || null,
        date_fin: dateFin || null,
        statut,
        priorite,
        note: note.trim() ? note.trim() : null,
        updated_at: new Date().toISOString(),
      };

      if (initial) {
        const { data, error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", initial.id)
          .select(SELECT_COLUMNS)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("Projet introuvable ou mise à jour refusée.");
        const row = data as Omit<ProjectEntry, "postes"> & { postes: unknown };
        onSaved(
          {
            ...row,
            postes: parsePostes(row.postes),
            etapes: parseEtapes(row.etapes),
            documents: parseDocuments(row.documents),
          },
          "update",
        );
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert({ ...payload, user_id: userId })
          .select(SELECT_COLUMNS)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("L'enregistrement n'a pas pu être confirmé.");
        const row = data as Omit<ProjectEntry, "postes"> & { postes: unknown };
        onSaved(
          {
            ...row,
            postes: parsePostes(row.postes),
            etapes: parseEtapes(row.etapes),
            documents: parseDocuments(row.documents),
          },
          "create",
        );
      }
    } catch (error) {
      setServerError(
        error instanceof Error
          ? `Enregistrement impossible : ${error.message}`
          : "Enregistrement impossible. Réessayez dans un instant.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    "box-border w-full min-w-0 rounded-md border bg-background-50 px-3.5 py-2.5 text-sm text-foreground-950 transition-colors placeholder:text-foreground-400 focus:outline-none focus:ring-2";
  const okBorder = "border-background-300 focus:border-primary-500 focus:ring-primary-100";
  const badBorder = "border-accent-500 focus:border-accent-500 focus:ring-accent-200";

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[55] flex items-end justify-center px-0 sm:items-center sm:px-4">
      <button
        type="button"
        aria-label="Fermer"
        onClick={() => !submitting && onClose()}
        className="absolute inset-0 cursor-pointer bg-foreground-950/45 backdrop-blur-[2px]"
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl animate-fade-up flex-col overflow-hidden rounded-t-lg border border-background-200 bg-background-50 sm:rounded-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-background-200 px-4 py-3.5 md:px-5">
          <div className="min-w-0">
            <h2
              className="text-sm font-semibold text-foreground-950 md:text-base"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {initial ? "Modifier le projet" : "Nouveau projet"}
            </h2>
            <p className="mt-0.5 text-xs text-foreground-500">
              Déclarez une enveloppe, puis répartissez-la par poste budgétaire.
            </p>
          </div>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            aria-label="Fermer"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-background-100 hover:text-foreground-900"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0 sm:col-span-2">
              <label
                htmlFor="project-nom"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Nom du projet <span className="text-primary-600">*</span>
              </label>
              <input
                id="project-nom"
                name="nom"
                type="text"
                value={nom}
                autoFocus
                maxLength={70}
                onChange={(event) => setNom(event.target.value)}
                placeholder="Construction de la maison, ouverture de boutique…"
                className={`${inputBase} ${errors.nom ? badBorder : okBorder}`}
              />
              {errors.nom && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
                  <i className="ri-error-warning-line mt-0.5 text-sm" />
                  <span>{errors.nom}</span>
                </p>
              )}
            </div>

            <div className="min-w-0 sm:col-span-2">
              <p className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600">
                Type de projet
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {projectCategories.map((item) => {
                  const active = categorie === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleCategorie(item.value)}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-2 text-[11px] font-semibold transition-colors duration-200 ${
                        active
                          ? "border-primary-500 bg-primary-50 text-primary-800"
                          : "border-background-300 bg-background-50 text-foreground-600 hover:border-primary-300 hover:bg-primary-50/60"
                      }`}
                    >
                      <i className={`${item.icon} text-sm`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="project-budget"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Enveloppe totale ({devise}) <span className="text-primary-600">*</span>
              </label>
              <input
                id="project-budget"
                name="budget_total"
                type="text"
                inputMode="decimal"
                value={budgetTotal}
                onChange={(event) => setBudgetTotal(event.target.value)}
                placeholder="8500000"
                className={`${inputBase} font-semibold ${errors.budgetTotal ? badBorder : okBorder}`}
              />
              {errors.budgetTotal && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
                  <i className="ri-error-warning-line mt-0.5 text-sm" />
                  <span>{errors.budgetTotal}</span>
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor="project-finance"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Déjà financé ({devise})
              </label>
              <input
                id="project-finance"
                name="montant_finance"
                type="text"
                inputMode="decimal"
                value={montantFinance}
                onChange={(event) => setMontantFinance(event.target.value)}
                placeholder="0"
                className={`${inputBase} font-semibold ${errors.montantFinance ? badBorder : okBorder}`}
              />
              {errors.montantFinance && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
                  <i className="ri-error-warning-line mt-0.5 text-sm" />
                  <span>{errors.montantFinance}</span>
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor="project-debut"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Début{" "}
                <span className="font-normal normal-case tracking-normal text-foreground-400">
                  (optionnel)
                </span>
              </label>
              <input
                id="project-debut"
                name="date_debut"
                type="date"
                value={dateDebut}
                onChange={(event) => setDateDebut(event.target.value)}
                className={`${inputBase} cursor-pointer ${okBorder}`}
              />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="project-fin"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Fin prévue{" "}
                <span className="font-normal normal-case tracking-normal text-foreground-400">
                  (optionnel)
                </span>
              </label>
              <input
                id="project-fin"
                name="date_fin"
                type="date"
                value={dateFin}
                min={dateDebut || toIsoDate(new Date())}
                onChange={(event) => setDateFin(event.target.value)}
                className={`${inputBase} cursor-pointer ${errors.dateFin ? badBorder : okBorder}`}
              />
              {errors.dateFin && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
                  <i className="ri-error-warning-line mt-0.5 text-sm" />
                  <span>{errors.dateFin}</span>
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor="project-statut"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Statut
              </label>
              <div className="relative w-full">
                <select
                  id="project-statut"
                  name="statut"
                  value={statut}
                  onChange={(event) => setStatut(event.target.value)}
                  className={`${inputBase} cursor-pointer appearance-none border-background-300 pr-9 focus:border-primary-500 focus:ring-primary-100`}
                >
                  {projectStatuses.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-foreground-400" />
              </div>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="project-priorite"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Priorité
              </label>
              <div className="relative w-full">
                <select
                  id="project-priorite"
                  name="priorite"
                  value={priorite}
                  onChange={(event) => setPriorite(event.target.value)}
                  className={`${inputBase} cursor-pointer appearance-none border-background-300 pr-9 focus:border-primary-500 focus:ring-primary-100`}
                >
                  {projectPriorities.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-foreground-400" />
              </div>
            </div>

            <div className="min-w-0 sm:col-span-2">
              <label
                htmlFor="project-goal"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Objectif d'épargne lié{" "}
                <span className="font-normal normal-case tracking-normal text-foreground-400">
                  (optionnel)
                </span>
              </label>
              <div className="relative w-full">
                <select
                  id="project-goal"
                  name="goal_id"
                  value={goalId}
                  onChange={(event) => setGoalId(event.target.value)}
                  className={`${inputBase} cursor-pointer appearance-none border-background-300 pr-9 focus:border-primary-500 focus:ring-primary-100`}
                >
                  <option value="">Aucun — financement manuel</option>
                  {goals.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nom}
                    </option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-foreground-400" />
              </div>

              {selectedGoal ? (
                <div className="mt-2 rounded-md border border-secondary-200 bg-secondary-100/70 px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-secondary-900">
                    <i className="ri-link-m text-xs" />
                    Objectif synchronisé avec ce projet
                  </p>
                  <div className="mt-1 grid grid-cols-1 gap-1 text-[11px] text-secondary-900/85 sm:grid-cols-3">
                    <span>
                      Cible :{" "}
                      <strong className="font-semibold">
                        {formatMoney(budget > 0 ? budget : Number(selectedGoal.montant_objectif), devise)}
                      </strong>
                    </span>
                    <span>
                      Épargne :{" "}
                      <strong className="font-semibold">
                        {formatMoney(toNumber(montantFinance), devise)}
                      </strong>
                    </span>
                    <span>
                      Reste :{" "}
                      <strong className="font-semibold">{formatMoney(resteAFinancer, devise)}</strong>
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-secondary-900/70">
                    Chaque épargne enregistrée sur cet objectif augmentera automatiquement le montant
                    déjà financé du projet.
                  </p>
                </div>
              ) : (
                <p className="mt-1.5 text-[11px] leading-relaxed text-foreground-400">
                  {goals.length > 0
                    ? "Reliez un objectif d'épargne pour financer automatiquement l'enveloppe manquante du projet."
                    : "Aucun objectif pour l'instant : créez-en un directement ci-dessous, prérempli avec votre enveloppe."}
                </p>
              )}

              <div className="mt-2 rounded-md border border-dashed border-background-300 bg-background-100/60 px-3 py-2.5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground-800">
                      <i className="ri-magic-line text-xs text-primary-600" />
                      Créer l'objectif d'épargne prérempli
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-foreground-500">
                      Cible = enveloppe {formatMoney(budget, devise)} · déjà épargné ={" "}
                      {formatMoney(toNumber(montantFinance), devise)} · échéance ={" "}
                      {dateFin ? formatDateFr(dateFin) : "non définie"} · catégorie{" "}
                      {goalCategoryForProject(categorie).replace("_", " ")}. L'objectif est
                      enregistré dans le module Objectifs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateGoal}
                    disabled={creatingGoal || submitting || budget <= 0}
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-primary-300 bg-primary-50 px-3 py-2 text-[11px] font-semibold text-primary-800 transition-colors hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingGoal ? (
                      <>
                        <i className="ri-loader-4-line animate-spin text-sm" />
                        Création…
                      </>
                    ) : (
                      <>
                        <i className="ri-add-line text-sm" />
                        Créer l'objectif
                      </>
                    )}
                  </button>
                </div>

                {budget <= 0 && (
                  <p className="mt-1.5 text-[10px] font-medium text-foreground-400">
                    Indiquez l'enveloppe totale pour activer la création.
                  </p>
                )}

                {goalError && (
                  <p className="mt-1.5 flex items-start gap-1.5 text-[10px] leading-relaxed text-accent-800">
                    <i className="ri-error-warning-line mt-0.5 text-xs" />
                    <span>{goalError}</span>
                  </p>
                )}

                {goalNotice && (
                  <p className="mt-1.5 flex items-start gap-1.5 text-[10px] font-medium leading-relaxed text-primary-800">
                    <i className="ri-checkbox-circle-line mt-0.5 text-xs" />
                    <span>{goalNotice}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="min-w-0 rounded-lg border border-background-200 bg-background-50 px-3.5 py-3 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600">
                  <i className="ri-route-line text-sm text-primary-600" />
                  Étapes du plan
                </p>
                <span className="shrink-0 rounded-full border border-background-300 bg-background-100 px-2 py-0.5 text-[10px] font-semibold text-foreground-600">
                  {(etapes.length > 0 ? etapes : projectEtapeTemplates[categorie] ?? []).length} étapes
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(etapes.length > 0
                  ? etapes.map((etape) => etape.libelle)
                  : projectEtapeTemplates[categorie] ?? []
                ).map((libelle, index) => (
                  <span
                    key={`${libelle}-${index}`}
                    className="inline-flex items-center gap-1 rounded-full border border-background-300 bg-background-100 px-2 py-0.5 text-[10px] font-medium text-foreground-600"
                  >
                    <span className="text-foreground-400">{index + 1}.</span>
                    {libelle}
                  </span>
                ))}
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-foreground-400">
                <i className="ri-information-line mt-0.5 text-[11px]" />
                <span>
                  {etapes.length > 0
                    ? "Ces étapes sont déjà enregistrées. Ouvrez « Voir projet » pour les cocher, les renommer ou en ajouter."
                    : "Ce plan est proposé selon le type de projet. Vous pourrez l'ajuster, le cocher et y ajouter des documents depuis « Voir projet »."}
                </span>
              </p>
            </div>

            <div className="min-w-0 sm:col-span-2">
              <ProjectPostesEditor
                postes={postes}
                onChange={setPostes}
                devise={devise}
                budgetTotal={budget}
                onApplyTemplate={applyTemplate}
                templateHint={`Répartition conseillée : ${recommendedSplitLabel(categorie)}`}
                error={postesError}
              />
            </div>

            {alloue > 0 && (
              <div className="min-w-0 rounded-md border border-primary-200 bg-primary-50/70 px-3.5 py-3 sm:col-span-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-primary-800">
                  <i className="ri-calculator-line text-sm" />
                  Aperçu de votre plan
                </p>
                <div className="mt-1.5 grid grid-cols-1 gap-1.5 text-[11px] text-primary-900 sm:grid-cols-3">
                  <span>
                    Postes : <strong className="font-semibold">{postes.length}</strong>
                  </span>
                  <span>
                    Reste à dépenser :{" "}
                    <strong className="font-semibold">{formatMoney(preview.reste, devise)}</strong>
                  </span>
                  <span>
                    Consommé :{" "}
                    <strong className="font-semibold">{Math.round(preview.progression)}%</strong>
                  </span>
                </div>
              </div>
            )}

            <div className="min-w-0 sm:col-span-2">
              <label
                htmlFor="project-description"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Description{" "}
                <span className="font-normal normal-case tracking-normal text-foreground-400">
                  (optionnel)
                </span>
              </label>
              <textarea
                id="project-description"
                name="description"
                rows={2}
                maxLength={300}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Objectif du projet, contexte, partenaire…"
                className={`${inputBase} resize-none ${okBorder}`}
              />
              <p className="mt-1 text-right text-[11px] text-foreground-400">{description.length}/300</p>
            </div>

            <div className="min-w-0 sm:col-span-2">
              <label
                htmlFor="project-note"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Note interne{" "}
                <span className="font-normal normal-case tracking-normal text-foreground-400">
                  (optionnel)
                </span>
              </label>
              <textarea
                id="project-note"
                name="note"
                rows={2}
                maxLength={200}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Devis à demander, fournisseur retenu, prochaine étape…"
                className={`${inputBase} resize-none ${okBorder}`}
              />
            </div>
          </div>

          {serverError && (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-accent-300 bg-accent-50 px-3.5 py-2.5 text-xs leading-relaxed text-accent-900">
              <i className="ri-error-warning-line mt-0.5 text-sm" />
              <span>{serverError}</span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-background-200 bg-background-50 px-4 py-3.5 sm:flex-row sm:justify-end md:px-5">
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-background-300 px-4 py-2.5 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <i className="ri-loader-4-line animate-spin text-base" />
                Enregistrement…
              </>
            ) : (
              <>
                <i className={initial ? "ri-save-line text-base" : "ri-add-line text-base"} />
                {initial ? "Enregistrer" : "Créer le projet"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </ModalPortal>
  );
}