"use server";

import { revalidatePath } from "next/cache";
import { getMockDb, saveMockDb } from "@/lib/supabase/mock-db-helper";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRole } from "@/lib/utils/auth-check";
import { IMAGES } from "@/lib/constants";

const isPlaceholder = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

/**
 * Creates a new partner (real Supabase: creates an auth user + profiles row +
 * providers row; mock DB: unchanged local-file behavior for local dev)
 */
export async function createPartner(partnerData: {
  name: string;
  company_name?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  address?: string;
  location?: string;
  notes?: string;
  password?: string;
  commission_type: "percentage" | "fixed";
  commission_value: number;
}) {
  try {
    await checkRole(["admin"]);

    if (isPlaceholder()) {
      const db = getMockDb();
      if (!db.partners) db.partners = {};

      const partnerId = `p-${Date.now()}`;

      // Verify email uniqueness
      const emailExists = Object.values(db.partners).some(
        (p: any) => p.email?.toLowerCase() === partnerData.email?.toLowerCase()
      );
      if (emailExists) {
        return { success: false, error: "Cet e-mail est déjà utilisé par un autre partenaire." };
      }

      const newPartner = {
        id: partnerId,
        name: partnerData.name,
        company_name: partnerData.company_name || "",
        phone: partnerData.phone,
        whatsapp: partnerData.whatsapp || partnerData.phone,
        email: partnerData.email,
        address: partnerData.address || "",
        location: partnerData.location || "Port de Béjaïa",
        notes: partnerData.notes || "",
        password: partnerData.password || "password123",
        is_disabled: false,
        commission_type: partnerData.commission_type || "percentage",
        commission_rate: partnerData.commission_value || 15, // store the value here
        commission_effective_date: new Date().toISOString().split("T")[0],
        commission_status: "active",
        commission_last_modified: new Date().toISOString(),
        joined: new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date()),
        status: "active", // Active by default
        boats: 0
      };

      db.partners[partnerId] = newPartner;
      saveMockDb(db);

      revalidatePath("/admin/partners");
      revalidatePath("/partner/settings");

      return { success: true, partnerId };
    }

    const admin = createAdminClient() as any;

    const { data: created, error: createUserError } = await admin.auth.admin.createUser({
      email: partnerData.email,
      password: partnerData.password || Math.random().toString(36).slice(-10),
      email_confirm: true,
      user_metadata: { full_name: partnerData.name },
    });

    if (createUserError) {
      const message = /already been registered|already exists/i.test(createUserError.message)
        ? "Cet e-mail est déjà utilisé par un autre partenaire."
        : createUserError.message;
      return { success: false, error: message };
    }

    const partnerId = created.user.id;

    const { error: profileError } = await admin.from("profiles").insert({
      id: partnerId,
      role: "provider",
      full_name: partnerData.name,
      phone: partnerData.phone,
    });
    if (profileError) throw new Error(profileError.message);

    const { error: providerError } = await admin.from("providers").insert({
      id: partnerId,
      company_name: partnerData.company_name || partnerData.name,
      port_location: partnerData.location || "Port de Béjaïa",
      whatsapp: partnerData.whatsapp || partnerData.phone,
      address: partnerData.address || "",
      notes: partnerData.notes || "",
      commission_type: partnerData.commission_type || "percentage",
      commission_rate: partnerData.commission_value || 15,
      commission_effective_date: new Date().toISOString().split("T")[0],
      commission_status: "active",
      is_active: true,
      is_disabled: false,
    });
    if (providerError) throw new Error(providerError.message);

    revalidatePath("/admin/partners");
    revalidatePath("/partner/settings");

    return { success: true, partnerId };
  } catch (err: any) {
    console.error("Error creating partner:", err);
    return { success: false, error: err.message || err };
  }
}

/**
 * Updates general information and commission settings for a partner
 */
export async function updatePartner(
  partnerId: string,
  partnerData: {
    name: string;
    company_name?: string;
    phone: string;
    whatsapp?: string;
    email: string;
    address?: string;
    location?: string;
    notes?: string;
    commission_type: "percentage" | "fixed";
    commission_value: number;
    status?: string;
  }
) {
  try {
    await checkRole(["admin"]);

    if (isPlaceholder()) {
      const db = getMockDb();
      if (!db.partners || !db.partners[partnerId]) {
        return { success: false, error: "Partenaire introuvable" };
      }

      const existing = db.partners[partnerId];

      // Check if email changed and if the new email is already taken
      if (partnerData.email?.toLowerCase() !== existing.email?.toLowerCase()) {
        const emailExists = Object.values(db.partners).some(
          (p: any) => p.id !== partnerId && p.email?.toLowerCase() === partnerData.email?.toLowerCase()
        );
        if (emailExists) {
          return { success: false, error: "Cet e-mail est déjà utilisé." };
        }
      }

      const updated = {
        ...existing,
        name: partnerData.name,
        company_name: partnerData.company_name || "",
        phone: partnerData.phone,
        whatsapp: partnerData.whatsapp || partnerData.phone,
        email: partnerData.email,
        address: partnerData.address || "",
        location: partnerData.location || "Port de Béjaïa",
        notes: partnerData.notes || "",
        status: partnerData.status || existing.status,
        is_disabled: partnerData.status === "disabled" ? true : existing.is_disabled,
        commission_type: partnerData.commission_type,
        commission_rate: partnerData.commission_value,
        commission_last_modified: new Date().toISOString()
      };

      db.partners[partnerId] = updated;
      saveMockDb(db);

      revalidatePath("/admin/partners");
      revalidatePath("/partner/settings");

      return { success: true };
    }

    const admin = createAdminClient() as any;

    const { data: existingUser } = await admin.auth.admin.getUserById(partnerId);
    if (existingUser?.user?.email && partnerData.email && existingUser.user.email.toLowerCase() !== partnerData.email.toLowerCase()) {
      const { error: emailError } = await admin.auth.admin.updateUserById(partnerId, { email: partnerData.email });
      if (emailError) {
        const message = /already been registered|already exists/i.test(emailError.message)
          ? "Cet e-mail est déjà utilisé."
          : emailError.message;
        return { success: false, error: message };
      }
    }

    const isDisabled = partnerData.status === "disabled";

    const { error: profileError } = await admin
      .from("profiles")
      .update({ full_name: partnerData.name, phone: partnerData.phone })
      .eq("id", partnerId);
    if (profileError) throw new Error(profileError.message);

    const { error: providerError } = await admin
      .from("providers")
      .update({
        company_name: partnerData.company_name || partnerData.name,
        port_location: partnerData.location || "Port de Béjaïa",
        whatsapp: partnerData.whatsapp || partnerData.phone,
        address: partnerData.address || "",
        notes: partnerData.notes || "",
        commission_type: partnerData.commission_type,
        commission_rate: partnerData.commission_value,
        commission_last_modified: new Date().toISOString(),
        is_disabled: isDisabled,
        is_active: !isDisabled,
      })
      .eq("id", partnerId);
    if (providerError) throw new Error(providerError.message);

    revalidatePath("/admin/partners");
    revalidatePath("/partner/settings");

    return { success: true };
  } catch (err: any) {
    console.error("Error updating partner:", err);
    return { success: false, error: err.message || err };
  }
}

/**
 * Resets a partner's password
 */
export async function resetPartnerPassword(partnerId: string, newPassword: string) {
  try {
    await checkRole(["admin"]);

    if (isPlaceholder()) {
      const db = getMockDb();
      if (!db.partners || !db.partners[partnerId]) {
        return { success: false, error: "Partenaire introuvable" };
      }

      db.partners[partnerId].password = newPassword;
      saveMockDb(db);

      return { success: true };
    }

    const admin = createAdminClient() as any;
    const { error } = await admin.auth.admin.updateUserById(partnerId, { password: newPassword });
    if (error) throw new Error(error.message);

    return { success: true };
  } catch (err: any) {
    console.error("Error resetting password:", err);
    return { success: false, error: err.message || err };
  }
}

/**
 * Toggles a partner's active status (Enables or Disables log-in)
 */
export async function disablePartnerAccount(partnerId: string, isDisabled: boolean) {
  try {
    await checkRole(["admin"]);

    if (isPlaceholder()) {
      const db = getMockDb();
      if (!db.partners || !db.partners[partnerId]) {
        return { success: false, error: "Partenaire introuvable" };
      }

      db.partners[partnerId].is_disabled = isDisabled;
      db.partners[partnerId].status = isDisabled ? "disabled" : "active";
      saveMockDb(db);

      revalidatePath("/admin/partners");

      return { success: true };
    }

    const admin = createAdminClient() as any;
    const { error } = await admin
      .from("providers")
      .update({ is_disabled: isDisabled, is_active: !isDisabled })
      .eq("id", partnerId);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/partners");

    return { success: true };
  } catch (err: any) {
    console.error("Error toggling account status:", err);
    return { success: false, error: err.message || err };
  }
}

/**
 * Adds equipment (boat or jetski) to a partner's profile
 */
export async function addPartnerEquipment(
  partnerId: string,
  equipmentData: {
    name: string;
    type: "private" | "shared" | "jetski" | "kayak" | "paddle";
    description: string;
    main_image_url?: string;
    capacity: number;
    price_total: number; // In centimes (divided by 100 on frontend input)
    duration_minutes: number;
    location?: string;
    available_services?: string; // Comma separated list of services for boats
    quantity?: number; // Quantity for jet skis
  }
) {
  try {
    await checkRole(["admin"]);

    if (isPlaceholder()) {
      const db = getMockDb();
      if (!db.boats) db.boats = {};
      if (!db.boat_availability) db.boat_availability = {};

      const boatId = `boat-${Date.now()}`;

      // Create the equipment entry
      const newBoat = {
        id: boatId,
        provider_id: partnerId,
        name: equipmentData.name,
        type: equipmentData.type,
        description: equipmentData.description || "",
        main_image_url: equipmentData.main_image_url || IMAGES.PLACEHOLDER,
        capacity: equipmentData.capacity || 2,
        price_total: equipmentData.price_total || 1500000,
        duration_minutes: equipmentData.duration_minutes || 120,
        location: equipmentData.location || "Port de Béjaïa",
        available_services: equipmentData.available_services || "",
        quantity: equipmentData.quantity || 1,
        is_active: true
      };

      db.boats[boatId] = newBoat;

      // Set default availability settings
      db.boat_availability[boatId] = {
        workingHours: { start: "08:00", end: "20:00" },
        breakTime: { start: "12:00", end: "13:00" },
        unavailableDays: [],
        maintenanceDates: []
      };

      // Also automatically create a corresponding experience template so it's queryable/renderable in fleet list
      if (!db.createdExperiences) db.createdExperiences = [];
      const slug = newBoat.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const partnerName = db.partners?.[partnerId]?.name || "Partenaire";

      const newExp = {
        id: `exp-auto-${boatId}`,
        slug: `${slug}-${boatId.split("-")[1]}`,
        title: `${newBoat.name} - Sortie Marine`,
        boatName: newBoat.name,
        provider_id: partnerId,
        partnerName,
        partner: partnerName,
        boat_id: boatId,
        type: newBoat.type === "jetski" ? "private" : newBoat.type,
        price_total: newBoat.price_total,
        price_per_seat: newBoat.type === "shared" ? Math.round(newBoat.price_total / newBoat.capacity) : null,
        duration_minutes: newBoat.duration_minutes,
        max_guests: newBoat.capacity,
        is_published: true,
        main_image_url: newBoat.main_image_url,
        description: newBoat.description,
        destinationName: newBoat.location,
        destination: newBoat.location,
        rating: 5.0
      };
      db.createdExperiences.push(newExp);

      saveMockDb(db);

      revalidatePath("/admin/partners");
      revalidatePath("/partner/boats");
      revalidatePath("/partner/availability");
      revalidatePath("/experiences");

      return { success: true, boatId };
    }

    const admin = createAdminClient() as any;

    const { data: boat, error: boatError } = await admin
      .from("boats")
      .insert({
        provider_id: partnerId,
        name: equipmentData.name,
        type: equipmentData.type,
        capacity: equipmentData.capacity || 2,
        description: equipmentData.description || "",
        photo_url: equipmentData.main_image_url || IMAGES.PLACEHOLDER,
        is_active: true,
      })
      .select()
      .single();
    if (boatError) throw new Error(boatError.message);

    const { error: availabilityError } = await admin.from("boat_availability").insert({
      boat_id: boat.id,
      settings: {
        workingHours: { start: "08:00", end: "20:00" },
        breakTime: { start: "12:00", end: "13:00" },
        unavailableDays: [],
        maintenanceDates: [],
      },
    });
    if (availabilityError) throw new Error(availabilityError.message);

    const priceTotal = equipmentData.price_total || 1500000;
    const capacity = equipmentData.capacity || 2;
    const slug = `${equipmentData.name}-${boat.id}`
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { error: experienceError } = await admin.from("experiences").insert({
      boat_id: boat.id,
      title: `${equipmentData.name} - Sortie Marine`,
      slug,
      description: equipmentData.description || "",
      type: equipmentData.type === "jetski" ? "private" : equipmentData.type,
      price_total: priceTotal,
      price_per_seat: equipmentData.type === "shared" ? Math.round(priceTotal / capacity) : null,
      duration_minutes: equipmentData.duration_minutes || 120,
      max_guests: capacity,
      is_published: true,
      main_image_url: equipmentData.main_image_url || IMAGES.PLACEHOLDER,
      departure_location: equipmentData.location || "Port de Béjaïa",
      included_services: equipmentData.available_services || "",
    });
    if (experienceError) throw new Error(experienceError.message);

    revalidatePath("/admin/partners");
    revalidatePath("/partner/boats");
    revalidatePath("/partner/availability");
    revalidatePath("/experiences");

    return { success: true, boatId: boat.id };
  } catch (err: any) {
    console.error("Error adding equipment:", err);
    return { success: false, error: err.message || err };
  }
}

/**
 * Updates an equipment item
 */
export async function updatePartnerEquipment(
  partnerId: string,
  equipmentId: string,
  equipmentData: {
    name: string;
    type: "private" | "shared" | "jetski" | "kayak" | "paddle";
    description: string;
    main_image_url?: string;
    capacity: number;
    price_total: number;
    duration_minutes: number;
    location?: string;
    available_services?: string;
    quantity?: number;
  }
) {
  try {
    await checkRole(["admin"]);

    if (isPlaceholder()) {
      const db = getMockDb();
      if (!db.boats || !db.boats[equipmentId]) {
        return { success: false, error: "Équipement introuvable" };
      }

      const existing = db.boats[equipmentId];
      const updatedBoat = {
        ...existing,
        name: equipmentData.name,
        type: equipmentData.type,
        description: equipmentData.description || "",
        main_image_url: equipmentData.main_image_url || existing.main_image_url,
        capacity: equipmentData.capacity,
        price_total: equipmentData.price_total,
        duration_minutes: equipmentData.duration_minutes,
        location: equipmentData.location || "Port de Béjaïa",
        available_services: equipmentData.available_services || "",
        quantity: equipmentData.quantity || 1
      };

      db.boats[equipmentId] = updatedBoat;

      // Sync corresponding experience if it exists in createdExperiences
      if (db.createdExperiences) {
        db.createdExperiences = db.createdExperiences.map((e: any) => {
          if (e.boat_id === equipmentId || e.id === `exp-auto-${equipmentId}`) {
            return {
              ...e,
              title: `${updatedBoat.name} - Sortie Marine`,
              boatName: updatedBoat.name,
              type: updatedBoat.type === "jetski" ? "private" : updatedBoat.type,
              price_total: updatedBoat.price_total,
              price_per_seat: updatedBoat.type === "shared" ? Math.round(updatedBoat.price_total / updatedBoat.capacity) : null,
              duration_minutes: updatedBoat.duration_minutes,
              max_guests: updatedBoat.capacity,
              main_image_url: updatedBoat.main_image_url,
              description: updatedBoat.description,
              destinationName: updatedBoat.location,
              destination: updatedBoat.location
            };
          }
          return e;
        });
      }

      saveMockDb(db);

      revalidatePath("/admin/partners");
      revalidatePath("/partner/boats");
      revalidatePath("/partner/availability");
      revalidatePath("/experiences");

      return { success: true };
    }

    const admin = createAdminClient() as any;

    const { error: boatError } = await admin
      .from("boats")
      .update({
        name: equipmentData.name,
        type: equipmentData.type,
        capacity: equipmentData.capacity,
        description: equipmentData.description || "",
        photo_url: equipmentData.main_image_url,
      })
      .eq("id", equipmentId);
    if (boatError) throw new Error(boatError.message);

    const priceTotal = equipmentData.price_total;
    const { error: experienceError } = await admin
      .from("experiences")
      .update({
        title: `${equipmentData.name} - Sortie Marine`,
        description: equipmentData.description || "",
        type: equipmentData.type === "jetski" ? "private" : equipmentData.type,
        price_total: priceTotal,
        price_per_seat: equipmentData.type === "shared" ? Math.round(priceTotal / equipmentData.capacity) : null,
        duration_minutes: equipmentData.duration_minutes,
        max_guests: equipmentData.capacity,
        main_image_url: equipmentData.main_image_url,
        departure_location: equipmentData.location || "Port de Béjaïa",
        included_services: equipmentData.available_services || "",
      })
      .eq("boat_id", equipmentId);
    if (experienceError) throw new Error(experienceError.message);

    revalidatePath("/admin/partners");
    revalidatePath("/partner/boats");
    revalidatePath("/partner/availability");
    revalidatePath("/experiences");

    return { success: true };
  } catch (err: any) {
    console.error("Error updating equipment:", err);
    return { success: false, error: err.message || err };
  }
}

/**
 * Deletes equipment
 */
export async function deletePartnerEquipment(partnerId: string, equipmentId: string) {
  try {
    await checkRole(["admin"]);

    if (isPlaceholder()) {
      const db = getMockDb();

      if (db.boats && db.boats[equipmentId]) {
        delete db.boats[equipmentId];
      }
      if (db.boat_availability && db.boat_availability[equipmentId]) {
        delete db.boat_availability[equipmentId];
      }

      // Remove matching experiences
      if (db.createdExperiences) {
        db.createdExperiences = db.createdExperiences.filter(
          (e: any) => e.boat_id !== equipmentId && e.id !== `exp-auto-${equipmentId}`
        );
      }

      saveMockDb(db);

      revalidatePath("/admin/partners");
      revalidatePath("/partner/boats");
      revalidatePath("/partner/availability");
      revalidatePath("/experiences");

      return { success: true };
    }

    const admin = createAdminClient() as any;
    // boat_availability and experiences both reference boats(id) ON DELETE CASCADE
    const { error } = await admin.from("boats").delete().eq("id", equipmentId);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/partners");
    revalidatePath("/partner/boats");
    revalidatePath("/partner/availability");
    revalidatePath("/experiences");

    return { success: true };
  } catch (err: any) {
    console.error("Error deleting equipment:", err);
    return { success: false, error: err.message || err };
  }
}

/**
 * Toggles status (active/deactivated) of equipment
 */
export async function togglePartnerEquipmentStatus(equipmentId: string, isActive: boolean) {
  try {
    await checkRole(["admin"]);

    if (isPlaceholder()) {
      const db = getMockDb();
      if (!db.boats || !db.boats[equipmentId]) {
        return { success: false, error: "Équipement introuvable" };
      }

      db.boats[equipmentId].is_active = isActive;

      // Sync in createdExperiences status
      if (db.createdExperiences) {
        db.createdExperiences = db.createdExperiences.map((e: any) => {
          if (e.boat_id === equipmentId || e.id === `exp-auto-${equipmentId}`) {
            return { ...e, is_published: isActive };
          }
          return e;
        });
      }

      saveMockDb(db);

      revalidatePath("/admin/partners");
      revalidatePath("/partner/boats");
      revalidatePath("/partner/availability");

      return { success: true };
    }

    const admin = createAdminClient() as any;

    const { error: boatError } = await admin.from("boats").update({ is_active: isActive }).eq("id", equipmentId);
    if (boatError) throw new Error(boatError.message);

    const { error: experienceError } = await admin
      .from("experiences")
      .update({ is_published: isActive })
      .eq("boat_id", equipmentId);
    if (experienceError) throw new Error(experienceError.message);

    revalidatePath("/admin/partners");
    revalidatePath("/partner/boats");
    revalidatePath("/partner/availability");

    return { success: true };
  } catch (err: any) {
    console.error("Error toggling equipment status:", err);
    return { success: false, error: err.message || err };
  }
}
