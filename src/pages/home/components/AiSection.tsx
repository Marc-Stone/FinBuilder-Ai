import { useEffect, useState } from "react";
import Reveal from "@/components/base/Reveal";
import { useInView } from "@/hooks/useInView";

const questions = [
  {
    id: "loyer",
    label: "Puis-je louer à 150 000 FCFA ?",
    answer:
      "Avec 450 000 FCFA de revenus, 150 000 FCFA de loyer représente 33 % de votre revenu : c'est dans la zone recommandée. En ajoutant les charges (28 000 FCFA), votre reste à vivre est de 272 000 FCFA. Votre capacité d'épargne passe de 100 000 à 72 000 FCFA par mois, soit un objectif « apport » décalé de 4 mois. Piste : négocier 135 000 FCFA.",
  },
  {
    id: "million",
    label: "Comment économiser 1 million ?",
    answer:
      "Votre capacité d'épargne actuelle est de 100 000 FCFA par mois : 1 000 000 FCFA seraient atteints en 10 mois. En réduisant les loisirs de 15 000 et les abonnements de 8 000 FCFA, vous passez à 123 000 FCFA par mois, donc 8 mois. Je peux créer un objectif avec ce rythme.",
  },
  {
    id: "mariage",
    label: "Quel budget pour mon mariage ?",
    answer:
      "Pour un mariage de 120 invités dans votre ville, comptez 2 400 000 FCFA : réception 1 300 000, tenues 450 000, photo 300 000, imprévus 350 000. Avec 100 000 FCFA mis de côté chaque mois, l'échéance réaliste est dans 24 mois. Voulez-vous que je crée le projet avec cette répartition ?",
  },
  {
    id: "voiture",
    label: "Puis-je acheter une voiture ?",
    answer:
      "Une voiture à 4 500 000 FCFA représente 10 mois de vos revenus. En achat comptant, il vous faudrait 45 mois d'épargne. En crédit sur 36 mois, la mensualité serait d'environ 150 000 FCFA, ce qui ferait passer votre taux d'endettement à 33 % — limite haute. Alternative : viser 3 200 000 FCFA en occasion récente.",
  },
];

export default function AiSection() {
  const [active, setActive] = useState(questions[0]);
  const [typed, setTyped] = useState("");
  const [thinking, setThinking] = useState(true);
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  useEffect(() => {
    if (!inView) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setThinking(false);
      setTyped(active.answer);
      return undefined;
    }

    setTyped("");
    setThinking(true);

    let intervalId = 0;
    const startId = window.setTimeout(() => {
      setThinking(false);
      let cursor = 0;
      intervalId = window.setInterval(() => {
        cursor += 4;
        setTyped(active.answer.slice(0, cursor));
        if (cursor >= active.answer.length) window.clearInterval(intervalId);
      }, 18);
    }, 560);

    return () => {
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
    };
  }, [active, inView]);

  return (
    <section className="w-full bg-background-50 py-16 md:py-24">
      <div className="shell">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal direction="right" distance={28} className="lg:col-span-5">
            <span className="eyebrow bg-accent-50 text-accent-800 border-accent-200">
              <i className="ri-sparkling-line text-xs" />
              Assistant IA
            </span>
            <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-4xl">
              Une question concrète, une réponse chiffrée
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-foreground-600">
              L'assistant FinBuilder ne répond pas avec des généralités. Il lit vos revenus, vos
              dépenses et vos objectifs, puis calcule l'impact réel de chaque décision — avec un plan
              d'action à la fin.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Analyse de votre situation réelle, pas d'un profil type",
                "Recommandations classées par impact financier",
                "Plan d'action étape par étape, avec montants et délais",
              ].map((item, index) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-foreground-700"
                  style={{ transitionDelay: `${index * 90}ms` }}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <i className="ri-check-line text-xs" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal direction="up" distance={32} delay={120} className="lg:col-span-7">
            <div ref={ref} className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
              <div className="flex items-center gap-2 border-b border-background-200 bg-background-100/60 px-4 py-3">
                <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-primary-500 text-background-50">
                  <span className="fx-ring absolute inset-0 rounded-md border border-primary-400/70" />
                  <i className="ri-sparkling-line relative text-sm" />
                </span>
                <p className="text-sm font-semibold text-foreground-900">Assistant FinBuilder</p>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-800">
                  <span className="fx-node h-1.5 w-1.5 rounded-full bg-primary-500" />
                  En ligne
                </span>
              </div>

              <div className="max-h-[360px] min-h-[248px] space-y-4 overflow-y-auto px-4 py-5 md:px-5">
                <div key={active.id} className="animate-fade-up flex justify-end">
                  <p className="max-w-[85%] rounded-lg rounded-br-sm bg-primary-500 px-3.5 py-2.5 text-[13px] leading-relaxed text-background-50">
                    {active.label}
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-800">
                    <i className="ri-robot-2-line text-sm" />
                  </span>
                  <div className="max-w-[88%] rounded-lg rounded-bl-sm border border-background-200 bg-background-100/70 px-3.5 py-2.5">
                    {thinking ? (
                      <span className="flex h-5 items-center gap-1">
                        {[0, 1, 2].map((dot) => (
                          <span
                            key={dot}
                            className="thinking-dot h-1.5 w-1.5 rounded-full bg-foreground-500"
                            style={{ animationDelay: `${dot * 0.16}s` }}
                          />
                        ))}
                      </span>
                    ) : (
                      <p className="min-h-[52px] text-[13px] leading-relaxed text-foreground-800">
                        <span className={typed.length < active.answer.length ? "typing-caret" : ""}>
                          {typed}
                        </span>
                      </p>
                    )}
                    {!thinking && typed.length >= active.answer.length && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {["Analyse", "Recommandation", "Plan d'action"].map((chip, index) => (
                          <span
                            key={chip}
                            className="animate-fade-up rounded-full bg-background-50 px-2 py-0.5 text-[10px] font-medium text-foreground-600"
                            style={{ animationDelay: `${index * 80}ms` }}
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-background-200 bg-background-50 px-4 py-3 md:px-5">
                <p className="text-[11px] uppercase tracking-[0.12em] text-foreground-400">
                  Essayez une question
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {questions.map((question) => (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setActive(question)}
                      className={`cursor-pointer whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-all duration-200 hover:-translate-y-0.5 ${
                        active.id === question.id
                          ? "border-primary-500 bg-primary-50 text-primary-800"
                          : "border-background-300 bg-background-50 text-foreground-600 hover:border-primary-300 hover:text-primary-700"
                      }`}
                    >
                      {question.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-foreground-500">
              Informations générales, ne constitue pas un conseil en investissement.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}