import { Link } from "react-router-dom";
import AmbientGlow from "@/components/base/AmbientGlow";
import AnimatedStat from "@/components/base/AnimatedStat";
import Reveal from "@/components/base/Reveal";
import { aboutStats } from "@/mocks/about";
import { useRegisteredUsersStat } from "@/hooks/usePublicStats";

export default function AboutHero() {
  // « Utilisateurs inscrits » : nombre réel, mis à jour à chaque inscription ou suppression de compte.
  const usersStat = useRegisteredUsersStat();
  const stats = aboutStats.map((stat, index) =>
    index === 1
      ? {
          value: usersStat.value,
          label: usersStat.label.charAt(0).toUpperCase() + usersStat.label.slice(1),
        }
      : stat,
  );

  return (
    <section className="surface-halo relative w-full overflow-hidden border-b border-background-200 bg-background-100 pb-12 pt-24 md:pb-16 md:pt-32">
      <AmbientGlow />
      <div className="shell relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal delay={0}>
            <span className="eyebrow bg-background-50">À propos</span>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight text-foreground-950 md:text-5xl">
              Rendre les finances personnelles
              <span className="text-primary-600"> lisibles </span>
              pour tout le monde
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-4 text-sm leading-relaxed text-foreground-600 md:text-base">
              FinBuilder AI est né d'une soirée de calculs refaits trois fois pour un seul projet
              immobilier. Nous avons voulu un outil qui répond simplement : où va mon argent, et que
              puis-je financer sans me mettre en danger.
            </p>
          </Reveal>
        </div>

        <Reveal delay={240}>
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/inscription"
              className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 active:scale-[0.98] sm:w-auto"
            >
              Créer mon compte
              <i className="ri-arrow-right-line text-base transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/mode-demploi"
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-6 py-3.5 text-sm font-semibold text-foreground-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50 active:scale-[0.98] sm:w-auto"
            >
              Voir le mode d'emploi
            </Link>
          </div>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={index} delay={index * 90} distance={18}>
              <div className="rounded-md border border-background-200 bg-background-50 px-4 py-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary-200">
                <p className="text-lg font-semibold text-foreground-950">
                  {index === 0 ? stat.value : <AnimatedStat value={stat.value} />}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-foreground-500">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}