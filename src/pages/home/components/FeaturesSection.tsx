import { Link } from "react-router-dom";
import { featureCards } from "@/mocks/landing";
import Reveal from "@/components/base/Reveal";
import FeatureVisual from "@/pages/home/components/FeatureVisual";

export default function FeaturesSection() {
  return (
    <section className="w-full bg-background-100 py-16 md:py-24">
      <div className="shell">
        <Reveal direction="up" distance={24} className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <span className="eyebrow bg-background-50">Fonctionnalités</span>
            <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-4xl">
              Tout ce qu'il faut pour piloter votre argent
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground-600">
              Un seul espace pour vos revenus, votre budget, vos objectifs et vos décisions
              importantes.
            </p>
          </div>
          <Link
            to="/fonctionnalites"
            className="group inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800"
          >
            Voir toutes les fonctionnalités
            <i className="ri-arrow-right-line text-base transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((feature, index) => (
            <Reveal
              key={feature.title}
              delay={index * 90}
              distance={28}
              blur
              threshold={0.12}
              className="h-full"
            >
              <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-background-200 bg-background-50 p-5 pb-16 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 md:p-6 md:pb-20">
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary-500 group-hover:text-background-50">
                    <i className={`${feature.icon} text-xl transition-transform duration-500 group-hover:rotate-6`} />
                  </span>
                  <span className="rounded-full bg-secondary-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary-800">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground-950">{feature.title}</h3>
                <p className="mt-2 max-w-[92%] text-sm leading-relaxed text-foreground-600">
                  {feature.description}
                </p>
                <FeatureVisual index={index} />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}