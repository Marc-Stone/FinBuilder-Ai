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

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerData, error: callerError } = await authClient.auth.getUser(token);

  if (callerError || !callerData.user) {
    return json({ error: "Session invalide ou expiree." }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const callerId = callerData.user.id;

    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("id, role, admin_role_id")
      .eq("id", callerId)
      .maybeSingle();

    if (profileError) {
      return json({ error: "Impossible de verifier vos droits." }, 500);
    }

    const isOwner = callerProfile?.role === "admin" && !callerProfile?.admin_role_id;
    let allowed = Boolean(isOwner);

    if (!allowed && callerProfile?.admin_role_id) {
      const { data: roleRow } = await adminClient
        .from("admin_roles")
        .select("permissions")
        .eq("id", callerProfile.admin_role_id)
        .maybeSingle();
      allowed = parsePermissions(roleRow?.permissions).includes("security");
    }

    if (!allowed) {
      return json(
        { error: "Votre profil n'autorise pas la reinitialisation des mots de passe." },
        403,
      );
    }

    let payload: { userId?: unknown; password?: unknown } = {};
    try {
      payload = await req.json();
    } catch {
      return json({ error: "Requete invalide." }, 400);
    }

    const targetId = typeof payload.userId === "string" ? payload.userId.trim() : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    if (!UUID_PATTERN.test(targetId)) {
      return json({ error: "Compte cible invalide." }, 400);
    }

    if (password.length < 8) {
      return json({ error: "Le mot de passe doit contenir au moins 8 caracteres." }, 400);
    }

    if (password.length > 72) {
      return json({ error: "Le mot de passe ne peut pas depasser 72 caracteres." }, 400);
    }

    if (targetId === callerId) {
      return json(
        { error: "Utilisez la page de votre profil pour modifier votre propre mot de passe." },
        400,
      );
    }

    const { data: targetProfile, error: targetError } = await adminClient
      .from("profiles")
      .select("id, email, role, admin_role_id")
      .eq("id", targetId)
      .maybeSingle();

    if (targetError) {
      return json({ error: "Impossible de verifier le compte cible." }, 500);
    }

    if (!targetProfile) {
      return json({ error: "Ce compte n'existe pas." }, 404);
    }

    // Le compte administrateur principal ne peut pas etre repris par un membre
    // de la console : sa reinitialisation passe par la procedure de recuperation.
    if (targetProfile.role === "admin" && !targetProfile.admin_role_id) {
      return json(
        {
          error:
            "Le mot de passe de l'administrateur principal se change depuis son propre profil ou par la procedure de recuperation.",
        },
        403,
      );
    }

    // Un membre délégué ne peut pas reprendre le compte d'un autre membre de la console
    // (sinon il récupérerait ses permissions) : réservé à l'administrateur principal.
    if (!isOwner) {
      const { data: targetMembership } = await adminClient
        .from("admins")
        .select("user_id")
        .eq("user_id", targetId)
        .maybeSingle();
      if (targetProfile.admin_role_id || targetMembership) {
        return json(
          {
            error:
              "Le mot de passe d'un membre de la console ne peut etre reinitialise que par l'administrateur principal.",
          },
          403,
        );
      }
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(targetId, {
      password,
    });

    if (updateError) {
      return json({ error: updateError.message }, 400);
    }

    await adminClient.from("admin_audit_logs").insert({
      action: "reinitialiser_mot_de_passe",
      cible: targetProfile.email ?? targetId,
      email: callerData.user.email ?? null,
      user_id: null,
      resultat: "succes",
      details: { compte: targetProfile.email ?? targetId },
    });

    return json({ ok: true });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Erreur inattendue." },
      500,
    );
  }
});
