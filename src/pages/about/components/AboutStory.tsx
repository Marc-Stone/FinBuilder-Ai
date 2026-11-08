import Reveal from "@/components/base/Reveal";
import { aboutTimeline } from "@/mocks/about";

export default function AboutStory() {
  return (
    <section className="w-full bg-background-100 py-14 md:py-20">
      <div className="shell">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Reveal direction="right" distance={24}>
                <div>
                  <span className="eyebrow bg-background-50">Notre histoire</span>
                  <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-3xl">
                    Deux ans à écouter avant de construire
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-600">
                    Nous avons commencé par des entretiens, pas par du code. Chaque étape ci-contre
                    correspond à ce que les utilisateurs nous ont demandé de rendre plus simple.
                  </p>

                  <div className="mt-6 rounded-lg border border-background-200 bg-background-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-400">
                      Aujourd'hui
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground-700">
                      13 espaces de travail, 14 fiches pédagogiques, et une seule promesse : que le mois
                      se termine avec de l'argent de côté.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-8">
            <ol className="relative space-y-4 border-l border-background-300 pl-5 md:pl-7">
              {aboutTimeline.map((item, index) => (
                <li key={item.title} className="relative">
                  <Reveal delay={index * 110} distance={24}>
                    <div className="relative">
                      <span
                        className={`anim-dot-pop absolute -left-[27px] top-5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background-100 md:-left-[35px] ${
                          index === aboutTimeline.length - 1 ? "bg-accent-500" : "bg-primary-500"
                        }`}
                        style={{ animationDelay: `${index * 110 + 200}ms` }}
                      />
                      <div className="rounded-lg border border-background-200 bg-background-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-background-300 md:p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                              index === aboutTimeline.length - 1
                                ? "bg-accent-100 text-accent-800"
                                : "bg-primary-50 text-primary-700"
                            }`}
                          >
                            {item.year}
                          </span>
                          <h3 className="text-sm font-semibold text-foreground-950 md:text-base">
                            {item.title}
                          </h3>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-foreground-600 md:text-sm">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}