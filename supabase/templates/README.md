# Modèles d'e-mails FinBuilder AI (Supabase Auth)

À coller dans Supabase → Authentication → Emails → Templates.
Pour chaque modèle : copier le **Sujet**, puis tout le contenu du fichier `.html` dans **Message body**, puis **Save**.

| Fichier | Modèle Supabase | Sujet |
|---|---|---|
| `1-confirmation-inscription.html` | Confirm signup | Confirmez votre inscription à FinBuilder AI |
| `2-reinitialisation-mot-de-passe.html` | Reset Password | Réinitialisez votre mot de passe FinBuilder AI |
| `3-lien-magique.html` | Magic Link | Votre lien de connexion FinBuilder AI |
| `4-changement-adresse.html` | Change Email Address | Confirmez votre nouvelle adresse e-mail |
| `5-invitation.html` | Invite user | Vous êtes invité(e) sur FinBuilder AI |
| `6-reauthentification.html` | Reauthentication | Votre code de confirmation FinBuilder AI |
| `7-alerte-mot-de-passe-modifie.html` | Password changed (Security notifications) | Votre mot de passe FinBuilder AI a été modifié |
| `8-alerte-adresse-modifiee.html` | Email address changed (Security notifications) | L'adresse e-mail de votre compte FinBuilder AI a changé |

Ne pas modifier les variables entre doubles accolades (`{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .Email }}`, `{{ .NewEmail }}`) : Supabase les remplace automatiquement.
