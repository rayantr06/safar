"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { checkRole } from "@/lib/utils/auth-check";

export type ContactMessage = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  admin_note: string | null;
  created_at: string;
};

export type ContactFormData = {
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export async function submitContactMessage(data: ContactFormData) {
  try {
    const fullName = data.full_name?.trim();
    const email = data.email?.trim();
    const phone = data.phone?.trim();
    const subject = data.subject?.trim();
    const message = data.message?.trim();

    if (!fullName) throw new Error("Le nom est obligatoire");
    if (fullName.length > 100)
      throw new Error("Le nom ne peut pas dépasser 100 caractères");
    if (!email) throw new Error("L'email est obligatoire");
    if (email.length > 200)
      throw new Error("L'email ne peut pas dépasser 200 caractères");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new Error("Format d'email invalide");
    if (phone && phone.length > 20)
      throw new Error("Le numéro de téléphone est trop long");
    if (subject && subject.length > 100)
      throw new Error("Le sujet ne peut pas dépasser 100 caractères");
    if (!message) throw new Error("Le message est obligatoire");
    if (message.length > 5000)
      throw new Error("Le message ne peut pas dépasser 5000 caractères");

    const supabase = await createClient();

    const { error } = await supabase.from("contact_messages").insert({
      full_name: fullName,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      status: "new",
    });

    if (error) throw new Error(error.message);

    return { success: true };
  } catch (err: any) {
    console.error("Error submitting contact message:", err);
    return {
      success: false,
      error: err.message || "Erreur lors de l'envoi du message",
    };
  }
}

export async function getContactMessages() {
  try {
    await checkRole(["admin"]);
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return { success: true, data: (data || []) as ContactMessage[] };
  } catch (err: any) {
    console.error("Error loading contact messages:", err);
    return {
      success: false,
      error: err.message || "Erreur de chargement",
      data: [],
    };
  }
}

export async function updateContactMessageStatus(
  id: string,
  status: string
) {
  try {
    await checkRole(["admin"]);
    const admin = createAdminClient();

    const { error } = await admin
      .from("contact_messages")
      .update({ status })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating contact message:", err);
    return {
      success: false,
      error: err.message || "Erreur de mise à jour",
    };
  }
}

export async function updateContactMessageNote(
  id: string,
  adminNote: string
) {
  try {
    await checkRole(["admin"]);
    const admin = createAdminClient();

    const { error } = await admin
      .from("contact_messages")
      .update({ admin_note: adminNote })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating contact message note:", err);
    return {
      success: false,
      error: err.message || "Erreur de mise à jour",
    };
  }
}

export async function deleteContactMessage(id: string) {
  try {
    await checkRole(["admin"]);
    const admin = createAdminClient();

    const { error } = await admin
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting contact message:", err);
    return {
      success: false,
      error: err.message || "Erreur de suppression",
    };
  }
}
