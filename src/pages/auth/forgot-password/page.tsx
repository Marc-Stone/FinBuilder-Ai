import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { appBasePath, isValidEmail, translateAuthError } from "@/lib/authErrors";
import AuthLayout from "@/pages/auth/components/AuthLayout";
import AuthField from "@/pages/auth/components/AuthField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setFieldError("");

    if (!email.trim()) {
      setFieldError("Renseignez votre adresse email.");
      return;
    }
    if (!isValidEmail(email)) {
      setFieldError("Cette adresse email ne semble pas valide.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}${appBasePath}/reinitialiser-mot-de-passe`,
      });

      if (error) {
        setFormError(translateAuthError(error.message));
        return;
      }
      setSent(true);
    } catch (error) {
      setFormError(translateAuthError(error instanceof Error ? error.message : null));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Récupération du compte"
      title="Mot de passe oublié"
      subtitle="Indiquez l'adresse email de votre compte : nous vous envoyons un lien sécurisé pour définir un nouveau mot de passe."
      footer={
        <p className="text-center text-sm text-foreground-600">
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link to="/connexion" className="font-semibold text-primary-700 hover:text-primary-800">
            Revenir à la connexion
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-500 text-background-50">
              <i className="ri-mail-send-line text-base" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary-900">Lien envoyé</p>
              <p className="mt-1 text-xs leading-relaxed text-primary-800">
                Si un compte existe pour <strong>{email}</strong>, vous recevrez un email contenant le
                lien de réinitialisation. Pensez à vérifier vos spams.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-primary-300 bg-background-50 px-5 py-2.5 text-sm font-semibold text-primary-800 transition-colors hover:bg-primary-100"
          >
            <i className="ri-refresh-line text-base" />
            Utiliser une autre adresse
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full" noValidate>
          <AuthField
            id="email"
            label="Adresse email"
            type="email"
            value={email}
            onChange={(value) => {
              setEmail(value);
              setFieldError("");
            }}
            placeholder="vous@exemple.com"
            icon="ri-mail-line"
            autoComplete="email"
            inputMode="email"
            error={fieldError}
            required
          />

          {formError && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-accent-300 bg-accent-50 px-3.5 py-2.5 text-xs leading-relaxed text-accent-900">
              <i className="ri-error-warning-line mt-0.5 text-sm" />
              <span>{formError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-all duration-200 hover:bg-primary-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin text-base" />
                Envoi en cours…
              </>
            ) : (
              <>
                Recevoir le lien de réinitialisation
                <i className="ri-arrow-right-line text-base" />
              </>
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}