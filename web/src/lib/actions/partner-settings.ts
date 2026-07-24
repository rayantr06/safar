"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type PartnerSettingsData = {
  full_name?: string;
  phone?: string;
  company_name?: string;
  port_location?: string;
  bio?: string;
  whatsapp?: string;
  address?: string;
};

export async function getPartnerSettings() {
  try {
    const supabase = (await createClient()) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé : Aucun utilisateur connecté");

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, avatar_url")
      .eq("id", user.id)
      .single();

    const { data: provider } = await supabase
      .from("providers")
      .select(
        "company_name, port_location, bio, whatsapp, address, created_at"
      )
      .eq("id", user.id)
      .single();

    const { data: boat } = await supabase
      .from("boats")
      .select("id, name")
      .eq("provider_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    return {
      success: true,
      data: {
        full_name: profile?.full_name || "",
        phone: profile?.phone || "",
        avatar_url: profile?.avatar_url || null,
        company_name: provider?.company_name || "",
        port_location: provider?.port_location || "",
        bio: provider?.bio || "",
        whatsapp: provider?.whatsapp || "",
        address: provider?.address || "",
        boat_name: boat?.name || "",
        boat_id: boat?.id || null,
        provider_created_at: provider?.created_at || null,
      },
    };
  } catch (err: any) {
    console.error("Error loading partner settings:", err);
    return { success: false, error: err.message || "Erreur de chargement" };
  }
}

export async function updatePartnerSettings(settings: PartnerSettingsData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé : Aucun utilisateur connecté");

    if (settings.full_name !== undefined) {
      const name = settings.full_name.trim();
      if (!name) throw new Error("Le nom est obligatoire");
      if (name.length > 100)
        throw new Error("Le nom ne peut pas dépasser 100 caractères");
    }

    if (settings.phone !== undefined && settings.phone) {
      const phone = settings.phone.trim();
      if (phone.length > 20)
        throw new Error("Le numéro de téléphone est trop long");
    }

    if (settings.company_name !== undefined) {
      const name = settings.company_name.trim();
      if (!name) throw new Error("Le nom de l'entreprise est obligatoire");
      if (name.length > 100)
        throw new Error(
          "Le nom de l'entreprise ne peut pas dépasser 100 caractères"
        );
    }

    if (settings.bio !== undefined && settings.bio) {
      if (settings.bio.length > 500)
        throw new Error("La description ne peut pas dépasser 500 caractères");
    }

    if (settings.whatsapp !== undefined && settings.whatsapp) {
      if (settings.whatsapp.length > 20)
        throw new Error("Le numéro WhatsApp est trop long");
    }

    if (settings.address !== undefined && settings.address) {
      if (settings.address.length > 200)
        throw new Error("L'adresse ne peut pas dépasser 200 caractères");
    }

    const admin = createAdminClient() as any;

    const profileUpdates: Record<string, string> = {};
    if (settings.full_name !== undefined)
      profileUpdates.full_name = settings.full_name.trim();
    if (settings.phone !== undefined)
      profileUpdates.phone = settings.phone.trim();

    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await admin
        .from("profiles")
        .update(profileUpdates)
        .eq("id", user.id);
      if (error) throw new Error(error.message);
    }

    const providerUpdates: Record<string, string> = {};
    if (settings.company_name !== undefined)
      providerUpdates.company_name = settings.company_name.trim();
    if (settings.port_location !== undefined)
      providerUpdates.port_location = settings.port_location.trim();
    if (settings.bio !== undefined) providerUpdates.bio = settings.bio.trim();
    if (settings.whatsapp !== undefined)
      providerUpdates.whatsapp = settings.whatsapp.trim();
    if (settings.address !== undefined)
      providerUpdates.address = settings.address.trim();

    if (Object.keys(providerUpdates).length > 0) {
      const { error } = await admin
        .from("providers")
        .update(providerUpdates)
        .eq("id", user.id);
      if (error) throw new Error(error.message);
    }

    revalidatePath("/partner/settings");
    revalidatePath("/partner/bookings");
    revalidatePath("/partner/boats");
    revalidatePath("/admin/partners");

    return { success: true };
  } catch (err: any) {
    console.error("Error updating partner settings:", err);
    return { success: false, error: err.message || "Erreur de sauvegarde" };
  }
}
