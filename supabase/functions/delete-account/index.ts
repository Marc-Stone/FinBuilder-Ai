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

function parsePermissions(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((value): value is string => typeof value === "string");
  if (raw && typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .filter(([, value]) => value === true)
      .map(([key]) => key);
  }
  return [];
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ADMIN_PROTECTED =
  "Les comptes administrateurs ne peuvent pas etre supprimes. Retirez d'abord l'acces a la console.";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Methode non autorisee." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: "Configuration serveur incomplete." }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return json({ error: "Session requise pour cette operation." }, 401);
  }

  // Client anonyme : uniquement pour valider la session de l'appelant.
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerData, error: callerError } = await authClient.auth.getUser(token);

  if (callerError || !callerData.user) {
    return json({ error: "Session invalide ou expiree." }, 401);
  }

  const callerId = callerData.user.id;

  // Client privilegie : uniquement pour les operations de suppression.
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    let payload: { userId?: unknown } = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    const rawTarget = typeof payload.userId === "string" ? payload.userId.trim() : "";
    const targetId = rawTarget || callerId;

    if (!UUID_PATTERN.test(targetId)) {
      return json({ error: "Compte cible invalide." }, 400);
    }

    const isSelf = targetId === callerId;

    const { data: targetProfile, error: targetError } = await adminClient
      .from("profiles")
      .select("id, email, role, admin_role_id")
      .eq("id", targetId)
      .maybeSingle();

    if (targetError) {
      return json({ error: "Impossible de verifier le compte cible." }, 500);
    }

    if (!targetProfile) {
      return json({ error: "Ce compte n'existe pas ou a deja ete supprime." }, 404);
    }

    const targetIsAdmin =
      targetProfile.role === "admin" || Boolean(targetProfile.admin_role_id);

    if (targetIsAdmin) {
      return json({ error: ADMIN_PROTECTED }, 403);
    }

    let callerEmail: string | null = null;

    if (!isSelf) {
      const { data: callerProfile, error: callerProfileError } = await adminClient
        .from("profiles")
        .select("id, email, role, admin_role_id")
        .eq("id", callerId)
        .maybeSingle();

      if (callerProfileError) {
        return json({ error: "Impossible de verifier vos droits." }, 500);
      }

      callerEmail = (callerProfile?.email as string | null) ?? callerData.user.email ?? null;

      const isOwner = callerProfile?.role === "admin" && !callerProfile?.admin_role_id;
      let allowed = Boolean(isOwner);

      if (!allowed && callerProfile?.admin_role_id) {
        const { data: roleRow } = await adminClient
          .from("admin_roles")
          .select("permissions")
          .eq("id", callerProfile.admin_role_id)
          .maybeSingle();
        const permissions = parsePermissions(roleRow?.permissions);
        allowed = permissions.includes("users");
      }

      if (!allowed) {
        return json(
          { error: "Votre profil n'autorise pas la suppression d'un compte." },
          403,
        );
      }
    }

    // --- Suppression des donnees applicatives ---------------------------
    const cleanups: { table: string; column: string }[] = [
      { table: "expenses", column: "user_id" },
      { table: "income", column: "user_id" },
      { table: "goals", column: "user_id" },
      { table: "projects", column: "user_id" },
      { table: "financial_profiles", column: "user_id" },
      { table: "admins", column: "user_id" },
    ];

    for (const step of cleanups) {
      const { error } = await adminClient
        .from(step.table)
        .delete()
        .eq(step.column, targetId);
      if (error) {
        return json(
          { error: `Suppression interrompue (${step.table}) : ${error.message}` },
          500,
        );
      }
    }

    // --- Suppression de la photo de profil ------------------------------
    try {
      await adminClient.storage.from("avatars").remove([`${targetId}/avatar.jpg`]);
    } catch {
      // Aucune photo ou stockage indisponible : la suppression du compte continue.
    }

    // --- Trace dans le journal (conservee apres suppression) ------------
    await adminClient.from("admin_audit_logs").insert({
      action: isSelf ? "supprimer_compte" : "supprimer_utilisateur",
      cible: targetProfile.email ?? targetId,
      email: isSelf ? (targetProfile.email ?? null) : callerEmail,
      user_id: null,
      resultat: "succes",
      details: {
        compte_supprime: targetProfile.email ?? targetId,
        initiateur: isSelf ? "titulaire" : "administration",
      },
    });

    const { error: profileDeleteError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", targetId);

    if (profileDeleteError) {
      return json(
        { error: `Le profil n'a pas pu etre supprime : ${profileDeleteError.message}` },
        500,
      );
    }

    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(targetId);

    if (authDeleteError) {
      return json(
        {
          error:
            "Les donnees ont ete supprimees mais le compte de connexion n'a pas pu etre retire. Contactez le support.",
        },
        500,
      );
    }

    return json({ ok: true, mode: isSelf ? "self" : "admin" });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Erreur inattendue." },
      500,
    );
  }
});
