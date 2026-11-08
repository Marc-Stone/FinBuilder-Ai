import { problemCards, steps } from "@/mocks/landing";
import Reveal from "@/components/base/Reveal";
import StepVisual from "@/pages/home/components/StepVisual";

export default function SolutionSection() {
  return (
    <>
      <section className="w-full bg-background-50 pb-4 pt-16 md:pt-24">
        <div className="shell">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <Reveal direction="right" distance={28} className="lg:col-span-5">
              <span className="eyebrow">Le problème</span>
              <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-4xl">
                Gagner de l'argent ne suffit pas. Il faut savoir où il va.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground-600">
                La plupart des budgets échouent non pas par manque de revenus, mais par manque de
                visibilité. FinBuilder AI comble ce vide avec des chiffres, pas des généralités.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-7 lg:gap-4">
              {problemCards.map((card, index) => (
                <Reveal key={card.title} delay={index * 110} distance={24} className="h-full">
                  <div className="group h-full rounded-lg border border-background-200 bg-background-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 md:p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-background-100 text-foreground-700 transition-colors duration-300 group-hover:bg-accent-100 group-hover:text-accent-700">
                      <i className={`${card.icon} text-lg`} />
                    </span>
                    <h3 className="mt-3.5 text-sm font-semibold leading-snug text-foreground-950">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-foreground-600">{card.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-background-50 py-16 md:py-24">
        <div className="shell">
          <Reveal direction="up" distance={22} className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Comment ça marche</span>
            <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-4xl">
              Trois étapes pour un plan financier qui tient
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground-600">
              Pas de connexion bancaire, pas de tableur. Vous saisissez, FinBuilder calcule et vous
              guide mois après mois.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 130} distance={30} blur className="h-full">
                <div className="group relative h-full overflow-hidden rounded-lg border border-background-200 bg-background-100/50 p-5 pb-16 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 md:p-6 md:pb-20">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-500 text-background-50 transition-transform duration-300 group-hover:scale-105">
                      <i className={`${step.icon} text-xl`} />
                    </span>
                    <span
                      className="text-2xl font-semibold text-background-300 transition-colors duration-300 group-hover:text-primary-200"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground-950">{step.title}</h3>
                  <p className="mt-2 max-w-[94%] text-sm leading-relaxed text-foreground-600">
                    {step.description}
                  </p>
                  <StepVisual index={index} />
                  {index < steps.length - 1 && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full overflow-hidden bg-primary-200/70">
                      <span className="block h-full w-1/3 bg-primary-500/70" />
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}