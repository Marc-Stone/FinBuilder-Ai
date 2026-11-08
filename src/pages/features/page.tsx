import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AmbientGlow from "@/components/base/AmbientGlow";
import AnimatedStat from "@/components/base/AnimatedStat";
import Reveal from "@/components/base/Reveal";
import ScrollTopButton from "@/components/base/ScrollTopButton";
import TiltCard from "@/components/base/TiltCard";
import { educationCategories, featureModules, housingEstimate, moduleChips } from "@/mocks/features";
import PanelMock from "@/pages/features/components/PanelMock";

const secondaryModules = [
  {
    icon: "ri-sparkling-line",
    title: "Assistant IA FinBuilder",
    text: "Un chat qui connaît votre situation : revenus, dépenses, objectifs. Réponses avec analyse, conseil et plan d'action.",
  },
  {
    icon: "ri-home-4-line",
    title: "Conseiller logement",
    text: "Salaire, ville, taille du foyer, loyer envisagé : le vrai coût mensuel estimé, charges comprises.",
  },
  {
    icon: "ri-notification-3-line",
    title: "Notifications utiles",
    text: "Budget dépassé, objectif en avance, facture qui arrive : vous êtes alerté au bon moment, pas en continu.",
  },
  {
    icon: "ri-file-chart-line",
    title: "Rapports mensuels",
    text: "Rapport mensuel et annuel prêts à imprimer en PDF, export Excel / CSV pour vos archives.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen w-full bg-background-50">
      <Navbar />
      <main>
        <section className="surface-halo relative w-full overflow-hidden border-b border-background-200 bg-background-100 pb-14 pt-24 md:pb-20 md:pt-32">
          <AmbientGlow />
          <div className="shell relative">
            <div className="max-w-3xl">
              <Reveal delay={0}>
                <span className="eyebrow bg-background-50">Fonctionnalités</span>
              </Reveal>
              <Reveal delay={90}>
                <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight text-foreground-950 md:text-5xl">
                  Un système complet pour comprendre, décider et construire
                </h1>
              </Reveal>
              <Reveal delay={180}>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground-600 md:text-base">
                  FinBuilder AI relie vos revenus, vos dépenses, votre budget et vos projets dans un
                  même moteur d'analyse. Chaque module alimente les recommandations de l'assistant IA.
                </p>
              </Reveal>
              <Reveal delay={260}>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/inscription"
                    className="group inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 active:scale-[0.98]"
                  >
                    Commencer gratuitement
                    <i className="ri-arrow-right-line text-base transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-5 py-3 text-sm font-semibold text-foreground-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50 active:scale-[0.98]"
                  >
                    Retour à l'accueil
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="w-full border-b border-background-200 bg-background-50 py-6">
          <div className="shell">
            <div className="flex flex-wrap gap-2">
              {moduleChips.map((chip, index) => (
                <Reveal key={chip} delay={index * 60} distance={14} duration={520}>
                  <span className="block rounded-full border border-background-200 bg-background-50 px-3 py-1.5 text-xs font-medium text-foreground-600 transition-all duration-200 hover:border-primary-300 hover:text-primary-700">
                    {chip}
                  </span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full bg-background-50 py-12 md:py-16">
          <div className="shell space-y-14 md:space-y-20">
            {featureModules.map((module, index) => {
              const flipped = index % 2 === 1;
              return (
                <div
                  key={module.id}
                  className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14"
                >
                  <Reveal
                    direction={flipped ? "left" : "right"}
                    distance={30}
                    className={`lg:col-span-6 ${flipped ? "lg:order-2" : ""}`}
                  >
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-primary-700">
                        <i className={`${module.icon} text-sm`} />
                        {module.kicker}
                      </span>
                      <h2 className="mt-4 text-balance text-xl font-semibold leading-snug text-foreground-950 md:text-3xl">
                        {module.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-foreground-600">{module.description}</p>
                      <ul className="mt-5 space-y-2.5">
                        {module.bullets.map((bullet, bulletIndex) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-2.5 text-sm text-foreground-700"
                            style={{
                              animation: `fade-slide-soft 640ms cubic-bezier(0.22, 1, 0.36, 1) ${220 + bulletIndex * 90}ms both`,
                            }}
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                              <i className="ri-check-line text-xs" />
                            </span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                  <Reveal
                    direction={flipped ? "right" : "left"}
                    distance={30}
                    delay={140}
                    className={`lg:col-span-6 ${flipped ? "lg:order-1" : ""}`}
                  >
                    <TiltCard max={5}>
                      <PanelMock variant={module.visual} />
                    </TiltCard>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </section>

        <section className="w-full bg-background-100 py-14 md:py-20">
          <div className="shell">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
              <Reveal direction="right" className="lg:col-span-5">
                <div>
                  <span className="eyebrow bg-background-50">Conseiller logement</span>
                  <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-3xl">
                    Le loyer n'est pas la seule charge
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-600">
                    Eau, électricité, internet, transport : ces postes représentent souvent 15 % du
                    budget d'un foyer. Le simulateur les estime avant que vous ne signiez.
                  </p>
                  <div className="mt-5 rounded-lg border border-background-200 bg-background-50 p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-foreground-400">
                      Exemple · Abidjan · 4 personnes
                    </p>
                    <div className="mt-3 flex items-end justify-between">
                      <p className="text-sm text-foreground-600">Coût logement total</p>
                      <p className="text-xl font-semibold text-foreground-950" style={{ fontFamily: "var(--font-heading)" }}>
                        <AnimatedStat value="198 500" />{" "}
                        <span className="text-xs font-medium text-foreground-500">FCFA</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal direction="left" delay={120} className="lg:col-span-7">
                <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
                  <div className="border-b border-background-200 bg-background-100/60 px-4 py-3">
                    <p className="text-sm font-semibold text-foreground-900">Estimation des charges</p>
                  </div>
                  <ul>
                    {housingEstimate.map((row, index) => (
                      <li
                        key={row.label}
                        className={`flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-200 hover:bg-background-100/50 ${
                          index > 0 ? "border-t border-background-200" : ""
                        }`}
                        style={{
                          animation: `fade-slide-soft 620ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 100}ms both`,
                        }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground-900">{row.label}</p>
                          <p className="text-[11px] text-foreground-500">{row.note}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-primary-700">{row.amount}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="w-full bg-background-50 py-14 md:py-20">
          <div className="shell">
            <Reveal>
              <div className="max-w-xl">
                <span className="eyebrow">Éducation financière</span>
                <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-3xl">
                  Apprendre ce que l'école n'enseigne pas
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground-600">
                  Des fiches courtes, concrètes, avec des exemples en FCFA. Cinq catégories pour
                  progresser à votre rythme.
                </p>
              </div>
            </Reveal>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {educationCategories.map((category, index) => (
                <Reveal key={category.name} delay={index * 80} distance={20}>
                  <div className="group h-full rounded-lg border border-background-200 bg-background-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-50 text-accent-700 transition-transform duration-300 group-hover:scale-110">
                      <i className={`${category.icon} text-lg`} />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-foreground-950">{category.name}</p>
                    <p className="mt-1 text-[11px] text-foreground-500">{category.lessons} fiches</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {secondaryModules.map((module, index) => (
                <Reveal key={module.title} delay={index * 90} distance={20}>
                  <div className="group h-full rounded-lg border border-background-200 bg-background-100/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-background-50 md:p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-background-50 text-primary-700 transition-transform duration-300 group-hover:rotate-6">
                      <i className={`${module.icon} text-lg`} />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-foreground-950">{module.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-foreground-600">{module.text}</p>
                  </div>
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
                    Prêt à voir vos chiffres autrement ?
                  </h2>
                  <p className="mt-2 text-sm text-background-50/70">
                    Tous les modules sont accessibles dès l'inscription, sans abonnement.
                  </p>
                </div>
                <Link
                  to="/mode-demploi"
                  className="group inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-500 px-6 py-3.5 text-sm font-semibold text-foreground-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-400 active:scale-[0.98]"
                >
                  Voir le mode d'emploi
                  <i className="ri-arrow-right-line text-base transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollTopButton />
    </div>
  );
}