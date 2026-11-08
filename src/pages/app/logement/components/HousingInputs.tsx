import { formatMoney } from "@/lib/finance";

export type HousingState = {
  revenu: number;
  loyerActuel: number;
  charges: number;
  apport: number;
  prixCible: number;
  tauxAnnuel: number;
  dureeAnnees: number;
  tauxEndettement: number;
};

type HousingInputsProps = {
  state: HousingState;
  devise: string;
  sourceLabel: string;
  onPatch: (patch: Partial<HousingState>) => void;
};

const durees = [5, 10, 15, 20, 25, 30];
const tauxEndettementOptions = [25, 30, 33, 35];

type MoneyFieldProps = {
  label: string;
  icon: string;
  tone: string;
  value: number;
  devise: string;
  onChange: (value: number) => void;
  hint?: string;
};

function MoneyField({ label, icon, tone, value, devise, onChange, hint }: MoneyFieldProps) {
  return (
    <label className="block min-w-0">
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground-600">
        <i className={`${icon} text-xs ${tone}`} />
        {label}
      </span>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-background-300 bg-background-50 px-3 py-2 focus-within:border-primary-400">
        <input
          type="number"
          min={0}
          step={1000}
          value={value === 0 ? "" : value}
          onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
          placeholder="0"
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground-950 outline-none"
        />
        <span className="shrink-0 text-[10px] font-medium text-foreground-400">{devise}</span>
      </div>
      {hint && <span className="mt-1 block text-[10px] leading-relaxed text-foreground-400">{hint}</span>}
    </label>
  );
}

export default function HousingInputs({ state, devise, sourceLabel, onPatch }: HousingInputsProps) {
  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <h2
            className="text-sm font-semibold text-foreground-950"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Votre situation
          </h2>
          <span className="shrink-0 rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-semibold text-secondary-900">
            {sourceLabel}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MoneyField
            label="Revenu net mensuel"
            icon="ri-arrow-down-line"
            tone="text-primary-600"
            value={state.revenu}
            devise={devise}
            onChange={(value) => onPatch({ revenu: value })}
          />
          <MoneyField
            label="Charge logement actuelle"
            icon="ri-home-5-line"
            tone="text-accent-700"
            value={state.loyerActuel}
            devise={devise}
            onChange={(value) => onPatch({ loyerActuel: value })}
            hint="Loyer ou mensualité que vous payez aujourd'hui."
          />
          <MoneyField
            label="Autres charges du logement"
            icon="ri-flashlight-line"
            tone="text-secondary-700"
            value={state.charges}
            devise={devise}
            onChange={(value) => onPatch({ charges: value })}
            hint="Eau, électricité, charges de copropriété."
          />
          <MoneyField
            label="Apport disponible"
            icon="ri-safe-2-line"
            tone="text-primary-600"
            value={state.apport}
            devise={devise}
            onChange={(value) => onPatch({ apport: value })}
          />
        </div>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <h2
          className="text-sm font-semibold text-foreground-950"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Votre scénario d'achat
        </h2>
        <p className="mt-0.5 text-xs text-foreground-500">
          Ajustez le crédit pour voir votre capacité d'emprunt réelle.
        </p>

        <div className="mt-3">
          <MoneyField
            label="Prix du bien visé"
            icon="ri-building-2-line"
            tone="text-primary-600"
            value={state.prixCible}
            devise={devise}
            onChange={(value) => onPatch({ prixCible: value })}
            hint="Sert à calculer la mensualité et le coût total du crédit."
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-foreground-600">Taux d'intérêt annuel</span>
            <span className="shrink-0 rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-800">
              {state.tauxAnnuel.toFixed(1).replace(".0", "")} %
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={15}
            step={0.5}
            value={state.tauxAnnuel}
            onChange={(event) => onPatch({ tauxAnnuel: Number(event.target.value) })}
            className="mt-2 w-full cursor-pointer accent-primary-600"
            aria-label="Taux d'intérêt annuel"
          />
          <div className="mt-1 flex justify-between text-[10px] text-foreground-400">
            <span>0 %</span>
            <span>7,5 %</span>
            <span>15 %</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-medium text-foreground-600">Durée de remboursement</p>
          <div className="mt-1.5 inline-flex w-full flex-wrap gap-1 rounded-md bg-background-100 p-1">
            {durees.map((annees) => (
              <button
                key={annees}
                type="button"
                onClick={() => onPatch({ dureeAnnees: annees })}
                className={`min-w-0 flex-1 cursor-pointer whitespace-nowrap rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  state.dureeAnnees === annees
                    ? "bg-background-50 text-foreground-950"
                    : "text-foreground-500 hover:text-foreground-800"
                }`}
              >
                {annees} ans
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-medium text-foreground-600">
            Taux d'endettement maximum accepté
          </p>
          <div className="mt-1.5 inline-flex w-full flex-wrap gap-1 rounded-md bg-background-100 p-1">
            {tauxEndettementOptions.map((taux) => (
              <button
                key={taux}
                type="button"
                onClick={() => onPatch({ tauxEndettement: taux })}
                className={`min-w-0 flex-1 cursor-pointer whitespace-nowrap rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  state.tauxEndettement === taux
                    ? "bg-background-50 text-foreground-950"
                    : "text-foreground-500 hover:text-foreground-800"
                }`}
              >
                {taux} %
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[10px] leading-relaxed text-foreground-400">
            La plupart des prêteurs retiennent 30 à 33 % des revenus nets.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-100 p-4 md:p-5">
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background-50 text-foreground-600">
            <i className="ri-lightbulb-flash-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground-900">Comment est calculé le résultat</p>
            <p className="mt-1 text-[11px] leading-relaxed text-foreground-600">
              Mensualité maximale = revenu × taux d'endettement. Le capital empruntable est la somme
              actualisée de ces mensualités sur la durée choisie. L'apport et le crédit forment votre
              budget d'achat, dont 7 % partent en frais d'acquisition.
            </p>
          </div>
        </div>
        <p className="mt-2.5 truncate text-[11px] font-medium text-foreground-500">
          Aujourd'hui votre logement coûte{" "}
          {formatMoney(state.loyerActuel + state.charges, devise)} par mois.
        </p>
      </section>
    </div>
  );
}