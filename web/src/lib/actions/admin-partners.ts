"use server";

import { revalidatePath } from "next/cache";
import { getMockDb, saveMockDb } from "@/lib/supabase/mock-db-helper";
import { checkRole } from "@/lib/utils/auth-check";

/**
 * Creates a new partner in the mock DB
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

    // Revalidate paths
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
    const db = getMockDb();
    if (!db.partners || !db.partners[partnerId]) {
      return { success: false, error: "Partenaire introuvable" };
    }

    db.partners[partnerId].password = newPassword;
    saveMockDb(db);

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
    const db = getMockDb();
    if (!db.partners || !db.partners[partnerId]) {
      return { success: false, error: "Partenaire introuvable" };
    }

    db.partners[partnerId].is_disabled = isDisabled;
    db.partners[partnerId].status = isDisabled ? "disabled" : "active";
    saveMockDb(db);

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
      main_image_url: equipmentData.main_image_url || "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
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
  } catch (err: any) {
    console.error("Error toggling equipment status:", err);
    return { success: false, error: err.message || err };
  }
}
