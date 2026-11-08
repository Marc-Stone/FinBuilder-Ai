import { formatMoney } from "@/lib/finance";
import type { ScenarioPreset } from "@/lib/simulations";

export type SimulatorState = {
  revenu: number;
  depenses: number;
  revenuVariation: number;
  depensesReduction: number;
  epargneAdditionnelle: number;
  horizonMois: number;
};

type SimulatorControlsProps = {
  state: SimulatorState;
  devise: string;
  sourceLabel: string;
  activePreset: string | null;
  presetGains: Record<string, number>;
  onPatch: (patch: Partial<SimulatorState>) => void;
  onPreset: (preset: ScenarioPreset) => void;
  presets: ScenarioPreset[];
};

const horizons = [6, 12, 24, 36, 60];

export default function SimulatorControls({
  state,
  devise,
  sourceLabel,
  activePreset,
  presetGains,
  onPatch,
  onPreset,
  presets,
}: SimulatorControlsProps) {
  const capacite = state.revenu - state.depenses;

  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <h2
            className="text-sm font-semibold text-foreground-950"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Votre point de départ
          </h2>
          <span className="shrink-0 rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-semibold text-secondary-900">
            {sourceLabel}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="text-[11px] font-medium text-foreground-600">
              Revenus mensuels
            </span>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-background-300 bg-background-50 px-3 py-2 focus-within:border-primary-400">
              <i className="ri-arrow-down-line text-sm text-primary-600" />
              <input
                type="number"
                min={0}
                step={1000}
                value={state.revenu === 0 ? "" : state.revenu}
                onChange={(event) => onPatch({ revenu: Math.max(0, Number(event.target.value) || 0) })}
                placeholder="0"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground-950 outline-none"
              />
              <span className="shrink-0 text-[10px] font-medium text-foreground-400">{devise}</span>
            </div>
          </label>

          <label className="block min-w-0">
            <span className="text-[11px] font-medium text-foreground-600">
              Dépenses mensuelles
            </span>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-background-300 bg-background-50 px-3 py-2 focus-within:border-primary-400">
              <i className="ri-arrow-up-line text-sm text-accent-700" />
              <input
                type="number"
                min={0}
                step={1000}
                value={state.depenses === 0 ? "" : state.depenses}
                onChange={(event) =>
                  onPatch({ depenses: Math.max(0, Number(event.target.value) || 0) })
                }
                placeholder="0"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground-950 outline-none"
              />
              <span className="shrink-0 text-[10px] font-medium text-foreground-400">{devise}</span>
            </div>
          </label>
        </div>

        <p className="mt-2.5 flex items-center gap-1.5 rounded-md bg-background-100 px-2.5 py-1.5 text-[11px] text-foreground-600">
          <i className="ri-information-line text-xs text-foreground-400" />
          Capacité d'épargne actuelle :{" "}
          <strong className={capacite >= 0 ? "font-semibold text-primary-800" : "font-semibold text-accent-900"}>
            {formatMoney(capacite, devise)}
          </strong>
        </p>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <h2
          className="text-sm font-semibold text-foreground-950"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Vos leviers
        </h2>
        <p className="mt-0.5 text-xs text-foreground-500">
          Déplacez les curseurs : le reste de la page se recalcule instantanément.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground-700">
                <i className="ri-arrow-down-line text-xs text-primary-600" />
                Variation des revenus
              </span>
              <span className="shrink-0 rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-800">
                {state.revenuVariation > 0 ? "+" : ""}
                {state.revenuVariation} %
              </span>
            </div>
            <input
              type="range"
              min={-30}
              max={50}
              step={1}
              value={state.revenuVariation}
              onChange={(event) => onPatch({ revenuVariation: Number(event.target.value) })}
              className="mt-2 w-full cursor-pointer accent-primary-600"
              aria-label="Variation des revenus en pourcentage"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground-700">
                <i className="ri-arrow-up-line text-xs text-accent-700" />
                Réduction des dépenses
              </span>
              <span className="shrink-0 rounded-md bg-accent-50 px-2 py-0.5 text-[11px] font-semibold text-accent-900">
                -{state.depensesReduction} %
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={state.depensesReduction}
              onChange={(event) => onPatch({ depensesReduction: Number(event.target.value) })}
              className="mt-2 w-full cursor-pointer accent-accent-600"
              aria-label="Réduction des dépenses en pourcentage"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground-700">
                <i className="ri-safe-2-line text-xs text-secondary-700" />
                Versement d'épargne automatique
              </span>
              <span className="shrink-0 rounded-md bg-secondary-100 px-2 py-0.5 text-[11px] font-semibold text-secondary-900">
                +{formatMoney(state.epargneAdditionnelle, devise)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={200000}
              step={5000}
              value={state.epargneAdditionnelle}
              onChange={(event) => onPatch({ epargneAdditionnelle: Number(event.target.value) })}
              className="mt-2 w-full cursor-pointer accent-secondary-600"
              aria-label="Versement d'épargne automatique"
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-medium text-foreground-600">Horizon de projection</p>
          <div className="mt-1.5 inline-flex w-full flex-wrap gap-1 rounded-md bg-background-100 p-1">
            {horizons.map((months) => (
              <button
                key={months}
                type="button"
                onClick={() => onPatch({ horizonMois: months })}
                className={`min-w-0 flex-1 cursor-pointer whitespace-nowrap rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  state.horizonMois === months
                    ? "bg-background-50 text-foreground-950"
                    : "text-foreground-500 hover:text-foreground-800"
                }`}
              >
                {months < 12 ? `${months} mois` : `${months / 12} ans`}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <h2
          className="text-sm font-semibold text-foreground-950"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Scénarios prêts à tester
        </h2>
        <p className="mt-0.5 text-xs text-foreground-500">
          Un raccourci pour appliquer un levier d'un seul clic.
        </p>

        <ul className="mt-3 space-y-2">
          {presets.map((preset) => {
            const gain = presetGains[preset.id] ?? 0;
            const active = activePreset === preset.id;
            return (
              <li key={preset.id}>
                <button
                  type="button"
                  onClick={() => onPreset(preset)}
                  className={`flex w-full cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-primary-300 bg-primary-50"
                      : "border-background-200 bg-background-50 hover:border-primary-200 hover:bg-background-100/70"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                      active ? "bg-primary-500 text-background-50" : "bg-background-100 text-foreground-600"
                    }`}
                  >
                    <i className={`${preset.icon} text-sm`} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-foreground-950">
                      {preset.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-foreground-500">
                      {preset.description}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 whitespace-nowrap text-[11px] font-semibold ${
                      gain > 0 ? "text-primary-700" : "text-foreground-400"
                    }`}
                  >
                    {gain > 0 ? `+${formatMoney(gain, devise)}` : "neutre"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}