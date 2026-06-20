import { createClient } from "@/lib/supabase/server";
import { EarningsClient } from "@/components/partner/earnings-client";

export const dynamic = "force-dynamic";

export default async function PartnerEarningsPage() {
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
          title
        )
      `)
      .eq("provider_id", user.id)
      .order("booking_date", { ascending: false });
      
    if (!error && data) {
      bookings = data;
    }
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary mb-1">Revenus &amp; Finance</h1>
          <p className="text-body-lg text-on-surface-variant">Suivez vos gains en temps réel et visualisez la répartition de vos revenus.</p>
        </div>
      </div>

      <EarningsClient bookings={bookings} />
    </div>
  );
}
