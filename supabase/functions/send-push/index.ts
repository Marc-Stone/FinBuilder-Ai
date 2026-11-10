/**
 * FinBuilder AI — envoi de notifications Web Push.
 *
 * Appel réservé au serveur (cron Supabase, trigger, console d'administration côté serveur) :
 * l'en-tête Authorization doit porter la clé service_role. Un utilisateur connecté
 * ne peut PAS déclencher d'envoi vers un autre compte.
 *
 * Corps attendu :
 *   { "user_id": "<uuid>", "type": "budget_depasse" | "objectif_atteint" | "rappel_financier" | "conseil_coach",
 *     "url": "/app/budget" (optionnel, chemin interne uniquement) }
 *
 * Les textes sont choisis ici, par type : aucun montant ni détail financier
 * n'apparaît sur l'écran verrouillé. L'utilisateur consulte le détail dans l'app, après authentification.
 *
 * Secrets requis (supabase secrets set ...) :
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (ex. "mailto:support@votre-domaine")
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MESSAGES: Record<string, { title: string; body: string; url: string; tag: string }> = {
  budget_depasse: {
    title: "Alerte budget",
    body: "Une de vos catégories a dépassé le budget prévu. Ouvrez FinBuilder pour voir le détail.",
    url: "/app/budget",
    tag: "budget",
  },
  objectif_atteint: {
    title: "Objectif atteint 🎉",
    body: "Bravo ! Un de vos objectifs financiers vient d'être atteint.",
    url: "/app/objectifs",
    tag: "objectif",
  },
  rappel_financier: {
    title: "Rappel FinBuilder",
    body: "Pensez à mettre à jour vos revenus et dépenses de la semaine.",
    url: "/app",
    tag: "rappel",
  },
  conseil_coach: {
    title: "Conseil du Coach IA",
    body: "Votre coach a un nouveau conseil personnalisé pour vous.",
    url: "/app/assistant",
    tag: "coach",
  },
};

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Methode non autorisee." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");

  if (!supabaseUrl || !serviceKey || !vapidPublic || !vapidPrivate || !vapidSubject) {
    return json({ error: "Configuration serveur incomplete." }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token || !safeEqual(token, serviceKey)) {
    return json({ error: "Acces reserve au serveur." }, 403);
  }

  let payload: { user_id?: unknown; type?: unknown; url?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Corps JSON invalide." }, 400);
  }

  const userId = typeof payload.user_id === "string" ? payload.user_id : "";
  const type = typeof payload.type === "string" ? payload.type : "";
  if (!UUID_PATTERN.test(userId)) return json({ error: "user_id invalide." }, 400);
  const template = MESSAGES[type];
  if (!template) return json({ error: "type inconnu." }, 400);

  // Chemin interne uniquement (pas d'URL externe dans une notification).
  const url =
    typeof payload.url === "string" && /^\/app(\/[a-z0-9\-/]*)?$/i.test(payload.url)
      ? payload.url
      : template.url;

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: subscriptions, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);
  if (error) return json({ error: "Lecture des abonnements impossible." }, 500);

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
  const message = JSON.stringify({ title: template.title, body: template.body, url, tag: template.tag, type });

  let sent = 0;
  const expired: string[] = [];
  await Promise.all(
    (subscriptions ?? []).map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          message,
          { TTL: 60 * 60 * 24, urgency: type === "budget_depasse" ? "high" : "normal" },
        );
        sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) expired.push(sub.id);
      }
    }),
  );

  if (expired.length > 0) {
    await admin.from("push_subscriptions").delete().in("id", expired);
  }

  return json({ sent, removed: expired.length });
});
