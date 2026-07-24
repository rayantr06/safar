import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClientDashboardClient } from "@/components/client/client-dashboard-client";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createAdminClient() as any;

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  const client = {
    id: user.id,
    name: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Client Safar",
    email: user.email || "",
    phone: profile?.phone || "",
  };

  const { data: bookingsData } = await admin
    .from("bookings")
    .select("*, experiences(title, main_image_url, duration_minutes)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <ClientDashboardClient
      initialClient={client}
      initialBookings={bookingsData || []}
    />
  );
}
