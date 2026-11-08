type SettingsPreviewCardProps = {
  appName: string;
  color: string;
  maintenance: boolean;
};

const NAV_HINTS = ["Tableau de bord", "Revenus", "Dépenses", "Budget"];

export default function SettingsPreviewCard({
  appName,
  color,
  maintenance,
}: SettingsPreviewCardProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
      <div className="flex items-center gap-2 border-b border-background-200 bg-background-100 px-4 py-2.5">
        <i className="ri-eye-line text-xs text-foreground-500" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-500">
          Aperçu en direct
        </p>
        {maintenance && (
          <span className="ml-auto inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-accent-300 bg-accent-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent-900">
            <i className="ri-tools-line text-[9px]" />
            Maintenance
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-0 sm:grid-cols-5">
        <div className="border-b border-background-200 p-3 sm:col-span-2 sm:border-b-0 sm:border-r">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-background-50"
              style={{ backgroundColor: color }}
            >
              <i className="ri-line-chart-line text-sm" />
            </span>
            <p
              className="truncate text-xs font-semibold text-foreground-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {appName.trim() || "Nom de l'application"}
            </p>
          </div>
          <ul className="mt-3 space-y-1">
            {NAV_HINTS.map((item, index) => (
              <li
                key={item}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium ${
                  index === 0 ? "text-foreground-950" : "text-foreground-500"
                }`}
                style={
                  index === 0
                    ? { backgroundColor: `color-mix(in oklab, ${color} 12%, white)` }
                    : undefined
                }
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: index === 0 ? color : "#c8c8c8" }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 sm:col-span-3">
          <span
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold text-background-50"
            style={{ backgroundColor: color }}
          >
            <i className="ri-check-line text-[9px]" />
            Badge principal
          </span>
          <p className="mt-2 text-[11px] font-semibold text-foreground-900">
            Enregistrer une dépense
          </p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-foreground-500">
            Le bouton d'action, les liens actifs et les badges reprennent la couleur choisie.
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className="inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1 text-[10px] font-semibold text-background-50"
              style={{ backgroundColor: color }}
            >
              <i className="ri-add-line text-[10px]" />
              Ajouter
            </span>
            <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2.5 py-1 text-[10px] font-semibold text-foreground-700">
              Annuler
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}