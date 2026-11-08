type SettingsMaintenanceCardProps = {
  enabled: boolean;
  disabled: boolean;
  onToggle: () => void;
};

export default function SettingsMaintenanceCard({
  enabled,
  disabled,
  onToggle,
}: SettingsMaintenanceCardProps) {
  return (
    <section
      className={`rounded-lg border p-4 md:p-5 ${
        enabled ? "border-accent-300 bg-accent-50" : "border-background-200 bg-background-50"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
            enabled ? "bg-accent-100 text-accent-900" : "bg-secondary-100 text-secondary-900"
          }`}
        >
          <i className={enabled ? "ri-tools-line text-base" : "ri-shield-check-line text-base"} />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            className="text-sm font-semibold text-foreground-950"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Mode maintenance
          </h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">
            Ferme temporairement l'espace personnel pour tous les comptes, sauf les administrateurs.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Activer ou désactiver le mode maintenance"
          onClick={onToggle}
          disabled={disabled}
          className={`relative ml-auto flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            enabled ? "border-accent-500 bg-accent-500" : "border-background-300 bg-background-200"
          }`}
        >
          <span
            className={`absolute h-4 w-4 rounded-full bg-background-50 transition-transform duration-200 ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div
        className={`mt-3 rounded-md border px-3 py-2 ${
          enabled ? "border-accent-300 bg-background-50" : "border-background-200 bg-background-100"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-accent-500" : "bg-primary-500"}`}
          />
          <p className="text-[11px] font-semibold text-foreground-800">
            {enabled ? "Plateforme en maintenance" : "Plateforme ouverte"}
          </p>
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-foreground-600">
          {enabled
            ? "Les utilisateurs voient un écran d'information à la place de leur espace. Le site public reste accessible et les administrateurs gardent l'accès complet."
            : "Tous les comptes accèdent normalement à leur espace. Activez la maintenance pendant une intervention sur les données."}
        </p>
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-foreground-400">
        Aucune donnée n'est supprimée : vous pouvez activer puis désactiver à tout moment.
      </p>
    </section>
  );
}