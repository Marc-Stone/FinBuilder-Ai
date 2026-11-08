import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
  pending: string[];
  children?: ReactNode;
};

const otherPages = [
  { label: "Mentions légales", to: "/mentions-legales" },
  { label: "Politique de confidentialité", to: "/confidentialite" },
  { label: "Conditions générales d'utilisation", to: "/cgu" },
];

/* Met en évidence les champs restant à compléter, entre crochets. */
function withTokens(text: string) {
  return text.split(/(\[[^\]]+\])/g).map((part, index) => {
    if (!part.startsWith("[") || !part.endsWith("]")) return part;
    return (
      <span
        key={`${part}-${index}`}
        className="rounded bg-accent-100 px-1 font-medium text-accent-900"
      >
        {part}
      </span>
    );
  });
}

export default function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  sections,
  pending,
  children,
}: LegalPageProps) {
  return (
    <div className="min-h-screen w-full bg-background-50">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <section className="w-full bg-background-100 py-10 md:py-14">
          <div className="shell">
            <div className="max-w-3xl animate-fade-up">
              <span className="eyebrow bg-background-50">{eyebrow}</span>
              <h1 className="mt-4 text-balance text-2xl font-semibold leading-tight text-foreground-950 md:text-4xl">
                {title}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-foreground-600 md:text-base">{intro}</p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-foreground-500">
                <i className="ri-time-line text-sm" />
                Dernière mise à jour : {updated}
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="shell">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-8">
                <div className="space-y-5">
                  {sections.map((section, index) => (
                    <article
                      key={section.id}
                      id={section.id}
                      className="scroll-mt-28 rounded-lg border border-background-200 bg-background-50 p-5 md:p-6"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50 text-[11px] font-semibold text-primary-700">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h2 className="text-base font-semibold leading-snug text-foreground-950 md:text-lg">
                          {section.title}
                        </h2>
                      </div>

                      {section.paragraphs && section.paragraphs.length > 0 && (
                        <div className="mt-3 space-y-2.5">
                          {section.paragraphs.map((paragraph) => (
                            <p
                              key={paragraph}
                              className="text-sm leading-relaxed text-foreground-700"
                            >
                              {withTokens(paragraph)}
                            </p>
                          ))}
                        </div>
                      )}

                      {section.bullets && section.bullets.length > 0 && (
                        <ul className="mt-3 space-y-2">
                          {section.bullets.map((bullet) => (
                            <li
                              key={bullet}
                              className="flex items-start gap-2 text-sm leading-relaxed text-foreground-700"
                            >
                              <i className="ri-checkbox-blank-circle-fill mt-1.5 text-[6px] text-primary-500" />
                              <span>{withTokens(bullet)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>

                {children}
              </div>

              <aside className="space-y-4 lg:col-span-4">
                <div className="rounded-lg border border-accent-200 bg-accent-50/70 p-4 md:p-5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-accent-900">
                    <i className="ri-error-warning-line text-sm" />
                    À compléter avant publication
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {pending.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs leading-relaxed text-accent-900"
                      >
                        <i className="ri-subtract-line mt-0.5 text-xs" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2.5 text-[11px] leading-relaxed text-accent-900/80">
                    Ces informations sont indispensables avant une mise en ligne publique définitive.
                  </p>
                </div>

                <div className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground-500">
                    Contact
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-700">
                    Pour toute question relative à ce document : {withTokens("mrwim74@gmail.com")}
                  </p>
                  <nav className="mt-4 space-y-1.5 border-t border-background-200 pt-3">
                    {otherPages.map((page) => (
                      <Link
                        key={page.to}
                        to={page.to}
                        className="flex min-h-[36px] cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-foreground-700 transition-colors hover:bg-primary-50 hover:text-primary-800"
                      >
                        {page.label}
                        <i className="ri-arrow-right-s-line text-sm" />
                      </Link>
                    ))}
                  </nav>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}