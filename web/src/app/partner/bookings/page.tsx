import { createClient } from "@/lib/supabase/server";
import { BookingsList } from "@/components/partner/bookings-list";

export const dynamic = "force-dynamic";

export default async function PartnerBookingsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  let bookings: any[] = [];
  let boats: any[] = [];

  if (user) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences (
          title,
          duration_minutes,
          max_guests
        ),
        boats (
          id,
          name,
          boat_type
        )
      `)
      .eq("provider_id", user.id)
      .order("created_at", { ascending: false });
      
    if (!error && data) bookings = data;

    const { data: boatsData } = await supabase
      .from("boats")
      .select("id, name, boat_type")
      .eq("provider_id", user.id)
      .order("name");

    if (boatsData) boats = boatsData;
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6">
      <BookingsList initialBookings={bookings} boats={boats} />
    </div>
  );
}
