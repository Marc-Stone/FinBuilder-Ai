import { useRef, useState, type ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getDisplayName, getInitials, useAuth } from "@/hooks/useAuth";

const BUCKET = "avatars";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function resizeToJpeg(file: File, maxSize = 512): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Votre navigateur ne permet pas de préparer l'image.");

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("La conversion de l'image a échoué."));
      },
      "image/jpeg",
      0.9,
    );
  });
}

export default function AvatarUploader() {
  const { profile, session, refreshProfile } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const avatarUrl = preview ?? profile?.avatar_url ?? null;
  const busy = uploading || removing;

  const handleSelect = () => {
    if (busy) return;
    setError("");
    setSuccess("");
    inputRef.current?.click();
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setSuccess("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Format non pris en charge. Choisissez une image JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Cette image dépasse 5 Mo. Choisissez un fichier plus léger.");
      return;
    }

    const userId = session?.user?.id;
    if (!userId) {
      setError("Session expirée. Reconnectez-vous pour modifier votre photo.");
      return;
    }

    setUploading(true);
    try {
      const blob = await resizeToJpeg(file);
      const objectPath = `${userId}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, blob, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpeg",
      });
      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
      const finalUrl = `${publicUrl.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: finalUrl, updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (updateError) throw updateError;

      setPreview(finalUrl);
      await refreshProfile();
      setSuccess("Votre photo de profil a été mise à jour.");
    } catch (uploadFailure) {
      setError(
        uploadFailure instanceof Error
          ? `Envoi impossible : ${uploadFailure.message}`
          : "Envoi impossible. Réessayez dans un instant.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    const userId = session?.user?.id;
    if (!userId || busy) return;

    setError("");
    setSuccess("");
    setRemoving(true);
    try {
      await supabase.storage.from(BUCKET).remove([`${userId}/avatar.jpg`]);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (updateError) throw updateError;

      setPreview(null);
      await refreshProfile();
      setSuccess("Photo de profil supprimée.");
    } catch (removeFailure) {
      setError(
        removeFailure instanceof Error
          ? `Suppression impossible : ${removeFailure.message}`
          : "Suppression impossible. Réessayez dans un instant.",
      );
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 border-b border-background-200 pb-4 text-center sm:flex-row sm:items-start sm:text-left">
      <div className="relative shrink-0">
        <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full border border-background-200 bg-primary-500">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Photo de profil"
              title="Photo de profil FinBuilder AI"
              className="h-full w-full object-top"
            />
          ) : (
            <span className="text-2xl font-semibold text-background-50">{getInitials(profile)}</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSelect}
          aria-label="Changer la photo de profil"
          disabled={busy}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-background-50 bg-primary-500 text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {uploading ? (
            <i className="ri-loader-4-line animate-spin text-sm" />
          ) : (
            <i className="ri-camera-line text-sm" />
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          className="hidden"
          aria-label="Sélectionner une image de profil"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground-950">
          {getDisplayName(profile) || "Mon compte"}
        </p>
        <p className="truncate text-xs text-foreground-500">{profile?.email}</p>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-800">
          {profile?.role === "admin" || profile?.admin_role_id ? "Administrateur" : "Membre gratuit"}
        </span>

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
          <button
            type="button"
            onClick={handleSelect}
            disabled={busy}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-primary-300 bg-primary-50 px-2.5 py-1.5 text-[11px] font-semibold text-primary-800 transition-colors hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className="ri-upload-2-line text-xs" />
            {profile?.avatar_url ? "Changer la photo" : "Ajouter une photo"}
          </button>
          {profile?.avatar_url && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 px-2.5 py-1.5 text-[11px] font-semibold text-foreground-600 transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {removing ? (
                <i className="ri-loader-4-line animate-spin text-xs" />
              ) : (
                <i className="ri-delete-bin-line text-xs" />
              )}
              Retirer
            </button>
          )}
        </div>

        <p className="mt-1.5 text-[10px] leading-relaxed text-foreground-400">
          JPG, PNG ou WEBP — 5 Mo max.
        </p>

        {error && (
          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-accent-700">
            <i className="ri-error-warning-line mt-0.5 text-xs" />
            <span>{error}</span>
          </p>
        )}
        {success && (
          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-primary-700">
            <i className="ri-checkbox-circle-line mt-0.5 text-xs" />
            <span>{success}</span>
          </p>
        )}
      </div>
    </div>
  );
}