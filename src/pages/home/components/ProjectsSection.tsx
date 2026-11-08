import { useState } from "react";
import { Link } from "react-router-dom";
import { projectPreview } from "@/mocks/landing";
import Reveal from "@/components/base/Reveal";

const highlights = [
  {
    icon: "ri-list-check-3",
    title: "Des postes chiffrés",
    text: "Terrain, construction, notaire, ameublement : chaque ligne a son montant, et la somme reste confrontée à l'enveloppe globale du projet.",
  },
  {
    icon: "ri-route-line",
    title: "Des étapes datées",
    text: "Devis, achat, travaux : chaque étape porte une date cible et un statut, pour voir où le projet en est réellement.",
  },
  {
    icon: "ri-calculator-line",
    title: "Un simulateur d'épargne",
    text: "Le reste à financer divisé par un nombre de mois donne l'effort mensuel à tenir — et l'équivalent hebdomadaire.",
  },
];

export default function ProjectsSection() {
  const [months, setMonths] = useState(24);
  const current = projectPreview.savings.find((item) => item.months === months) ?? projectPreview.savings[0];

  return (
    <section className="w-full bg-background-100 py-16 md:py-24">
      <div className="shell">
        <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
          <div className="grid grid-cols-1 gap-8 p-5 md:p-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:p-10">
            <Reveal direction="right" distance={26} className="lg:col-span-7">
              <div className="rounded-lg border border-background-200 bg-background-100/60 p-4 md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                      <i className="ri-building-4-line text-lg" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground-950">
                        {projectPreview.name}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-foreground-500">
                        <span className="rounded-full bg-background-100 px-2 py-0.5 font-medium text-foreground-600">
                          {projectPreview.type}
                        </span>
                        Enveloppe {projectPreview.envelope} FCFA
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1 text-[10px] font-semibold text-accent-900">
                    {projectPreview.progress} % financé
                  </span>
                </div>

                <div className="mt-3.5 rounded-md border border-background-200 bg-background-50 px-3 py-2.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <p
                      className="text-base font-semibold text-foreground-950"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {projectPreview.saved}
                      <span className="ml-1 text-[10px] font-medium text-foreground-500">FCFA épargnés</span>
                    </p>
                    <p className="text-[11px] font-medium text-foreground-500">
                      reste {projectPreview.remaining} FCFA
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-500"
                      style={{ width: `${projectPreview.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
                    Postes budgétaires
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {projectPreview.postes.map((poste) => (
                      <div
                        key={poste.label}
                        className="flex items-center justify-between gap-2 rounded-md border border-background-200 bg-background-50 px-2.5 py-1.5"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              poste.tone === "accent"
                                ? "bg-accent-500"
                                : poste.tone === "secondary"
                                  ? "bg-secondary-500"
                                  : "bg-primary-500"
                            }`}
                          />
                          <span className="truncate text-[11px] font-medium text-foreground-800">
                            {poste.label}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="hidden h-1 w-12 overflow-hidden rounded-full bg-background-200 sm:block">
                            <span
                              className={`block h-full rounded-full ${
                                poste.tone === "accent"
                                  ? "bg-accent-400"
                                  : poste.tone === "secondary"
                                    ? "bg-secondary-400"
                                    : "bg-primary-400"
                              }`}
                              style={{ width: `${Math.min(poste.share * 2, 100)}%` }}
                            />
                          </span>
                          <span
                            className="text-[11px] font-semibold text-foreground-900"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {poste.amount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-400">
                      Étapes du projet
                    </p>
                    <ol className="mt-2 space-y-2">
                      {projectPreview.etapes.map((etape) => {
                        const done = etape.state === "done";
                        const active = etape.state === "current";
                        return (
                          <li key={etape.label} className="flex items-start gap-2">
                            <span
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                done
                                  ? "bg-primary-500 text-background-50"
                                  : active
                                    ? "border border-accent-400 bg-accent-100 text-accent-800"
                                    : "bg-background-200 text-foreground-400"
                              }`}
                            >
                              <i
                                className={
                                  done
                                    ? "ri-check-line text-[9px]"
                                    : active
                                      ? "ri-time-line text-[9px]"
                                      : "ri-circle-line text-[9px]"
                                }
                              />
                            </span>
                            <div className="min-w-0">
                              <p
                                className={`text-[11px] font-medium leading-snug ${
                                  done ? "text-foreground-500 line-through" : "text-foreground-800"
                                }`}
                              >
                                {etape.label}
                              </p>
                              <p className="text-[10px] text-foreground-400">{etape.date}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  <div className="rounded-md border border-secondary-200 bg-secondary-100/60 p-2.5">
                    <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-secondary-900">
                      <i className="ri-wallet-3-line text-xs" />
                      Combien épargner par mois ?
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {projectPreview.savings.map((option) => {
                        const active = option.months === months;
                        return (
                          <button
                            key={option.months}
                            type="button"
                            onClick={() => setMonths(option.months)}
                            className={`cursor-pointer rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors duration-200 ${
                              active
                                ? "border-secondary-500 bg-secondary-500 text-background-50"
                                : "border-background-300 bg-background-50 text-foreground-700 hover:border-secondary-300 hover:bg-secondary-200/50"
                            }`}
                          >
                            {option.months} mois
                          </button>
                        );
                      })}
                    </div>
                    <p
                      className="mt-2 text-base font-semibold text-foreground-950"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {current.monthly}
                      <span className="ml-1 text-[10px] font-medium text-foreground-500">FCFA / mois</span>
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-foreground-500">
                      soit environ {current.weekly} FCFA par semaine pendant {current.months} mois.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="left" distance={26} delay={120} className="lg:col-span-5">
              <div>
                <span className="eyebrow">
                  <i className="ri-building-4-line text-xs" />
                  Projets planifiés
                </span>
                <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-4xl">
                  De l'intention au plan d'épargne, sans tableur
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground-600">
                  Un achat important ne se décide pas sur un chiffre vague. Vous fixez une
                  enveloppe, vous la découpez en postes, vous datez les étapes — et le simulateur
                  vous dit quel montant mettre de côté chaque mois pour y arriver.
                </p>

                <ul className="mt-6 space-y-4">
                  {highlights.map((item, index) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                          index === 2
                            ? "bg-accent-100 text-accent-800"
                            : "bg-primary-100 text-primary-700"
                        }`}
                      >
                        <i className={`${item.icon} text-sm`} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground-950">{item.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-foreground-600">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Link
                    to="/inscription"
                    className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 active:translate-y-0 active:scale-[0.98]"
                  >
                    Planifier mon projet
                    <i className="ri-arrow-right-line text-base transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/fonctionnalites"
                    className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 bg-background-100 px-5 py-3 text-sm font-semibold text-foreground-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50 active:translate-y-0"
                  >
                    Voir le module en détail
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}