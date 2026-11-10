import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { authHighlights } from "@/mocks/auth";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

const panelStats = [
  { value: "6", label: "profils financiers couverts" },
  { value: "14", label: "modules inclus" },
  { value: "Aucune", label: "connexion bancaire requise" },
];

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-background-50 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-primary-950 lg:flex lg:flex-col lg:justify-between lg:gap-6 lg:p-10 xl:p-12">
        <img
          src="https://public.readdy.ai/ai/img_res/edited_3d4bd86119d91c7a65a0da5d65290f8a_ae98af66.jpg"
          alt="Texture abstraite bleu nuit de FinBuilder AI"
          title="FinBuilder AI — texture financière abstraite"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/85 via-primary-950/88 to-primary-950/97" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary-950 to-transparent" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-500 text-background-50">
              <i className="ri-line-chart-line text-lg" />
            </span>
            <span
              className="text-base font-semibold tracking-tight text-background-50"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              FinBuilder<span className="text-accent-400"> AI</span>
            </span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-background-50/20 px-2.5 py-1 text-[11px] font-medium text-background-50/80">
            <i className="ri-lock-2-line text-xs text-accent-300" />
            Connexion sécurisée
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-300">
            Build your financial future
          </p>
          <h2
            className="mt-3 text-[1.6rem] font-semibold leading-tight text-background-50 xl:text-[1.95rem]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Un plan financier clair, chiffré et vraiment à vous.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-background-50/75">
            Rejoignez les particuliers qui pilotent leurs revenus, leurs dépenses et leurs projets
            avec un coach financier propulsé par l'intelligence artificielle.
          </p>

          <div className="mt-6 space-y-3.5">
            {authHighlights.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background-50/10 text-accent-300">
                  <i className={`${item.icon} text-base`} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-background-50">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-background-50/65">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3 border-y border-background-50/15 py-4">
            {panelStats.map((stat) => (
              <div key={stat.value} className="min-w-0">
                <p
                  className="text-base font-semibold leading-none text-background-50"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[11px] leading-snug text-background-50/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 rounded-lg border border-background-50/15 bg-background-50/[0.07] p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-300">
            <i className="ri-shield-check-line text-sm" />
            Vos données, votre compte
          </p>
          <p className="mt-2 text-sm leading-relaxed text-background-50/85">
            Connexion sécurisée (HTTPS) · Données isolées par compte. Chaque compte ne peut lire que
            ses propres revenus, dépenses, objectifs et projets.
          </p>
        </div>
      </aside>

      <main className="flex min-h-screen w-full flex-col bg-background-50">
        <div className="flex items-center justify-between border-b border-background-200 px-4 py-3.5 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-background-50">
              <i className="ri-line-chart-line text-base" />
            </span>
            <span
              className="text-sm font-semibold tracking-tight text-foreground-950"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              FinBuilder<span className="text-accent-600"> AI</span>
            </span>
          </Link>
          <Link
            to="/"
            className="tap-target whitespace-nowrap rounded-md border border-background-300 px-3 py-1.5 text-xs font-semibold text-foreground-700"
          >
            Retour au site
          </Link>
        </div>

        <div className="hidden items-center justify-end gap-2 px-6 py-5 lg:flex lg:px-10">
          <Link
            to="/mode-demploi"
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold text-foreground-600 transition-colors hover:bg-background-100 hover:text-primary-700"
          >
            <i className="ri-question-line text-sm" />
            Comment ça marche
          </Link>
          <Link
            to="/"
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3.5 py-2 text-xs font-semibold text-foreground-800 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800"
          >
            <i className="ri-arrow-left-line text-sm" />
            Retour au site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-10 md:px-8 lg:py-12">
          <div className="w-full max-w-[440px] animate-fade-up">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-700">{eyebrow}</p>
            <h1
              className="mt-3 text-2xl font-semibold leading-tight text-foreground-950 md:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-foreground-600">{subtitle}</p>

            <div className="mt-6">{children}</div>

            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>

        <div className="border-t border-background-200 px-4 py-4 lg:px-8">
          <p className="text-center text-xs text-foreground-500">
            © 2026 FinBuilder AI — Connexion sécurisée (HTTPS) · Données isolées par compte.
          </p>
        </div>
      </main>
    </div>
  );
}