import { useEffect, useState, type FormEvent } from "react";
import ModalPortal from "@/components/base/ModalPortal";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { incomeTypes, toIsoDate, type IncomeEntry, type IncomeType } from "@/lib/finance";

type IncomeFormModalProps = {
  initial: IncomeEntry | null;
  devise: string;
  onClose: () => void;
  onSaved: (entry: IncomeEntry, mode: "create" | "update") => void;
};

const SELECT_COLUMNS = "id, source, montant, date, type, note, recurrent";

export default function IncomeFormModal({ initial, devise, onClose, onSaved }: IncomeFormModalProps) {
  const { session } = useAuth();

  const [source, setSource] = useState(initial?.source ?? "");
  const [montant, setMontant] = useState(initial ? String(initial.montant) : "");
  const [date, setDate] = useState(initial?.date ?? toIsoDate(new Date()));
  const [type, setType] = useState<IncomeType>((initial?.type as IncomeType) ?? "salaire");
  const [note, setNote] = useState(initial?.note ?? "");
  const [recurrent, setRecurrent] = useState(initial?.recurrent ?? false);

  const [errors, setErrors] = useState<{ source?: string; montant?: string; date?: string }>({});
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");

    const nextErrors: { source?: string; montant?: string; date?: string } = {};
    const cleanSource = source.trim();
    const numericAmount = Number(montant.replace(/\s/g, "").replace(",", "."));

    if (cleanSource.length < 2) nextErrors.source = "Indiquez la source du revenu (2 caractères minimum).";
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
      source: cleanSource,
      montant: numericAmount,
      date,
      type,
      note: note.trim() ? note.trim() : null,
      recurrent,
    };

    setSubmitting(true);
    try {
      if (initial) {
        const { data, error } = await supabase
          .from("income")
          .update(payload)
          .eq("id", initial.id)
          .select(SELECT_COLUMNS)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("Revenu introuvable ou mise à jour refusée.");
        onSaved(data as IncomeEntry, "update");
      } else {
        const { data, error } = await supabase
          .from("income")
          .insert({ ...payload, user_id: userId })
          .select(SELECT_COLUMNS)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("L'enregistrement n'a pas pu être confirmé.");
        onSaved(data as IncomeEntry, "create");
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
              {initial ? "Modifier le revenu" : "Ajouter un revenu"}
            </h2>
            <p className="mt-0.5 text-xs text-foreground-500">
              Ces montants alimentent votre budget et votre capacité d'épargne.
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
                htmlFor="income-source"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Source du revenu <span className="text-primary-600">*</span>
              </label>
              <div className="relative w-full">
                <span className="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-foreground-400">
                  <i className="ri-wallet-3-line text-base" />
                </span>
                <input
                  id="income-source"
                  name="source"
                  type="text"
                  value={source}
                  autoFocus
                  maxLength={80}
                  onChange={(event) => setSource(event.target.value)}
                  placeholder="Salaire Novembre — Société XYZ"
                  className={`box-border w-full min-w-0 rounded-md border bg-background-50 py-2.5 pl-10 pr-3.5 text-sm text-foreground-950 transition-colors placeholder:text-foreground-400 focus:outline-none focus:ring-2 ${
                    errors.source
                      ? "border-accent-500 focus:border-accent-500 focus:ring-accent-200"
                      : "border-background-300 focus:border-primary-500 focus:ring-primary-100"
                  }`}
                />
              </div>
              {errors.source && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-accent-700">
                  <i className="ri-error-warning-line mt-0.5 text-sm" />
                  <span>{errors.source}</span>
                </p>
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor="income-montant"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Montant ({devise}) <span className="text-primary-600">*</span>
              </label>
              <div className="relative w-full">
                <input
                  id="income-montant"
                  name="montant"
                  type="text"
                  inputMode="decimal"
                  value={montant}
                  onChange={(event) => setMontant(event.target.value)}
                  placeholder="450000"
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
                htmlFor="income-date"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Date d'encaissement <span className="text-primary-600">*</span>
              </label>
              <input
                id="income-date"
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
                Type de revenu
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {incomeTypes.map((item) => {
                  const active = type === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setType(item.value)}
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
                htmlFor="income-note"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Note <span className="font-normal normal-case tracking-normal text-foreground-400">(optionnel)</span>
              </label>
              <textarea
                id="income-note"
                name="note"
                rows={2}
                maxLength={200}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Prime, mission ponctuelle, 13e mois…"
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
                Revenu récurrent
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-foreground-500">
                Ce revenu revient chaque mois (salaire, loyer perçu…).
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
                {initial ? "Enregistrer" : "Ajouter le revenu"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </ModalPortal>
  );
}