import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return json({ error: "Methode non autorisee." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: "Configuration serveur incomplete." }, 500);
  }

  // La bibliotheque est reservee aux utilisateurs connectes : la session est
  // validee avant tout acces privilegie.
  const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return json({ error: "Session requise pour cette operation." }, 401);
  }

  try {
    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: callerData, error: callerError } = await authClient.auth.getUser(token);

    if (callerError || !callerData.user) {
      return json({ error: "Session invalide ou expiree." }, 401);
    }

    const client = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await client
      .from("admin_contents")
      .select("id, titre, resume, contenu, categorie, url, date_publication")
      .eq("type", "fiche")
      .eq("statut", "publie")
      .order("date_publication", { ascending: false });

    if (error) {
      return json({ error: error.message }, 500);
    }

    return json(data ?? []);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Erreur inconnue" }, 500);
  }
});
