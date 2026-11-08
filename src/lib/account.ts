import { supabase } from "@/lib/supabaseClient";

async function callDeleteAccount(body: Record<string, unknown>): Promise<void> {
  const { data, error } = await supabase.functions.invoke("delete-account", { body });

  if (error) {
    let message = error.message;
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === "function") {
      const payload = await context.json().catch(() => null);
      if (payload && typeof payload.error === "string" && payload.error.trim()) {
        message = payload.error;
      }
    }
    throw new Error(message || "La suppression du compte a echoue.");
  }

  const payload = data as { ok?: boolean; error?: string } | null;
  if (payload?.error) throw new Error(payload.error);
  if (!payload?.ok) throw new Error("La suppression du compte n'a pas abouti.");
}

/** Le titulaire supprime son propre compte et toutes ses donnees financieres. */
export async function deleteMyAccount(): Promise<void> {
  await callDeleteAccount({});
}

/** Un administrateur supprime le compte d'un utilisateur (jamais un compte admin). */
export async function deleteUserAccount(userId: string): Promise<void> {
  await callDeleteAccount({ userId });
}