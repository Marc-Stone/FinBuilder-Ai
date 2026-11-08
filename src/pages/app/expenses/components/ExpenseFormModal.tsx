import { useEffect, useState, type FormEvent } from "react";
import ModalPortal from "@/components/base/ModalPortal";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import {
  expenseCategories,
  paymentMethods,
  toIsoDate,
  type ExpenseCategory,
  type ExpenseEntry,
} from "@/lib/finance";

type ExpenseFormModalProps = {
  initial: ExpenseEntry | null;
  devise: string;
  onClose: () => void;
  onSaved: (entry: ExpenseEntry, mode: "create" | "update") => void;
};

const SELECT_COLUMNS =
  "id, description, montant, date, categorie, mode_paiement, note, recurrent, project_id";

export default function ExpenseFormModal({
  initial,
  devise,
  onClose,
  onSaved,
}: ExpenseFormModalProps) {
  const { session } = useAuth();

  const [description, setDescription] = useState(initial?.description ?? "");
  const [montant, setMontant] = useState(initial ? String(initial.montant) : "");
  const [date, setDate] = useState(initial?.date ?? toIsoDate(new Date()));
  const [categorie, setCategorie] = useState<ExpenseCategory>(
    (initial?.categorie as ExpenseCategory) ?? "alimentation",
  );
  const [modePaiement, setModePaiement] = useState(initial?.mode_paiement ?? "mobile_money");
  const [note, setNote] = useState(initial?.note ?? "");
  const [recurrent, setRecurrent] = useState(initial?.recurrent ?? false);
  const [projectId, setProjectId] = useState(initial?.project_id ?? "");
  const [projects, setProjects] = useState<{ id: string; nom: string }[]>([]);

  const [errors, setErrors] = useState<{
    description?: string;
    montant?: string;
    date?: string;
  }>({});
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
    supabase
      .from("projects")
      .select("id, nom")
      .order("nom", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setProjects((data ?? []) as { id: string; nom: string }[]);
      });
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");

    const nextErrors: { description?: string; montant?: string; date?: string } = {};
    const cleanDescription = description.trim();
    const numericAmount = Number(montant.replace(/\s/g, "").replace(",", "."));

    if (cleanDescription.length < 2)
      nextErrors.description = "Décrivez la dépense (2 caractères minimum).";
    if (!montant.trim()) nextErrors.montant = "Saisissez un montant.";
    else if (!Number.isFinite(numericAmount) || numericAmount <= 0)
      nextErrors.montant = "Le montant doit être supérieur à zéro.";
    if (!date) nextErrors.date = "Choisissez une date.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const userId = session?.user?.id;
    if (!userId) {
      setServerError("Session expirée. Reconnectez-vous puis réessayez.");
      return;
    }

    const payload = {
      description: cleanDescription,
      montant: numericAmount,
      date,
      categorie,
      mode_paiement: modePaiement,
      note: note.trim() ? note.trim() : null,
      recurrent,
      project_id: projectId || null,
      updated_at: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      if (initial) {
        const { data, error } = await supabase
          .from("expenses")
          .update(payload)
          .eq("id", initial.id)
          .select(SELECT_COLUMNS)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("Dépense introuvable ou mise à jour refusée.");
        onSaved(data as ExpenseEntry, "update");
      } else {
        const { data, error } = await supabase
          .from("expenses")
          .insert({ ...payload, user_id: userId })
          .select(SELECT_COLUMNS)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("L'enregistrement n'a pas pu être confirmé.");
        onSaved(data as ExpenseEntry, "create");
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
        className="relative z-10 flex max-h-[92vh] w-full max-w-lg animate-fade-up flex-col overflow-hidden rounded-t-lg border border-background-200 bg-background-50 sm:rounded-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-background-200 px-4 py-3.5 md:px-5">
          <div className="min-w-0">
            <h2
              className="text-sm font-semibold text-foreground-950 md:text-base"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {initial ? "Modifier la dépense" : "Ajouter une dépense"}
            </h2>
            <p className="mt-0.5 text-xs text-foreground-500">
              Chaque dépense alimente votre répartition et votre budget intelligent.
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
                htmlFor="expense-description"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Description <span className="text-primary-600">*</span>
              </label>
              <div className="relative w-full">
                <span className="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-foreground-400">
                  <i className="ri-shopping-basket-2-line text-base" />
                </span>
                <input
                  id="expense-description"
                  name="description"
                  type="text"
                  value={description}
                  autoFocus
                  maxLength={80}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Courses du marché, loyer, carburant…"
                  className={`box-border w-full min-w-0 rounded-md border bg-background-50 py-2.5 pl-10 pr-3.5 text-sm text-foreground-950 transition-colors placeholder:text-foreground-400 focus:outline-none focus:ring-2 ${
                    errors.description
                      ? "border-accent-500 focus:border-accent-500 focus:ring-accent-200"
                      : "border-background-300 focus:border-primary-500 focus:ring-primary-100"
                  }`}
                />
              </div>
              {errors.description && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
                  <i className="ri-error-warning-line mt-0.5 text-sm" />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor="expense-montant"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Montant ({devise}) <span className="text-primary-600">*</span>
              </label>
              <div className="relative w-full">
                <input
                  id="expense-montant"
                  name="montant"
                  type="text"
                  inputMode="decimal"
                  value={montant}
                  onChange={(event) => setMontant(event.target.value)}
                  placeholder="25000"
                  className={`box-border w-full min-w-0 rounded-md border bg-background-50 py-2.5 pl-3.5 pr-14 text-sm font-semibold text-foreground-950 transition-colors placeholder:font-normal placeholder:text-foreground-400 focus:outline-none focus:ring-2 ${
                    errors.montant
                      ? "border-accent-500 focus:border-accent-500 focus:ring-accent-200"
                      : "border-background-300 focus:border-primary-500 focus:ring-primary-100"
                  }`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground-400">
                  {devise}
                </span>
              </div>
              {errors.montant && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
                  <i className="ri-error-warning-line mt-0.5 text-sm" />
                  <span>{errors.montant}</span>
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor="expense-date"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Date <span className="text-primary-600">*</span>
              </label>
              <input
                id="expense-date"
                name="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={`box-border w-full min-w-0 cursor-pointer rounded-md border bg-background-50 px-3.5 py-2.5 text-sm text-foreground-950 transition-colors focus:outline-none focus:ring-2 ${
                  errors.date
                    ? "border-accent-500 focus:border-accent-500 focus:ring-accent-200"
                    : "border-background-300 focus:border-primary-500 focus:ring-primary-100"
                }`}
              />
              {errors.date && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
                  <i className="ri-error-warning-line mt-0.5 text-sm" />
                  <span>{errors.date}</span>
                </p>
              )}
            </div>

            <div className="min-w-0 sm:col-span-2">
              <p className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600">
                Catégorie
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {expenseCategories.map((item) => {
                  const active = categorie === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategorie(item.value)}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-xs font-semibold transition-colors duration-200 ${
                        active
                          ? "border-primary-500 bg-primary-50 text-primary-800"
                          : "border-background-300 bg-background-50 text-foreground-600 hover:border-primary-300 hover:bg-primary-50/60"
                      }`}
                    >
                      <i className={`${item.icon} text-sm`} />
                      <span className="truncate">{item.label}</span>
                      {active && <i className="ri-check-line ml-auto text-xs" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0 sm:col-span-2">
              <label
                htmlFor="expense-paiement"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Mode de paiement
              </label>
              <div className="relative w-full">
                <select
                  id="expense-paiement"
                  name="mode_paiement"
                  value={modePaiement}
                  onChange={(event) => setModePaiement(event.target.value)}
                  className="box-border w-full min-w-0 cursor-pointer appearance-none rounded-md border border-background-300 bg-background-50 py-2.5 pl-10 pr-9 text-sm text-foreground-950 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                <i className="ri-bank-card-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-foreground-400" />
                <i className="ri-arrow-down-s-line pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-foreground-400" />
              </div>
            </div>

            <div className="min-w-0 sm:col-span-2">
              <label
                htmlFor="expense-projet"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Projet associé{" "}
                <span className="font-normal normal-case tracking-normal text-foreground-400">
                  (optionnel)
                </span>
              </label>
              <div className="relative w-full">
                <select
                  id="expense-projet"
                  name="project_id"
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  disabled={projects.length === 0}
                  className="box-border w-full min-w-0 cursor-pointer appearance-none rounded-md border border-background-300 bg-background-50 py-2.5 pl-10 pr-9 text-sm text-foreground-950 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-background-100 disabled:text-foreground-400"
                >
                  <option value="">Aucun projet</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.nom}
                    </option>
                  ))}
                </select>
                <i className="ri-building-4-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-foreground-400" />
                <i className="ri-arrow-down-s-line pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-foreground-400" />
              </div>
              <p className="mt-1 flex items-start gap-1 text-[11px] leading-relaxed text-foreground-500">
                <i className="ri-information-line mt-0.5 text-xs text-primary-600" />
                <span>
                  {projects.length > 0
                    ? "La dépense augmentera automatiquement le budget consommé et l'avancement de ce projet."
                    : "Créez un projet pour pouvoir y rattacher vos dépenses."}
                </span>
              </p>
            </div>

            <div className="min-w-0 sm:col-span-2">
              <label
                htmlFor="expense-note"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Note{" "}
                <span className="font-normal normal-case tracking-normal text-foreground-400">
                  (optionnel)
                </span>
              </label>
              <textarea
                id="expense-note"
                name="note"
                rows={2}
                maxLength={200}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Précision utile : commerçant, fréquence, motif…"
                className="box-border w-full min-w-0 resize-none rounded-md border border-background-300 bg-background-50 px-3.5 py-2.5 text-sm text-foreground-950 transition-colors placeholder:text-foreground-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              <p className="mt-1 text-right text-[11px] text-foreground-400">{note.length}/200</p>
            </div>
          </div>

          <label className="mt-1 flex cursor-pointer items-start gap-2.5 rounded-md border border-background-200 bg-background-100/60 px-3 py-2.5">
            <input
              type="checkbox"
              checked={recurrent}
              onChange={(event) => setRecurrent(event.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer accent-primary-600"
            />
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-foreground-900">
                Dépense récurrente
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-foreground-500">
                Loyer, abonnement, école… une charge qui revient chaque mois.
              </span>
            </span>
          </label>

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
                {initial ? "Enregistrer" : "Ajouter la dépense"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </ModalPortal>
  );
}