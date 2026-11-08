import { useEffect, useState } from "react";
import ModalPortal from "@/components/base/ModalPortal";
import { displayUserName, type AdminUserRow } from "@/lib/admin";
import {
  ANNOUNCEMENT_TYPE_META,
  ANNOUNCEMENT_TYPE_ORDER,
  defaultScheduleValue,
  draftFromAnnouncement,
  emptyAnnouncementDraft,
  formatAnnouncementDateTime,
  type AnnouncementDraft,
  type AnnouncementRow,
  type AnnouncementType,
} from "@/lib/announcement";

type AnnouncementFormModalProps = {
  row: AnnouncementRow | null;
  users: AdminUserRow[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (draft: AnnouncementDraft) => void;
};

export default function AnnouncementFormModal({
  row,
  users,
  saving,
  onClose,
  onSubmit,
}: AnnouncementFormModalProps) {
  const [draft, setDraft] = useState<AnnouncementDraft>(() =>
    row ? draftFromAnnouncement(row) : emptyAnnouncementDraft(),
  );
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

  const set = <K extends keyof AnnouncementDraft>(key: K, value: AnnouncementDraft[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
  };

  const setType = (value: AnnouncementType) => set("type", value);

  const setAudience = (value: AnnouncementDraft["audience"]) => {
    setDraft((previous) => ({
      ...previous,
      audience: value,
      userId: value === "utilisateur" ? previous.userId ?? users[0]?.id ?? null : null,
    }));
  };

  const validate = (): string[] => {
    const found: string[] = [];
    if (draft.titre.trim().length < 5) found.push("Le titre doit contenir au moins 5 caractères.");
    if (draft.message.trim().length < 20) {
      found.push("Le message doit contenir au moins 20 caractères.");
    }
    if (draft.message.length > 500) found.push("Le message ne peut pas dépasser 500 caractères.");
    if (draft.audience === "utilisateur" && !draft.userId) {
      found.push("Choisissez l'utilisateur qui doit recevoir cette annonce.");
    }
    if (draft.statut === "programme") {
      if (!draft.scheduledAt) {
        found.push("Choisissez la date et l'heure de diffusion.");
      } else {
        const target = new Date(draft.scheduledAt).getTime();
        if (Number.isNaN(target)) {
          found.push("La date de diffusion n'est pas valide.");
        } else if (target <= Date.now()) {
          found.push("La diffusion doit être programmée dans le futur.");
        }
      }
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

        <div className="relative z-10 flex max-h-[94vh] w-full max-w-2xl animate-fade-up flex-col overflow-hidden rounded-t-xl border border-background-200 bg-background-50 sm:rounded-lg">
          <div className="flex items-start gap-3 border-b border-background-200 px-4 py-3.5 md:px-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-900">
              <i className={row ? "ri-edit-line text-base" : "ri-megaphone-line text-base"} />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                className="text-sm font-semibold text-foreground-950"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {row ? "Modifier l'annonce" : "Nouvelle annonce"}
              </h2>
              <p className="mt-0.5 text-[11px] text-foreground-500">
                Une annonce envoyée apparaît dans le centre de notifications des utilisateurs
                concernés.
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
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className={labelClass} htmlFor="annonce-titre">
                  Titre de l'annonce
                </label>
                <input
                  id="annonce-titre"
                  value={draft.titre}
                  onChange={(event) => set("titre", event.target.value)}
                  placeholder="Ex. Nouveau module de simulation disponible"
                  className={fieldClass}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className={labelClass} htmlFor="annonce-message">
                    Message
                  </label>
                  <span className="text-[10px] tabular-nums text-foreground-400">
                    {draft.message.length} / 500
                  </span>
                </div>
                <textarea
                  id="annonce-message"
                  value={draft.message}
                  onChange={(event) => set("message", event.target.value)}
                  maxLength={500}
                  rows={5}
                  placeholder="Expliquez en quelques phrases ce que l'utilisateur doit savoir."
                  className={`${fieldClass} resize-none`}
                />
              </div>

              <div>
                <label className={labelClass}>Type de message</label>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {ANNOUNCEMENT_TYPE_ORDER.map((value) => {
                    const meta = ANNOUNCEMENT_TYPE_META[value];
                    const active = draft.type === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setType(value)}
                        aria-pressed={active}
                        className={`flex cursor-pointer items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors ${
                          active
                            ? "border-primary-500 bg-primary-50"
                            : "border-background-200 hover:border-primary-300"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded ${meta.bubble}`}
                        >
                          <i className={`${meta.icon} text-xs`} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-semibold text-foreground-900">
                            {meta.label}
                          </span>
                          <span className="mt-0.5 block text-[10px] leading-relaxed text-foreground-500">
                            {meta.hint}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClass}>Destinataires</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "tous" as const, label: "Tous les utilisateurs", icon: "ri-group-line" },
                    { value: "utilisateur" as const, label: "Un utilisateur précis", icon: "ri-user-line" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setAudience(option.value)}
                      aria-pressed={draft.audience === option.value}
                      className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                        draft.audience === option.value
                          ? "border-primary-500 bg-primary-500 text-background-50"
                          : "border-background-300 text-foreground-600 hover:border-primary-300 hover:text-primary-800"
                      }`}
                    >
                      <i className={`${option.icon} text-[11px]`} />
                      {option.label}
                    </button>
                  ))}
                </div>

                {draft.audience === "utilisateur" && (
                  <select
                    value={draft.userId ?? ""}
                    onChange={(event) => set("userId", event.target.value || null)}
                    aria-label="Choisir l'utilisateur destinataire"
                    className={`${fieldClass} mt-1.5 cursor-pointer`}
                  >
                    <option value="">Sélectionner un utilisateur…</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {displayUserName(user)}
                        {user.email ? ` · ${user.email}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className={labelClass}>Envoi</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "brouillon" as const, label: "Garder en brouillon", icon: "ri-draft-line" },
                    { value: "programme" as const, label: "Programmer l'envoi", icon: "ri-timer-line" },
                    { value: "envoye" as const, label: "Envoyer maintenant", icon: "ri-send-plane-line" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setDraft((previous) => ({
                          ...previous,
                          statut: option.value,
                          scheduledAt:
                            option.value === "programme"
                              ? previous.scheduledAt ?? defaultScheduleValue()
                              : previous.scheduledAt,
                        }));
                      }}
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

                {draft.statut === "programme" && (
                  <div className="mt-2 rounded-md border border-accent-300 bg-accent-50 px-3 py-2.5">
                    <label
                      className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-900"
                      htmlFor="annonce-programmation"
                    >
                      Date et heure de diffusion
                    </label>
                    <input
                      id="annonce-programmation"
                      type="datetime-local"
                      value={draft.scheduledAt ?? ""}
                      onChange={(event) => set("scheduledAt", event.target.value || null)}
                      className={`${fieldClass} cursor-pointer`}
                    />
                    <p className="mt-1.5 flex items-start gap-1.5 text-[10px] leading-relaxed text-accent-900">
                      <i className="ri-timer-line mt-0.5 text-[11px]" />
                      L'annonce reste en brouillon visible uniquement ici, puis apparaît
                      automatiquement dans le centre de notifications à l'heure choisie.
                      {draft.scheduledAt && !Number.isNaN(new Date(draft.scheduledAt).getTime()) && (
                        <span className="font-semibold">
                          Diffusion prévue le {formatAnnouncementDateTime(new Date(draft.scheduledAt).toISOString())}.
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <p className="mt-1.5 text-[10px] leading-relaxed text-foreground-500">
                  En brouillon, l'annonce n'est visible que dans cette console. Un brouillon envoyé
                  plus tard apparaît immédiatement côté utilisateur.
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
              {row ? "Les modifications sont enregistrées immédiatement." : "L'annonce sera créée avec son statut actuel."}
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
                {saving ? "Enregistrement…" : row ? "Enregistrer" : "Créer l'annonce"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}