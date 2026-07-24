"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateClientProfile(email: string, updates: { name: string; phone: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé : Veuillez vous connecter");
    if (user.email?.toLowerCase() !== email.toLowerCase()) {
      throw new Error("Non autorisé : Modification d'un autre profil interdite");
    }

    const admin = createAdminClient() as any;
    const { error } = await admin
      .from("profiles")
      .update({ full_name: updates.name, phone: updates.phone })
      .eq("id", user.id);
    if (error) throw new Error(error.message);
    revalidatePath("/client");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating client profile:", err);
    return { success: false, error: err.message || err };
  }
}
