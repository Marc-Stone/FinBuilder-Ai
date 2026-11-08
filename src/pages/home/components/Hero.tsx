import { Link } from "react-router-dom";
import { heroStats } from "@/mocks/landing";
import AnimatedStat from "@/components/base/AnimatedStat";
import Reveal from "@/components/base/Reveal";
import HeroBackdrop from "@/pages/home/components/HeroBackdrop";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://public.readdy.ai/ai/img_res/edited_9f4f43250e0ac8e0c0c8e322cb344b41_f0abb908.jpg"
          alt="Composition abstraite bleu profond et rouge évoquant la croissance financière"
          title="FinBuilder AI — coach financier intelligent"
          className="h-full w-full object-cover object-top anim-hero-zoom"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground-950/85 via-foreground-950/70 to-foreground-950/90" />
        <HeroBackdrop />
      </div>

      <div className="relative z-10 w-full px-4 pb-16 pt-28 md:px-6 md:pb-24 md:pt-40">
        <div className="mx-auto w-full max-w-4xl text-center">
          <Reveal direction="up" distance={18} duration={600}>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-background-50/20 bg-background-50/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-background-50/90 backdrop-blur-sm">
                <i className="ri-sparkling-line text-sm text-accent-400" />
                Coach financier propulsé par l'IA
              </span>
            </div>
          </Reveal>

          <Reveal delay={90} distance={30} blur>
            <h1 className="mt-6 text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-background-50 sm:text-4xl md:text-6xl">
              Construisez votre avenir financier, décision après décision.
            </h1>
          </Reveal>

          <Reveal delay={180} distance={24}>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-background-50/80 md:text-base">
              FinBuilder AI analyse vos revenus, vos dépenses et vos objectifs pour vous donner un plan
              clair, chiffré et réaliste. En FCFA, sans jargon, sans tableur.
            </p>
          </Reveal>

          <Reveal delay={260} distance={22}>
            <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/inscription"
                className="group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-600 active:translate-y-0 active:scale-[0.98] sm:w-auto"
              >
                Commencer gratuitement
                <i className="ri-arrow-right-line text-base transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/fonctionnalites"
                className="group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-50/25 bg-background-50/10 px-6 py-3.5 text-sm font-semibold text-background-50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-background-50/40 hover:bg-background-50/20 active:translate-y-0 active:scale-[0.98] sm:w-auto"
              >
                <i className="ri-play-circle-line text-base transition-transform duration-300 group-hover:scale-110" />
                Voir la démo
              </Link>
            </div>
          </Reveal>

          <Reveal delay={340} duration={600}>
            <p className="mt-5 text-xs text-background-50/55">
              Tous les modules inclus · Aucune carte bancaire requise · Connexion sécurisée (HTTPS) · Données isolées par compte
            </p>
          </Reveal>
        </div>

        <Reveal delay={120} distance={34} className="mx-auto mt-14 w-full max-w-5xl">
          <div className="grid w-full grid-cols-1 gap-px overflow-hidden rounded-lg border border-background-50/15 bg-background-50/10 sm:grid-cols-3">
            {heroStats.map((stat, index) => (
              <div
                key={stat.label}
                className="group bg-foreground-950/40 px-4 py-5 text-center backdrop-blur-sm transition-colors duration-300 hover:bg-foreground-950/55 md:px-6"
                style={{ transitionDelay: `${index * 40}ms` }}
              >
                <p
                  className="text-xl font-semibold text-accent-400 transition-transform duration-300 group-hover:-translate-y-0.5 md:text-2xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <AnimatedStat value={stat.value} delay={index * 120} />
                </p>
                <p className="mt-1 text-[11px] leading-snug text-background-50/65 md:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}