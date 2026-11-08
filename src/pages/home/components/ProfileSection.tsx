import { Link } from "react-router-dom";
import { financialProfileTypes, profilePreview } from "@/mocks/landing";
import Reveal from "@/components/base/Reveal";

const highlights = [
  {
    icon: "ri-user-star-line",
    title: "Six situations couvertes",
    text: "Étudiant, salarié, entrepreneur, freelance, famille, retraité : chaque profil a ses priorités, ses revenus types et ses objectifs réalistes.",
  },
  {
    icon: "ri-dashboard-3-line",
    title: "Un espace qui s'adapte",
    text: "Les libellés de vos indicateurs, votre parcours de démarrage et les conseils du coach suivent la situation que vous avez choisie.",
  },
  {
    icon: "ri-add-circle-line",
    title: "Des objectifs prêts à créer",
    text: "Trois cibles chiffrées sont proposées pour votre profil, créées en un clic puis ajustables à votre réalité.",
  },
];

export default function ProfileSection() {
  return (
    <section className="w-full bg-background-50 py-16 md:py-24">
      <div className="shell">
        <div className="overflow-hidden rounded-lg border border-background-200 bg-background-100">
          <div className="grid grid-cols-1 gap-8 p-5 md:p-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:p-10">
            <Reveal direction="right" distance={26} className="lg:col-span-5">
              <div>
                <span className="eyebrow bg-background-50">
                  <i className="ri-user-star-line text-xs" />
                  Profil financier
                </span>
                <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-4xl">
                  Un plan calibré sur votre situation, pas sur la moyenne
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground-600">
                  À la première connexion, vous indiquez votre situation, votre revenu, la
                  composition de votre foyer et vos priorités. Tout le reste de l'application
                  s'aligne sur ces réponses.
                </p>

                <ul className="mt-6 space-y-4">
                  {highlights.map((item, index) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                          index === 1
                            ? "bg-accent-100 text-accent-800"
                            : "bg-primary-100 text-primary-700"
                        }`}
                      >
                        <i className={`${item.icon} text-sm`} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground-950">{item.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-foreground-600">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/inscription"
                  className="group mt-6 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 active:translate-y-0 active:scale-[0.98]"
                >
                  Trouver mon profil en 2 minutes
                  <i className="ri-arrow-right-line text-base transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>

            <Reveal direction="left" distance={26} delay={120} className="lg:col-span-7">
              <div className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground-950">Quel est votre profil ?</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground-600">
                    Étape 1 sur 2
                  </span>
                </div>

                <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {financialProfileTypes.map((type, index) => {
                    const active = index === 1;
                    return (
                      <div
                        key={type.label}
                        className={`flex items-start gap-2.5 rounded-md border p-2.5 transition-colors duration-300 ${
                          active
                            ? "border-primary-300 bg-primary-50"
                            : "border-background-200 bg-background-50 hover:border-primary-200"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                            active ? "bg-primary-500 text-background-50" : "bg-background-100 text-primary-700"
                          }`}
                        >
                          <i className={`${type.icon} text-sm`} />
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-xs font-semibold text-foreground-950">
                            {type.label}
                            {active && <i className="ri-checkbox-circle-fill text-[11px] text-primary-600" />}
                          </p>
                          <p className="mt-0.5 text-[10px] leading-snug text-foreground-500">
                            {type.tagline}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-background-200 bg-background-100/60 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-foreground-400">
                      Salaire net
                    </p>
                    <p
                      className="mt-1 text-sm font-semibold text-foreground-950"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {profilePreview.income}{" "}
                      <span className="text-[10px] font-medium text-foreground-500">FCFA</span>
                    </p>
                  </div>
                  <div className="rounded-md border border-background-200 bg-background-100/60 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-foreground-400">Foyer</p>
                    <p
                      className="mt-1 text-sm font-semibold text-foreground-950"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {profilePreview.family}
                    </p>
                  </div>
                  <div className="rounded-md border border-background-200 bg-background-100/60 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-foreground-400">
                      Objectifs
                    </p>
                    <p
                      className="mt-1 text-sm font-semibold text-foreground-950"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      3 sélectionnés
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {profilePreview.goals.map((goal) => (
                    <span
                      key={goal}
                      className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-[10px] font-medium text-primary-800"
                    >
                      <i className="ri-check-line text-[10px]" />
                      {goal}
                    </span>
                  ))}
                </div>

                <div className="mt-3.5 rounded-md border border-background-200 bg-background-100/60 p-3">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground-900">
                    <i className="ri-sparkling-line text-xs text-accent-600" />
                    Conseil du profil salarié
                  </p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-foreground-600">
                    {profilePreview.advice}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}