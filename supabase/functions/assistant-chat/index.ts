/**
 * FinBuilder AI — Coach IA conversationnel.
 *
 * Fournisseur par défaut : Google Gemini (clé créée sur Google AI Studio).
 * Compatible avec toute API au format « OpenAI Chat Completions » :
 *   - Google Gemini (défaut) : AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
 *   - Groq                   : AI_BASE_URL=https://api.groq.com/openai/v1
 *   - OpenAI                 : AI_BASE_URL=https://api.openai.com/v1
 *
 * Secrets (supabase secrets set ...) :
 *   AI_API_KEY   (obligatoire, jamais côté navigateur)
 *   AI_BASE_URL  (défaut : Google Gemini)
 *   AI_MODEL     (défaut : gemini-3.8-flash)
 *   AI_DAILY_LIMIT (défaut : 30 messages par utilisateur et par jour)
 *   AI_REASONING_EFFORT (Gemini uniquement, défaut : low — réponses rapides ; minimal | low | medium | high)
 *
 * Sécurité / confidentialité :
 *   - Session obligatoire ; les données sont lues avec le jeton de l'utilisateur (RLS appliquée).
 *   - Seuls des TOTAUX agrégés sont transmis au fournisseur d'IA : ni nom, ni email, ni libellé de dépense.
 */
import { createClient } from "npm:@supabase/supabase-js@2";

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

const MAX_HISTORY = 10;
const MAX_MESSAGE_CHARS = 1200;

type ChatTurn = { role: "user" | "assistant"; content: string };

function sanitizeHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is ChatTurn =>
        !!item &&
        typeof item === "object" &&
        ((item as ChatTurn).role === "user" || (item as ChatTurn).role === "assistant") &&
        typeof (item as ChatTurn).content === "string",
    )
    .map((item) => ({ role: item.role, content: item.content.trim().slice(0, MAX_MESSAGE_CHARS) }))
    .filter((item) => item.content.length > 0)
    .slice(-MAX_HISTORY);
}

const fmt = (value: number, devise: string) =>
  `${new Intl.NumberFormat("fr-FR").format(Math.round(value))} ${devise}`;

function monthsAgoIso(months: number): string {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months, 1));
  return date.toISOString().slice(0, 10);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Methode non autorisee." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const aiKey = Deno.env.get("AI_API_KEY");
  const aiBaseUrl = (Deno.env.get("AI_BASE_URL") || "https://generativelanguage.googleapis.com/v1beta/openai").replace(/\/+$/, "");
  const aiModel = Deno.env.get("AI_MODEL") || "gemini-3.8-flash";
  const dailyLimit = Number(Deno.env.get("AI_DAILY_LIMIT") || "30");
  // Gemini « réfléchit » avant de répondre : on limite cette réflexion pour rester rapide
  // (sinon la fonction peut dépasser la durée autorisée par Supabase → erreur 546).
  const isGemini = aiBaseUrl.includes("generativelanguage.googleapis.com");
  const reasoningEffort = Deno.env.get("AI_REASONING_EFFORT") || "low";

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: "Configuration serveur incomplete." }, 500);
  }
  if (!aiKey) {
    return json({ error: "ai_not_configured" }, 503);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Session requise." }, 401);

  // Client « utilisateur » : toutes les lectures passent par la RLS.
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "Session invalide ou expiree." }, 401);
  const userId = userData.user.id;

  let payload: { messages?: unknown; profileLabel?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Corps JSON invalide." }, 400);
  }

  const history = sanitizeHistory(payload.messages);
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return json({ error: "Message manquant." }, 400);
  }
  const profileLabel =
    typeof payload.profileLabel === "string" ? payload.profileLabel.slice(0, 60) : "";

  // Quota journalier (protège la facture du fournisseur d'IA).
  if (dailyLimit > 0) {
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: used, error: quotaError } = await adminClient.rpc("assistant_consume_quota", {
      p_user_id: userId,
      p_limit: dailyLimit,
    });
    // Table de quota absente : on continue sans bloquer l'utilisateur.
    if (!quotaError && typeof used === "number" && used > dailyLimit) {
      return json({ error: "quota_exceeded", limit: dailyLimit }, 429);
    }
  }

  // Contexte financier agrégé (3 derniers mois), lu avec les droits de l'utilisateur.
  const since = monthsAgoIso(2);
  const [profileRes, incomeRes, expenseRes, goalsRes] = await Promise.all([
    userClient.from("profiles").select("devise, pays, budget_rule").eq("id", userId).maybeSingle(),
    userClient.from("income").select("montant").gte("date", since),
    userClient.from("expenses").select("montant, categorie").gte("date", since),
    userClient
      .from("goals")
      .select("categorie, montant_objectif, montant_actuel, date_limite, statut")
      .eq("statut", "actif")
      .limit(5),
  ]);

  const profile = (profileRes.data ?? {}) as { devise?: string; pays?: string; budget_rule?: string };
  const devise = profile.devise || "FCFA";
  const income = (incomeRes.data ?? []) as { montant: number }[];
  const expenses = (expenseRes.data ?? []) as { montant: number; categorie: string }[];
  const goals = (goalsRes.data ?? []) as {
    categorie: string;
    montant_objectif: number;
    montant_actuel: number;
    date_limite: string | null;
  }[];

  const incomeAvg = income.reduce((sum, row) => sum + (Number(row.montant) || 0), 0) / 3;
  const byCategory: Record<string, number> = {};
  expenses.forEach((row) => {
    byCategory[row.categorie] = (byCategory[row.categorie] ?? 0) + (Number(row.montant) || 0) / 3;
  });
  const savingsAvg = byCategory.epargne ?? 0;
  const spendingAvg =
    Object.values(byCategory).reduce((sum, value) => sum + value, 0) - savingsAvg;
  const topCategories = Object.entries(byCategory)
    .filter(([key]) => key !== "epargne")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key, value]) => `${key} ${fmt(value, devise)}`)
    .join(", ");

  const context = [
    `Devise : ${devise}.${profile.pays ? ` Pays : ${profile.pays}.` : ""}`,
    profileLabel ? `Profil financier : ${profileLabel}.` : "",
    `Règle de budget choisie : ${profile.budget_rule === "80-20" ? "80/20" : "50/30/20"}.`,
    income.length || expenses.length
      ? `Moyennes mensuelles (3 derniers mois) : revenus ${fmt(incomeAvg, devise)}, dépenses ${fmt(spendingAvg, devise)}, épargne versée ${fmt(savingsAvg, devise)}, capacité d'épargne estimée ${fmt(Math.max(incomeAvg - spendingAvg, 0), devise)}.`
      : "Aucun revenu ni dépense enregistré pour l'instant.",
    topCategories ? `Principaux postes de dépense : ${topCategories}.` : "",
    goals.length
      ? `Objectifs actifs : ${goals
          .map(
            (goal) =>
              `${goal.categorie} (${fmt(goal.montant_actuel, devise)} / ${fmt(goal.montant_objectif, devise)}${
                goal.date_limite ? `, échéance ${goal.date_limite}` : ""
              })`,
          )
          .join(" ; ")}.`
      : "Aucun objectif actif.",
  ]
    .filter(Boolean)
    .join("\n");

  const systemPrompt = `Tu es le Coach IA de FinBuilder AI, une application de gestion financière personnelle pour l'Afrique francophone.
Réponds toujours en français, de façon claire, chaleureuse et concrète, en 120 à 220 mots maximum, avec des montants en ${devise} quand c'est utile.
Appuie-toi sur la situation de l'utilisateur ci-dessous ; ne l'invente pas et ne demande jamais de données sensibles (mot de passe, code, numéro de carte).
Tu peux renvoyer vers les modules de l'application : Revenus, Dépenses, Budget intelligent (règles 50/30/20 ou 80/20), Objectifs, Projets, Simulations, Conseiller logement, Rapports, Éducation financière.
Pour créer un objectif ou un projet, invite l'utilisateur à écrire une phrase du type « je veux acheter une maison à 15 millions dans 3 ans ».
Tu donnes des informations générales : pas de recommandation d'achat d'un produit financier précis, et pour un sujet fiscal ou juridique complexe, conseille un professionnel.
Si la question n'a aucun rapport avec l'argent, la gestion ou les projets de vie, réponds brièvement puis ramène vers ton rôle.

Situation de l'utilisateur :
${context}`;

  try {
    const aiResponse = await fetch(`${aiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiKey}` },
      // Le fournisseur ne doit jamais bloquer l'utilisateur : 25 s maximum.
      signal: AbortSignal.timeout(25_000),
      body: JSON.stringify({
        model: aiModel,
        messages: [{ role: "system", content: systemPrompt }, ...history],
        temperature: 0.5,
        // Marge suffisante : chez Gemini, la réflexion consomme une partie de ce budget.
        max_tokens: isGemini ? 2000 : 600,
        ...(isGemini ? { reasoning_effort: reasoningEffort } : {}),
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      console.error("[assistant-chat] fournisseur IA", status, (await aiResponse.text()).slice(0, 300));
      return json({ error: status === 429 ? "provider_busy" : "provider_error" }, 502);
    }

    const data = await aiResponse.json();
    const reply: string = data?.choices?.[0]?.message?.content?.trim?.() ?? "";
    if (!reply) {
      console.error("[assistant-chat] réponse vide", JSON.stringify(data).slice(0, 300));
      return json({ error: "provider_error" }, 502);
    }

    return json({ reply });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    console.error("[assistant-chat]", timedOut ? "délai dépassé (25 s)" : error);
    return json({ error: timedOut ? "provider_busy" : "provider_error" }, 504);
  }
});
