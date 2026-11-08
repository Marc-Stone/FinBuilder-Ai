import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/base/ConfirmDialog";
import ModalPortal from "@/components/base/ModalPortal";
import { formatAdminDate, formatAdminDateTime, type AdminUserRow } from "@/lib/admin";
import {
  findRole,
  generatePassword,
  hasConsoleAccess,
  isConsoleOwner,
  passwordScore,
  permissionIcon,
  permissionLabel,
  type AdminRole,
} from "@/lib/roles";

type Feedback = { tone: "success" | "error"; message: string } | null;

type MemberPanelProps = {
  user: AdminUserRow;
  roles: AdminRole[];
  currentUserId: string | null;
  canManage: boolean;
  onClose: () => void;
  onAssignRole: (roleId: string | null) => Promise<void>;
  onResetPassword: (password: string) => Promise<void>;
};

const MIN_PASSWORD = 8;

function displayName(user: AdminUserRow): string {
  const parts = [user.prenom, user.nom].filter(Boolean);
  return parts.join(" ") || user.email || "Compte sans nom";
}

function initials(user: AdminUserRow): string {
  const first = user.prenom?.trim().charAt(0) ?? "";
  const last = user.nom?.trim().charAt(0) ?? "";
  return (`${first}${last}`.toUpperCase() || (user.email?.charAt(0) ?? "?")).toUpperCase();
}

export default function MemberPanel({
  user,
  roles,
  currentUserId,
  canManage,
  onClose,
  onAssignRole,
  onResetPassword,
}: MemberPanelProps) {
  const isSelf = user.id === currentUserId;
  const isOwner = isConsoleOwner(user);
  const role = findRole(roles, user.admin_role_id);

  const [selectedRoleId, setSelectedRoleId] = useState<string>(user.admin_role_id ?? "");
  const [savingRole, setSavingRole] = useState(false);
  const [roleFeedback, setRoleFeedback] = useState<Feedback>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const [toRevoke, setToRevoke] = useState(false);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    setSelectedRoleId(user.admin_role_id ?? "");
    setRoleFeedback(null);
    setPassword("");
    setConfirmPassword("");
    setPasswordFeedback(null);
    setShowPassword(false);
    // Réinitialisation uniquement au changement de compte : les messages de
    // confirmation doivent rester visibles après une mise à jour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const initialRoleId = user.admin_role_id ?? "";
  const roleChanged = selectedRoleId !== initialRoleId;

  const selectedRole = roles.find((item) => item.id === selectedRoleId) ?? null;

  const strength = useMemo(() => passwordScore(password), [password]);
  const passwordLongEnough = password.length >= MIN_PASSWORD;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const passwordReady = passwordLongEnough && passwordsMatch && !isSelf;

  const handleSaveRole = async () => {
    setSavingRole(true);
    setRoleFeedback(null);
    try {
      await onAssignRole(selectedRoleId || null);
      setRoleFeedback({
        tone: "success",
        message: selectedRole
          ? `Le rôle « ${selectedRole.nom} » est maintenant actif pour ce compte.`
          : "La personne n'a plus accès à la console d'administration.",
      });
    } catch (error) {
      setRoleFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Le changement de rôle a échoué.",
      });
    } finally {
      setSavingRole(false);
    }
  };

  const handleReset = async () => {
    setSavingPassword(true);
    setPasswordFeedback(null);
    try {
      await onResetPassword(password);
      setConfirmReset(false);
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setPasswordFeedback({
        tone: "success",
        message:
          "Le nouveau mot de passe est actif. Transmettez-le à la personne par un canal sûr : il ne sera plus affiché.",
      });
    } catch (error) {
      setConfirmReset(false);
      setPasswordFeedback({
        tone: "error",
        message:
          error instanceof Error ? error.message : "La réinitialisation du mot de passe a échoué.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      await onAssignRole(null);
      setToRevoke(false);
      setSelectedRoleId("");
      setRoleFeedback({
        tone: "success",
        message: "L'accès à la console a été retiré. Le compte et ses données restent intacts.",
      });
    } catch (error) {
      setToRevoke(false);
      setRoleFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Le retrait de l'accès a échoué.",
      });
    } finally {
      setRevoking(false);
    }
  };

  const accessBadge = isOwner
    ? { label: "Admin", tone: "owner" as const }
    : role
      ? { label: role.nom, tone: "role" as const }
      : { label: "Aucun accès console", tone: "none" as const };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] flex justify-end">
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="absolute inset-0 cursor-pointer bg-foreground-950/40"
        />

        <aside className="relative z-10 flex h-full w-full max-w-xl animate-fade-up flex-col border-l border-background-200 bg-background-50">
          <header className="border-b border-background-200 px-4 py-4 md:px-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground-950 text-sm font-semibold text-background-50">
                {initials(user)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h2
                    className="truncate text-base font-semibold text-foreground-950"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {displayName(user)}
                  </h2>
                  {isSelf && (
                    <span className="rounded-full bg-background-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-foreground-500">
                      Vous
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-foreground-500">{user.email ?? "—"}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      accessBadge.tone === "owner"
                        ? "border-primary-200 bg-primary-50 text-primary-800"
                        : accessBadge.tone === "role"
                          ? "border-secondary-200 bg-secondary-50 text-secondary-900"
                          : "border-background-300 bg-background-100 text-foreground-600"
                    }`}
                  >
                    <i
                      className={
                        accessBadge.tone === "owner"
                          ? "ri-shield-star-line text-[10px]"
                          : accessBadge.tone === "role"
                            ? "ri-shield-user-line text-[10px]"
                            : "ri-user-line text-[10px]"
                      }
                    />
                    {accessBadge.label}
                  </span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-background-100 px-2 py-0.5 text-[10px] font-medium text-foreground-600">
                    <i className="ri-calendar-line text-[10px]" />
                    Inscrit le {formatAdminDate(user.date_creation)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer le panneau"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-background-100"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>
          </header>

          <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-5">
            {isSelf && !isOwner && (
              <div className="rounded-md border border-background-300 bg-background-100 px-3 py-2.5">
                <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-foreground-700">
                  <i className="ri-lock-line mt-0.5 text-xs" />
                  Vous ne pouvez pas modifier votre propre niveau d'accès. Demandez à un autre
                  administrateur disposant de l'accès total de le faire.
                </p>
              </div>
            )}

            {isOwner && (
              <div className="rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5">
                <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-primary-900">
                  <i className="ri-lock-line mt-0.5 text-xs" />
                  Ce compte est le vôtre et détient l'accès total. Son rôle ne peut pas être modifié
                  depuis cette page.
                </p>
              </div>
            )}

            <section>
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground-950">Rôle et accès</h3>
                <span className="text-[10px] text-foreground-500">
                  {roles.length} profil(s) disponible(s)
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedRoleId("")}
                  disabled={!canManage || isOwner || isSelf || savingRole}
                  className={`flex w-full cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    selectedRoleId === ""
                      ? "border-foreground-900 bg-background-100"
                      : "border-background-200 bg-background-50 hover:border-background-300"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                      selectedRoleId === ""
                        ? "bg-foreground-950 text-background-50"
                        : "bg-background-100 text-foreground-500"
                    }`}
                  >
                    <i className="ri-user-forbid-line text-sm" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-foreground-900">
                      Aucun accès à la console
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-relaxed text-foreground-500">
                      La personne garde son compte et son espace personnel, sans administration.
                    </span>
                  </span>
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      selectedRoleId === ""
                        ? "border-foreground-950 bg-foreground-950 text-background-50"
                        : "border-background-300 text-transparent"
                    }`}
                  >
                    <i className="ri-check-line text-[9px]" />
                  </span>
                </button>

                {roles.map((item) => {
                  const active = selectedRoleId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedRoleId(item.id)}
                      disabled={!canManage || isOwner || isSelf || savingRole}
                      className={`flex w-full cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        active
                          ? "border-primary-400 bg-primary-50"
                          : "border-background-200 bg-background-50 hover:border-background-300"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                          active
                            ? "bg-primary-500 text-background-50"
                            : "bg-secondary-100 text-secondary-900"
                        }`}
                      >
                        <i className="ri-shield-user-line text-sm" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground-900">
                            {item.nom}
                          </span>
                          <span className="rounded-full bg-background-100 px-1.5 py-0.5 text-[9px] font-semibold text-foreground-600">
                            {item.permissions.length} droit(s)
                          </span>
                        </span>
                        <span className="mt-0.5 block line-clamp-2 text-[10px] leading-relaxed text-foreground-500">
                          {item.description || "Aucune description pour ce profil."}
                        </span>
                      </span>
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          active
                            ? "border-primary-500 bg-primary-500 text-background-50"
                            : "border-background-300 text-transparent"
                        }`}
                      >
                        <i className="ri-check-line text-[9px]" />
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedRole && selectedRole.permissions.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1">
                  {selectedRole.permissions.slice(0, 8).map((key) => (
                    <li
                      key={key}
                      className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-secondary-200 bg-secondary-50 px-1.5 py-0.5 text-[10px] font-medium text-secondary-900"
                    >
                      <i className={`${permissionIcon(key)} text-[10px]`} />
                      {permissionLabel(key)}
                    </li>
                  ))}
                  {selectedRole.permissions.length > 8 && (
                    <li className="inline-flex items-center rounded-md bg-background-100 px-1.5 py-0.5 text-[10px] font-semibold text-foreground-600">
                      +{selectedRole.permissions.length - 8}
                    </li>
                  )}
                </ul>
              )}

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveRole}
                  disabled={!canManage || isOwner || isSelf || !roleChanged || savingRole}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i
                    className={
                      savingRole ? "ri-loader-4-line animate-spin text-xs" : "ri-shield-check-line text-xs"
                    }
                  />
                  {savingRole ? "Enregistrement…" : "Enregistrer le rôle"}
                </button>

                {hasConsoleAccess(user) && !isOwner && !isSelf && (
                  <button
                    type="button"
                    onClick={() => setToRevoke(true)}
                    disabled={!canManage || savingRole}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-accent-300 bg-background-50 px-3 py-2 text-xs font-semibold text-accent-800 transition-colors hover:bg-accent-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <i className="ri-user-unfollow-line text-xs" />
                    Retirer l'accès
                  </button>
                )}

                {!canManage && (
                  <p className="text-[10px] text-foreground-500">
                    Seul un compte admin disposant de l'accès total peut modifier les accès.
                  </p>
                )}
              </div>

              {roleFeedback && (
                <p
                  className={`mt-2 flex items-start gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] leading-relaxed ${
                    roleFeedback.tone === "success"
                      ? "bg-primary-50 text-primary-900"
                      : "bg-accent-50 text-accent-900"
                  }`}
                >
                  <i
                    className={`mt-0.5 ${
                      roleFeedback.tone === "success"
                        ? "ri-check-double-line"
                        : "ri-error-warning-line"
                    }`}
                  />
                  {roleFeedback.message}
                </p>
              )}
            </section>

            <section className="rounded-lg border border-background-200 bg-background-50 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-100 text-accent-800">
                  <i className="ri-key-2-line text-sm" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground-950">Mot de passe</h3>
                  <p className="text-[10px] text-foreground-500">
                    Définissez un mot de passe temporaire pour ce compte.
                  </p>
                </div>
              </div>

              {isSelf ? (
                <p className="mt-2.5 rounded-md bg-background-100 px-2.5 py-2 text-[11px] leading-relaxed text-foreground-600">
                  Pour votre propre compte, modifiez votre mot de passe depuis la page
                  «&nbsp;Profil&nbsp;» de votre espace personnel.
                </p>
              ) : (
                <>
                  <div className="mt-2.5 space-y-2">
                    <div>
                      <label
                        htmlFor="new-password"
                        className="mb-1 block text-[11px] font-semibold text-foreground-800"
                      >
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          autoComplete="new-password"
                          placeholder={`Au moins ${MIN_PASSWORD} caractères`}
                          className="w-full box-border rounded-md border border-background-300 bg-background-50 py-2 pl-3 pr-20 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-primary-400"
                        />
                        <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={showPassword ? "Masquer" : "Afficher"}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-foreground-500 hover:bg-background-100"
                          >
                            <i
                              className={
                                showPassword ? "ri-eye-off-line text-sm" : "ri-eye-line text-sm"
                              }
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = generatePassword();
                              setPassword(next);
                              setConfirmPassword(next);
                              setShowPassword(true);
                            }}
                            title="Générer un mot de passe solide"
                            aria-label="Générer un mot de passe"
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-foreground-500 hover:bg-background-100"
                          >
                            <i className="ri-magic-line text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="mb-1 block text-[11px] font-semibold text-foreground-800"
                      >
                        Confirmer le mot de passe
                      </label>
                      <input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        placeholder="Saisissez-le à nouveau"
                        className="w-full box-border rounded-md border border-background-300 bg-background-50 px-3 py-2 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-primary-400"
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <span
                          key={step}
                          className={`h-1 flex-1 rounded-full ${
                            password.length === 0
                              ? "bg-background-200"
                              : strength.score >= step
                                ? strength.tone === "strong"
                                  ? "bg-primary-500"
                                  : "bg-accent-400"
                                : "bg-background-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold text-foreground-600">
                      {password.length === 0 ? "—" : strength.label}
                    </span>
                  </div>

                  {password.length > 0 && !passwordLongEnough && (
                    <p className="mt-1.5 text-[10px] text-accent-800">
                      Le mot de passe doit contenir au moins {MIN_PASSWORD} caractères.
                    </p>
                  )}
                  {password.length > 0 && passwordLongEnough && !passwordsMatch && (
                    <p className="mt-1.5 text-[10px] text-accent-800">
                      Les deux mots de passe ne correspondent pas encore.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    disabled={!passwordReady || savingPassword}
                    className="mt-2.5 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-foreground-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <i
                      className={
                        savingPassword
                          ? "ri-loader-4-line animate-spin text-xs"
                          : "ri-lock-password-line text-xs"
                      }
                    />
                    {savingPassword ? "Application…" : "Définir ce mot de passe"}
                  </button>

                  {passwordFeedback && (
                    <p
                      className={`mt-2 flex items-start gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] leading-relaxed ${
                        passwordFeedback.tone === "success"
                          ? "bg-primary-50 text-primary-900"
                          : "bg-accent-50 text-accent-900"
                      }`}
                    >
                      <i
                        className={`mt-0.5 ${
                          passwordFeedback.tone === "success"
                            ? "ri-check-double-line"
                            : "ri-error-warning-line"
                        }`}
                      />
                      {passwordFeedback.message}
                    </p>
                  )}

                  <p className="mt-2 text-[10px] leading-relaxed text-foreground-500">
                    Le mot de passe est remplacé immédiatement. Communiquez-le par un canal sûr :
                    il ne sera plus affiché ensuite.
                  </p>
                </>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold text-foreground-950">Informations du compte</h3>
              <dl className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {[
                  { label: "Inscription", value: formatAdminDate(user.date_creation), icon: "ri-calendar-line" },
                  {
                    label: "Dernière connexion",
                    value: user.derniere_connexion
                      ? formatAdminDateTime(user.derniere_connexion)
                      : "Jamais",
                    icon: "ri-login-box-line",
                  },
                  { label: "Pays", value: user.pays ?? "—", icon: "ri-map-pin-line" },
                  { label: "Statut", value: user.statut ?? "actif", icon: "ri-user-follow-line" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-md border border-background-200 bg-background-50 px-2.5 py-2"
                  >
                    <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-foreground-500">
                      <i className={`${item.icon} text-[10px]`} />
                      {item.label}
                    </dt>
                    <dd className="mt-0.5 truncate text-xs font-medium text-foreground-900">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <footer className="border-t border-background-200 px-4 py-3 md:px-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] text-foreground-400">
                Toute modification est enregistrée dans le journal d'activité.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3.5 py-2 text-xs font-semibold text-foreground-800 transition-colors hover:bg-background-100"
              >
                Fermer
              </button>
            </div>
          </footer>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Définir ce nouveau mot de passe ?"
        message={`Le mot de passe de ${displayName(user)} sera remplacé immédiatement. La personne devra utiliser ce nouveau mot de passe pour se connecter.`}
        confirmLabel="Appliquer"
        loading={savingPassword}
        onCancel={() => setConfirmReset(false)}
        onConfirm={handleReset}
      />

      <ConfirmDialog
        open={toRevoke}
        title="Retirer l'accès à la console ?"
        message={`${displayName(user)} ne pourra plus ouvrir l'administration. Son compte utilisateur et ses données financières restent intacts.`}
        confirmLabel="Retirer l'accès"
        loading={revoking}
        onCancel={() => setToRevoke(false)}
        onConfirm={handleRevoke}
      />
    </ModalPortal>
  );
}