import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { appBasePath, isValidEmail, translateAuthError } from "@/lib/authErrors";
import { devisesOptions, paysOptions } from "@/mocks/auth";
import AuthLayout from "@/pages/auth/components/AuthLayout";
import AuthField from "@/pages/auth/components/AuthField";
import AuthSelect from "@/pages/auth/components/AuthSelect";

type FieldErrors = {
  prenom?: string;
  nom?: string;
  email?: string;
  password?: string;
  confirm?: string;
  conditions?: string;
};

function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const strengthLabels = ["Très faible", "Faible", "Correct", "Solide", "Excellent"];

export default function SignupPage() {
  const navigate = useNavigate();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [pays, setPays] = useState(paysOptions[0]);
  const [devise, setDevise] = useState(devisesOptions[0].value);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [conditions, setConditions] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const score = passwordScore(password);

  const clearError = (key: keyof FieldErrors) =>
    setFieldErrors((current) => ({ ...current, [key]: undefined }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    const errors: FieldErrors = {};
    if (!prenom.trim()) errors.prenom = "Indiquez votre prénom.";
    if (!nom.trim()) errors.nom = "Indiquez votre nom.";
    if (!email.trim()) errors.email = "Renseignez votre adresse email.";
    else if (!isValidEmail(email)) errors.email = "Cette adresse email ne semble pas valide.";
    if (!password) errors.password = "Choisissez un mot de passe.";
    else if (password.length < 8) errors.password = "8 caractères minimum.";
    if (confirm !== password) errors.confirm = "Les deux mots de passe ne correspondent pas.";
    if (!conditions) errors.conditions = "Vous devez accepter les conditions d'utilisation.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            prenom: prenom.trim(),
            nom: nom.trim(),
            telephone: telephone.trim(),
            pays,
            devise,
          },
          emailRedirectTo: `${window.location.origin}${appBasePath}/connexion`,
        },
      });

      if (error) {
        setFormError(translateAuthError(error.message));
        return;
      }

      if (data.session) {
        navigate("/app", { replace: true });
        return;
      }

      setSuccess(
        "Votre compte est créé. Ouvrez le lien de confirmation envoyé à votre adresse email pour activer votre espace.",
      );
    } catch (error) {
      setFormError(translateAuthError(error instanceof Error ? error.message : null));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Créer un compte"
      title="Construisez votre avenir financier"
      subtitle="Quelques informations suffisent pour générer votre premier plan budgétaire personnalisé."
      footer={
        <p className="text-center text-sm text-foreground-600">
          Vous avez déjà un compte ?{" "}
          <Link to="/connexion" className="font-semibold text-primary-700 hover:text-primary-800">
            Se connecter
          </Link>
        </p>
      }
    >
      {success ? (
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-500 text-background-50">
              <i className="ri-mail-check-line text-base" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary-900">Vérifiez votre boîte mail</p>
              <p className="mt-1 text-xs leading-relaxed text-primary-800">{success}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/connexion")}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            Aller à la connexion
            <i className="ri-arrow-right-line text-base" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AuthField
              id="prenom"
              label="Prénom"
              value={prenom}
              onChange={(value) => {
                setPrenom(value);
                clearError("prenom");
              }}
              placeholder="Aminata"
              icon="ri-user-line"
              autoComplete="given-name"
              error={fieldErrors.prenom}
              required
            />
            <AuthField
              id="nom"
              label="Nom"
              value={nom}
              onChange={(value) => {
                setNom(value);
                clearError("nom");
              }}
              placeholder="Koné"
              icon="ri-user-3-line"
              autoComplete="family-name"
              error={fieldErrors.nom}
              required
            />
          </div>

          <div className="mt-4">
            <AuthField
              id="email"
              label="Adresse email"
              type="email"
              value={email}
              onChange={(value) => {
                setEmail(value);
                clearError("email");
              }}
              placeholder="vous@exemple.com"
              icon="ri-mail-line"
              autoComplete="email"
              inputMode="email"
              error={fieldErrors.email}
              required
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AuthField
              id="telephone"
              label="Téléphone"
              type="tel"
              value={telephone}
              onChange={setTelephone}
              placeholder="+221 77 000 00 00"
              icon="ri-phone-line"
              autoComplete="tel"
              inputMode="tel"
            />
            <AuthSelect
              id="pays"
              label="Pays"
              value={pays}
              onChange={setPays}
              options={paysOptions.map((item) => ({ value: item, label: item }))}
              icon="ri-map-pin-line"
            />
          </div>

          <div className="mt-4">
            <AuthSelect
              id="devise"
              label="Devise principale"
              value={devise}
              onChange={setDevise}
              options={devisesOptions}
              icon="ri-money-dollar-circle-line"
              required
            />
          </div>

          <div className="mt-4">
            <AuthField
              id="password"
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                clearError("password");
              }}
              placeholder="8 caractères minimum"
              icon="ri-lock-line"
              autoComplete="new-password"
              error={fieldErrors.password}
              required
            />
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[0, 1, 2, 3].map((index) => (
                    <span
                      key={index}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        index < score
                          ? score <= 1
                            ? "bg-accent-500"
                            : score === 2
                              ? "bg-accent-400"
                              : "bg-primary-500"
                          : "bg-background-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="w-20 text-right text-[11px] font-medium text-foreground-500">
                  {strengthLabels[score]}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <AuthField
              id="confirm"
              label="Confirmer le mot de passe"
              type="password"
              value={confirm}
              onChange={(value) => {
                setConfirm(value);
                clearError("confirm");
              }}
              placeholder="Retapez votre mot de passe"
              icon="ri-lock-2-line"
              autoComplete="new-password"
              error={fieldErrors.confirm}
              required
            />
          </div>

          <div className="mt-4">
            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-foreground-600">
              <input
                type="checkbox"
                checked={conditions}
                onChange={(event) => {
                  setConditions(event.target.checked);
                  clearError("conditions");
                }}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-background-300 text-primary-600 focus:ring-primary-300"
              />
              <span>
                J'accepte les{" "}
                <span className="font-semibold text-primary-700">conditions d'utilisation</span> et la
                politique de confidentialité de FinBuilder AI.
              </span>
            </label>
            {fieldErrors.conditions && (
              <p className="mt-1.5 text-xs text-accent-700">{fieldErrors.conditions}</p>
            )}
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
                Création du compte…
              </>
            ) : (
              <>
                Créer mon compte
                <i className="ri-arrow-right-line text-base" />
              </>
            )}
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-foreground-500">
            <i className="ri-shield-check-line text-sm text-primary-600" />
            Tous les modules inclus — aucune carte requise.
          </p>
        </form>
      )}
    </AuthLayout>
  );
}