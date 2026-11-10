# FinBuilder AI — PWA

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `public/manifest.json` | Manifeste (nom, couleurs, icônes, `standalone`, `portrait`, raccourcis) |
| `public/sw.js` | Service worker (cache des fichiers statiques uniquement, hors ligne, push) |
| `public/offline.html` | Page affichée hors connexion si l'app n'a jamais été ouverte |
| `public/icons/` | Logo SVG source + icônes PNG (192, 512, maskable, apple-touch) |
| `vite.config.ts` → `pwaServiceWorker()` | Injecte la version du build et la liste du précache dans `out/sw.js` |
| `src/lib/pwa.ts` | Enregistrement du SW, invite d'installation, reprise après déploiement |
| `src/components/feature/InstallPrompt.tsx` | Bannière « Installer FinBuilder AI » (Android) / guide iOS |
| `src/lib/push.ts` | Abonnement Web Push côté navigateur |
| `src/pages/app/notifications/components/PushSettings.tsx` | Activation des notifications sur l'appareil |
| `supabase/migrations/20261110000000_push_subscriptions.sql` | Table des abonnements + RLS |
| `supabase/functions/send-push` | Envoi des notifications (rôle service uniquement) |

## Règle de cache

Le service worker ne met en cache **que** les fichiers statiques du même domaine.
Les requêtes Supabase (REST, Auth, Storage, Realtime, Functions), les requêtes
avec en-tête `Authorization` et toutes les requêtes non-GET ne passent jamais par le cache.
Ne pas assouplir ces règles.

## Mettre à jour les icônes

Remplacer `public/icons/logo.svg` (et les variantes `logo-maskable.svg`, `logo-apple.svg`)
par le logo officiel, puis régénérer les PNG aux mêmes tailles et mêmes noms.

## Activer les notifications push

1. Générer une paire de clés VAPID : `npx web-push generate-vapid-keys`
2. Appliquer la migration SQL (SQL Editor Supabase ou `supabase db push`).
3. Secrets de la fonction Edge (**jamais** dans `.env` ni dans le code) :
   ```
   supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:support@votre-domaine
   supabase functions deploy send-push
   ```
4. Côté front, variable publique : `VITE_PUBLIC_VAPID_PUBLIC_KEY=<clé publique>` puis rebuild.
   Tant qu'elle est absente, le bouton d'activation n'apparaît pas.
5. Déclencher un envoi depuis le serveur (cron, trigger, autre fonction) :
   ```
   POST /functions/v1/send-push
   Authorization: Bearer <SERVICE_ROLE_KEY>
   { "user_id": "<uuid>", "type": "budget_depasse" }
   ```
   Types : `budget_depasse`, `objectif_atteint`, `rappel_financier`, `conseil_coach`.
   Les textes sont génériques (aucun montant sur l'écran verrouillé).

iOS : le push fonctionne à partir d'iOS 16.4, uniquement depuis l'app installée sur l'écran d'accueil.

## Hébergement

- HTTPS obligatoire (le SW ne s'enregistre pas sinon).
- Réécriture SPA : toutes les routes → `index.html`.
- En-têtes conseillés : `sw.js` et `index.html` en `Cache-Control: no-cache` ;
  `/assets/*` en `Cache-Control: public, max-age=31536000, immutable`.
