"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRole } from "@/lib/utils/auth-check";
import { randomBytes } from "crypto";

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

    const admin = createAdminClient() as any;

    const { data: created, error: createUserError } = await admin.auth.admin.createUser({
      email: partnerData.email,
      password: partnerData.password || randomBytes(8).toString("hex"),
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
      commission_rate: partnerData.commission_value ?? 15,
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

export async function resetPartnerPassword(partnerId: string, newPassword: string) {
  try {
    await checkRole(["admin"]);

    const admin = createAdminClient() as any;
    const { error } = await admin.auth.admin.updateUserById(partnerId, { password: newPassword });
    if (error) throw new Error(error.message);

    return { success: true };
  } catch (err: any) {
    console.error("Error resetting password:", err);
    return { success: false, error: err.message || err };
  }
}

export async function disablePartnerAccount(partnerId: string, isDisabled: boolean) {
  try {
    await checkRole(["admin"]);

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

export async function addPartnerEquipment(
  partnerId: string,
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

    const admin = createAdminClient() as any;

    const { data: boat, error: boatError } = await admin
      .from("boats")
      .insert({
        provider_id: partnerId,
        name: equipmentData.name,
        type: equipmentData.type,
        capacity: equipmentData.capacity || 2,
        description: equipmentData.description || "",
        photo_url: equipmentData.main_image_url,
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
      main_image_url: equipmentData.main_image_url,
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

export async function deletePartnerEquipment(partnerId: string, equipmentId: string) {
  try {
    await checkRole(["admin"]);

    const admin = createAdminClient() as any;
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

export async function togglePartnerEquipmentStatus(equipmentId: string, isActive: boolean) {
  try {
    await checkRole(["admin"]);

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
