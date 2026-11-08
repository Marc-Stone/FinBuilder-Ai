import { Link } from "react-router-dom";
import Reveal from "@/components/base/Reveal";
import TiltCard from "@/components/base/TiltCard";
import { aboutCommitments, aboutFounder } from "@/mocks/about";

export default function AboutTeam() {
  return (
    <>
      <section className="w-full bg-background-50 py-14 md:py-20">
        <div className="shell">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <Reveal>
                <span className="eyebrow">Le fondateur</span>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-3xl">
                  Une personne, un produit, une promesse tenue
                </h2>
              </Reveal>
              <Reveal delay={150}>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground-600">
                  FinBuilder AI est porté par un seul fondateur, basé à Abidjan. Les décisions de
                  produit, les calculs et les réponses aux messages viennent de la même personne —
                  c'est ce qui garde l'application simple.
                </p>
              </Reveal>
            </div>
            <Reveal delay={200} direction="left" distance={22} className="lg:col-span-5 lg:pt-10">
              <div className="rounded-lg border border-background-200 bg-background-100 p-4">
                <p className="text-xs leading-relaxed text-foreground-700">
                  <span className="font-semibold text-foreground-950">Une remarque à nous faire ?</span>{" "}
                  Chaque retour est lu et discuté avant la mise à jour suivante. Écrivez à{" "}
                  <span className="font-semibold text-primary-700">mrwim74@gmail.com</span>.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120} distance={30}>
            <article className="mt-8 overflow-hidden rounded-lg border border-background-200 bg-background-50">
              <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-12 md:gap-8 md:p-7">
                <Reveal
                  direction="right"
                  distance={24}
                  className="md:col-span-4"
                >
                  <div className="flex flex-col items-center md:items-start">
                    <TiltCard max={4} className="rounded-full">
                      <div className="h-40 w-40 overflow-hidden rounded-full bg-background-200 md:h-48 md:w-48">
                        <img
                          src={aboutFounder.photo}
                          alt={`Portrait de ${aboutFounder.name}`}
                          title={`${aboutFounder.name} — ${aboutFounder.role}`}
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                    </TiltCard>
                    <p
                      className="mt-4 text-base font-semibold text-foreground-950"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {aboutFounder.name}
                    </p>
                    <p className="mt-1 text-xs font-medium text-primary-700">{aboutFounder.role}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-800">
                      <i className="ri-map-pin-line text-xs" />
                      Abidjan
                    </span>
                  </div>
                </Reveal>

                <div className="md:col-span-8">
                  <div className="space-y-3">
                    {aboutFounder.bio.map((paragraph, index) => (
                      <p
                        key={paragraph.slice(0, 24)}
                        className="text-sm leading-relaxed text-foreground-700"
                        style={{
                          animation: `fade-slide-soft 700ms cubic-bezier(0.22, 1, 0.36, 1) ${240 + index * 110}ms both`,
                        }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {aboutFounder.focus.map((item, index) => (
                      <Reveal key={item.title} delay={index * 100} distance={18}>
                        <div className="group h-full rounded-md border border-background-200 bg-background-100 p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:bg-background-50">
                          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-background-50 text-primary-700 transition-transform duration-300 group-hover:rotate-6">
                            <i className={`${item.icon} text-base`} />
                          </span>
                          <p className="mt-2.5 text-xs font-semibold text-foreground-950">
                            {item.title}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-foreground-600">
                            {item.text}
                          </p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="w-full bg-background-100 py-14 md:py-20">
        <div className="shell">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow bg-background-50">Nos engagements</span>
              <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-3xl">
                Trois choses que nous ne ferons pas
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground-600">
                La confiance se construit sur des limites claires, pas sur des slogans. Voici les
                nôtres.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {aboutCommitments.map((item, index) => (
              <Reveal key={item.title} delay={index * 110} distance={24}>
                <article className="group h-full rounded-lg border border-background-200 bg-background-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent-300">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-100 text-accent-700 transition-transform duration-300 group-hover:scale-110">
                    <i className={`${item.icon} text-lg`} />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-foreground-950">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground-600">{item.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-primary-950 py-14 md:py-16">
        <div className="shell">
          <Reveal>
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 className="text-2xl font-semibold text-background-50 md:text-3xl">
                  Vous savez qui nous sommes, voyez ce que ça donne
                </h2>
                <p className="mt-2 text-sm text-background-50/70">
                  Créez votre compte, ajoutez un revenu, et laissez l'application calculer la suite.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  to="/inscription"
                  className="group inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-500 px-6 py-3.5 text-sm font-semibold text-foreground-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-400 active:scale-[0.98]"
                >
                  Créer mon compte
                  <i className="ri-arrow-right-line text-base transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/mode-demploi"
                  className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-background-50/25 px-6 py-3.5 text-sm font-semibold text-background-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-background-50/10"
                >
                  Mode d'emploi
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}