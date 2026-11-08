import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

const FOOTER_FORM_URL = "https://readdy.ai/api/form/dbl2uhp3ild7mhspti10";

/** Délai minimal entre deux inscriptions à la lettre financière. */
const NEWSLETTER_COOLDOWN_MS = 30000;

const columns = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", to: "/fonctionnalites" },
      { label: "Mode d'emploi", to: "/mode-demploi" },
      { label: "Assistant IA", to: "/fonctionnalites" },
      { label: "Simulations", to: "/fonctionnalites" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Guide du budget", to: "/fonctionnalites" },
      { label: "Éducation financière", to: "/fonctionnalites" },
      { label: "Conseiller logement", to: "/fonctionnalites" },
      { label: "Rapports", to: "/fonctionnalites" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", to: "/a-propos" },
      { label: "Mode d'emploi", to: "/mode-demploi" },
      { label: "Fonctionnalités", to: "/fonctionnalites" },
    ],
  },
];

const legalLinks = [
  { label: "Mentions légales", to: "/mentions-legales" },
  { label: "Politique de confidentialité", to: "/confidentialite" },
  { label: "Conditions générales d'utilisation", to: "/cgu" },
];

export default function Footer() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    if (!cooldownUntil) return undefined;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  const cooldown = cooldownUntil > clock ? Math.ceil((cooldownUntil - clock) / 1000) : 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cooldown > 0) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const honeypot = String(formData.get("company_alt") || "").trim();

    if (honeypot) {
      setStatus("success");
      setMessage("Merci ! Votre inscription est confirmée.");
      form.reset();
      return;
    }

    if (!formData.get("consent")) {
      setStatus("error");
      setMessage("Merci de cocher la case de consentement pour vous inscrire.");
      return;
    }

    const payload = new URLSearchParams();
    formData.forEach((value, key) => {
      if (key === "company_alt") return;
      const text = String(value).trim();
      if (text) payload.append(key, text);
    });

    setStatus("loading");
    setMessage("");
    setCooldownUntil(Date.now() + NEWSLETTER_COOLDOWN_MS);
    setClock(Date.now());

    try {
      const response = await fetch(FOOTER_FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
      });
      const responseText = await response.text();
      let parsed: {
        code?: string;
        message?: string;
        meta?: { message?: string; detail?: string };
      } | null = null;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = null;
      }
      const serverMessage =
        parsed?.meta?.message || parsed?.message || parsed?.meta?.detail || responseText || "";
      const isSuccess =
        response.ok && parsed?.code === "OK" && !String(serverMessage).toLowerCase().includes("spam");

      if (isSuccess) {
        setStatus("success");
        setMessage("Merci ! Vous recevrez nos conseils financiers chaque semaine.");
        form.reset();
      } else {
        setStatus("error");
        setMessage(
          serverMessage && !String(serverMessage).toLowerCase().includes("spam")
            ? serverMessage
            : "L'inscription n'a pas pu aboutir. Vérifiez votre adresse email et réessayez.",
        );
      }
    } catch {
      setStatus("error");
      setMessage("Connexion impossible. Vérifiez votre réseau puis réessayez.");
    }
  };

  return (
    <footer className="bg-primary-950 text-background-50">
      <div className="shell py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-500 text-background-50">
                <i className="ri-line-chart-line text-lg" />
              </span>
              <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                FinBuilder<span className="text-accent-400"> AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-background-50/70">
              Build your financial future. Votre coach financier personnel, propulsé par l'intelligence
              artificielle, pensé pour les revenus en FCFA.
            </p>

            <form
              id="newsletter-finbuilder"
              data-readdy-form
              onSubmit={handleSubmit}
              className="mt-7 w-full"
              noValidate={false}
            >
              <label
                htmlFor="newsletter-email"
                className="block text-xs font-medium uppercase tracking-[0.14em] text-background-50/60"
              >
                Lettre financière hebdomadaire
              </label>
              <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  required
                  placeholder="votre@email.com"
                  className="box-border w-full min-w-0 rounded-md border border-background-50/20 bg-background-50/10 px-3.5 py-2.5 text-sm text-background-50 placeholder:text-background-50/40 focus:border-primary-400 focus:outline-none"
                />
                <input
                  type="text"
                  name="company_alt"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  readOnly
                  className="newsletter-extra-field"
                />
                <button
                  type="submit"
                  disabled={status === "loading" || cooldown > 0}
                  className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-500 px-4 py-2.5 text-sm font-semibold text-foreground-950 transition-all duration-200 hover:bg-accent-400 active:scale-[0.98] disabled:opacity-60"
                >
                  {status === "loading"
                    ? "Envoi…"
                    : cooldown > 0
                      ? `Patientez ${cooldown} s`
                      : "S'inscrire"}
                  <i className="ri-arrow-right-line text-sm" />
                </button>
              </div>

              <div className="mt-3 flex items-start gap-2.5">
                <input
                  id="newsletter-consent"
                  name="consent"
                  type="checkbox"
                  value="oui"
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-background-50/30 bg-background-50/10 accent-accent-500"
                />
                <label
                  htmlFor="newsletter-consent"
                  className="text-[11px] leading-relaxed text-background-50/60"
                >
                  J'accepte de recevoir la lettre financière hebdomadaire et que mon adresse email soit
                  utilisée à cette seule fin. Voir la{" "}
                  <Link
                    to="/confidentialite"
                    className="cursor-pointer font-medium text-accent-300 underline underline-offset-2 transition-colors hover:text-accent-200"
                  >
                    politique de confidentialité
                  </Link>
                  .
                </label>
              </div>

              {status !== "idle" && message && (
                <p
                  className={`mt-2.5 text-xs ${
                    status === "success" ? "text-primary-300" : "text-accent-300"
                  }`}
                  role="status"
                >
                  {message}
                </p>
              )}
            </form>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="lg:col-span-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-background-50/50">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-sm text-background-50/75 transition-colors hover:text-accent-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-background-50/50">
              Contact
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-background-50/75">
              <li className="flex items-start gap-2">
                <i className="ri-mail-line mt-0.5 text-base text-accent-400" />
                <span className="break-all">mrwim74@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="ri-map-pin-line text-base text-accent-400" />
                <span>Abidjan - Côte d'Ivoire</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="ri-time-line text-base text-accent-400" />
                <span>Réponse sous 24 h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-background-50/10 pt-6">
          <nav aria-label="Informations légales" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="cursor-pointer whitespace-nowrap text-xs text-background-50/70 transition-colors hover:text-accent-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-xs text-background-50/50">© 2026 FinBuilder AI. Tous droits réservés.</p>
            <p className="max-w-xl text-xs leading-relaxed text-background-50/40">
              Informations générales, ne constitue pas un conseil en investissement.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}