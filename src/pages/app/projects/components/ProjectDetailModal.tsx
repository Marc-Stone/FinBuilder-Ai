import { useEffect, useMemo, useState } from "react";
import ModalPortal from "@/components/base/ModalPortal";
import { supabase } from "@/lib/supabaseClient";
import { formatDateFr, formatMoney } from "@/lib/finance";
import ProjectSavingsSimulator from "@/pages/app/projects/components/ProjectSavingsSimulator";
import ProjectEtapesSection from "@/pages/app/projects/components/ProjectEtapesSection";
import ProjectDocumentsSection from "@/pages/app/projects/components/ProjectDocumentsSection";
import {
  computeProjectMetrics,
  getProjectCategory,
  getProjectStatus,
  parseDocuments,
  parseEtapes,
  parsePostes,
  posteTone,
  type ProjectEntry,
} from "@/lib/projects";

type ProjectDetailModalProps = {
  project: ProjectEntry;
  devise: string;
  goalName?: string;
  onClose: () => void;
  onEdit: (project: ProjectEntry) => void;
  onSaved: (project: ProjectEntry) => void;
};

const SELECT_COLUMNS =
  "id, nom, categorie, description, budget_total, montant_finance, goal_id, postes, etapes, documents, date_debut, date_fin, statut, priorite, note";

function toNumber(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export default function ProjectDetailModal({
  project,
  devise,
  goalName,
  onClose,
  onEdit,
  onSaved,
}: ProjectDetailModalProps) {
  const meta = getProjectCategory(project.categorie);
  const statut = getProjectStatus(project.statut);
  const [postes, setPostes] = useState(() => parsePostes(project.postes));
  const [etapes, setEtapes] = useState(() => parseEtapes(project.etapes));
  const [documents, setDocuments] = useState(() => parseDocuments(project.documents));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, saving]);

  const metrics = useMemo(
    () => computeProjectMetrics({ ...project, postes }),
    [project, postes],
  );

  const updateDepense = (id: string, value: number) => {
    setPostes((current) =>
      current.map((poste) => (poste.id === id ? { ...poste, depense: value } : poste)),
    );
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        postes: postes.map((poste) => ({
          id: poste.id,
          libelle: poste.libelle,
          categorie: poste.categorie,
          prevu: Number(poste.prevu) || 0,
          depense: Number(poste.depense) || 0,
        })),
        etapes: etapes
          .filter((etape) => etape.libelle.trim().length > 0)
          .map((etape) => ({ id: etape.id, libelle: etape.libelle.trim(), statut: etape.statut })),
        documents: documents
          .filter((document) => document.nom.trim().length > 0)
          .map((document) => ({ id: document.id, nom: document.nom.trim(), url: document.url })),
        updated_at: new Date().toISOString(),
      };
      const { data, error: updateError } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", project.id)
        .select(SELECT_COLUMNS)
        .maybeSingle();
      if (updateError) throw updateError;
      if (!data) throw new Error("Projet introuvable ou mise à jour refusée.");
      const row = data as Omit<ProjectEntry, "postes"> & { postes: unknown };
      setPostes(parsePostes(row.postes));
      setEtapes(parseEtapes(row.etapes));
      setDocuments(parseDocuments(row.documents));
      onSaved({
        ...row,
        postes: parsePostes(row.postes),
        etapes: parseEtapes(row.etapes),
        documents: parseDocuments(row.documents),
      });
      setDirty(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Enregistrement impossible : ${saveError.message}`
          : "Enregistrement impossible. Réessayez.",
      );
    } finally {
      setSaving(false);
    }
  };

  const nonAlloue = metrics.nonAlloue;

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[56] flex items-end justify-center px-0 sm:items-center sm:px-4">
      <button
        type="button"
        aria-label="Fermer"
        onClick={() => (!saving ? onClose() : undefined)}
        className="absolute inset-0 cursor-pointer bg-foreground-950/45 backdrop-blur-[2px]"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl animate-fade-up flex-col overflow-hidden rounded-t-lg border border-background-200 bg-background-50 sm:rounded-lg">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-background-200 px-4 py-3.5 md:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${meta.bubble}`}>
              <i className={`${meta.icon} text-lg`} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2
                  className="min-w-0 truncate text-sm font-semibold text-foreground-950 md:text-base"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {project.nom}
                </h2>
                <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${statut.tone}`}>
                  {statut.label}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-foreground-500">
                {meta.label}
                {project.date_debut || project.date_fin
                  ? ` · ${project.date_debut ? formatDateFr(project.date_debut) : "?"} → ${
                      project.date_fin ? formatDateFr(project.date_fin) : "?"
                    }`
                  : " · dates libres"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => (!saving ? onClose() : undefined)}
            aria-label="Fermer"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-background-100 hover:text-foreground-900"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-background-200 bg-background-50 px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400">
                Enveloppe totale
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground-950">
                {formatMoney(Number(project.budget_total) || 0, devise)}
              </p>
            </div>
            <div className="rounded-md border border-background-200 bg-background-50 px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400">
                Alloué aux postes
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground-950">
                {formatMoney(metrics.prevuTotal, devise)}
              </p>
            </div>
            <div className="rounded-md border border-background-200 bg-background-50 px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400">
                Dépensé
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-primary-700">
                {formatMoney(metrics.depenseTotal, devise)}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-primary-200 bg-primary-50/70 px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400">
                Déjà financé
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-primary-800">
                {formatMoney(metrics.finance, devise)}
                <span className="ml-1.5 text-[11px] font-medium text-foreground-500">
                  {Math.round(metrics.financementProgression)}% de l'enveloppe
                </span>
              </p>
            </div>
            <div className="rounded-md border border-accent-200 bg-accent-50 px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400">
                Reste à financer
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-accent-900">
                {formatMoney(metrics.enveloppeManquante, devise)}
                <span className="ml-1.5 text-[11px] font-medium text-foreground-500">
                  {goalName ? `Objectif « ${goalName} »` : "Financement manuel"}
                </span>
              </p>
            </div>
          </div>

          <ProjectSavingsSimulator
            reste={metrics.enveloppeManquante}
            devise={devise}
            dateFin={project.date_fin}
            goalName={goalName}
          />

          <div className="mt-3 rounded-md border border-background-200 bg-background-100/60 px-3.5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="font-medium text-foreground-600">
                Avancement : <strong className="font-semibold text-foreground-900">
                  {Math.round(metrics.progression)}%
                </strong>{" "}
                ({formatMoney(metrics.depenseTotal, devise)} / {formatMoney(metrics.prevuTotal, devise)})
              </span>
              <span
                className={`font-semibold ${nonAlloue < 0 ? "text-accent-700" : "text-foreground-600"}`}
              >
                {nonAlloue === 0
                  ? "Enveloppe entièrement répartie"
                  : nonAlloue > 0
                    ? `${formatMoney(nonAlloue, devise)} non répartis`
                    : `${formatMoney(Math.abs(nonAlloue), devise)} au-delà de l'enveloppe`}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background-200">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-500"
                style={{ width: `${Math.max(metrics.progression, metrics.progression > 0 ? 2 : 0)}%` }}
              />
            </div>
          </div>

          {project.description && (
            <p className="mt-3 rounded-md bg-background-100/70 px-3.5 py-2.5 text-[11px] leading-relaxed text-foreground-600">
              {project.description}
            </p>
          )}

          {postes.length > 0 ? (
            <div className="mt-4">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600">
                  Répartition par poste
                </h3>
                <p className="text-[10px] text-foreground-400">
                  Ajustez le montant dépensé, puis enregistrez.
                </p>
              </div>

              <div className="mt-2 hidden grid-cols-[1fr_90px_96px_96px_32px] items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-400 sm:grid">
                <span>Poste</span>
                <span className="text-right">Part</span>
                <span className="text-right">Prévu</span>
                <span className="text-right">Dépensé</span>
                <span />
              </div>

              <ul className="mt-1.5 space-y-2">
                {metrics.lignes.map((ligne, index) => (
                  <li
                    key={ligne.id}
                    className="grid grid-cols-1 gap-2 rounded-md border border-background-200 bg-background-50 px-2 py-2.5 sm:grid-cols-[1fr_90px_96px_96px_32px] sm:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${posteTone(index)}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground-900">
                          {ligne.libelle}
                        </p>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-background-200">
                          <div
                            className={`h-full rounded-full ${posteTone(index)}`}
                            style={{ width: `${Math.max(ligne.progression, ligne.progression > 0 ? 3 : 0)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-right sm:block">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground-400 sm:hidden">
                        Part
                      </span>
                      <span className="text-[11px] font-medium text-foreground-600">
                        {Math.round(ligne.part)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:block">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground-400 sm:hidden">
                        Prévu
                      </span>
                      <span className="truncate text-[11px] font-semibold text-foreground-800">
                        {formatMoney(ligne.prevu, devise)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:block">
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-foreground-400 sm:hidden">
                        Dépensé
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={ligne.depense ? String(ligne.depense) : ""}
                        onChange={(event) => updateDepense(ligne.id, toNumber(event.target.value))}
                        placeholder="0"
                        aria-label={`Dépensé sur ${ligne.libelle}`}
                        className="box-border w-full min-w-0 rounded-md border border-background-300 bg-background-50 px-2 py-1.5 text-right text-[11px] font-semibold text-foreground-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-1 sm:justify-end">
                      <span
                        className={`text-[10px] font-semibold sm:hidden ${
                          ligne.ecart > 0 ? "text-accent-700" : "text-primary-700"
                        }`}
                      >
                        {ligne.ecart > 0
                          ? `+${formatMoney(ligne.ecart, devise)}`
                          : `${formatMoney(Math.max(ligne.prevu - ligne.depense, 0), devise)} restants`}
                      </span>
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-background-100 text-foreground-500"
                        title={
                          ligne.ecart > 0
                            ? `Dépassement de ${formatMoney(ligne.ecart, devise)}`
                            : `Reste ${formatMoney(Math.max(ligne.prevu - ligne.depense, 0), devise)}`
                        }
                      >
                        <i
                          className={`text-xs ${
                            ligne.ecart > 0 ? "ri-arrow-up-line text-accent-700" : "ri-check-line text-primary-700"
                          }`}
                        />
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-2 text-[10px] leading-relaxed text-foreground-400">
                Reste à dépenser sur l'ensemble des postes : {formatMoney(metrics.reste, devise)}.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-md border border-dashed border-background-300 bg-background-50 px-4 py-6 text-center">
              <p className="text-xs font-semibold text-foreground-800">Budget pas encore réparti</p>
              <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-foreground-500">
                Ajoutez des postes budgétaires pour savoir combien allouer au terrain, aux travaux,
                au matériel ou aux imprévus.
              </p>
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
              >
                <i className="ri-list-check-2 text-sm" />
                Répartir le budget
              </button>
            </div>
          )}

          {project.note && (
            <p className="mt-3 rounded-md border border-secondary-200 bg-secondary-100/60 px-3.5 py-2.5 text-[11px] leading-relaxed text-secondary-900">
              <span className="font-semibold">Note : </span>
              {project.note}
            </p>
          )}

          <ProjectEtapesSection
            etapes={etapes}
            disabled={saving}
            onChange={(next) => {
              setEtapes(next);
              setDirty(true);
            }}
          />

          <ProjectDocumentsSection
            documents={documents}
            disabled={saving}
            onChange={(next) => {
              setDocuments(next);
              setDirty(true);
            }}
          />

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-accent-300 bg-accent-50 px-3.5 py-2.5 text-xs leading-relaxed text-accent-900">
              <i className="ri-error-warning-line mt-0.5 text-sm" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-background-200 bg-background-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <button
            type="button"
            onClick={() => onEdit(project)}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 px-3.5 py-2.5 text-xs font-semibold text-foreground-800 transition-colors hover:bg-background-100"
          >
            <i className="ri-pencil-line text-sm" />
            Modifier la répartition
          </button>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => (!saving ? onClose() : undefined)}
              disabled={saving}
              className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-background-300 px-4 py-2.5 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-background-200 disabled:text-foreground-500"
            >
              {saving ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-base" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <i className="ri-save-line text-base" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}