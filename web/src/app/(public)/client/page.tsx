import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientDashboardClient } from "@/components/client/client-dashboard-client";
import { getMockDb } from "@/lib/supabase/mock-db-helper";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
          ? "https://lh3.googleusercontent.com/p/AF1QipP_n0cM3r_G9pE3D_nF8wWvTf2FhQ4-1B1H4o0R=s1360-w1360-h1020"
          : b.experience_id === "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f"
          ? "https://lh3.googleusercontent.com/p/AF1QipNjQZ5hNfWw9O9n5zXgZ4E9FkO6W4W3oR2Z8x9C=s1360-w1360-h1020"
          : "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
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
