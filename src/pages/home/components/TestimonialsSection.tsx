import { numbersFacts, useCases } from "@/mocks/landing";
import AnimatedStat from "@/components/base/AnimatedStat";
import Reveal from "@/components/base/Reveal";

export default function TestimonialsSection() {
  return (
    <section className="w-full bg-background-100 py-16 md:py-24">
      <div className="shell">
        <Reveal
          direction="up"
          distance={24}
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-lg">
            <span className="eyebrow bg-background-50">Cas d'usage</span>
            <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-4xl">
              Trois situations, trois façons de l'utiliser
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground-600">
              Des scénarios d'usage décrits pour montrer le fonctionnement de l'application. Ce ne
              sont pas des témoignages : aucune personne réelle n'est citée.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 md:gap-8">
            {numbersFacts.map((fact, index) => (
              <div key={fact.label}>
                <p
                  className="text-xl font-semibold text-primary-700 md:text-2xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <AnimatedStat value={fact.value} delay={index * 140} />
                </p>
                <p className="mt-0.5 text-xs text-foreground-600">{fact.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {useCases.map((item, index) => (
            <Reveal key={item.id} delay={index * 120} distance={30} blur className="h-full">
              <article className="group flex h-full flex-col justify-between rounded-lg border border-background-200 bg-background-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 md:p-6">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition-transform duration-300 group-hover:scale-105">
                      <i className={`${item.icon} text-base`} />
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-accent-200 bg-accent-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-800">
                      <i className="ri-information-line text-[11px]" />
                      Exemple fictif
                    </span>
                  </div>

                  <h3 className="mt-3.5 text-sm font-semibold leading-snug text-foreground-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-foreground-600">
                    {item.situation}
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed text-foreground-700">
                    {item.scenario}
                  </p>
                </div>

                <p className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary-100 px-2.5 py-1 text-[11px] font-medium text-secondary-900">
                  <i className="ri-focus-3-line text-xs" />
                  {item.focus}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}