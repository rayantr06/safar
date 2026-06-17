"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }

  // Vérifier le rôle de l'utilisateur pour le rediriger au bon endroit
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: profile } = (await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()) as any;

    if (profile?.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/partner");
    }
  }

  redirect("/");
}
