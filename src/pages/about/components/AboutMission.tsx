import Reveal from "@/components/base/Reveal";
import { aboutValues } from "@/mocks/about";

export default function AboutMission() {
  return (
    <section className="w-full bg-background-50 py-14 md:py-20">
      <div className="shell">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal direction="right" distance={28} className="lg:col-span-6">
            <div className="group relative h-[300px] w-full overflow-hidden rounded-lg border border-background-200 bg-background-100 sm:h-[380px] lg:h-[440px]">
              <img
                src="https://readdy.ai/api/search-image?query=Minimal%20editorial%20still%20life%20on%20a%20clean%20white%20desk%20with%20a%20dark%20navy%20notebook%2C%20a%20red%20pen%20and%20a%20simple%20calculator%2C%20soft%20natural%20window%20light%2C%20gentle%20geometric%20shadows%2C%20calm%20organized%20mood%2C%20deep%20blue%20and%20crimson%20accents%2C%20high%20detail%2C%20square%20composition&width=1000&height=1000&seq=about-mission-01&orientation=squarish"
                alt="Carnet de budget, stylo rouge et calculatrice sur un bureau clair"
                title="FinBuilder AI — un budget clair, posé sur papier"
                className="h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-6">
            <Reveal delay={100}>
              <span className="eyebrow">Notre mission</span>
            </Reveal>
            <Reveal delay={170}>
              <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-3xl">
                Un outil qui répond à une question, pas qui en pose dix
              </h2>
            </Reveal>
            <Reveal delay={230}>
              <p className="mt-4 text-sm leading-relaxed text-foreground-700">
                La plupart des applications financières demandent beaucoup avant de rendre quoi que ce
                soit : connecter un compte, choisir un plan, comprendre un vocabulaire. Nous avons pris
                le chemin inverse.
              </p>
            </Reveal>
            <Reveal delay={290}>
              <p className="mt-3 text-sm leading-relaxed text-foreground-700">
                Vous saisissez un revenu et une poignée de dépenses. L'application calcule votre
                capacité d'épargne réelle, répartit un budget par poste et chiffre vos projets. Rien
                n'est verrouillé, rien n'est deviné : tout part de vos chiffres.
              </p>
            </Reveal>

            <Reveal delay={350}>
              <div className="mt-6 flex items-start gap-3 rounded-md border border-accent-200 bg-accent-50 px-4 py-3.5">
                <i className="ri-double-quotes-l mt-0.5 text-lg text-accent-600" />
                <p className="text-sm leading-relaxed text-accent-900">
                  « Si un écran ne vous aide pas à décider quoi que ce soit ce mois-ci, il n'a pas sa
                  place dans le produit. »
                  <span className="mt-1 block text-xs font-semibold text-accent-800">
                    Goude Marc, fondateur
                  </span>
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 md:mt-20">
          <Reveal>
            <div className="max-w-xl">
              <span className="eyebrow bg-background-100">Ce qui nous guide</span>
              <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-3xl">
                Quatre principes, appliqués à chaque écran
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground-600">
                Ils ne sont pas affichés dans un couloir : ils décident de ce qu'on publie et de ce
                qu'on refuse de publier.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aboutValues.map((value, index) => (
              <Reveal key={value.title} delay={index * 90} distance={22}>
                <div className="group h-full rounded-lg border border-background-200 bg-background-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 md:p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition-transform duration-300 group-hover:scale-110">
                    <i className={`${value.icon} text-lg`} />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-foreground-950">{value.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground-600">{value.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}