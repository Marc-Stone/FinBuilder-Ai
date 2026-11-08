import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { translateAuthError } from "@/lib/authErrors";
import AuthLayout from "@/pages/auth/components/AuthLayout";
import AuthField from "@/pages/auth/components/AuthField";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    let settled = false;

    const settle = (value: boolean) => {
      if (!mounted || settled) return;
      settled = true;
      setSessionReady(value);
    };

    // Le lien de récupération place la session dans l'URL : Supabase la traite
    // de façon asynchrone. On écoute donc l'évènement avant de conclure à un
    // lien invalide, sinon un lien parfaitement valide est refusé.
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (
        (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
        nextSession
      ) {
        settle(true);
      }
    });

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) {
          settle(true);
          return;
        }
        window.setTimeout(() => settle(false), 1600);
      })
      .catch(() => settle(false));

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const errors: { password?: string; confirm?: string } = {};
    if (password.length < 8) errors.password = "8 caractères minimum.";
    if (confirm !== password) errors.confirm = "Les deux mots de passe ne correspondent pas.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setFormError(translateAuthError(error.message));
        return;
      }
      setDone(true);
      setTimeout(() => navigate("/app", { replace: true }), 2200);
    } catch (error) {
      setFormError(translateAuthError(error instanceof Error ? error.message : null));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Sécurité du compte"
      title="Nouveau mot de passe"
      subtitle="Choisissez un mot de passe solide. Il remplacera immédiatement l'ancien."
      footer={
        <p className="text-center text-sm text-foreground-600">
          <Link to="/connexion" className="font-semibold text-primary-700 hover:text-primary-800">
            Revenir à la connexion
          </Link>
        </p>
      }
    >
      {done ? (
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-5">
          <p className="text-sm font-semibold text-primary-900">Mot de passe mis à jour</p>
          <p className="mt-1 text-xs leading-relaxed text-primary-800">
            Vous êtes connecté. Redirection vers votre tableau de bord…
          </p>
        </div>
      ) : sessionReady === null ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-background-200 bg-background-50 p-6 text-center">
          <i className="ri-loader-4-line animate-spin text-xl text-primary-600" />
          <p className="text-xs text-foreground-500">Vérification de votre lien sécurisé…</p>
        </div>
      ) : sessionReady === false ? (
        <div className="rounded-lg border border-accent-300 bg-accent-50 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-500 text-foreground-950">
              <i className="ri-link-unlink text-base" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-accent-900">Lien invalide ou expiré</p>
              <p className="mt-1 text-xs leading-relaxed text-accent-800">
                Ouvrez le lien reçu par email depuis cet appareil, ou demandez un nouveau lien.
              </p>
            </div>
          </div>
          <Link
            to="/mot-de-passe-oublie"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            Demander un nouveau lien
            <i className="ri-arrow-right-line text-base" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full" noValidate>
          <div className="space-y-4">
            <AuthField
              id="password"
              label="Nouveau mot de passe"
              type="password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setFieldErrors((current) => ({ ...current, password: undefined }));
              }}
              placeholder="8 caractères minimum"
              icon="ri-lock-line"
              autoComplete="new-password"
              error={fieldErrors.password}
              required
            />
            <AuthField
              id="confirm"
              label="Confirmer le mot de passe"
              type="password"
              value={confirm}
              onChange={(value) => {
                setConfirm(value);
                setFieldErrors((current) => ({ ...current, confirm: undefined }));
              }}
              placeholder="Retapez le mot de passe"
              icon="ri-lock-2-line"
              autoComplete="new-password"
              error={fieldErrors.confirm}
              required
            />
          </div>

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
                Mise à jour…
              </>
            ) : (
              <>
                Enregistrer le mot de passe
                <i className="ri-arrow-right-line text-base" />
              </>
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}