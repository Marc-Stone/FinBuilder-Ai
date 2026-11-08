import { useEffect, useMemo, useState } from "react";
import ModalPortal from "@/components/base/ModalPortal";
import {
  CONSOLE_PERMISSIONS,
  FULL_ACCESS_KEYS,
  PLATFORM_PERMISSIONS,
  type AdminRole,
  type RoleDraft,
} from "@/lib/roles";

type RoleFormModalProps = {
  role: AdminRole | null;
  preset?: RoleDraft | null;
  existingNames: string[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (draft: RoleDraft) => void;
};

export default function RoleFormModal({
  role,
  preset = null,
  existingNames,
  saving,
  onClose,
  onSubmit,
}: RoleFormModalProps) {
  const [nom, setNom] = useState(preset?.nom ?? role?.nom ?? "");
  const [description, setDescription] = useState(preset?.description ?? role?.description ?? "");
  const [permissions, setPermissions] = useState<string[]>(
    preset?.permissions ?? role?.permissions ?? ["dashboard"],
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const consoleCount = useMemo(
    () => CONSOLE_PERMISSIONS.filter((item) => permissions.includes(item.key)).length,
    [permissions],
  );

  const toggle = (key: string) => {
    setPermissions((previous) =>
      previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key],
    );
  };

  const setConsoleAll = (enabled: boolean) => {
    const consoleKeys = CONSOLE_PERMISSIONS.map((item) => item.key);
    setPermissions((previous) => {
      const withoutConsole = previous.filter((key) => !consoleKeys.includes(key));
      return enabled ? [...withoutConsole, ...consoleKeys] : withoutConsole;
    });
  };

  const handleSubmit = () => {
    const cleanName = nom.trim();
    if (cleanName.length < 3) {
      setError("Le nom du rôle doit contenir au moins 3 caractères.");
      return;
    }
    const duplicate = existingNames.some(
      (name) => name.toLowerCase() === cleanName.toLowerCase() && name !== role?.nom,
    );
    if (duplicate) {
      setError("Un rôle porte déjà ce nom.");
      return;
    }
    if (consoleCount === 0) {
      setError("Sélectionnez au moins un module de la console pour ce rôle.");
      return;
    }
    setError("");
    onSubmit({ nom: cleanName, description: description.trim(), permissions });
  };

  const group = (
    title: string,
    hint: string,
    items: typeof CONSOLE_PERMISSIONS,
  ) => (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground-900">{title}</p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-foreground-500">{hint}</p>
        </div>
        {items === CONSOLE_PERMISSIONS && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setConsoleAll(true)}
              className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2 py-1 text-[10px] font-semibold text-foreground-700 transition-colors hover:border-primary-300 hover:text-primary-800"
            >
              Tout autoriser
            </button>
            <button
              type="button"
              onClick={() => setConsoleAll(false)}
              className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2 py-1 text-[10px] font-semibold text-foreground-700 transition-colors hover:border-accent-300 hover:text-accent-800"
            >
              Tout retirer
            </button>
          </div>
        )}
      </div>

      <ul className="mt-2 space-y-1.5">
        {items.map((item) => {
          const active = permissions.includes(item.key);
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => toggle(item.key)}
                className={`flex w-full cursor-pointer items-start gap-2.5 rounded-md border px-2.5 py-2 text-left transition-colors ${
                  active
                    ? "border-primary-300 bg-primary-50"
                    : "border-background-200 bg-background-50 hover:border-background-300"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                    active ? "bg-primary-500 text-background-50" : "bg-background-100 text-foreground-500"
                  }`}
                >
                  <i className={`${item.icon} text-xs`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold text-foreground-900">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-relaxed text-foreground-500">
                    {item.description}
                  </span>
                </span>
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    active
                      ? "border-primary-500 bg-primary-500 text-background-50"
                      : "border-background-300 bg-background-50 text-transparent"
                  }`}
                >
                  <i className="ri-check-line text-[9px]" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="absolute inset-0 cursor-pointer bg-foreground-950/50"
        />

        <div className="relative z-10 flex max-h-[94vh] w-full max-w-2xl animate-fade-up flex-col overflow-hidden rounded-t-xl border border-background-200 bg-background-50 sm:rounded-lg">
          <div className="flex items-start gap-3 border-b border-background-200 px-4 py-3.5 md:px-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-800">
              <i className="ri-shield-user-line text-base" />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                className="text-sm font-semibold text-foreground-950"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {role ? "Modifier le rôle" : "Créer un rôle d'administrateur"}
              </h2>
              <p className="mt-0.5 text-[11px] text-foreground-500">
                Cochez uniquement les modules que ce profil doit pouvoir ouvrir.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-500 hover:bg-background-100"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>

          <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <label
                  htmlFor="role-nom"
                  className="mb-1 block text-[11px] font-semibold text-foreground-800"
                >
                  Nom du rôle
                </label>
                <input
                  id="role-nom"
                  type="text"
                  value={nom}
                  onChange={(event) => setNom(event.target.value)}
                  maxLength={40}
                  placeholder="Ex. Support utilisateurs"
                  className="w-full box-border rounded-md border border-background-300 bg-background-50 px-3 py-2 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-primary-400"
                />
              </div>
              <div className="min-w-0">
                <label
                  htmlFor="role-description"
                  className="mb-1 block text-[11px] font-semibold text-foreground-800"
                >
                  Description
                </label>
                <input
                  id="role-description"
                  type="text"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={140}
                  placeholder="À quoi sert ce rôle ?"
                  className="w-full box-border rounded-md border border-background-300 bg-background-50 px-3 py-2 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-primary-400"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-md border border-background-200 bg-background-100 px-3 py-2">
              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-background-50 px-2 py-0.5 text-[10px] font-semibold text-foreground-700">
                <i className="ri-checkbox-circle-line text-[10px] text-primary-600" />
                {consoleCount} / {CONSOLE_PERMISSIONS.length} modules ouverts
              </span>
              <button
                type="button"
                onClick={() =>
                  setPermissions((previous) =>
                    Array.from(new Set([...previous, ...FULL_ACCESS_KEYS])),
                  )
                }
                className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border border-accent-300 bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-900 transition-colors hover:bg-accent-100"
              >
                <i className="ri-sparkling-line text-[10px]" />
                Accès complet
              </button>
              <span className="text-[10px] leading-relaxed text-foreground-500">
                Un membre sans rôle conserve un accès total.
              </span>
            </div>

            {group(
              "Modules de la console",
              "Ces droits déterminent les entrées visibles dans le menu d'administration.",
              CONSOLE_PERMISSIONS,
            )}

            {group(
              "Droits étendus",
              "Droits réservés aux modules de pilotage prévus : ils n'ont pas encore d'écran mais sont conservés pour la suite.",
              PLATFORM_PERMISSIONS,
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-accent-300 bg-accent-50 px-3 py-2">
                <i className="ri-error-warning-line mt-0.5 text-xs text-accent-800" />
                <p className="text-[11px] leading-relaxed text-accent-900">{error}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-background-200 px-4 py-3 md:px-5">
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
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-wait disabled:opacity-70"
            >
              <i className={saving ? "ri-loader-4-line animate-spin text-xs" : "ri-save-3-line text-xs"} />
              {saving ? "Enregistrement…" : "Enregistrer le rôle"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}