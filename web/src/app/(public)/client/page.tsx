import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClientDashboardClient } from "@/components/client/client-dashboard-client";
import { getMockDb } from "@/lib/supabase/mock-db-helper";
import { IMAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

const isPlaceholder = () =>
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isPlaceholder()) {
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

  // Fetch client details from mock DB
  const db = getMockDb();
  const clientKey = user.email?.toLowerCase() || "";
  const client = db.clients?.[clientKey] || {
    id: `c-${Date.now()}`,
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Client Safar",
    email: user.email || "",
    phone: user.user_metadata?.phone || ""
  };

  // Fetch bookings matching this client's phone number
  let bookings: any[] = [];
  if (client.phone) {
    // Standard normalized phone comparison
    const cleanPhone = client.phone.replace(/\s+/g, "");
    bookings = (db.bookings || []).filter((b: any) => {
      const bPhone = (b.client_phone || "").replace(/\s+/g, "");
      return bPhone === cleanPhone && cleanPhone.length > 0;
    });
  }

  // Format experience details for bookings
  const enrichedBookings = bookings.map((b: any) => {
    return {
      ...b,
      experiences: {
        title: b.experience_id === "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e" || b.experience_id === "2"
          ? "Sortie Pêche & Baignade - Les Falaises"
          : b.experience_id === "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f"
          ? "Tour Partagé - Île des Pisans (Boulimate)"
          : "Balade privée Cap Carbon & Aiguades",
        main_image_url: b.experience_id === "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e" || b.experience_id === "2"
          ? IMAGES.EXPERIENCE_FALAISES
          : b.experience_id === "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f"
          ? IMAGES.EXPERIENCE_PISANS
          : IMAGES.EXPERIENCE_CAP_CARBON,
        duration_minutes: b.duration_minutes || 120
      }
    };
  });

  return (
    <ClientDashboardClient
      initialClient={client}
      initialBookings={enrichedBookings}
    />
  );
}
