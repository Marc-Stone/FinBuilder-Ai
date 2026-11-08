import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/finance";
import { monthsUntil } from "@/lib/goals";

type ProjectSavingsSimulatorProps = {
  reste: number;
  devise: string;
  dateFin: string | null;
  goalName?: string;
};

const presets = [6, 12, 18, 24, 36];

export default function ProjectSavingsSimulator({
  reste,
  devise,
  dateFin,
  goalName,
}: ProjectSavingsSimulatorProps) {
  const horizon = monthsUntil(dateFin);
  const [monthsInput, setMonthsInput] = useState(() =>
    String(horizon > 0 ? Math.min(horizon, 600) : 12),
  );

  const months = useMemo(() => {
    const parsed = Math.round(Number(monthsInput));
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.min(parsed, 600);
  }, [monthsInput]);

  const mensuel = months > 0 && reste > 0 ? Math.ceil(reste / months) : 0;
  const hebdo = mensuel > 0 ? Math.ceil((mensuel * 12) / 52) : 0;
  const annuel = mensuel > 0 ? mensuel * 12 : 0;

  const targetDate = useMemo(() => {
    if (months <= 0) return null;
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + months);
    return date;
  }, [months]);

  const lastMonth = useMemo(() => {
    if (months <= 0) return null;
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date;
  }, [months]);

  return (
    <div className="mt-3 rounded-lg border border-secondary-200 bg-secondary-100/50 px-3.5 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary-500 text-background-50">
            <i className="ri-wallet-3-line text-sm" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-secondary-900">Combien épargner par mois ?</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-secondary-900/75">
              Pour financer le reste à temps :{" "}
              <strong className="font-semibold">{formatMoney(Math.max(reste, 0), devise)}</strong>.
            </p>
          </div>
        </div>

        {horizon > 0 && Number(monthsInput) !== horizon && (
          <button
            type="button"
            onClick={() => setMonthsInput(String(Math.min(horizon, 600)))}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border border-secondary-300 bg-background-50 px-2.5 py-1 text-[10px] font-semibold text-secondary-900 transition-colors hover:bg-secondary-200/70"
          >
            <i className="ri-calendar-check-line text-[11px]" />
            Caler sur l'échéance ({horizon} mois)
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((preset) => {
            const active = months === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => setMonthsInput(String(preset))}
                className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  active
                    ? "border-secondary-500 bg-secondary-500 text-background-50"
                    : "border-background-300 bg-background-50 text-foreground-700 hover:border-secondary-300 hover:bg-secondary-200/40"
                }`}
              >
                {preset} mois
              </button>
            );
          })}
        </div>

        <div className="flex min-w-0 items-center gap-1.5">
          <label
            htmlFor="project-simulator-months"
            className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-500"
          >
            Autre
          </label>
          <div className="relative w-[104px]">
            <input
              id="project-simulator-months"
              type="text"
              inputMode="numeric"
              value={monthsInput}
              onChange={(event) => setMonthsInput(event.target.value.replace(/[^\d]/g, "").slice(0, 3))}
              aria-label="Nombre de mois pour financer le projet"
              className="box-border w-full min-w-0 rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 pr-11 text-right text-xs font-semibold text-foreground-900 focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-foreground-400">
              mois
            </span>
          </div>
        </div>
      </div>

      {reste <= 0 ? (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5">
          <i className="ri-checkbox-circle-line text-base text-primary-700" />
          <p className="text-[11px] font-semibold text-primary-800">
            Enveloppe déjà entièrement financée. Aucune épargne supplémentaire n'est nécessaire.
          </p>
        </div>
      ) : (
        <div className="mt-3 rounded-md border border-background-200 bg-background-50 px-3 py-2.5">
          {mensuel > 0 ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <p
                  className="text-lg font-semibold text-foreground-950"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {formatMoney(mensuel, devise)}
                  <span className="ml-1.5 text-[11px] font-medium text-foreground-500">/ mois</span>
                </p>
                <span className="rounded-full border border-accent-200 bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-900">
                  sur {months} mois
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-foreground-600">
                Soit environ <strong className="font-semibold text-foreground-800">{formatMoney(hebdo, devise)}</strong>{" "}
                par semaine, ou {formatMoney(annuel, devise)} par an.
                {lastMonth && (
                  <>
                    {" "}
                    Dernier versement autour de{" "}
                    <strong className="font-semibold text-foreground-800">
                      {lastMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                    </strong>
                    .
                  </>
                )}
              </p>
              <p className="mt-1.5 flex items-start gap-1.5 text-[10px] leading-relaxed text-foreground-500">
                <i className="ri-information-line mt-0.5 text-[11px]" />
                <span>
                  {goalName
                    ? `Versez ce montant chaque mois sur l'objectif « ${goalName} » : le reste à financer du projet se mettra à jour automatiquement.`
                    : "Aucun objectif d'épargne n'est encore lié : créez-en un depuis « Modifier la répartition » pour suivre ce plan automatiquement."}
                </span>
              </p>
            </>
          ) : (
            <p className="text-[11px] font-medium text-foreground-500">
              Indiquez un nombre de mois supérieur à zéro pour calculer l'effort mensuel.
            </p>
          )}
        </div>
      )}

      {targetDate && mensuel > 0 && (
        <p className="mt-2 text-[10px] text-foreground-400">
          Hypothèse : épargne régulière de {formatMoney(mensuel, devise)} par mois jusqu'à{" "}
          {targetDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}.
        </p>
      )}
    </div>
  );
}