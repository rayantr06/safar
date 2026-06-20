"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import * as fs from "fs";
import * as path from "path";
import { checkRole } from "@/lib/utils/auth-check";

// Path to store mock database updates in development
const MOCK_DB_FILE = path.join(process.cwd(), ".safar-mock-db.json");

function getMockDb() {
  if (!fs.existsSync(MOCK_DB_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveMockDb(data: any) {
  try {
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write mock db", err);
  }
}

export async function toggleExperienceStatus(id: string, isPublished: boolean) {
  const { user, role } = await checkRole(["provider", "admin"]);
  const supabase = await createClient();
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  if (role === "provider") {
    if (isPlaceholder) {
      const db = getMockDb();
      const exp = db.experiences?.[id] || db.createdExperiences?.find((e: any) => e.id === id);
      const boatId = exp?.boat_id || id.replace("exp-auto-", "");
      const boat = db.boats?.[boatId];
      if (boat && boat.provider_id !== user.id) {
        throw new Error("Non autorisé : Ce navire ne vous appartient pas");
      }
    } else {
      const { data: exp } = await supabase.from("experiences").select("boat_id, boats(provider_id)").eq("id", id).single() as any;
      if (exp?.boats?.provider_id !== user.id) {
        throw new Error("Non autorisé");
      }
    }
  }

  if (isPlaceholder) {
    const db = getMockDb();
    if (!db.experiences) db.experiences = {};
    if (!db.experiences[id]) db.experiences[id] = {};
    db.experiences[id].is_published = isPublished;
    saveMockDb(db);
  } else {
    const { error } = await (supabase as any)
      .from("experiences")
      .update({ is_published: isPublished })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/partner/boats");
  revalidatePath("/admin/experiences");
  return { success: true };
}

export async function saveExperience(id: string, updates: any) {
  const { user, role } = await checkRole(["provider", "admin"]);
  const supabase = await createClient();
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  if (role === "provider") {
    if (isPlaceholder) {
      const db = getMockDb();
      const isCreated = id.startsWith("created-") || id.startsWith("new-");
      let boatId = updates.boat_id;
      if (!boatId) {
        if (isCreated) {
          const exp = db.createdExperiences?.find((e: any) => e.id === id);
          boatId = exp?.boat_id;
        } else {
          const exp = db.experiences?.[id];
          boatId = exp?.boat_id;
        }
      }
      const boat = db.boats?.[boatId];
      if (boat && boat.provider_id !== user.id) {
        throw new Error("Non autorisé : Ce navire ne vous appartient pas");
      }
    } else {
      const { data: exp } = await supabase.from("experiences").select("boat_id, boats(provider_id)").eq("id", id).single() as any;
      if (exp?.boats?.provider_id !== user.id) {
        throw new Error("Non autorisé");
      }
    }
  }

  if (isPlaceholder) {
    const db = getMockDb();
    const isCreated = id.startsWith("created-") || id.startsWith("new-");
    
    // Resolve partner details if partnerName or provider_id is updated
    let resolvedUpdates = { ...updates };
    if (updates.provider_id) {
      const partner = db.partners?.[updates.provider_id];
      if (partner) {
        resolvedUpdates.partnerName = partner.name;
        resolvedUpdates.partner = partner.name;
      }
    }
    if (updates.destination_id) {
      // destinations list mock
      const destinations: Record<string, string> = {
        "d1": "Cap Carbon",
        "d2": "Île des Pisans",
        "d3": "Gouraya",
        "d4": "Les Falaises"
      };
      resolvedUpdates.destinationName = destinations[updates.destination_id] || "Béjaïa";
      resolvedUpdates.destination = resolvedUpdates.destinationName;
    }

    if (isCreated) {
      if (!db.createdExperiences) db.createdExperiences = [];
      db.createdExperiences = db.createdExperiences.map((e: any) =>
        e.id === id ? { ...e, ...resolvedUpdates } : e
      );
    } else {
      if (!db.experiences) db.experiences = {};
      db.experiences[id] = {
        ...(db.experiences[id] || {}),
        ...resolvedUpdates
      };
    }

    if (updates.availabilitySettings && updates.boat_id) {
      if (!db.boat_availability) db.boat_availability = {};
      db.boat_availability[updates.boat_id] = updates.availabilitySettings;
    }

    saveMockDb(db);
  } else {
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

    const { error } = await (supabase as any)
      .from("experiences")
      .update(mappedUpdates)
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/partner/boats");
  revalidatePath("/admin/experiences");
  revalidatePath("/experiences");
  return { success: true };
}

export async function createExperience(experience: any) {
  const { user, role } = await checkRole(["provider", "admin"]);
  const supabase = await createClient();
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  if (role === "provider") {
    experience.provider_id = user.id;
    if (isPlaceholder) {
      const db = getMockDb();
      const boat = db.boats?.[experience.boat_id];
      if (boat && boat.provider_id !== user.id) {
        throw new Error("Non autorisé : Ce navire ne vous appartient pas");
      }
    } else {
      const { data: boat } = await supabase.from("boats").select("provider_id").eq("id", experience.boat_id).single() as any;
      if (boat && boat.provider_id !== user.id) {
        throw new Error("Non autorisé : Ce navire ne vous appartient pas");
      }
    }
  }

  if (isPlaceholder) {
    const db = getMockDb();
    if (!db.createdExperiences) db.createdExperiences = [];
    const newId = `new-${Date.now()}`;
    
    let partnerName = experience.partnerName || "Partenaire";
    if (experience.provider_id) {
      partnerName = db.partners?.[experience.provider_id]?.name || partnerName;
    }
    
    let destinationName = experience.destinationName || "Béjaïa";
    if (experience.destination_id) {
      const destinations: Record<string, string> = {
        "d1": "Cap Carbon",
        "d2": "Île des Pisans",
        "d3": "Gouraya",
        "d4": "Les Falaises"
      };
      destinationName = destinations[experience.destination_id] || destinationName;
    }

    const slug = (experience.title || "nouvelle-experience")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newExp = {
      id: newId,
      slug: `${slug}-${newId.split("-")[1]}`,
      is_published: experience.status === "approved" || experience.is_published || false,
      main_image_url: experience.main_image_url || "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
      images: experience.images || [experience.main_image_url || "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020"],
      partnerName,
      partner: partnerName,
      destinationName,
      destination: destinationName,
      rating: 5.0,
      ...experience
    };
    db.createdExperiences.push(newExp);

    if (experience.availabilitySettings && experience.boat_id) {
      if (!db.boat_availability) db.boat_availability = {};
      db.boat_availability[experience.boat_id] = experience.availabilitySettings;
    }

    saveMockDb(db);
    revalidatePath("/partner/boats");
    revalidatePath("/admin/experiences");
    revalidatePath("/experiences");
    return { success: true, data: newExp };
  } else {
    const { data, error } = await (supabase as any)
      .from("experiences")
      .insert(experience)
      .select()
      .single();
    if (error) throw new Error(error.message);
    revalidatePath("/partner/boats");
    revalidatePath("/admin/experiences");
    revalidatePath("/experiences");
    return { success: true, data };
  }
}

export async function validatePartner(id: string, status: "active" | "pending") {
  await checkRole(["admin"]);
  const supabase = await createClient();
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  if (isPlaceholder) {
    const db = getMockDb();
    if (!db.partners) db.partners = {};
    if (!db.partners[id]) db.partners[id] = {};
    db.partners[id].status = status;
    saveMockDb(db);
  } else {
    const { error } = await (supabase as any)
      .from("providers")
      .update({ is_active: status === "active" })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/partners");
  return { success: true };
}

export async function toggleDestinationStatus(id: string, isActive: boolean) {
  await checkRole(["admin"]);
  const supabase = await createClient();
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  if (isPlaceholder) {
    const db = getMockDb();
    if (!db.destinations) db.destinations = {};
    if (!db.destinations[id]) db.destinations[id] = {};
    db.destinations[id].is_active = isActive;
    saveMockDb(db);
  } else {
    const { error } = await (supabase as any)
      .from("destinations")
      .update({ is_active: isActive })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/destinations");
  return { success: true };
}

export async function toggleDestinationFeatured(id: string, isFeatured: boolean) {
  await checkRole(["admin"]);
  const supabase = await createClient();
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  if (isPlaceholder) {
    const db = getMockDb();
    if (!db.destinations) db.destinations = {};
    if (!db.destinations[id]) db.destinations[id] = {};
    db.destinations[id].is_featured = isFeatured;
    saveMockDb(db);
  } else {
    const { error } = await (supabase as any)
      .from("destinations")
      .update({ is_featured: isFeatured })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/destinations");
  return { success: true };
}

export async function saveDestination(id: string, updates: any) {
  await checkRole(["admin"]);
  const supabase = await createClient();
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  if (isPlaceholder) {
    const db = getMockDb();
    if (!db.destinations) db.destinations = {};
    db.destinations[id] = {
      ...(db.destinations[id] || {}),
      ...updates
    };
    saveMockDb(db);
  } else {
    const { error } = await (supabase as any)
      .from("destinations")
      .update(updates)
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/destinations");
  return { success: true };
}

export async function createDestination(destination: any) {
  await checkRole(["admin"]);
  const supabase = await createClient();
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  if (isPlaceholder) {
    const db = getMockDb();
    if (!db.createdDestinations) db.createdDestinations = [];
    const newId = `dest-${Date.now()}`;
    const newDest = { id: newId, ...destination };
    db.createdDestinations.push(newDest);
    saveMockDb(db);
    revalidatePath("/admin/destinations");
    return { success: true, data: newDest };
  } else {
    const { data, error } = await (supabase as any)
      .from("destinations")
      .insert(destination)
      .select()
      .single();
    if (error) throw new Error(error.message);
    revalidatePath("/admin/destinations");
    return { success: true, data };
  }
}

export async function updateCommissionRate(rate: number) {
  await checkRole(["admin"]);
  const supabase = await createClient();
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  if (isPlaceholder) {
    const db = getMockDb();
    db.commission_rate = rate;
    saveMockDb(db);
  } else {
    // For real database: update globally
  }

  revalidatePath("/admin/finance");
  return { success: true };
}

export async function getPersistedMockData() {
  await checkRole(["admin"]);
  return getMockDb();
}

export async function savePartnerCommissionSettings(
  partnerId: string,
  settings: { commission_rate: number; effective_date: string; is_active: boolean }
) {
  await checkRole(["admin"]);
  const supabase = await createClient();
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  if (isPlaceholder) {
    const db = getMockDb();
    if (!db.partners) db.partners = {};
    if (!db.partners[partnerId]) {
      db.partners[partnerId] = {
        id: partnerId,
        name: "Partenaire Safar",
        phone: "0550000000",
        email: "partner@safar.dz",
        boats: 1,
        total_revenue: 0,
        joined: "Récemment",
        status: settings.is_active ? "active" : "pending"
      };
    }
    db.partners[partnerId].commission_rate = settings.commission_rate;
    db.partners[partnerId].commission_effective_date = settings.effective_date;
    db.partners[partnerId].commission_status = settings.is_active ? "active" : "inactive";
    db.partners[partnerId].commission_last_modified = new Date().toISOString();
    db.partners[partnerId].status = settings.is_active ? "active" : "pending";
    
    saveMockDb(db);
  } else {

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
  }

  revalidatePath("/admin/partners");
  return { success: true };
}
