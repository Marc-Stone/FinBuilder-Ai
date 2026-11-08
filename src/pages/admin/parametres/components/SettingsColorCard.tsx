import { COLOR_PRESETS, buildPrimaryScale, isColorTooLight } from "@/lib/settings";

type SettingsColorCardProps = {
  color: string;
  disabled: boolean;
  onChange: (hex: string) => void;
};

const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

export default function SettingsColorCard({ color, disabled, onChange }: SettingsColorCardProps) {
  const scale = buildPrimaryScale(color);
  const tooLight = isColorTooLight(color);

  return (
    <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
      <div className="flex items-start gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-900">
          <i className="ri-palette-line text-base" />
        </span>
        <div className="min-w-0">
          <h2
            className="text-sm font-semibold text-foreground-950"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Couleur principale
          </h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-500">
            Elle s'applique immédiatement à toute la plateforme : boutons, menus, badges et liens.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
          Teintes proposées
        </p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {COLOR_PRESETS.map((preset) => {
            const active = preset.hex.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={preset.hex}
                type="button"
                disabled={disabled}
                onClick={() => onChange(preset.hex)}
                aria-pressed={active}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? "border-primary-500 bg-primary-50"
                    : "border-background-200 hover:border-primary-300"
                }`}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: preset.hex }}
                >
                  {active && <i className="ri-check-line text-[10px] text-white" />}
                </span>
                <span className="truncate text-[11px] font-medium text-foreground-800">
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="min-w-0">
          <label
            className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500"
            htmlFor="parametres-couleur"
          >
            Code couleur (hexadécimal)
          </label>
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-background-300"
              style={{ backgroundColor: color }}
            >
              <i className="ri-eye-off-line text-[10px] text-white/70" />
            </span>
            <input
              id="parametres-couleur"
              value={color}
              onChange={(event) => onChange(event.target.value)}
              disabled={disabled}
              maxLength={7}
              placeholder="#0f766e"
              className="w-full box-border rounded-md border border-background-300 bg-background-50 px-3 py-2 font-mono text-sm uppercase text-foreground-900 outline-none transition-colors placeholder:font-sans placeholder:normal-case placeholder:text-foreground-400 focus:border-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        <div className="min-w-0">
          <label
            className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500"
            htmlFor="parametres-couleur-natif"
          >
            Sélecteur visuel
          </label>
          <input
            id="parametres-couleur-natif"
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(color) ? color : "#0f766e"}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            className="h-9 w-full cursor-pointer rounded-md border border-background-300 bg-background-50 p-1 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      {scale && (
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
            Déclinaison appliquée
          </p>
          <div className="flex overflow-hidden rounded-md border border-background-200">
            {STEPS.map((step) => (
              <span
                key={step}
                title={`Nuance ${step}`}
                className="h-6 flex-1"
                style={{ backgroundColor: `oklch(${scale[`--primary-${step}`]})` }}
              />
            ))}
          </div>
        </div>
      )}

      {tooLight && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-accent-300 bg-accent-50 px-3 py-2">
          <i className="ri-contrast-2-line mt-0.5 text-xs text-accent-800" />
          <p className="text-[10px] leading-relaxed text-accent-900">
            Cette teinte est assez claire : le texte blanc des boutons risque d'être difficile à
            lire. Préférez une nuance plus soutenue.
          </p>
        </div>
      )}
    </section>
  );
}