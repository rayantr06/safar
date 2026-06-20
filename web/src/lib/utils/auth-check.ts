import { createClient } from "@/lib/supabase/server";

export async function checkRole(allowedRoles: ("admin" | "provider" | "client")[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Non autorisé : Aucun utilisateur connecté");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as any;

  const role = profile?.role || "client";
  if (!allowedRoles.includes(role as any)) {
    throw new Error("Non autorisé : Permissions insuffisantes");
  }

  return { user, role };
}
