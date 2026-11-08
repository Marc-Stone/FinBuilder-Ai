import { useState } from "react";
import { faqItems } from "@/mocks/landing";
import Reveal from "@/components/base/Reveal";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full bg-background-100 py-16 md:py-24">
      <div className="shell">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
          <Reveal direction="right" distance={26} className="lg:col-span-4">
            <span className="eyebrow bg-background-50">Questions fréquentes</span>
            <h2 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-3xl">
              Ce que les utilisateurs demandent avant de commencer
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground-600">
              Une autre question ? Écrivez-nous, nous répondons sous 24 heures.
            </p>
          </Reveal>

          <Reveal direction="up" distance={28} delay={100} className="lg:col-span-8">
            <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={item.question}
                    className={index > 0 ? "border-t border-background-200" : ""}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left transition-colors duration-200 hover:bg-background-100/60 md:px-5"
                      aria-expanded={isOpen}
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
                    <div
                      className="overflow-hidden transition-all duration-300 ease-out"
                      style={{ maxHeight: isOpen ? "460px" : "0px", opacity: isOpen ? 1 : 0 }}
                    >
                      <p className="max-w-2xl px-4 pb-4 text-sm leading-relaxed text-foreground-600 md:px-5">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}