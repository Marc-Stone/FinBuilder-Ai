import { supabase } from "@/lib/supabaseClient";

export type AiTurn = { role: "user" | "assistant"; content: string };

export type AiResult =
  | { ok: true; reply: string }
  | { ok: false; reason: "not_configured" | "quota" | "busy" | "error"; message: string };

/**
 * Pose une question libre au Coach IA (fonction Edge « assistant-chat »).
 * La clé du fournisseur d'IA reste côté serveur ; le contexte financier est
 * calculé côté serveur à partir des données de l'utilisateur (RLS).
 */
export async function askCoachAi(history: AiTurn[], profileLabel?: string): Promise<AiResult> {
  try {
    const { data, error } = await supabase.functions.invoke("assistant-chat", {
      body: { messages: history.slice(-10), profileLabel: profileLabel ?? "" },
    });

    if (!error && data && typeof data.reply === "string" && data.reply.trim()) {
      return { ok: true, reply: data.reply.trim() };
    }

    // Les erreurs HTTP de la fonction arrivent dans error.context (Response).
    let code = "";
    const context = (error as { context?: Response } | null)?.context;
    if (context && typeof context.json === "function") {
      try {
        const body = await context.clone().json();
        code = typeof body?.error === "string" ? body.error : "";
      } catch {
        code = "";
      }
    }

    if (code === "ai_not_configured") {
      return { ok: false, reason: "not_configured", message: "" };
    }
    if (code === "quota_exceeded") {
      return {
        ok: false,
        reason: "quota",
        message: "Vous avez atteint la limite de questions libres pour aujourd'hui. Revenez demain, ou décrivez un projet (« je veux acheter une maison… ») pour que je le planifie.",
      };
    }
    if (code === "provider_busy") {
      return {
        ok: false,
        reason: "busy",
        message: "Le coach IA est très sollicité en ce moment. Réessayez dans une minute.",
      };
    }
    return {
      ok: false,
      reason: "error",
      message: "Je n'ai pas pu joindre le coach IA. Vérifiez votre connexion puis réessayez.",
    };
  } catch {
    return {
      ok: false,
      reason: "error",
      message: "Je n'ai pas pu joindre le coach IA. Vérifiez votre connexion puis réessayez.",
    };
  }
}
