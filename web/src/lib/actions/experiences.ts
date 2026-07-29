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
  const { user, role } = await checkRole(["provider", "admin"]);
  const supabase = await createClient();

  if (role === "provider") {
    const { data: exp } = await supabase.from("experiences").select("boat_id, boats(provider_id)").eq("id", id).single() as any;
    if (exp?.boats?.provider_id !== user.id) {
      throw new Error("Non autorisé");
    }
  }

  const mappedUpdates: any = {};
  if (updates.title !== undefined) mappedUpdates.title = updates.title;
  if (updates.price_total !== undefined) mappedUpdates.price_total = updates.price_total;
  if (updates.price_per_seat !== undefined) mappedUpdates.price_per_seat = updates.price_per_seat;
  if (updates.duration_minutes !== undefined) mappedUpdates.duration_minutes = updates.duration_minutes;
  if (updates.max_guests !== undefined) mappedUpdates.max_guests = updates.max_guests;
  if (updates.is_published !== undefined) mappedUpdates.is_published = updates.is_published;
  if (updates.description !== undefined) mappedUpdates.description = updates.description;
  if (updates.type !== undefined) mappedUpdates.type = updates.type;
  if (updates.destination_id !== undefined) mappedUpdates.destination_id = updates.destination_id;
  if (updates.boat_id !== undefined) mappedUpdates.boat_id = updates.boat_id;
  if (updates.main_image_url !== undefined) mappedUpdates.main_image_url = updates.main_image_url;
  if (updates.category !== undefined) mappedUpdates.category = updates.category;
  if (updates.included_services !== undefined) mappedUpdates.included_services = updates.included_services;
  if (updates.requirements !== undefined) mappedUpdates.requirements = updates.requirements;
  if (updates.departure_location !== undefined) mappedUpdates.departure_location = updates.departure_location;
  if (updates.route_description !== undefined) mappedUpdates.route_description = updates.route_description;
  if (updates.images !== undefined) mappedUpdates.images = updates.images;

  const { error } = await (supabase as any)
    .from("experiences")
    .update(mappedUpdates)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/partner/boats");
  revalidatePath("/admin/experiences");
  revalidatePath("/experiences");
  revalidatePath("/");
  return { success: true };
}

export async function createExperience(experience: any) {
  const { user, role } = await checkRole(["provider", "admin"]);
  const supabase = await createClient();

  if (role === "provider") {
    experience.provider_id = user.id;
    const { data: boat } = await supabase.from("boats").select("provider_id").eq("id", experience.boat_id).single() as any;
    if (boat && boat.provider_id !== user.id) {
      throw new Error("Non autorisé : Ce navire ne vous appartient pas");
    }
  }

  // Strip fields that don't exist as columns on the experiences table
  const allowedColumns = [
    "title", "type", "category", "price_total", "price_per_seat",
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

  const { data, error } = await (supabase as any)
    .from("experiences")
    .insert(insertPayload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/partner/boats");
  revalidatePath("/admin/experiences");
  revalidatePath("/experiences");
  revalidatePath("/");
  return { success: true, data };
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
