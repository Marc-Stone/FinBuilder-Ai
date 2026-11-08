import { Link } from "react-router-dom";
import Reveal from "@/components/base/Reveal";

export default function CtaSection() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://public.readdy.ai/ai/img_res/edited_0d338eacc74c976db01057f5f2fcb8d1_9587e811.jpg"
          alt="Dégradé bleu profond et particules rouges évoquant la prospérité financière"
          title="FinBuilder AI — commencez votre plan financier"
          className="h-full w-full object-cover object-top anim-hero-zoom"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground-950/90 via-foreground-950/75 to-primary-950/70" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-20 bottom-[-30%] h-[320px] w-[320px] rounded-full bg-primary-500/25 blur-[90px] anim-aurora" />
          <div className="absolute right-[6%] top-[-18%] h-[280px] w-[280px] rounded-full bg-accent-500/20 blur-[90px] anim-aurora-reverse" />
        </div>
      </div>

      <div className="shell relative z-10 py-16 md:py-24">
        <Reveal direction="up" distance={26} className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-background-50/20 bg-background-50/10 px-3 py-1 text-xs font-medium text-background-50/85 backdrop-blur-sm">
            <i className="ri-seedling-line text-sm text-accent-400" />
            Build your financial future
          </span>
          <h2 className="mt-5 text-balance text-2xl font-semibold leading-tight text-background-50 md:text-4xl">
            Votre premier budget clair commence aujourd'hui
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-background-50/75">
            Créez votre compte, saisissez vos revenus du mois et découvrez votre capacité d'épargne
            réelle en moins de trois minutes.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/inscription"
              className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-600 active:translate-y-0 active:scale-[0.98]"
            >
              Créer mon compte gratuitement
              <i className="ri-arrow-right-line text-base transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/fonctionnalites"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-50/25 bg-background-50/10 px-6 py-3.5 text-sm font-semibold text-background-50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-background-50/40 hover:bg-background-50/20 active:translate-y-0 active:scale-[0.98]"
            >
              Découvrir les fonctionnalités
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-background-50/60">
            <span className="inline-flex items-center gap-1.5">
              <i className="ri-shield-check-line text-sm text-primary-400" />
              Données privées par utilisateur
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="ri-bank-card-line text-sm text-primary-400" />
              Sans carte bancaire
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="ri-time-line text-sm text-primary-400" />
              Prêt en 3 minutes
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}