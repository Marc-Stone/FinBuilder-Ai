import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfirmDialog from "@/components/base/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { displayUserName, fetchAdminUsers, formatAdminNumber, recordAdminAction, type AdminUserRow } from "@/lib/admin";
import {
  announcementStats,
  createAnnouncement,
  deleteAnnouncement,
  fetchAdminAnnouncements,
  promoteDueAnnouncements,
  updateAnnouncement,
  updateAnnouncementStatus,
  type AnnouncementDraft,
  type AnnouncementRow,
  type AnnouncementStatut,
} from "@/lib/announcement";
import AnnouncementFilters from "@/pages/admin/annonces/components/AnnouncementFilters";
import AnnouncementTable from "@/pages/admin/annonces/components/AnnouncementTable";
import AnnouncementFormModal from "@/pages/admin/annonces/components/AnnouncementFormModal";
import AnnouncementPreviewModal from "@/pages/admin/annonces/components/AnnouncementPreviewModal";

type Notice = { tone: "success" | "error"; message: string } | null;

export default function AdminAnnouncementsPage() {
  const { profile, session } = useAuth();

  const [rows, setRows] = useState<AnnouncementRow[]>([]);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("tous");
  const [type, setType] = useState("tous");
  const [audience, setAudience] = useState("toutes");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AnnouncementRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<AnnouncementRow | null>(null);
  const [toDelete, setToDelete] = useState<AnnouncementRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const dueHandled = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await promoteDueAnnouncements();
      const [announcements, profiles] = await Promise.all([
        fetchAdminAnnouncements(),
        fetchAdminUsers().catch(() => [] as AdminUserRow[]),
      ]);
      setRows(announcements);
      setUsers(profiles);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Les annonces n'ont pas pu être chargées.",
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
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(() => announcementStats(rows), [rows]);

  /** Une annonce programmée arrive à échéance pendant la consultation : on rafraîchit la liste. */
  const handleScheduleDue = useCallback(() => {
    if (dueHandled.current) return;
    dueHandled.current = true;
    window.setTimeout(() => {
      dueHandled.current = false;
      setReloadKey((value) => value + 1);
    }, 1500);
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (statut !== "tous" && row.statut !== statut) return false;
      if (type !== "tous" && row.type !== type) return false;
      if (audience !== "toutes" && row.audience !== audience) return false;
      if (!term) return true;
      const haystack = [row.titre, row.message].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [rows, search, statut, type, audience]);

  const isFiltered = search !== "" || statut !== "tous" || type !== "tous" || audience !== "toutes";

  const userLabel = useCallback(
    (userId: string | null) => {
      const found = users.find((user) => user.id === userId);
      return found ? displayUserName(found) : "Utilisateur inconnu";
    },
    [users],
  );

  const handleReset = () => {
    setSearch("");
    setStatut("tous");
    setType("tous");
    setAudience("toutes");
  };

  const author = () => ({
    email: profile?.email ?? null,
    userId: session?.user?.id ?? null,
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row: AnnouncementRow) => {
    setEditing(row);
    setPreview(null);
    setFormOpen(true);
  };

  const handleSubmit = async (draft: AnnouncementDraft) => {
    setSaving(true);
    try {
      if (editing) {
        await updateAnnouncement(editing.id, draft, editing);
        recordAdminAction({
          action: draft.statut === "programme" ? "programmer_annonce" : "modifier_annonce",
          cible: draft.titre,
          ...author(),
          details: {
            statut: draft.statut,
            audience: draft.audience,
            diffusion: draft.statut === "programme" ? draft.scheduledAt : null,
          },
        });
        setNotice({
          tone: "success",
          message:
            draft.statut === "programme"
              ? "L'annonce est enregistrée et sera diffusée automatiquement à l'heure choisie."
              : "L'annonce a été mise à jour.",
        });
      } else {
        await createAnnouncement(draft);
        recordAdminAction({
          action:
            draft.statut === "envoye"
              ? "envoyer_annonce"
              : draft.statut === "programme"
                ? "programmer_annonce"
                : "creer_annonce",
          cible: draft.titre,
          ...author(),
          details: {
            statut: draft.statut,
            audience: draft.audience,
            diffusion: draft.statut === "programme" ? draft.scheduledAt : null,
          },
        });
        setNotice({
          tone: "success",
          message:
            draft.statut === "envoye"
              ? "L'annonce est créée et diffusée aux destinataires."
              : draft.statut === "programme"
                ? "L'annonce est programmée : elle partira toute seule à l'heure prévue."
                : "L'annonce est enregistrée en brouillon.",
        });
      }
      setFormOpen(false);
      setEditing(null);
      setReloadKey((value) => value + 1);
    } catch (saveError) {
      setNotice({
        tone: "error",
        message:
          saveError instanceof Error ? saveError.message : "L'enregistrement de l'annonce a échoué.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (row: AnnouncementRow) => {
    const nextStatus: AnnouncementStatut = row.statut === "envoye" ? "brouillon" : "envoye";
    const wasProgrammee = row.statut === "programme";
    setBusyId(row.id);
    try {
      await updateAnnouncementStatus(row.id, nextStatus);
      setRows((previous) =>
        previous.map((item) =>
          item.id === row.id
            ? {
                ...item,
                statut: nextStatus,
                date_envoi: nextStatus === "envoye" ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              }
            : item,
        ),
      );
      recordAdminAction({
        action: nextStatus === "envoye" ? "envoyer_annonce" : "retirer_annonce",
        cible: row.titre,
        ...author(),
        details: wasProgrammee ? { programmation_annulee: true } : null,
      });
      setNotice({
        tone: "success",
        message:
          nextStatus === "envoye"
            ? wasProgrammee
              ? `« ${row.titre} » a été diffusée immédiatement, sans attendre l'heure prévue.`
              : `« ${row.titre} » est diffusée dans le centre de notifications.`
            : wasProgrammee
              ? `La programmation de « ${row.titre} » est annulée : l'annonce repasse en brouillon.`
              : `« ${row.titre} » est retirée du centre de notifications.`,
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
      await deleteAnnouncement(toDelete.id);
      recordAdminAction({ action: "supprimer_annonce", cible: toDelete.titre, ...author() });
      setRows((previous) => previous.filter((item) => item.id !== toDelete.id));
      setToDelete(null);
      setNotice({ tone: "success", message: "L'annonce a été supprimée." });
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
              Annonces aux utilisateurs
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-foreground-600 md:text-sm">
              Diffusez un message dans le centre de notifications : nouveauté, rappel important ou
              maintenance. Envoi immédiat ou programmé à la date de votre choix, à tous les comptes
              ou à un seul destinataire.
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
              Nouvelle annonce
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Annonces", value: stats.total, icon: "ri-megaphone-line" },
            { label: "Envoyées", value: stats.envoyees, icon: "ri-send-plane-line" },
            { label: "Programmées", value: stats.programmees, icon: "ri-timer-line" },
            { label: "Brouillons", value: stats.brouillons, icon: "ri-draft-line" },
            { label: "Ciblées", value: stats.cibles, icon: "ri-user-line" },
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
              <p className="text-xs font-semibold text-accent-900">Annonces indisponibles</p>
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

      <AnnouncementFilters
        search={search}
        onSearch={setSearch}
        statut={statut}
        onStatut={setStatut}
        type={type}
        onType={setType}
        audience={audience}
        onAudience={setAudience}
        resultCount={filtered.length}
        isFiltered={isFiltered}
        onReset={handleReset}
      />

      {loading && rows.length === 0 ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-[76px] animate-pulse rounded-lg bg-background-200" />
          ))}
        </div>
      ) : (
        <AnnouncementTable
          rows={filtered}
          busyId={busyId}
          userLabel={userLabel}
          onPreview={(row) => {
            setPreview(row);
            recordAdminAction({ action: "apercu_annonce", cible: row.titre, ...author() });
          }}
          onEdit={openEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={setToDelete}
          onScheduleDue={handleScheduleDue}
        />
      )}

      <p className="text-[11px] leading-relaxed text-foreground-400">
        {formatAdminNumber(stats.envoyees)} annonce(s) diffusée(s) sur {formatAdminNumber(stats.total)}
        {stats.programmees > 0 && ` · ${formatAdminNumber(stats.programmees)} en attente de diffusion`}.
        Retirer une annonce la fait disparaître du centre de notifications sans la supprimer.
      </p>

      {formOpen && (
        <AnnouncementFormModal
          key={editing?.id ?? "nouvelle-annonce"}
          row={editing}
          users={users}
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
        <AnnouncementPreviewModal
          row={preview}
          userLabel={userLabel(preview.user_id)}
          onClose={() => setPreview(null)}
          onEdit={() => openEdit(preview)}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cette annonce ?"
        message={
          toDelete
            ? `« ${toDelete.titre} » sera définitivement supprimée. Si elle était envoyée, elle disparaîtra du centre de notifications des utilisateurs.`
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