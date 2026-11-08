import { useEffect, useMemo, useState } from "react";
import ModalPortal from "@/components/base/ModalPortal";
import { educationModules, getEducationModule } from "@/lib/education";
import {
  CONTENT_CATEGORIES,
  CONTENT_ICONS,
  CONTENT_NIVEAUX,
  draftFromRow,
  emptyDraft,
  type ContentDraft,
  type ContentRow,
} from "@/lib/content";

type ContentFormModalProps = {
  row: ContentRow | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (draft: ContentDraft) => void;
};

export default function ContentFormModal({ row, saving, onClose, onSubmit }: ContentFormModalProps) {
  const [draft, setDraft] = useState<ContentDraft>(() => (row ? draftFromRow(row) : emptyDraft()));
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, saving]);

  const set = <K extends keyof ContentDraft>(key: K, value: ContentDraft[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
  };

  const handleModule = (value: string) => {
    const meta = getEducationModule(value);
    setDraft((previous) => ({ ...previous, module: value, url: meta.to }));
  };

  const updatePoint = (index: number, value: string) => {
    setDraft((previous) => {
      const points = [...previous.points];
      points[index] = value;
      return { ...previous, points };
    });
  };

  const addPoint = () => {
    setDraft((previous) => ({ ...previous, points: [...previous.points, ""] }));
  };

  const removePoint = (index: number) => {
    setDraft((previous) => ({
      ...previous,
      points: previous.points.length > 1 ? previous.points.filter((_, i) => i !== index) : [""],
    }));
  };

  const filledPoints = useMemo(
    () => draft.points.filter((point) => point.trim().length > 0).length,
    [draft.points],
  );

  const validate = (): string[] => {
    const found: string[] = [];
    if (draft.titre.trim().length < 5) found.push("Le titre doit contenir au moins 5 caractères.");
    if (draft.resume.trim().length < 20) found.push("Le résumé doit contenir au moins 20 caractères.");
    if (filledPoints < 2) found.push("Ajoutez au moins deux points clés pour guider le lecteur.");
    if (draft.statut === "publie" && draft.exemple.trim().length < 10) {
      found.push("Une fiche publiée doit proposer un exemple chiffré.");
    }
    return found;
  };

  const handleSubmit = () => {
    const found = validate();
    setErrors(found);
    if (found.length > 0) return;
    onSubmit(draft);
  };

  const fieldClass =
    "w-full rounded-md border border-background-300 bg-background-50 px-3 py-2 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-primary-400";
  const labelClass =
    "mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500";

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => {
            if (!saving) onClose();
          }}
          className="absolute inset-0 cursor-pointer bg-foreground-950/50"
        />

        <div className="relative z-10 flex max-h-[94vh] w-full max-w-3xl animate-fade-up flex-col overflow-hidden rounded-t-xl border border-background-200 bg-background-50 sm:rounded-lg">
          <div className="flex items-start gap-3 border-b border-background-200 px-4 py-3.5 md:px-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-800">
              <i className={row ? "ri-edit-line text-base" : "ri-add-line text-base"} />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                className="text-sm font-semibold text-foreground-950"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {row ? "Modifier la fiche" : "Nouvelle fiche pédagogique"}
              </h2>
              <p className="mt-0.5 text-[11px] text-foreground-500">
                Une fiche publiée apparaît immédiatement dans la bibliothèque d'éducation des
                utilisateurs.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Fermer"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-500 hover:bg-background-100 disabled:opacity-50"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>

          <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4 md:px-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="content-titre">
                  Titre de la fiche
                </label>
                <input
                  id="content-titre"
                  value={draft.titre}
                  onChange={(event) => set("titre", event.target.value)}
                  placeholder="Ex. Construire un fonds d'urgence en 6 mois"
                  className={fieldClass}
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className={labelClass} htmlFor="content-resume">
                    Résumé d'accroche
                  </label>
                  <span className="text-[10px] tabular-nums text-foreground-400">
                    {draft.resume.length} / 500
                  </span>
                </div>
                <textarea
                  id="content-resume"
                  value={draft.resume}
                  onChange={(event) => set("resume", event.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Deux phrases maximum pour donner envie de lire."
                  className={`${fieldClass} resize-none`}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="content-categorie">
                  Catégorie
                </label>
                <select
                  id="content-categorie"
                  value={draft.categorie}
                  onChange={(event) => set("categorie", event.target.value)}
                  className={`${fieldClass} cursor-pointer`}
                >
                  {CONTENT_CATEGORIES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="content-module">
                  Module lié
                </label>
                <select
                  id="content-module"
                  value={draft.module}
                  onChange={(event) => handleModule(event.target.value)}
                  className={`${fieldClass} cursor-pointer`}
                >
                  {educationModules.map((module) => (
                    <option key={module.value} value={module.value}>
                      {module.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="content-niveau">
                  Niveau
                </label>
                <select
                  id="content-niveau"
                  value={draft.niveau}
                  onChange={(event) => set("niveau", event.target.value)}
                  className={`${fieldClass} cursor-pointer`}
                >
                  {CONTENT_NIVEAUX.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="content-minutes">
                  Durée de lecture (minutes)
                </label>
                <input
                  id="content-minutes"
                  type="number"
                  min={1}
                  max={60}
                  value={draft.minutes}
                  onChange={(event) => set("minutes", Number(event.target.value))}
                  className={fieldClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Icône de la fiche</label>
                <div className="flex flex-wrap gap-1.5 rounded-md border border-background-300 bg-background-50 p-2">
                  {CONTENT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => set("icon", icon)}
                      aria-label={icon}
                      aria-pressed={draft.icon === icon}
                      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border transition-colors ${
                        draft.icon === icon
                          ? "border-primary-500 bg-primary-50 text-primary-800"
                          : "border-background-200 text-foreground-500 hover:border-primary-300 hover:text-primary-700"
                      }`}
                    >
                      <i className={`${icon} text-base`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="content-action">
                  Libellé du bouton d'action
                </label>
                <input
                  id="content-action"
                  value={draft.action}
                  onChange={(event) => set("action", event.target.value)}
                  placeholder="Ex. Comparer mon budget réel"
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="content-url">
                  Page cible dans l'application
                </label>
                <input
                  id="content-url"
                  value={draft.url}
                  onChange={(event) => set("url", event.target.value)}
                  placeholder="/app/budget"
                  className={fieldClass}
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Points clés</label>
                  <span className="text-[10px] font-medium text-foreground-400">
                    {filledPoints} point{filledPoints > 1 ? "s" : ""} renseigné{filledPoints > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {draft.points.map((point, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-800">
                        {index + 1}
                      </span>
                      <input
                        value={point}
                        onChange={(event) => updatePoint(index, event.target.value)}
                        placeholder="Une idée clé, formulée en une phrase."
                        className={fieldClass}
                      />
                      <button
                        type="button"
                        onClick={() => removePoint(index)}
                        aria-label="Retirer ce point"
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-400 transition-colors hover:bg-accent-50 hover:text-accent-800"
                      >
                        <i className="ri-close-line text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addPoint}
                  className="mt-1.5 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-background-300 px-2.5 py-1.5 text-[11px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
                >
                  <i className="ri-add-line text-xs" />
                  Ajouter un point
                </button>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="content-exemple">
                  Exemple chiffré
                </label>
                <textarea
                  id="content-exemple"
                  value={draft.exemple}
                  onChange={(event) => set("exemple", event.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="Ex. Avec 600 000 FCFA par mois, la cible d'épargne est de 120 000 FCFA."
                  className={`${fieldClass} resize-none`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Statut de publication</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "brouillon" as const, label: "Brouillon", icon: "ri-draft-line" },
                    { value: "publie" as const, label: "Publiée", icon: "ri-send-plane-line" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => set("statut", option.value)}
                      aria-pressed={draft.statut === option.value}
                      className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                        draft.statut === option.value
                          ? "border-primary-500 bg-primary-500 text-background-50"
                          : "border-background-300 text-foreground-600 hover:border-primary-300 hover:text-primary-800"
                      }`}
                    >
                      <i className={`${option.icon} text-[11px]`} />
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[10px] leading-relaxed text-foreground-500">
                  En brouillon, la fiche reste visible uniquement dans cette console.
                </p>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="mt-3 rounded-md border border-accent-300 bg-accent-50 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-accent-900">
                  <i className="ri-error-warning-line text-xs" />
                  Quelques éléments à compléter
                </p>
                <ul className="mt-1 space-y-0.5">
                  {errors.map((error) => (
                    <li key={error} className="text-[11px] leading-relaxed text-accent-800">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-background-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
            <p className="text-[10px] text-foreground-400">
              {row ? "Les modifications sont enregistrées immédiatement." : "La fiche sera créée avec son statut actuel."}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3.5 py-2 text-xs font-semibold text-foreground-800 transition-colors hover:bg-background-100 disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-wait disabled:opacity-70"
              >
                <i className={saving ? "ri-loader-4-line animate-spin text-xs" : "ri-save-3-line text-xs"} />
                {saving ? "Enregistrement…" : row ? "Enregistrer" : "Créer la fiche"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}