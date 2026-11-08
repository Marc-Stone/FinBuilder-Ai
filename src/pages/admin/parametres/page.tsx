import { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/base/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/hooks/useAppSettings";
import { formatAdminDateTime, recordAdminAction } from "@/lib/admin";
import {
  applyAppSettings,
  applyPrimaryColor,
  draftFromSettings,
  fetchAppSettingsStrict,
  isHexColor,
  updateAppSettings,
  validateSettingsDraft,
  type AppSettings,
  type AppSettingsDraft,
} from "@/lib/settings";
import SettingsIdentityCard from "@/pages/admin/parametres/components/SettingsIdentityCard";
import SettingsColorCard from "@/pages/admin/parametres/components/SettingsColorCard";
import SettingsMaintenanceCard from "@/pages/admin/parametres/components/SettingsMaintenanceCard";
import SettingsPreviewCard from "@/pages/admin/parametres/components/SettingsPreviewCard";

type Notice = { tone: "success" | "error"; message: string } | null;

export default function AdminSettingsPage() {
  const { profile, session } = useAuth();
  const { refresh } = useAppSettings();

  const [saved, setSaved] = useState<AppSettings | null>(null);
  const [draft, setDraft] = useState<AppSettingsDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [confirmMaintenance, setConfirmMaintenance] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = await fetchAppSettingsStrict();
      setSaved(next);
      setDraft(draftFromSettings(next));
      applyAppSettings(next);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Les paramètres de l'application n'ont pas pu être chargés.",
      );
      setSaved(null);
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const baseline = useMemo(() => (saved ? draftFromSettings(saved) : null), [saved]);
  const dirty = Boolean(draft && baseline && JSON.stringify(draft) !== JSON.stringify(baseline));
  const maintenanceChange = Boolean(
    draft && saved && draft.mode_maintenance !== saved.mode_maintenance,
  );

  const author = () => ({
    email: profile?.email ?? null,
    userId: session?.user?.id ?? null,
  });

  const handleChange = <K extends keyof AppSettingsDraft>(key: K, value: AppSettingsDraft[K]) => {
    setDraft((previous) => (previous ? { ...previous, [key]: value } : previous));
  };

  const handleColorChange = (hex: string) => {
    const value = hex.startsWith("#") || hex === "" ? hex : `#${hex}`;
    setDraft((previous) => (previous ? { ...previous, couleur_principale: value } : previous));
    if (isHexColor(value)) applyPrimaryColor(value);
  };

  const handleMaintenanceToggle = () => {
    if (!draft) return;
    if (!draft.mode_maintenance) {
      setConfirmMaintenance(true);
      return;
    }
    setDraft({ ...draft, mode_maintenance: false });
  };

  const confirmEnableMaintenance = () => {
    setConfirmMaintenance(false);
    setDraft((previous) => (previous ? { ...previous, mode_maintenance: true } : previous));
  };

  const handleReset = () => {
    if (!saved) return;
    setDraft(draftFromSettings(saved));
    setErrors([]);
    applyAppSettings(saved);
  };

  const handleSave = async () => {
    if (!draft || !saved) return;
    const found = validateSettingsDraft(draft);
    setErrors(found);
    if (found.length > 0) return;

    setSaving(true);
    try {
      await updateAppSettings(draft);
      if (maintenanceChange) {
        recordAdminAction({
          action: draft.mode_maintenance ? "activer_maintenance" : "desactiver_maintenance",
          cible: draft.nom_application.trim(),
          ...author(),
        });
      }
      recordAdminAction({
        action: "modifier_parametres",
        cible: draft.nom_application.trim(),
        ...author(),
        details: {
          couleur: draft.couleur_principale,
          langue: draft.langue,
          fuseau: draft.fuseau,
          maintenance: draft.mode_maintenance,
        },
      });

      const next = await fetchAppSettingsStrict();
      setSaved(next);
      setDraft(draftFromSettings(next));
      applyAppSettings(next);
      await refresh();

      setNotice({
        tone: "success",
        message: maintenanceChange
          ? draft.mode_maintenance
            ? "Paramètres enregistrés. Le mode maintenance est actif : les utilisateurs voient l'écran d'information."
            : "Paramètres enregistrés. Le mode maintenance est désactivé : l'espace personnel est de nouveau accessible."
          : "Paramètres enregistrés. Le nom et la couleur sont appliqués partout.",
      });
    } catch (saveError) {
      setNotice({
        tone: "error",
        message:
          saveError instanceof Error
            ? saveError.message
            : "L'enregistrement des paramètres a échoué.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !draft) {
    return (
      <div className="w-full animate-fade-up space-y-4">
        <div className="h-[112px] animate-pulse rounded-lg bg-background-200" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="h-[340px] animate-pulse rounded-lg bg-background-200 lg:col-span-7" />
          <div className="h-[340px] animate-pulse rounded-lg bg-background-200 lg:col-span-5" />
        </div>
      </div>
    );
  }

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
              Paramètres de la plateforme
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-foreground-600 md:text-sm">
              Le nom, la couleur principale et le mode maintenance s'appliquent immédiatement à toute
              l'application, sans redéploiement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                saved?.mode_maintenance
                  ? "border-accent-300 bg-accent-100 text-accent-900"
                  : "border-primary-200 bg-primary-50 text-primary-800"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  saved?.mode_maintenance ? "bg-accent-500" : "bg-primary-500"
                }`}
              />
              {saved?.mode_maintenance ? "Maintenance active" : "Plateforme ouverte"}
            </span>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              disabled={loading}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800 disabled:cursor-wait disabled:opacity-70"
            >
              <i className={loading ? "ri-loader-4-line animate-spin text-xs" : "ri-refresh-line text-xs"} />
              Recharger
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!dirty || saving}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i className="ri-arrow-go-back-line text-xs" />
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || saving}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i className={saving ? "ri-loader-4-line animate-spin text-xs" : "ri-save-3-line text-xs"} />
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-foreground-500">
          <span className="inline-flex items-center gap-1.5">
            <i className="ri-time-line text-xs text-foreground-400" />
            Dernière modification : {formatAdminDateTime(saved?.updated_at ?? null)}
          </span>
          {dirty && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-accent-900">
              <i className="ri-error-warning-line text-xs" />
              Modifications non enregistrées
            </span>
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-accent-300 bg-accent-50 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <i className="ri-error-warning-line mt-0.5 text-base text-accent-800" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent-900">Paramètres indisponibles</p>
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

      {errors.length > 0 && (
        <div className="rounded-lg border border-accent-300 bg-accent-50 px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-accent-900">
            <i className="ri-error-warning-line text-xs" />
            Quelques éléments à corriger
          </p>
          <ul className="mt-1 space-y-0.5">
            {errors.map((item) => (
              <li key={item} className="text-[11px] leading-relaxed text-accent-800">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {draft && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            <SettingsIdentityCard draft={draft} disabled={saving} onChange={handleChange} />
            <SettingsMaintenanceCard
              enabled={draft.mode_maintenance}
              disabled={saving}
              onToggle={handleMaintenanceToggle}
            />
          </div>

          <div className="space-y-3 lg:col-span-5">
            <SettingsColorCard
              color={draft.couleur_principale}
              disabled={saving}
              onChange={handleColorChange}
            />
            <SettingsPreviewCard
              appName={draft.nom_application}
              color={isHexColor(draft.couleur_principale) ? draft.couleur_principale : "#3b5bdb"}
              maintenance={draft.mode_maintenance}
            />
          </div>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-foreground-400">
        Chaque enregistrement est tracé dans le journal d'activité. Le mode maintenance bloque
        uniquement l'espace personnel : le site public reste consultable.
      </p>

      <ConfirmDialog
        open={confirmMaintenance}
        title="Activer le mode maintenance ?"
        message="Tous les utilisateurs non administrateurs verront un écran d'information à la place de leur espace personnel. Vous, en tant qu'administrateur, garderez l'accès complet."
        confirmLabel="Activer la maintenance"
        cancelLabel="Annuler"
        onCancel={() => setConfirmMaintenance(false)}
        onConfirm={confirmEnableMaintenance}
      />
    </div>
  );
}