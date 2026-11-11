/**
 * FinBuilder AI — notifications push automatiques.
 *
 * Appelée UNIQUEMENT par la base de données (pg_cron / trigger via pg_net), avec l'en-tête
 * `x-scheduler-secret` vérifié contre le coffre-fort Supabase (Vault).
 * À déployer avec « Verify JWT » DÉSACTIVÉ : l'authentification est faite par ce secret.
 *
 *   { "job": "budget" }                 → chaque soir : budgets dépassés (règle 50/30/20 ou 80/20)
 *   { "job": "goal", "goal_id": "…" }   → dès qu'un objectif atteint 100 %
 *
 * Une seule notification par objectif, et une par bloc de budget et par mois (table push_log).
 * Les textes sont génériques : aucun montant sur l'écran verrouillé.
 *
 * Secrets requis (déjà présents pour send-push) : VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.
 */
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MESSAGES = {
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
} as const;

type MessageType = keyof typeof MESSAGES;

/* ---------- Règles de budget (miroir de src/lib/finance.ts et src/lib/budget.ts) ---------- */

type GroupKey = "besoins" | "envies" | "epargne";

const CATEGORY_GROUP: Record<string, GroupKey> = {
  logement: "besoins",
  alimentation: "besoins",
  transport: "besoins",
  factures: "besoins",
  sante: "besoins",
  education: "besoins",
  famille: "besoins",
  loisirs: "envies",
  shopping: "envies",
  autre: "envies",
  epargne: "epargne",
};

/** Blocs contrôlés (l'épargne n'est jamais « dépassée »). */
const RULE_BLOCKS: Record<string, { key: string; members: GroupKey[]; percent: number }[]> = {
  "50-30-20": [
    { key: "besoins", members: ["besoins"], percent: 50 },
    { key: "envies", members: ["envies"], percent: 30 },
  ],
  "80-20": [{ key: "depenses", members: ["besoins", "envies"], percent: 80 }],
};

/** Même tolérance que les alertes de l'application. */
const OVERRUN_TOLERANCE = 1.02;

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function isoDay(year: number, monthIndex: number): string {
  const d = new Date(Date.UTC(year, monthIndex, 1));
  return d.toISOString().slice(0, 10);
}

/* ---------- Envoi ---------- */

async function sendToUser(admin: SupabaseClient, userId: string, type: MessageType): Promise<number> {
  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  const template = MESSAGES[type];
  const message = JSON.stringify({ ...template, type });

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
  return sent;
}

/** Réserve l'envoi dans le journal ; faux si déjà envoyé (contrainte d'unicité). */
async function reserve(admin: SupabaseClient, userId: string, kind: string, ref: string): Promise<boolean> {
  const { error } = await admin.from("push_log").insert({ user_id: userId, kind, ref });
  return !error;
}

/* ---------- Tâches ---------- */

async function runGoal(admin: SupabaseClient, goalId: string) {
  const { data: goal } = await admin
    .from("goals")
    .select("id, user_id, montant_objectif, montant_actuel")
    .eq("id", goalId)
    .maybeSingle();

  if (!goal) return { sent: 0, reason: "objectif introuvable" };

  const target = Number(goal.montant_objectif) || 0;
  const saved = Number(goal.montant_actuel) || 0;
  if (target <= 0 || saved < target) return { sent: 0, reason: "objectif non atteint" };

  if (!(await reserve(admin, goal.user_id, "objectif_atteint", goal.id))) {
    return { sent: 0, reason: "déjà notifié" };
  }
  return { sent: await sendToUser(admin, goal.user_id, "objectif_atteint") };
}

async function runBudget(admin: SupabaseClient) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const currentKey = monthKey(now);
  const monthStart = isoDay(year, month);
  const nextMonthStart = isoDay(year, month + 1);
  const historyStart = isoDay(year, month - 11);

  const { data: subs, error } = await admin.from("push_subscriptions").select("user_id");
  if (error) throw new Error("Lecture des abonnements impossible.");

  const userIds = [...new Set((subs ?? []).map((row) => row.user_id as string))];
  let notified = 0;

  for (const userId of userIds) {
    try {
      const [{ data: profile }, { data: income }, { data: expenses }] = await Promise.all([
        admin.from("profiles").select("budget_rule").eq("id", userId).maybeSingle(),
        admin.from("income").select("montant, date").eq("user_id", userId).gte("date", historyStart),
        admin
          .from("expenses")
          .select("montant, categorie")
          .eq("user_id", userId)
          .gte("date", monthStart)
          .lt("date", nextMonthStart),
      ]);

      // Revenu de référence : moyenne des 3 derniers mois qui ont des revenus (comme l'application).
      const byMonth: Record<string, number> = {};
      (income ?? []).forEach((row) => {
        const key = String(row.date).slice(0, 7);
        byMonth[key] = (byMonth[key] ?? 0) + (Number(row.montant) || 0);
      });
      const months = Object.keys(byMonth).filter((key) => byMonth[key] > 0).sort().slice(-3);
      const reference = months.length
        ? Math.round(months.reduce((sum, key) => sum + byMonth[key], 0) / months.length)
        : byMonth[currentKey] ?? 0;
      if (reference <= 0) continue;

      const spentByGroup: Record<GroupKey, number> = { besoins: 0, envies: 0, epargne: 0 };
      (expenses ?? []).forEach((row) => {
        const group = CATEGORY_GROUP[String(row.categorie)] ?? "epargne";
        spentByGroup[group] += Number(row.montant) || 0;
      });

      const rule = profile?.budget_rule === "80-20" ? "80-20" : "50-30-20";
      const overrun = RULE_BLOCKS[rule].filter((block) => {
        const target = Math.round((reference * block.percent) / 100);
        const spent = block.members.reduce((sum, member) => sum + spentByGroup[member], 0);
        return target > 0 && spent > target * OVERRUN_TOLERANCE;
      });
      if (overrun.length === 0) continue;

      let isNew = false;
      for (const block of overrun) {
        if (await reserve(admin, userId, "budget_depasse", `${currentKey}:${block.key}`)) isNew = true;
      }
      if (isNew && (await sendToUser(admin, userId, "budget_depasse")) > 0) notified += 1;
    } catch (err) {
      console.error(`[push-scheduler] budget ${userId.slice(0, 8)} :`, err instanceof Error ? err.message : err);
    }
  }

  return { checked: userIds.length, notified };
}

/* ---------- Point d'entrée ---------- */

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Methode non autorisee." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");

  if (!supabaseUrl || !serviceKey || !vapidPublic || !vapidPrivate || !vapidSubject) {
    return json({ error: "Configuration serveur incomplete." }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const secret = req.headers.get("x-scheduler-secret") ?? "";
  const { data: ok } = await admin.rpc("push_scheduler_secret_ok", { candidate: secret });
  if (ok !== true) return json({ error: "Acces reserve au serveur." }, 403);

  let payload: { job?: unknown; goal_id?: unknown } = {};
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Corps JSON invalide." }, 400);
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  try {
    if (payload.job === "goal") {
      const goalId = typeof payload.goal_id === "string" ? payload.goal_id : "";
      if (!UUID_PATTERN.test(goalId)) return json({ error: "goal_id invalide." }, 400);
      const result = await runGoal(admin, goalId);
      console.log("[push-scheduler] objectif :", JSON.stringify(result));
      return json(result);
    }

    if (payload.job === "budget") {
      const result = await runBudget(admin);
      console.log("[push-scheduler] budget :", JSON.stringify(result));
      return json(result);
    }

    return json({ error: "job inconnu." }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Erreur inattendue." }, 500);
  }
});
