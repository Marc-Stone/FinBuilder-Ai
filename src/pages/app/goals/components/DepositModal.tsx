import { useEffect, useMemo, useState, type FormEvent } from "react";
import ModalPortal from "@/components/base/ModalPortal";
import { supabase } from "@/lib/supabaseClient";
import { formatMoney } from "@/lib/finance";
import { computeGoalProgress, type GoalEntry } from "@/lib/goals";

type DepositModalProps = {
  goal: GoalEntry;
  devise: string;
  onClose: () => void;
  onSaved: (goal: GoalEntry) => void;
};

const SELECT_COLUMNS =
  "id, nom, categorie, montant_objectif, montant_actuel, date_limite, priorite, statut, note";

export default function DepositModal({ goal, devise, onClose, onSaved }: DepositModalProps) {
  const progress = useMemo(() => computeGoalProgress(goal), [goal]);
  const [montant, setMontant] = useState("");
  const [error, setError] = useState("");
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

  const shortcuts = [
    { label: "25 %", ratio: 0.25 },
    { label: "50 %", ratio: 0.5 },
    { label: "Tout", ratio: 1 },
  ];

  const applyShortcut = (ratio: number) => {
    setMontant(String(Math.round(progress.restant * ratio)));
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");
    setError("");

    const value = Number(montant.replace(/\s/g, "").replace(",", "."));
    if (!montant.trim()) {
      setError("Indiquez le montant que vous épargnez.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError("Le montant doit être supérieur à zéro.");
      return;
    }
    if (value > progress.restant) {
      setError(`Le reste à financer est de ${formatMoney(progress.restant, devise)}.`);
      return;
    }

    const nouveauMontant = Number(goal.montant_actuel) + value;
    const atteint = nouveauMontant >= Number(goal.montant_objectif);

    setSubmitting(true);
    try {
      const { data, error: updateError } = await supabase
        .from("goals")
        .update({
          montant_actuel: nouveauMontant,
          statut: atteint ? "atteint" : "actif",
          updated_at: new Date().toISOString(),
        })
        .eq("id", goal.id)
        .select(SELECT_COLUMNS)
        .maybeSingle();
      if (updateError) throw updateError;
      if (!data) throw new Error("Objectif introuvable ou mise à jour refusée.");
      onSaved(data as GoalEntry);
    } catch (updateError) {
      setServerError(
        updateError instanceof Error
          ? `Enregistrement impossible : ${updateError.message}`
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
        className="relative z-10 w-full max-w-md animate-fade-up overflow-hidden rounded-t-lg border border-background-200 bg-background-50 sm:rounded-lg"
      >
        <div className="flex items-start justify-between gap-3 border-b border-background-200 px-4 py-3.5 md:px-5">
          <div className="min-w-0">
            <h2
              className="text-sm font-semibold text-foreground-950 md:text-base"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Enregistrer une épargne
            </h2>
            <p className="mt-0.5 truncate text-xs text-foreground-500">{goal.nom}</p>
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

        <div className="px-4 py-4 md:px-5">
          <div className="rounded-md bg-background-100 px-3.5 py-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                Déjà épargné
              </p>
              <p className="text-[11px] font-semibold text-primary-700">
                {Math.round(progress.progression)}%
              </p>
            </div>
            <p
              className="mt-1 text-lg font-semibold text-foreground-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {formatMoney(Number(goal.montant_actuel), devise)}
              <span className="ml-1.5 text-xs font-medium text-foreground-400">
                / {formatMoney(Number(goal.montant_objectif), devise)}
              </span>
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-700"
                style={{ width: `${Math.max(progress.progression, progress.progression > 0 ? 2 : 0)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-foreground-500">
              Reste à financer :{" "}
              <span className="font-semibold text-foreground-800">
                {formatMoney(progress.restant, devise)}
              </span>
              {progress.epargneMensuelle > 0 && (
                <>
                  {" "}· soit {formatMoney(progress.epargneMensuelle, devise)} par mois
                </>
              )}
            </p>
          </div>

          <div className="mt-4">
            <label
              htmlFor="deposit-montant"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
            >
              Montant épargné ({devise}) <span className="text-primary-600">*</span>
            </label>
            <input
              id="deposit-montant"
              name="montant"
              type="text"
              inputMode="decimal"
              autoFocus
              value={montant}
              onChange={(event) => {
                setMontant(event.target.value);
                setError("");
              }}
              placeholder="50000"
              className={`box-border w-full min-w-0 rounded-md border bg-background-50 px-3.5 py-2.5 text-sm font-semibold text-foreground-950 transition-colors placeholder:font-normal placeholder:text-foreground-400 focus:outline-none focus:ring-2 ${
                error
                  ? "border-accent-500 focus:border-accent-500 focus:ring-accent-200"
                  : "border-background-300 focus:border-primary-500 focus:ring-primary-100"
              }`}
            />
            {error && (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
                <i className="ri-error-warning-line mt-0.5 text-sm" />
                <span>{error}</span>
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-1.5">
              {shortcuts.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => applyShortcut(item.ratio)}
                  className="cursor-pointer whitespace-nowrap rounded-full border border-background-300 bg-background-50 px-2.5 py-1 text-[11px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {serverError && (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-accent-300 bg-accent-50 px-3.5 py-2.5 text-xs leading-relaxed text-accent-900">
              <i className="ri-error-warning-line mt-0.5 text-sm" />
              <span>{serverError}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-background-200 bg-background-50 px-4 py-3.5 sm:flex-row sm:justify-end md:px-5">
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
                <i className="ri-safe-2-line text-base" />
                Ajouter à l'objectif
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </ModalPortal>
  );
}