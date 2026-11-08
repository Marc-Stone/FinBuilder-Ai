import { APP_LANGUAGES, APP_TIMEZONES, type AppSettingsDraft } from "@/lib/settings";

type SettingsIdentityCardProps = {
  draft: AppSettingsDraft;
  disabled: boolean;
  onChange: <K extends keyof AppSettingsDraft>(key: K, value: AppSettingsDraft[K]) => void;
};

export default function SettingsIdentityCard({ draft, disabled, onChange }: SettingsIdentityCardProps) {
  const fieldClass =
    "w-full box-border rounded-md border border-background-300 bg-background-50 px-3 py-2 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-primary-400 disabled:cursor-not-allowed disabled:opacity-60";
  const labelClass =
    "mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500";

  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex items-start gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-800">
          <i className="ri-store-3-line text-base" />
        </span>
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Identité de l'application
          </h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">
            Le nom s'affiche dans les menus, les emails et le titre des pages. Les emails servent de
            contact visible par vos utilisateurs.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="min-w-0 md:col-span-2">
          <label className={labelClass} htmlFor="parametres-nom">
            Nom de l'application
          </label>
          <input
            id="parametres-nom"
            value={draft.nom_application}
            onChange={(event) => onChange("nom_application", event.target.value)}
            disabled={disabled}
            maxLength={40}
            placeholder="Ex. FinBuilder AI"
            className={fieldClass}
          />
          <p className="mt-1 text-[10px] text-foreground-400">
            {draft.nom_application.trim().length} / 40 caractères
          </p>
        </div>

        <div className="min-w-0">
          <label className={labelClass} htmlFor="parametres-email-contact">
            Email de contact
          </label>
          <input
            id="parametres-email-contact"
            type="email"
            value={draft.email_contact}
            onChange={(event) => onChange("email_contact", event.target.value)}
            disabled={disabled}
            placeholder="contact@exemple.com"
            className={fieldClass}
          />
        </div>

        <div className="min-w-0">
          <label className={labelClass} htmlFor="parametres-email-support">
            Email de support
          </label>
          <input
            id="parametres-email-support"
            type="email"
            value={draft.email_support}
            onChange={(event) => onChange("email_support", event.target.value)}
            disabled={disabled}
            placeholder="support@exemple.com"
            className={fieldClass}
          />
        </div>

        <div className="min-w-0">
          <label className={labelClass} htmlFor="parametres-langue">
            Langue par défaut
          </label>
          <select
            id="parametres-langue"
            value={draft.langue}
            onChange={(event) => onChange("langue", event.target.value)}
            disabled={disabled}
            className={`${fieldClass} cursor-pointer`}
          >
            {APP_LANGUAGES.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label className={labelClass} htmlFor="parametres-fuseau">
            Fuseau horaire
          </label>
          <select
            id="parametres-fuseau"
            value={draft.fuseau}
            onChange={(event) => onChange("fuseau", event.target.value)}
            disabled={disabled}
            className={`${fieldClass} cursor-pointer`}
          >
            {APP_TIMEZONES.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[10px] leading-relaxed text-foreground-400">
            Sert de référence pour les dates de diffusion programmée et les exports.
          </p>
        </div>
      </div>
    </section>
  );
}