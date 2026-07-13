"use server";

import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRole } from "@/lib/utils/auth-check";

const BUCKET = "media";
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

const isPlaceholder = () =>
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

export type UploadableEntity = "experiences" | "destinations" | "accommodations" | "cms";

export async function uploadImage(entity: UploadableEntity, entityId: string, formData: FormData) {
  await checkRole(["admin", "provider"]);

  if (isPlaceholder()) {
    return {
      success: false,
      error: "L'upload d'images nécessite un projet Supabase réel (indisponible en mode local de démonstration). Utilisez le champ URL ci-dessous.",
    };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "Aucun fichier fourni." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Format d'image non supporté (JPEG, PNG, WEBP, AVIF, GIF uniquement)." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "L'image dépasse la taille maximale de 8 Mo." };
  }

  const admin = createAdminClient() as any;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${entity}/${entityId}/${randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await admin.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { success: true, url: publicUrlData.publicUrl as string, path };
}

export async function deleteImage(path: string) {
  await checkRole(["admin", "provider"]);

  const admin = createAdminClient() as any;
  const { error } = await admin.storage.from(BUCKET).remove([path]);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
