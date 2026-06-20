import { createClient } from "@/lib/supabase/server";
import { BookingsList } from "@/components/partner/bookings-list";

export const dynamic = "force-dynamic";

export default async function PartnerBookingsPage() {
  const supabase = await createClient();
  
  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Fetch bookings
  let bookings: any[] = [];
  if (user) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences (
          title,
          duration_minutes,
          max_guests
        )
      `)
      .eq("provider_id", user.id)
      .order("created_at", { ascending: false });
      
    if (!error && data) bookings = data;
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6">
      <BookingsList initialBookings={bookings} />
    </div>
  );
}
