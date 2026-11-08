import { useEffect, useMemo, useState, type FormEvent } from "react";
import ModalPortal from "@/components/base/ModalPortal";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { formatMoney, toIsoDate } from "@/lib/finance";
import {
  computeGoalProgress,
  formatMonths,
  goalCategories,
  goalPriorities,
  type GoalEntry,
} from "@/lib/goals";

type GoalFormModalProps = {
  initial: GoalEntry | null;
  devise: string;
  onClose: () => void;
  onSaved: (goal: GoalEntry, mode: "create" | "update") => void;
};

const SELECT_COLUMNS =
  "id, nom, categorie, montant_objectif, montant_actuel, date_limite, priorite, statut, note";

export default function GoalFormModal({ initial, devise, onClose, onSaved }: GoalFormModalProps) {
  const { session } = useAuth();

  const [nom, setNom] = useState(initial?.nom ?? "");
  const [categorie, setCategorie] = useState(initial?.categorie ?? "fonds_urgence");
  const [montantObjectif, setMontantObjectif] = useState(
    initial ? String(initial.montant_objectif) : "",
  );
  const [montantActuel, setMontantActuel] = useState(initial ? String(initial.montant_actuel) : "0");
  const [dateLimite, setDateLimite] = useState(initial?.date_limite ?? "");
  const [priorite, setPriorite] = useState(initial?.priorite ?? "moyenne");
  const [note, setNote] = useState(initial?.note ?? "");

  const [errors, setErrors] = useState<{
    nom?: string;
    montantObjectif?: string;
    montantActuel?: string;
    dateLimite?: string;
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
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, submitting]);

  const preview = useMemo(() => {
    const objectif = Number(montantObjectif.replace(/\s/g, "").replace(",", ".")) || 0;
    const actuel = Number(montantActuel.replace(/\s/g, "").replace(",", ".")) || 0;
    const progress = computeGoalProgress({
      id: "preview",
      nom: nom || "Objectif",
      categorie,
      montant_objectif: objectif,
      montant_actuel: actuel,
      date_limite: dateLimite || null,
      priorite,
      statut: "actif",
      note: null,
    });
    return { objectif, actuel, ...progress };
  }, [montantObjectif, montantActuel, dateLimite, nom, categorie, priorite]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");

    const cleanNom = nom.trim();
    const objectif = Number(montantObjectif.replace(/\s/g, "").replace(",", "."));
    const actuelValue = montantActuel.trim() === "" ? 0 : Number(montantActuel.replace(/\s/g, "").replace(",", "."));

    const nextErrors: typeof errors = {};
    if (cleanNom.length < 2) nextErrors.nom = "Donnez un nom à votre objectif (2 caractères minimum).";
    if (!montantObjectif.trim()) nextErrors.montantObjectif = "Indiquez le montant visé.";
    else if (!Number.isFinite(objectif) || objectif <= 0)
      nextErrors.montantObjectif = "Le montant visé doit être supérieur à zéro.";
    if (!Number.isFinite(actuelValue) || actuelValue < 0)
      nextErrors.montantActuel = "Le montant déjà épargné ne peut pas être négatif.";
    else if (Number.isFinite(objectif) && actuelValue > objectif)
      nextErrors.montantActuel = "Le montant épargné dépasse déjà la cible.";
    if (dateLimite && dateLimite < toIsoDate(new Date()))
      nextErrors.dateLimite = "Choisissez une date future (ou laissez vide).";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const userId = session?.user?.id;
    if (!userId) {
      setServerError("Session expirée. Reconnectez-vous puis réessayez.");
      return;
    }

    const statut = objectif > 0 && actuelValue >= objectif ? "atteint" : "actif";
    const payload = {
      nom: cleanNom,
      categorie,
      montant_objectif: objectif,
      montant_actuel: actuelValue,
      date_limite: dateLimite || null,
      priorite,
      statut,
      note: note.trim() ? note.trim() : null,
      updated_at: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      if (initial) {
        const { data, error } = await supabase
          .from("goals")
          .update(payload)
          .eq("id", initial.id)
          .select(SELECT_COLUMNS)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("Objectif introuvable ou mise à jour refusée.");
        onSaved(data as GoalEntry, "update");
      } else {
        const { data, error } = await supabase
          .from("goals")
          .insert({ ...payload, user_id: userId })
          .select(SELECT_COLUMNS)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("L'enregistrement n'a pas pu être confirmé.");
        onSaved(data as GoalEntry, "create");
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
              {initial ? "Modifier l'objectif" : "Nouvel objectif financier"}
            </h2>
            <p className="mt-0.5 text-xs text-foreground-500">
              FinBuilder calcule l'épargne mensuelle nécessaire pour tenir votre échéance.
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
                htmlFor="goal-nom"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Nom de l'objectif <span className="text-primary-600">*</span>
              </label>
              <input
                id="goal-nom"
                name="nom"
                type="text"
                value={nom}
                autoFocus
                maxLength={70}
                onChange={(event) => setNom(event.target.value)}
                placeholder="Apport pour la maison, voiture, fonds d'urgence…"
                className={`${inputBase} ${
                  errors.nom
                    ? "border-accent-500 focus:border-accent-500 focus:ring-accent-200"
                    : "border-background-300 focus:border-primary-500 focus:ring-primary-100"
                }`}
              />
              {errors.nom && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
                  <i className="ri-error-warning-line mt-0.5 text-sm" />
                  <span>{errors.nom}</span>
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor="goal-objectif"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Montant visé ({devise}) <span className="text-primary-600">*</span>
              </label>
              <input
                id="goal-objectif"
                name="montant_objectif"
                type="text"
                inputMode="decimal"
                value={montantObjectif}
                onChange={(event) => setMontantObjectif(event.target.value)}
                placeholder="2500000"
                className={`${inputBase} font-semibold ${
                  errors.montantObjectif
                    ? "border-accent-500 focus:border-accent-500 focus:ring-accent-200"
                    : "border-background-300 focus:border-primary-500 focus:ring-primary-100"
                }`}
              />
              {errors.montantObjectif && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
                  <i className="ri-error-warning-line mt-0.5 text-sm" />
                  <span>{errors.montantObjectif}</span>
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor="goal-actuel"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Déjà épargné ({devise})
              </label>
              <input
                id="goal-actuel"
                name="montant_actuel"
                type="text"
                inputMode="decimal"
                value={montantActuel}
                onChange={(event) => setMontantActuel(event.target.value)}
                placeholder="0"
                className={`${inputBase} font-semibold ${
                  errors.montantActuel
                    ? "border-accent-500 focus:border-accent-500 focus:ring-accent-200"
                    : "border-background-300 focus:border-primary-500 focus:ring-primary-100"
                }`}
              />
              {errors.montantActuel && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
                  <i className="ri-error-warning-line mt-0.5 text-sm" />
                  <span>{errors.montantActuel}</span>
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor="goal-echeance"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Échéance{" "}
                <span className="font-normal normal-case tracking-normal text-foreground-400">
                  (optionnel)
                </span>
              </label>
              <input
                id="goal-echeance"
                name="date_limite"
                type="date"
                value={dateLimite}
                onChange={(event) => setDateLimite(event.target.value)}
                className={`${inputBase} cursor-pointer ${
                  errors.dateLimite
                    ? "border-accent-500 focus:border-accent-500 focus:ring-accent-200"
                    : "border-background-300 focus:border-primary-500 focus:ring-primary-100"
                }`}
              />
              {errors.dateLimite && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
                  <i className="ri-error-warning-line mt-0.5 text-sm" />
                  <span>{errors.dateLimite}</span>
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor="goal-priorite"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Priorité
              </label>
              <div className="relative w-full">
                <select
                  id="goal-priorite"
                  name="priorite"
                  value={priorite}
                  onChange={(event) => setPriorite(event.target.value)}
                  className={`${inputBase} cursor-pointer appearance-none border-background-300 pr-9 focus:border-primary-500 focus:ring-primary-100`}
                >
                  {goalPriorities.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-foreground-400" />
              </div>
            </div>

            <div className="min-w-0 sm:col-span-2">
              <p className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600">
                Catégorie
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {goalCategories.map((item) => {
                  const active = categorie === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategorie(item.value)}
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

            <div className="min-w-0 sm:col-span-2">
              <label
                htmlFor="goal-note"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Note{" "}
                <span className="font-normal normal-case tracking-normal text-foreground-400">
                  (optionnel)
                </span>
              </label>
              <textarea
                id="goal-note"
                name="note"
                rows={2}
                maxLength={200}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Motivation, compte d'épargne utilisé, prochaine étape…"
                className={`${inputBase} resize-none border-background-300 focus:border-primary-500 focus:ring-primary-100`}
              />
              <p className="mt-1 text-right text-[11px] text-foreground-400">{note.length}/200</p>
            </div>
          </div>

          {preview.objectif > 0 && (
            <div className="mt-1 rounded-md border border-primary-200 bg-primary-50/70 px-3.5 py-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-primary-800">
                <i className="ri-calculator-line text-sm" />
                Simulation de votre plan d'épargne
              </p>
              <div className="mt-1.5 grid grid-cols-1 gap-1.5 text-[11px] text-primary-900 sm:grid-cols-2">
                <span>
                  Reste à financer :{" "}
                  <strong className="font-semibold">{formatMoney(preview.restant, devise)}</strong>
                </span>
                <span>
                  Épargne mensuelle :{" "}
                  <strong className="font-semibold">
                    {preview.epargneMensuelle > 0 ? formatMoney(preview.epargneMensuelle, devise) : "—"}
                  </strong>
                </span>
                <span>
                  Durée : <strong className="font-semibold">{formatMonths(preview.moisRestants)}</strong>
                </span>
                <span>
                  Progression : <strong className="font-semibold">{Math.round(preview.progression)}%</strong>
                </span>
              </div>
              {!dateLimite && (
                <p className="mt-1.5 text-[11px] leading-relaxed text-primary-800/80">
                  Ajoutez une échéance pour connaître l'effort mensuel exact.
                </p>
              )}
              <p className="mt-1.5 flex items-start gap-1.5 border-t border-primary-200 pt-1.5 text-[10px] leading-relaxed text-primary-900/70">
                <i className="ri-information-line mt-0.5 text-[11px]" />
                <span>
                  Un objectif est une destination. Le détail des dépenses (terrain, travaux,
                  traiteur…) se planifie dans un projet, que vous pourrez relier à cet objectif.
                </span>
              </p>
            </div>
          )}

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
                {initial ? "Enregistrer" : "Créer l'objectif"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </ModalPortal>
  );
}