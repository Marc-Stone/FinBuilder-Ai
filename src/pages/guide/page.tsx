import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AmbientGlow from "@/components/base/AmbientGlow";
import AnimatedStat from "@/components/base/AnimatedStat";
import Reveal from "@/components/base/Reveal";
import ScrollTopButton from "@/components/base/ScrollTopButton";
import { guideFaq, guideFlow, guideModules, guideStartSteps } from "@/mocks/guide";
import { exportGuidePdf } from "@/lib/guidePdf";

export default function GuidePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  function handleDownloadGuide() {
    if (downloading) return;
    setDownloading(true);
    setPdfError("");
    try {
      exportGuidePdf();
    } catch (error) {
      setPdfError(
        "Le PDF n'a pas pu être généré. Réessayez depuis un autre navigateur ou désactivez votre bloqueur de téléchargements.",
      );
      console.error(error);
    } finally {
      window.setTimeout(() => setDownloading(false), 900);
    }
  }

  return (
    <div className="min-h-screen w-full bg-background-50">
      <Navbar />
      <main>
        <section className="surface-halo relative w-full overflow-hidden border-b border-background-200 bg-background-100 pb-12 pt-24 md:pb-16 md:pt-32">
          <AmbientGlow />
          <div className="shell relative">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal delay={0}>
                <span className="eyebrow bg-background-50">Mode d'emploi</span>
              </Reveal>
              <Reveal delay={90}>
                <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight text-foreground-950 md:text-5xl">
                  Comment fonctionne chaque onglet
                </h1>
              </Reveal>
              <Reveal delay={180}>
                <p className="mt-4 text-sm leading-relaxed text-foreground-600 md:text-base">
                  Quatorze onglets, un même objectif : savoir où va votre argent et ce que vous
                  pouvez financer. Voici, pour chacun, à quoi il sert, ce qu'il faut préparer et les
                  gestes à faire dans l'ordre — du profil financier jusqu'aux rapports exportables.
                </p>
              </Reveal>
            </div>

            <Reveal delay={240}>
              <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href="#onglets"
                  className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 active:scale-[0.98] sm:w-auto"
                >
                  Commencer par le premier onglet
                  <i className="ri-arrow-down-line text-base transition-transform duration-200 group-hover:translate-y-0.5" />
                </a>
                <Link
                  to="/inscription"
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-6 py-3.5 text-sm font-semibold text-foreground-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50 active:scale-[0.98] sm:w-auto"
                >
                  Créer mon compte
                </Link>
                <button
                  type="button"
                  onClick={handleDownloadGuide}
                  disabled={downloading}
                  className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-6 py-3.5 text-sm font-semibold text-foreground-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
                >
                  <i
                    className={
                      downloading
                        ? "ri-loader-4-line animate-spin text-base"
                        : "ri-download-2-line text-base transition-transform duration-200 group-hover:translate-y-0.5"
                    }
                  />
                  {downloading ? "Préparation du PDF…" : "Télécharger en PDF"}
                </button>
              </div>
              {pdfError && (
                <p
                  role="alert"
                  className="mx-auto mt-3 max-w-xl rounded-md border border-accent-300 bg-accent-50 px-3 py-2 text-center text-[11px] leading-relaxed text-accent-900"
                >
                  {pdfError}
                </p>
              )}
            </Reveal>

            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
              <Reveal delay={0} distance={16}>
                <div className="rounded-md border border-background-200 bg-background-50 px-4 py-3 text-center transition-colors duration-200 hover:border-primary-200">
                  <p className="text-lg font-semibold text-foreground-950">
                    <AnimatedStat value="14" />
                  </p>
                  <p className="mt-0.5 text-[11px] text-foreground-500">onglets expliqués</p>
                </div>
              </Reveal>
              <Reveal delay={80} distance={16}>
                <div className="rounded-md border border-background-200 bg-background-50 px-4 py-3 text-center transition-colors duration-200 hover:border-primary-200">
                  <p className="text-lg font-semibold text-foreground-950">
                    <AnimatedStat value="4" />
                  </p>
                  <p className="mt-0.5 text-[11px] text-foreground-500">étapes pour démarrer</p>
                </div>
              </Reveal>
              <Reveal delay={160} distance={16}>
                <div className="rounded-md border border-background-200 bg-background-50 px-4 py-3 text-center transition-colors duration-200 hover:border-primary-200">
                  <p className="text-lg font-semibold text-foreground-950">
                    <AnimatedStat value="2 min" />
                  </p>
                  <p className="mt-0.5 text-[11px] text-foreground-500">de mise en route</p>
                </div>
              </Reveal>
              <Reveal delay={240} distance={16}>
                <div className="rounded-md border border-background-200 bg-background-50 px-4 py-3 text-center transition-colors duration-200 hover:border-primary-200">
                  <p className="text-lg font-semibold text-foreground-950">
                    <AnimatedStat value="0" />
                  </p>
                  <p className="mt-0.5 text-[11px] text-foreground-500">module verrouillé</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="w-full bg-background-50 py-14 md:py-20">
          <div className="shell">
            <Reveal>
              <div className="max-w-xl">
                <span className="eyebrow">Pour commencer</span>
                <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-3xl">
                  Quatre gestes, et l'application devient utile
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground-600">
                  Tant que ces quatre étapes ne sont pas faites, la plupart des écrans restent vides.
                  C'est normal : tout est calculé à partir de vos chiffres, jamais inventé.
                  Le profil financier, demandé juste après l'inscription, sert de point de repère à
                  tout le reste.
                </p>
              </div>
            </Reveal>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {guideStartSteps.map((item, index) => (
                <Reveal key={item.step} delay={index * 90} distance={22}>
                  <div className="group flex h-full flex-col rounded-lg border border-background-200 bg-background-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 md:p-5">
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition-transform duration-300 group-hover:scale-110">
                        <i className={`${item.icon} text-lg`} />
                      </span>
                      <span
                        className="text-xl font-semibold text-background-300 transition-colors duration-300 group-hover:text-primary-200"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {item.step}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-foreground-950">{item.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-foreground-600">{item.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="onglets" className="w-full scroll-mt-20 bg-background-100 py-14 md:py-20">
          <div className="shell">
            <Reveal>
              <div className="max-w-xl">
                <span className="eyebrow bg-background-50">Onglet par onglet</span>
                <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-3xl">
                  Les quatorze espaces, dans l'ordre d'usage
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground-600">
                  L'ordre ci-dessous n'est pas décoratif : chaque onglet s'appuie sur celui qui le
                  précède. Vous pouvez toujours revenir en arrière, rien n'est définitif.
                </p>
              </div>
            </Reveal>

            <div className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
              <aside className="lg:col-span-3">
                <div className="lg:sticky lg:top-24">
                  <Reveal direction="right" distance={20}>
                    <div className="rounded-lg border border-background-200 bg-background-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-400">
                        Sommaire
                      </p>
                      <nav className="mt-3 flex flex-col gap-0.5">
                        {guideModules.map((module, index) => (
                          <a
                            key={module.id}
                            href={`#${module.id}`}
                            className="group flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-xs text-foreground-600 transition-all duration-200 hover:translate-x-0.5 hover:bg-primary-50 hover:text-primary-700"
                            style={{
                              animation: `fade-slide-soft 520ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 45}ms both`,
                            }}
                          >
                            <span className="w-4 shrink-0 text-[10px] font-semibold text-foreground-300 transition-colors group-hover:text-primary-400">
                              {module.step}
                            </span>
                            <span className="truncate">{module.title}</span>
                          </a>
                        ))}
                      </nav>
                    </div>
                  </Reveal>

                  <Link
                    to="/connexion"
                    className="group mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2.5 text-xs font-semibold text-foreground-900 transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 active:scale-[0.98]"
                  >
                    Ouvrir mon espace
                    <i className="ri-arrow-right-line text-sm transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  <button
                    type="button"
                    onClick={handleDownloadGuide}
                    disabled={downloading}
                    className="group mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-50 px-4 py-2.5 text-xs font-semibold text-primary-700 transition-all duration-200 hover:bg-primary-100 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                  >
                    <i className={downloading ? "ri-loader-4-line animate-spin text-sm" : "ri-file-pdf-2-line text-sm"} />
                    {downloading ? "Préparation…" : "Guide en PDF"}
                  </button>
                </div>
              </aside>

              <div className="space-y-4 lg:col-span-9">
                {guideModules.map((module, index) => (
                  <Reveal
                    key={module.id}
                    delay={index % 3 === 0 ? 0 : 60}
                    distance={22}
                    threshold={0.08}
                  >
                    <article
                      id={module.id}
                      className="scroll-mt-24 rounded-lg border border-background-200 bg-background-50 p-5 transition-colors duration-300 hover:border-background-300 md:p-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                          <i className={`${module.icon} text-xl`} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-500">
                              Onglet {module.step}
                            </span>
                            <h3 className="text-base font-semibold text-foreground-950 md:text-lg">
                              {module.title}
                            </h3>
                          </div>
                          <p className="mt-1 text-xs font-medium text-primary-700">{module.tagline}</p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-foreground-700">
                        {module.purpose}
                      </p>

                      <div className="mt-4 flex items-start gap-2 rounded-md bg-secondary-100/70 px-3 py-2.5">
                        <i className="ri-information-line mt-0.5 text-sm text-secondary-800" />
                        <p className="text-xs leading-relaxed text-secondary-900">
                          <span className="font-semibold">À préparer : </span>
                          {module.needs}
                        </p>
                      </div>

                      <div className="mt-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-400">
                          Comment faire
                        </p>
                        <ol className="mt-3 space-y-2.5">
                          {module.steps.map((step, stepIndex) => (
                            <li
                              key={step}
                              className="flex items-start gap-3"
                              style={{
                                animation: `fade-slide-soft 600ms cubic-bezier(0.22, 1, 0.36, 1) ${200 + stepIndex * 80}ms both`,
                              }}
                            >
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
                                {stepIndex + 1}
                              </span>
                              <p className="text-sm leading-relaxed text-foreground-700">{step}</p>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="mt-5 flex items-start gap-2.5 rounded-md border border-accent-200 bg-accent-50 px-3 py-2.5">
                        <i className="ri-lightbulb-line mt-0.5 text-sm text-accent-700" />
                        <p className="text-xs leading-relaxed text-accent-900">
                          <span className="font-semibold">Astuce : </span>
                          {module.tip}
                        </p>
                      </div>

                      <div className="mt-5 border-t border-background-200 pt-4">
                        <Link
                          to={module.link}
                          className="group inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-xs font-semibold text-background-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 active:scale-[0.98]"
                        >
                          {module.linkLabel}
                          <i className="ri-arrow-right-line text-sm transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-background-50 py-14 md:py-20">
          <div className="shell">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
              <Reveal direction="right" className="lg:col-span-4">
                <div>
                  <span className="eyebrow">Enchaînement</span>
                  <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-3xl">
                    Un onglet ne travaille jamais seul
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-600">
                    Voici la chaîne qui se déclenche à chaque saisie. Comprendre cet ordre évite de
                    chercher longtemps pourquoi un chiffre ne bouge pas.
                  </p>
                </div>
              </Reveal>

              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {guideFlow.map((item, index) => (
                    <Reveal key={item.title} delay={index * 90} distance={20}>
                      <div className="group flex h-full items-start gap-3 rounded-lg border border-background-200 bg-background-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent-300">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-800 transition-transform duration-300 group-hover:scale-110">
                          <i className={`${item.icon} text-base`} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground-500">
                            Étape {index + 1}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-foreground-950">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-foreground-600">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-background-100 py-14 md:py-20">
          <div className="shell">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <span className="eyebrow bg-background-50">Questions fréquentes</span>
                <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-3xl">
                  Les questions que l'on nous pose le plus
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground-600">
                  Une autre question ? Écrivez-nous à mrwim74@gmail.com, nous répondons sous 24
                  heures.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-lg border border-background-200 bg-background-50">
                {guideFaq.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={item.question}
                      className={index > 0 ? "border-t border-background-200" : ""}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left transition-colors duration-200 hover:bg-background-100/60 md:px-5"
                      >
                        <span className="text-sm font-medium text-foreground-950">{item.question}</span>
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                            isOpen
                              ? "rotate-180 bg-primary-500 text-background-50"
                              : "bg-background-200 text-foreground-600"
                          }`}
                        >
                          <i className={isOpen ? "ri-subtract-line text-xs" : "ri-add-line text-xs"} />
                        </span>
                      </button>
                      {isOpen && (
                        <div className="animate-fade-in px-4 pb-4 md:px-5">
                          <p className="text-sm leading-relaxed text-foreground-600">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="w-full bg-primary-950 py-14 md:py-16">
          <div className="shell">
            <Reveal>
              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <h2 className="text-2xl font-semibold text-background-50 md:text-3xl">
                    Vous connaissez la carte, il reste à la suivre
                  </h2>
                  <p className="mt-2 text-sm text-background-50/70">
                    Créez votre compte, ajoutez un revenu, et laissez l'application calculer la suite.
                  </p>
                </div>
                <Link
                  to="/inscription"
                  className="group inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-500 px-6 py-3.5 text-sm font-semibold text-foreground-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-400 active:scale-[0.98]"
                >
                  Créer mon compte
                  <i className="ri-arrow-right-line text-base transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollTopButton threshold={700} />
    </div>
  );
}