import { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/base/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { formatAdminNumber, recordAdminAction } from "@/lib/admin";
import {
  contentStats,
  createContent,
  deleteContent,
  fetchAdminContents,
  updateContent,
  updateContentStatus,
  type ContentDraft,
  type ContentRow,
} from "@/lib/content";
import ContentFilters from "@/pages/admin/contenus/components/ContentFilters";
import ContentTable from "@/pages/admin/contenus/components/ContentTable";
import ContentFormModal from "@/pages/admin/contenus/components/ContentFormModal";
import ContentPreviewModal from "@/pages/admin/contenus/components/ContentPreviewModal";

type Notice = { tone: "success" | "error"; message: string } | null;

export default function AdminContentsPage() {
  const { profile, session } = useAuth();

  const [rows, setRows] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("tous");
  const [categorie, setCategorie] = useState("toutes");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContentRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<ContentRow | null>(null);
  const [toDelete, setToDelete] = useState<ContentRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminContents();
      setRows(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Les contenus n'ont pas pu être chargés.",
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(() => contentStats(rows), [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (statut !== "tous" && row.statut !== statut) return false;
      if (categorie !== "toutes" && (row.categorie ?? "") !== categorie) return false;
      if (!term) return true;
      const haystack = [row.titre, row.resume, row.categorie, row.statut].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [rows, search, statut, categorie]);

  const isFiltered = search !== "" || statut !== "tous" || categorie !== "toutes";

  const handleReset = () => {
    setSearch("");
    setStatut("tous");
    setCategorie("toutes");
  };

  const author = () => ({
    email: profile?.email ?? null,
    userId: session?.user?.id ?? null,
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row: ContentRow) => {
    setEditing(row);
    setPreview(null);
    setFormOpen(true);
  };

  const handleSubmit = async (draft: ContentDraft) => {
    setSaving(true);
    try {
      if (editing) {
        await updateContent(editing.id, draft);
        recordAdminAction({
          action: "modifier_contenu",
          cible: draft.titre,
          ...author(),
          details: { statut: draft.statut, categorie: draft.categorie },
        });
        setNotice({ tone: "success", message: "La fiche a été mise à jour." });
      } else {
        await createContent(draft);
        recordAdminAction({
          action: draft.statut === "publie" ? "publier_contenu" : "creer_contenu",
          cible: draft.titre,
          ...author(),
          details: { statut: draft.statut, categorie: draft.categorie },
        });
        setNotice({
          tone: "success",
          message:
            draft.statut === "publie"
              ? "La fiche est créée et publiée dans la bibliothèque."
              : "La fiche est créée en brouillon.",
        });
      }
      setFormOpen(false);
      setEditing(null);
      setReloadKey((value) => value + 1);
    } catch (saveError) {
      setNotice({
        tone: "error",
        message:
          saveError instanceof Error
            ? saveError.message
            : "L'enregistrement de la fiche a échoué.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (row: ContentRow) => {
    const nextStatus = row.statut === "publie" ? "brouillon" : "publie";
    setBusyId(row.id);
    try {
      await updateContentStatus(row.id, nextStatus);
      setRows((previous) =>
        previous.map((item) =>
          item.id === row.id
            ? {
                ...item,
                statut: nextStatus,
                date_publication: nextStatus === "publie" ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              }
            : item,
        ),
      );
      recordAdminAction({
        action: nextStatus === "publie" ? "publier_contenu" : "depublier_contenu",
        cible: row.titre,
        ...author(),
      });
      setNotice({
        tone: "success",
        message:
          nextStatus === "publie"
            ? `« ${row.titre} » est désormais visible dans la bibliothèque.`
            : `« ${row.titre} » est repassée en brouillon.`,
      });
    } catch (statusError) {
      setNotice({
        tone: "error",
        message:
          statusError instanceof Error ? statusError.message : "Le changement de statut a échoué.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteContent(toDelete.id);
      recordAdminAction({ action: "supprimer_contenu", cible: toDelete.titre, ...author() });
      setRows((previous) => previous.filter((item) => item.id !== toDelete.id));
      setToDelete(null);
      setNotice({ tone: "success", message: "La fiche a été supprimée." });
    } catch (deleteError) {
      setNotice({
        tone: "error",
        message: deleteError instanceof Error ? deleteError.message : "La suppression a échoué.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full animate-fade-up space-y-4">
      <section className="rounded-lg border border-background-200 bg-background-100 px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-700">
              Administration
            </p>
            <h1
              className="mt-1.5 text-xl font-semibold leading-tight text-foreground-950 md:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Contenus pédagogiques
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-foreground-600 md:text-sm">
              Rédigez les fiches de la bibliothèque d'éducation financière. Une fiche publiée
              apparaît immédiatement dans l'onglet Éducation de chaque utilisateur.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              disabled={loading}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800 disabled:cursor-wait disabled:opacity-70"
            >
              <i className={loading ? "ri-loader-4-line animate-spin text-xs" : "ri-refresh-line text-xs"} />
              Actualiser
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-add-line text-xs" />
              Nouvelle fiche
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Fiches", value: stats.total, icon: "ri-article-line" },
            { label: "Publiées", value: stats.publies, icon: "ri-send-plane-line" },
            { label: "Brouillons", value: stats.brouillons, icon: "ri-draft-line" },
            { label: "Catégories", value: stats.categories, icon: "ri-price-tag-3-line" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-background-200 bg-background-50 px-3 py-2"
            >
              <div className="flex items-center gap-1.5">
                <i className={`${item.icon} text-[11px] text-primary-600`} />
                <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-500">
                  {item.label}
                </p>
              </div>
              <p className="mt-1 text-base font-semibold leading-none text-foreground-950">
                {formatAdminNumber(item.value)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {notice && (
        <div
          className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 ${
            notice.tone === "success"
              ? "border-primary-200 bg-primary-50"
              : "border-accent-300 bg-accent-50"
          }`}
        >
          <i
            className={`mt-0.5 text-base ${
              notice.tone === "success"
                ? "ri-check-double-line text-primary-700"
                : "ri-error-warning-line text-accent-800"
            }`}
          />
          <p
            className={`text-[11px] leading-relaxed ${
              notice.tone === "success" ? "text-primary-900" : "text-accent-900"
            }`}
          >
            {notice.message}
          </p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Masquer le message"
            className="ml-auto flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-foreground-400 hover:bg-background-100"
          >
            <i className="ri-close-line text-xs" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-accent-300 bg-accent-50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <i className="ri-error-warning-line mt-0.5 text-base text-accent-800" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent-900">Contenus indisponibles</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-accent-800">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((value) => value + 1)}
                className="mt-2 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md bg-foreground-950 px-3 py-1.5 text-[11px] font-semibold text-background-50 transition-colors hover:bg-foreground-900"
              >
                <i className="ri-refresh-line text-xs" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      <ContentFilters
        search={search}
        onSearch={setSearch}
        statut={statut}
        onStatut={setStatut}
        categorie={categorie}
        onCategorie={setCategorie}
        resultCount={filtered.length}
        onReset={handleReset}
        isFiltered={isFiltered}
      />

      {loading && rows.length === 0 ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="h-[76px] animate-pulse rounded-lg bg-background-200" />
          ))}
        </div>
      ) : (
        <ContentTable
          rows={filtered}
          busyId={busyId}
          onPreview={(row) => {
            setPreview(row);
            recordAdminAction({ action: "apercu_contenu", cible: row.titre, ...author() });
          }}
          onEdit={openEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={setToDelete}
        />
      )}

      <p className="text-[11px] leading-relaxed text-foreground-400">
        {formatAdminNumber(stats.publies)} fiche(s) publiée(s) sur {formatAdminNumber(stats.total)}.
        Les brouillons restent invisibles pour les utilisateurs.
      </p>

      {formOpen && (
        <ContentFormModal
          key={editing?.id ?? "nouvelle-fiche"}
          row={editing}
          saving={saving}
          onClose={() => {
            if (saving) return;
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {preview && (
        <ContentPreviewModal
          row={preview}
          onClose={() => setPreview(null)}
          onEdit={() => openEdit(preview)}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cette fiche ?"
        message={
          toDelete
            ? `« ${toDelete.titre} » sera définitivement retirée de la bibliothèque. Cette action est irréversible.`
            : ""
        }
        confirmLabel="Supprimer"
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}