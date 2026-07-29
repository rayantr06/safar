"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRole } from "@/lib/utils/auth-check";


export async function toggleExperienceStatus(id: string, isPublished: boolean) {
  const { user, role } = await checkRole(["provider", "admin"]);
  const supabase = await createClient();

  if (role === "provider") {
    const { data: exp } = await supabase.from("experiences").select("boat_id, boats(provider_id)").eq("id", id).single() as any;
    if (exp?.boats?.provider_id !== user.id) {
      throw new Error("Non autorisé");
    }
  }

  const { error } = await (supabase as any)
    .from("experiences")
    .update({ is_published: isPublished })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/partner/boats");
  revalidatePath("/admin/experiences");
  revalidatePath("/experiences");
  revalidatePath("/");
  return { success: true };
}

const CONTENT_STATUSES = ["draft", "published", "hidden", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export async function setExperienceStatus(id: string, status: ContentStatus) {
  const { user, role } = await checkRole(["provider", "admin"]);
  const supabase = await createClient();

  if (role === "provider") {
    const { data: exp } = await supabase.from("experiences").select("boat_id, boats(provider_id)").eq("id", id).single() as any;
    if (exp?.boats?.provider_id !== user.id) {
      throw new Error("Non autorisé");
    }
  }

  // The `status` column drives is_published via a DB trigger (migration 004),
  // so a single write here keeps both in sync.
  const { error } = await (supabase as any)
    .from("experiences")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/partner/boats");
  revalidatePath("/admin/experiences");
  revalidatePath("/experiences");
  revalidatePath("/");
  return { success: true };
}

export async function deleteExperience(id: string) {
  await checkRole(["admin"]);
  const supabase = await createClient();

  const { count } = await (supabase as any)
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("experience_id", id);
  if (count && count > 0) {
    return { success: false, error: "Impossible de supprimer : cette expérience a des réservations. Archivez-la à la place." };
  }

  const { error } = await (supabase as any).from("experiences").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/experiences");
  revalidatePath("/experiences");
  revalidatePath("/");
  return { success: true };
}

export async function saveExperience(id: string, updates: any) {
  try {
    const { user, role } = await checkRole(["provider", "admin"]);
    const supabase = await createClient();

    if (role === "provider") {
      const { data: exp } = await supabase.from("experiences").select("boat_id, boats(provider_id)").eq("id", id).single() as any;
      if (exp?.boats?.provider_id !== user.id) {
        return { success: false, error: "Non autorisé" };
      }
    }

    // Generate slug if title changed
    let slug: string | undefined;
    if (updates.title) {
      slug = updates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (!slug) slug = "exp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    }

    const mappedUpdates: Record<string, any> = {};
    const allowedUpdateColumns = [
      "title", "price_total", "price_per_seat", "duration_minutes", "max_guests",
      "is_published", "description", "type", "destination_id", "boat_id",
      "main_image_url", "category", "included_services", "requirements",
      "departure_location", "route_description", "badge", "status",
    ];
    for (const key of allowedUpdateColumns) {
      if (updates[key] !== undefined) {
        mappedUpdates[key] = updates[key];
      }
    }
    if (slug) mappedUpdates.slug = slug;

    const { error } = await (supabase as any)
      .from("experiences")
      .update(mappedUpdates)
      .eq("id", id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/partner/boats");
    revalidatePath("/admin/experiences");
    revalidatePath("/experiences");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("saveExperience error:", err);
    return { success: false, error: err.message || "Erreur inconnue" };
  }
}

export async function createExperience(experience: any) {
  try {
    const { user, role } = await checkRole(["provider", "admin"]);
    const supabase = await createClient();

    if (role === "provider") {
      experience.provider_id = user.id;
      const { data: boat } = await supabase.from("boats").select("provider_id").eq("id", experience.boat_id).single() as any;
      if (boat && boat.provider_id !== user.id) {
        return { success: false, error: "Non autorisé : Ce navire ne vous appartient pas" };
      }
    }

    // Generate slug from title if not provided
    let slug = experience.slug;
    if (!slug && experience.title) {
      slug = experience.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
    if (!slug) {
      slug = "exp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    }

    // Strip fields that don't exist as columns on the experiences table
    const allowedColumns = [
      "title", "slug", "type", "category", "price_total", "price_per_seat",
      "duration_minutes", "max_guests", "is_published", "status",
      "description", "destination_id", "boat_id", "main_image_url",
      "included_services", "requirements", "departure_location",
      "route_description", "badge",
    ];
    const insertPayload: Record<string, any> = {};
    for (const key of allowedColumns) {
      if (experience[key] !== undefined) {
        insertPayload[key] = experience[key];
      }
    }
    insertPayload.slug = slug;

    const { data, error } = await (supabase as any)
      .from("experiences")
      .insert(insertPayload)
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    revalidatePath("/partner/boats");
    revalidatePath("/admin/experiences");
    revalidatePath("/experiences");
    revalidatePath("/");
    return { success: true, data };
  } catch (err: any) {
    console.error("createExperience error:", err);
    return { success: false, error: err.message || "Erreur inconnue" };
  }
}

export async function validatePartner(id: string, status: "active" | "pending") {
  await checkRole(["admin"]);
  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from("providers")
    .update({ is_active: status === "active" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/partners");
  return { success: true };
}

export async function toggleDestinationStatus(id: string, isActive: boolean) {
  await checkRole(["admin"]);
  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from("destinations")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/destinations");
  revalidatePath("/destinations");
  revalidatePath("/");
  return { success: true };
}

export async function setDestinationStatus(id: string, status: ContentStatus) {
  await checkRole(["admin"]);
  const supabase = await createClient();

  // The `status` column drives is_active via a DB trigger (migration 004).
  const { error } = await (supabase as any)
    .from("destinations")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/destinations");
  revalidatePath("/destinations");
  revalidatePath("/");
  return { success: true };
}

export async function deleteDestination(id: string) {
  await checkRole(["admin"]);
  const supabase = await createClient();

  const { count } = await (supabase as any)
    .from("experiences")
    .select("id", { count: "exact", head: true })
    .eq("destination_id", id);
  if (count && count > 0) {
    return { success: false, error: "Impossible de supprimer : des expériences sont rattachées à cette destination. Archivez-la à la place." };
  }

  const { error } = await (supabase as any).from("destinations").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/destinations");
  revalidatePath("/destinations");
  revalidatePath("/");
  return { success: true };
}

export async function toggleDestinationFeatured(id: string, isFeatured: boolean) {
  await checkRole(["admin"]);
  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from("destinations")
    .update({ is_featured: isFeatured })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/destinations");
  revalidatePath("/destinations");
  revalidatePath("/");
  return { success: true };
}

export async function saveDestination(id: string, updates: any) {
  await checkRole(["admin"]);
  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from("destinations")
    .update(updates)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/destinations");
  revalidatePath("/destinations");
  revalidatePath("/");
  return { success: true };
}

export async function createDestination(destination: any) {
  await checkRole(["admin"]);
  const supabase = await createClient();

  const { id: _tempId, ...destinationPayload } = destination;
  const { data, error } = await (supabase as any)
    .from("destinations")
    .insert(destinationPayload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/destinations");
  revalidatePath("/destinations");
  revalidatePath("/");
  return { success: true, data };
}

export async function updateCommissionRate(rate: number) {
  await checkRole(["admin"]);
  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from("providers")
    .update({
      commission_rate: rate,
      commission_last_modified: new Date().toISOString(),
    })
    .neq("id", "");

  if (error) throw new Error(error.message);

  revalidatePath("/admin/finance");
  return { success: true };
}

export async function savePartnerCommissionSettings(
  partnerId: string,
  settings: { commission_rate: number; effective_date: string; is_active: boolean }
) {
  await checkRole(["admin"]);
  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from("providers")
    .update({
      commission_rate: settings.commission_rate,
      commission_effective_date: settings.effective_date,
      commission_status: settings.is_active ? "active" : "inactive",
      commission_last_modified: new Date().toISOString(),
      is_active: settings.is_active
    })
    .eq("id", partnerId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/partners");
  return { success: true };
}
