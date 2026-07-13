"use server";

import { getMockDb, saveMockDb } from "@/lib/supabase/mock-db-helper";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const isPlaceholder = () =>
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

export async function updateClientProfile(email: string, updates: { name: string; phone: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé : Veuillez vous connecter");
    if (user.email?.toLowerCase() !== email.toLowerCase()) {
      throw new Error("Non autorisé : Modification d'un autre profil interdite");
    }

    if (!isPlaceholder()) {
      const admin = createAdminClient() as any;
      const { error } = await admin
        .from("profiles")
        .update({ full_name: updates.name, phone: updates.phone })
        .eq("id", user.id);
      if (error) throw new Error(error.message);
      revalidatePath("/client");
      return { success: true };
    }

    const db = getMockDb();
    if (!db.clients) db.clients = {};
    
    const key = email.toLowerCase();
    const existing = db.clients[key] || {
      id: `c-${Date.now()}`,
      email: key,
      created_at: new Date().toISOString()
    };
    
    db.clients[key] = {
      ...existing,
      name: updates.name,
      phone: updates.phone,
      updated_at: new Date().toISOString()
    };
    
    saveMockDb(db);
    revalidatePath("/client");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating client profile:", err);
    return { success: false, error: err.message || err };
  }
}
