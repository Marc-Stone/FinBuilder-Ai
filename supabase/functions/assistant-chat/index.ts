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
 *   AI_MODEL     (défaut : gemini-3.5-flash-lite — le plus rapide ; gemini-3.8-flash = plus fin mais plus lent)
 *   AI_DAILY_LIMIT (défaut : 30 messages par utilisateur et par jour)
 *   AI_REASONING_EFFORT (facultatif, Gemini : minimal | low | medium | high — non envoyé si absent)
 *
 * Sécurité / confidentialité :
 *   - Session obligatoire ; les données sont lues avec le jeton de l'utilisateur (RLS appliquée).
 *   - Transmis au fournisseur d'IA : totaux du mois et par catégorie, objectifs et projets (nom, montants,
 *     échéance). Jamais : nom ou email de l'utilisateur, ni libellés ou détails des dépenses.
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
  const aiModel = Deno.env.get("AI_MODEL") || "gemini-3.5-flash-lite";
  const dailyLimit = Number(Deno.env.get("AI_DAILY_LIMIT") || "30");
  // Réglage facultatif de la « réflexion » Gemini : envoyé uniquement s'il est configuré,
  // car tous les modèles ne l'acceptent pas.
  const isGemini = aiBaseUrl.includes("generativelanguage.googleapis.com");
  const reasoningEffort = Deno.env.get("AI_REASONING_EFFORT") || "";

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

  // Contexte financier réel, lu avec les droits de l'utilisateur (RLS).
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // AAAA-MM
  const since = monthsAgoIso(2); // mois en cours + 2 mois précédents
  const [profileRes, incomeRes, expenseRes, goalsRes, projectsRes] = await Promise.all([
    userClient.from("profiles").select("devise, pays, budget_rule").eq("id", userId).maybeSingle(),
    userClient.from("income").select("montant, date").gte("date", since),
    userClient.from("expenses").select("montant, date, categorie").gte("date", since),
    userClient
      .from("goals")
      .select("nom, categorie, montant_objectif, montant_actuel, date_limite, statut")
      .order("date_limite", { ascending: true })
      .limit(8),
    userClient
      .from("projects")
      .select("nom, statut, budget_total, montant_finance, date_fin")
      .in("statut", ["preparation", "en_cours"])
      .limit(5),
  ]);

  // Diagnostic sans aucun montant : nombre de lignes lues et erreurs éventuelles.
  const readErrors = [profileRes.error, incomeRes.error, expenseRes.error, goalsRes.error, projectsRes.error]
    .filter(Boolean)
    .map((error) => error?.message)
    .join(" | ");
  console.log(
    `[assistant-chat] contexte : revenus=${incomeRes.data?.length ?? "err"} dépenses=${
      expenseRes.data?.length ?? "err"
    } objectifs=${goalsRes.data?.length ?? "err"} projets=${projectsRes.data?.length ?? "err"}${
      readErrors ? ` erreurs=${readErrors}` : ""
    }`,
  );

  const profile = (profileRes.data ?? {}) as { devise?: string; pays?: string; budget_rule?: string };
  const devise = profile.devise || "FCFA";
  const rule8020 = profile.budget_rule === "80-20";
  const income = (incomeRes.data ?? []) as { montant: number; date: string }[];
  const expenses = (expenseRes.data ?? []) as { montant: number; date: string; categorie: string }[];
  const goals = (goalsRes.data ?? []) as {
    nom: string;
    categorie: string;
    montant_objectif: number;
    montant_actuel: number;
    date_limite: string | null;
    statut: string;
  }[];
  const projects = (projectsRes.data ?? []) as {
    nom: string;
    statut: string;
    budget_total: number;
    montant_finance: number;
    date_fin: string | null;
  }[];

  const amount = (value: unknown) => Number(value) || 0;
  const monthOf = (date: string) => String(date).slice(0, 7);

  // Mois en cours : chiffres exacts.
  const monthIncome = income
    .filter((row) => monthOf(row.date) === currentMonth)
    .reduce((sum, row) => sum + amount(row.montant), 0);
  const monthByCategory: Record<string, number> = {};
  expenses
    .filter((row) => monthOf(row.date) === currentMonth)
    .forEach((row) => {
      monthByCategory[row.categorie] = (monthByCategory[row.categorie] ?? 0) + amount(row.montant);
    });
  const monthSavings = monthByCategory.epargne ?? 0;
  const monthSpending =
    Object.values(monthByCategory).reduce((sum, value) => sum + value, 0) - monthSavings;

  // Moyenne : divisée par le nombre de mois qui contiennent réellement des données.
  const months = new Set([...income, ...expenses].map((row) => monthOf(row.date)));
  const monthCount = Math.max(months.size, 1);
  const avgIncome = income.reduce((sum, row) => sum + amount(row.montant), 0) / monthCount;
  const avgSpending =
    expenses
      .filter((row) => row.categorie !== "epargne")
      .reduce((sum, row) => sum + amount(row.montant), 0) / monthCount;

  const topCategories = Object.entries(monthByCategory)
    .filter(([key]) => key !== "epargne")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, value]) => `${key} ${fmt(value, devise)}`)
    .join(", ");

  // Budget recommandé selon la règle choisie (revenu du mois, sinon la moyenne).
  const reference = monthIncome > 0 ? monthIncome : avgIncome;
  const budgetLine =
    reference <= 0
      ? ""
      : rule8020
        ? `Budget recommandé (80/20) sur ${fmt(reference, devise)} : dépenses ${fmt(reference * 0.8, devise)}, épargne ${fmt(reference * 0.2, devise)}.`
        : `Budget recommandé (50/30/20) sur ${fmt(reference, devise)} : besoins ${fmt(reference * 0.5, devise)}, envies ${fmt(reference * 0.3, devise)}, épargne ${fmt(reference * 0.2, devise)}.`;

  const goalsLine = goals.length
    ? `Objectifs : ${goals
        .map((goal) => {
          const target = amount(goal.montant_objectif);
          const saved = amount(goal.montant_actuel);
          const pct = target > 0 ? Math.round((saved / target) * 100) : 0;
          return `« ${goal.nom} » (${goal.categorie}, ${goal.statut}) : ${fmt(saved, devise)} sur ${fmt(target, devise)}, soit ${pct} %${
            goal.date_limite ? `, échéance ${goal.date_limite}` : ""
          }`;
        })
        .join(" ; ")}.`
    : "Aucun objectif enregistré.";

  const projectsLine = projects.length
    ? `Projets en cours : ${projects
        .map(
          (project) =>
            `« ${project.nom} » : financé ${fmt(amount(project.montant_finance), devise)} sur ${fmt(amount(project.budget_total), devise)}${
              project.date_fin ? `, fin prévue ${project.date_fin}` : ""
            }`,
        )
        .join(" ; ")}.`
    : "";

  const context = [
    `Date du jour : ${now.toISOString().slice(0, 10)}. Devise : ${devise}.${profile.pays ? ` Pays : ${profile.pays}.` : ""}`,
    profileLabel ? `Profil financier : ${profileLabel}.` : "",
    `Règle de budget choisie : ${rule8020 ? "80/20" : "50/30/20"}.`,
    income.length || expenses.length
      ? `Ce mois-ci (${currentMonth}) : revenus ${fmt(monthIncome, devise)}, dépenses ${fmt(monthSpending, devise)}, épargne versée ${fmt(monthSavings, devise)}, reste disponible ${fmt(monthIncome - monthSpending - monthSavings, devise)}.`
      : "Aucun revenu ni dépense enregistré sur les 3 derniers mois.",
    topCategories ? `Dépenses du mois par catégorie : ${topCategories}.` : "",
    months.size > 1
      ? `Moyenne sur ${months.size} mois : revenus ${fmt(avgIncome, devise)} par mois, dépenses ${fmt(avgSpending, devise)} par mois, capacité d'épargne ${fmt(Math.max(avgIncome - avgSpending, 0), devise)} par mois.`
      : "",
    budgetLine,
    goalsLine,
    projectsLine,
  ]
    .filter(Boolean)
    .join("\n");

  const systemPrompt = `Tu es le Coach IA de FinBuilder AI, une application de gestion financière personnelle pour l'Afrique francophone.
Réponds toujours en français, de façon claire, chaleureuse et concrète, en 120 à 220 mots maximum, avec des montants en ${devise} quand c'est utile.
Appuie-toi en priorité sur la situation RÉELLE de l'utilisateur ci-dessous : cite ses vrais montants, ses objectifs et ses projets par leur nom. Si une donnée manque, dis-le et invite-le à la saisir dans l'application ; n'invente jamais de chiffres et ne demande jamais de données sensibles (mot de passe, code, numéro de carte).
Tu peux renvoyer vers les modules de l'application : Revenus, Dépenses, Budget intelligent (règles 50/30/20 ou 80/20), Objectifs, Projets, Simulations, Conseiller logement, Rapports, Éducation financière.
Pour créer un objectif ou un projet, invite l'utilisateur à écrire une phrase du type « je veux acheter une maison à 15 millions dans 3 ans ».
Tu donnes des informations générales : pas de recommandation d'achat d'un produit financier précis, et pour un sujet fiscal ou juridique complexe, conseille un professionnel.
Si la question n'a aucun rapport avec l'argent, la gestion ou les projets de vie, réponds brièvement puis ramène vers ton rôle.

Situation de l'utilisateur :
${context}`;

  const startedAt = Date.now();
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
        ...(isGemini && reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
      }),
    });

    console.log(`[assistant-chat] ${aiModel} → HTTP ${aiResponse.status} en ${Date.now() - startedAt} ms`);

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
    console.error(
      "[assistant-chat]",
      aiModel,
      timedOut ? `délai dépassé (${Date.now() - startedAt} ms)` : error,
    );
    return json({ error: timedOut ? "provider_busy" : "provider_error" }, 504);
  }
});
