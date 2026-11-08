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

  // Client anonyme : uniquement pour identifier l'appelant.
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerData, error: callerError } = await authClient.auth.getUser(token);

  if (callerError || !callerData.user) {
    return json({ error: "Session invalide ou expiree." }, 401);
  }

  // Client privilegie : uniquement pour les ecritures de privileges.
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const callerId = callerData.user.id;

    const { data: callerProfile, error: callerProfileError } = await adminClient
      .from("profiles")
      .select("id, email, role, admin_role_id")
      .eq("id", callerId)
      .maybeSingle();

    if (callerProfileError) {
      return json({ error: "Impossible de verifier vos droits." }, 500);
    }

    let allowed = callerProfile?.role === "admin" && !callerProfile?.admin_role_id;

    if (!allowed && callerProfile?.admin_role_id) {
      const { data: callerRole } = await adminClient
        .from("admin_roles")
        .select("permissions")
        .eq("id", callerProfile.admin_role_id)
        .maybeSingle();
      allowed = parsePermissions(callerRole?.permissions).includes("security");
    }

    if (!allowed) {
      return json(
        { error: "Votre profil n'autorise pas la gestion des acces." },
        403,
      );
    }

    let payload: { userId?: unknown; roleId?: unknown } = {};
    try {
      payload = await req.json();
    } catch {
      return json({ error: "Requete invalide." }, 400);
    }

    const targetId = typeof payload.userId === "string" ? payload.userId.trim() : "";
    const rawRoleId = payload.roleId;

    if (!UUID_PATTERN.test(targetId)) {
      return json({ error: "Compte cible invalide." }, 400);
    }

    let roleId: string | null = null;

    if (rawRoleId !== null && rawRoleId !== undefined && rawRoleId !== "") {
      if (typeof rawRoleId !== "string" || !UUID_PATTERN.test(rawRoleId.trim())) {
        return json({ error: "Role invalide." }, 400);
      }
      roleId = rawRoleId.trim();
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

    const targetIsOwner = targetProfile.role === "admin" && !targetProfile.admin_role_id;

    if (targetIsOwner) {
      return json(
        { error: "Le compte administrateur principal conserve toujours son acces a la console." },
        403,
      );
    }

    if (targetId === callerId) {
      return json(
        { error: "Vous ne pouvez pas modifier votre propre niveau d'acces." },
        403,
      );
    }

    if (roleId) {
      const { data: roleRow, error: roleError } = await adminClient
        .from("admin_roles")
        .select("id, nom")
        .eq("id", roleId)
        .maybeSingle();

      if (roleError) {
        return json({ error: "Impossible de verifier le role demande." }, 500);
      }

      if (!roleRow) {
        return json({ error: "Ce role n'existe plus." }, 404);
      }
    }

    const { error: updateError } = await adminClient
      .from("profiles")
      .update(
        roleId
          ? { admin_role_id: roleId, updated_at: new Date().toISOString() }
          : { admin_role_id: null, role: "user", updated_at: new Date().toISOString() },
      )
      .eq("id", targetId);

    if (updateError) {
      return json({ error: `Le changement n'a pas ete enregistre : ${updateError.message}` }, 500);
    }

    if (roleId) {
      const { error: upsertError } = await adminClient
        .from("admins")
        .upsert({ user_id: targetId, role_id: roleId }, { onConflict: "user_id" });

      if (upsertError && upsertError.code !== "23505") {
        return json({ error: `Le role n'a pas pu etre rattache : ${upsertError.message}` }, 500);
      }
    } else {
      const { error: deleteError } = await adminClient
        .from("admins")
        .delete()
        .eq("user_id", targetId);

      if (deleteError) {
        return json({ error: `L'acces n'a pas pu etre retire : ${deleteError.message}` }, 500);
      }
    }

    await adminClient.from("admin_audit_logs").insert({
      action: roleId ? "attribuer_role" : "revoquer_acces",
      cible: targetProfile.email ?? targetId,
      email: callerProfile?.email ?? callerData.user.email ?? null,
      user_id: null,
      resultat: "succes",
      details: {
        compte: targetProfile.email ?? targetId,
        role_id: roleId,
      },
    });

    return json({ ok: true, admin_role_id: roleId });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Erreur inattendue." },
      500,
    );
  }
});
