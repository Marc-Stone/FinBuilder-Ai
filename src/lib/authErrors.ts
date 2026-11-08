const errorMap: Record<string, string> = {
  "Invalid login credentials": "Email ou mot de passe incorrect. Vérifiez vos informations.",
  "Email not confirmed": "Votre adresse email n'est pas encore confirmée. Ouvrez le lien reçu par email.",
  "User already registered": "Un compte existe déjà avec cette adresse email. Connectez-vous.",
  "Password should be at least 6 characters":
    "Le mot de passe doit contenir au moins 8 caractères.",
  "Signup requires a valid password": "Choisissez un mot de passe valide d'au moins 8 caractères.",
  "Unable to validate email address: invalid format":
    "Cette adresse email n'est pas valide. Vérifiez-la puis réessayez.",
  "Email rate limit exceeded":
    "Trop de tentatives envoyées. Patientez quelques minutes avant de réessayer.",
  "For security purposes, you can only request this after 60 seconds.":
    "Pour des raisons de sécurité, patientez 60 secondes avant de réessayer.",
  "New password should be different from the old password.":
    "Le nouveau mot de passe doit être différent de l'ancien.",
  "Auth session missing!": "Le lien a expiré. Demandez un nouveau lien de réinitialisation.",
};

export function translateAuthError(message?: string | null): string {
  if (!message) return "Une erreur inattendue est survenue. Réessayez dans un instant.";
  const direct = errorMap[message];
  if (direct) return direct;
  const lowered = message.toLowerCase();
  if (lowered.includes("invalid login")) return errorMap["Invalid login credentials"];
  if (lowered.includes("already registered")) return errorMap["User already registered"];
  if (lowered.includes("rate limit"))
    return "Trop de tentatives envoyées. Patientez quelques minutes avant de réessayer.";
  if (lowered.includes("password")) return "Le mot de passe ne respecte pas les critères requis.";
  if (lowered.includes("network") || lowered.includes("fetch"))
    return "Connexion au serveur impossible. Vérifiez votre réseau puis réessayez.";
  return message;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export const appBasePath = (() => {
  const segments = __BASE_PATH__.split("/").filter(Boolean).join("/");
  return segments ? `/${segments}` : "";
})();