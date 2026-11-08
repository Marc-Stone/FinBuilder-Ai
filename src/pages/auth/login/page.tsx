import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { isValidEmail, translateAuthError } from "@/lib/authErrors";
import AuthLayout from "@/pages/auth/components/AuthLayout";
import AuthField from "@/pages/auth/components/AuthField";

type FieldErrors = { email?: string; password?: string };

const REMEMBER_KEY = "finbuilder:remembered-email";

/** Limitation des tentatives de connexion (protection anti-force brute côté client). */
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60000;

function readRememberedEmail(): string {
  try {
    return window.localStorage.getItem(REMEMBER_KEY) ?? "";
  } catch {
    return "";
  }
}

function persistRememberedEmail(value: string) {
  try {
    if (value) window.localStorage.setItem(REMEMBER_KEY, value);
    else window.localStorage.removeItem(REMEMBER_KEY);
  } catch {
    /* Le stockage peut être indisponible : la connexion reste possible. */
  }
}

function safeRedirect(raw: unknown): string {
  if (typeof raw !== "string") return "/app";
  const value = raw.trim();
  // Uniquement des chemins internes : on refuse toute URL absolue ou protocole.
  if (!value.startsWith("/") || value.startsWith("//")) return "/app";
  return value;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = safeRedirect((location.state as { from?: string } | null)?.from);

  const [email, setEmail] = useState(() => readRememberedEmail());
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(() => readRememberedEmail().length > 0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    if (!lockUntil) return undefined;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [lockUntil]);

  const lockSeconds = lockUntil > clock ? Math.ceil((lockUntil - clock) / 1000) : 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lockSeconds > 0) return;
    setFormError("");
    setNotice("");

    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Renseignez votre adresse email.";
    else if (!isValidEmail(email)) errors.email = "Cette adresse email ne semble pas valide.";
    if (!password) errors.password = "Renseignez votre mot de passe.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Message volontairement générique : on n'indique jamais si l'email existe.
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);
        if (attempts >= MAX_ATTEMPTS) {
          setLockUntil(Date.now() + LOCK_MS);
          setClock(Date.now());
          setFailedAttempts(0);
          setFormError(
            "Trop de tentatives échouées. Pour votre sécurité, la connexion est bloquée une minute.",
          );
        } else {
          setFormError(translateAuthError(error.message));
        }
        return;
      }

      setFailedAttempts(0);
      setLockUntil(0);
      persistRememberedEmail(remember ? email.trim() : "");

      // Trace la dernière connexion : la console d'administration l'affiche.
      const signedUser = data.user;
      if (signedUser) {
        void supabase
          .from("profiles")
          .update({ derniere_connexion: new Date().toISOString() })
          .eq("id", signedUser.id)
          .then(() => undefined)
          .catch(() => undefined);
      }

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(translateAuthError(error instanceof Error ? error.message : null));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Espace personnel"
      title="Bon retour parmi nous"
      subtitle="Connectez-vous pour retrouver votre tableau de bord, votre budget et vos objectifs."
      footer={
        <p className="text-center text-sm text-foreground-600">
          Pas encore de compte ?{" "}
          <Link
            to="/inscription"
            className="font-semibold text-primary-700 transition-colors hover:text-primary-800"
          >
            Créer un compte gratuit
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="w-full" noValidate>
        <div className="space-y-4">
          <AuthField
            id="email"
            label="Adresse email"
            type="email"
            value={email}
            onChange={(value) => {
              setEmail(value);
              setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
            placeholder="vous@exemple.com"
            icon="ri-mail-line"
            autoComplete="email"
            inputMode="email"
            error={fieldErrors.email}
            required
          />

          <AuthField
            id="password"
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              setFieldErrors((current) => ({ ...current, password: undefined }));
            }}
            placeholder="Votre mot de passe"
            icon="ri-lock-line"
            autoComplete="current-password"
            error={fieldErrors.password}
            warnCapsLock
            required
          />

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <label
              htmlFor="remember"
              className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground-700"
            >
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-background-300 accent-primary-500"
              />
              Se souvenir de moi
            </label>
            <Link
              to="/mot-de-passe-oublie"
              className="whitespace-nowrap text-xs font-semibold text-primary-700 transition-colors hover:text-primary-800"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        {formError && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-accent-300 bg-accent-50 px-3.5 py-2.5 text-xs leading-relaxed text-accent-900">
            <i className="ri-error-warning-line mt-0.5 text-sm" />
            <span>{formError}</span>
          </div>
        )}

        {notice && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3.5 py-2.5 text-xs leading-relaxed text-primary-800">
            <i className="ri-checkbox-circle-line mt-0.5 text-sm" />
            <span>{notice}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || lockSeconds > 0}
          className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-all duration-200 hover:bg-primary-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin text-base" />
              Connexion…
            </>
          ) : lockSeconds > 0 ? (
            <>
              <i className="ri-lock-2-line text-base" />
              Réessayez dans {lockSeconds} s
            </>
          ) : (
            <>
              Se connecter
              <i className="ri-arrow-right-line text-base" />
            </>
          )}
        </button>

        <div className="mt-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-background-200" />
          <span className="text-xs uppercase tracking-[0.12em] text-foreground-400">ou</span>
          <span className="h-px flex-1 bg-background-200" />
        </div>

        <Link
          to="/fonctionnalites"
          className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-5 py-3 text-sm font-semibold text-foreground-900 transition-colors duration-200 hover:border-primary-300 hover:bg-primary-50"
        >
          <i className="ri-compass-3-line text-base" />
          Découvrir les fonctionnalités
        </Link>

        <div className="mt-6 rounded-lg border border-background-200 bg-background-100/70 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background-50 text-primary-700">
              <i className="ri-lifebuoy-line text-sm" />
            </span>
            <p className="text-xs font-semibold text-foreground-900">Besoin d'aide pour vous connecter ?</p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-foreground-600">
            Un doute sur votre mot de passe ou sur votre adresse email ? Tout se règle en deux
            minutes, sans contacter personne.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              to="/mode-demploi"
              className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-primary-700 transition-colors hover:text-primary-800"
            >
              <i className="ri-book-open-line text-sm" />
              Consulter le mode d'emploi
            </Link>
            <Link
              to="/a-propos"
              className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-primary-700 transition-colors hover:text-primary-800"
            >
              <i className="ri-mail-send-line text-sm" />
              Écrire à l'équipe
            </Link>
          </div>
          <p className="mt-3 flex items-center gap-1.5 border-t border-background-200 pt-3 text-[11px] text-foreground-500">
            <i className="ri-shield-check-line text-xs text-secondary-700" />
            Connexion chiffrée — vos identifiants ne sont jamais partagés.
          </p>
        </div>

        <p className="mt-4 text-center text-[11px] text-foreground-400">
          Inscription gratuite, sans carte bancaire.
        </p>
      </form>
    </AuthLayout>
  );
}