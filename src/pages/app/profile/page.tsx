import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { devisesOptions, paysOptions } from "@/mocks/auth";
import { useAuth } from "@/hooks/useAuth";
import { useDataSync } from "@/hooks/useDataSync";
import AuthField from "@/pages/auth/components/AuthField";
import AuthSelect from "@/pages/auth/components/AuthSelect";
import AvatarUploader from "@/pages/app/profile/components/AvatarUploader";
import DeleteAccountCard from "@/pages/app/profile/components/DeleteAccountCard";
import InstallAppCard from "@/pages/app/profile/components/InstallAppCard";
import FinancialSituationCard from "@/pages/app/profile/components/FinancialSituationCard";

export default function ProfilePage() {
  const { profile, session, refreshProfile, profileLoading } = useAuth();
  const { notifyChange } = useDataSync();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [pays, setPays] = useState(paysOptions[0]);
  const [devise, setDevise] = useState(devisesOptions[0].value);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setPrenom(profile?.prenom ?? "");
    setNom(profile?.nom ?? "");
    setTelephone(profile?.telephone ?? "");
    setPays(profile?.pays ?? paysOptions[0]);
    setDevise(profile?.devise ?? devisesOptions[0].value);
  }, [profile]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    if (!prenom.trim()) {
      setFormError("Le prénom est obligatoire.");
      return;
    }
    if (!nom.trim()) {
      setFormError("Le nom est obligatoire.");
      return;
    }

    const userId = session?.user?.id;
    if (!userId) {
      setFormError("Session expirée. Reconnectez-vous pour enregistrer vos informations.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          prenom: prenom.trim(),
          nom: nom.trim(),
          telephone: telephone.trim() || null,
          pays,
          devise,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      await refreshProfile();
      notifyChange();
      setSuccess("Vos informations ont bien été enregistrées.");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? `Enregistrement impossible : ${error.message}`
          : "Enregistrement impossible. Réessayez dans un instant.",
      );
    } finally {
      setSaving(false);
    }
  };

  const memberSince = profile?.date_creation
    ? new Date(profile.date_creation).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="w-full animate-fade-up space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
          <AvatarUploader />
          <dl className="mt-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-foreground-500">Membre depuis</dt>
              <dd className="font-medium text-foreground-900">{memberSince}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-foreground-500">Devise</dt>
              <dd className="font-medium text-foreground-900">{profile?.devise ?? "FCFA"}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-foreground-500">Statut email</dt>
              <dd className="inline-flex items-center gap-1 font-medium text-primary-700">
                <i className="ri-checkbox-circle-line text-sm" />
                {session?.user?.email_confirmed_at ? "Confirmé" : "À confirmer"}
              </dd>
            </div>
          </dl>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5 lg:col-span-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground-950 md:text-base">
                Informations personnelles
              </h2>
              <p className="mt-0.5 text-xs text-foreground-500">
                Ces données servent à personnaliser vos conseils financiers.
              </p>
            </div>
            {profileLoading && (
              <i className="ri-loader-4-line animate-spin text-base text-primary-600" />
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AuthField
              id="profile-prenom"
              label="Prénom"
              value={prenom}
              onChange={setPrenom}
              placeholder="Aminata"
              icon="ri-user-line"
              autoComplete="given-name"
              required
            />
            <AuthField
              id="profile-nom"
              label="Nom"
              value={nom}
              onChange={setNom}
              placeholder="Koné"
              icon="ri-user-3-line"
              autoComplete="family-name"
              required
            />
            <AuthField
              id="profile-telephone"
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
              id="profile-pays"
              label="Pays"
              value={pays}
              onChange={setPays}
              options={paysOptions.map((item) => ({ value: item, label: item }))}
              icon="ri-map-pin-line"
            />
            <AuthSelect
              id="profile-devise"
              label="Devise principale"
              value={devise}
              onChange={setDevise}
              options={devisesOptions}
              icon="ri-money-dollar-circle-line"
            />
            <div className="w-full min-w-0">
              <label
                htmlFor="profile-email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-foreground-600"
              >
                Adresse email
              </label>
              <div className="relative w-full">
                <span className="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-foreground-400">
                  <i className="ri-mail-line text-base" />
                </span>
                <input
                  id="profile-email"
                  name="profile-email"
                  type="email"
                  value={profile?.email ?? ""}
                  readOnly
                  className="box-border w-full min-w-0 cursor-not-allowed rounded-md border border-background-200 bg-background-100 py-2.5 pl-10 pr-3.5 text-sm text-foreground-500"
                />
              </div>
              <p className="mt-1.5 text-xs text-foreground-500">
                L'email de connexion ne peut pas être modifié ici.
              </p>
            </div>
          </div>

          {formError && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-accent-300 bg-accent-50 px-3.5 py-2.5 text-xs leading-relaxed text-accent-900">
              <i className="ri-error-warning-line mt-0.5 text-sm" />
              <span>{formError}</span>
            </div>
          )}
          {success && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3.5 py-2.5 text-xs leading-relaxed text-primary-800">
              <i className="ri-checkbox-circle-line mt-0.5 text-sm" />
              <span>{success}</span>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-base" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <i className="ri-save-line text-base" />
                  Enregistrer les modifications
                </>
              )}
            </button>
            <Link
              to="/mot-de-passe-oublie"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 px-5 py-2.5 text-sm font-semibold text-foreground-800 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <i className="ri-lock-password-line text-base" />
              Changer mon mot de passe
            </Link>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
            <i className="ri-shield-keyhole-line text-base" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground-950">Vos données restent privées</p>
            <p className="mt-0.5 text-xs leading-relaxed text-foreground-600">
              Vos informations financières sont protégées par des règles d'accès strictes : seul
              votre compte peut lire et modifier vos données.
            </p>
          </div>
        </div>
      </div>

      <FinancialSituationCard />

      <InstallAppCard />

      <DeleteAccountCard />
    </div>
  );
}