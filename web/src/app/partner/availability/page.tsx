import { createClient } from "@/lib/supabase/server";
import { AvailabilityScheduler } from "@/components/partner/availability-scheduler";
import { getBoatAvailability } from "@/lib/actions/partner-bookings";

export const dynamic = "force-dynamic";

export default async function PartnerAvailabilityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let boats: any[] = [];
  if (user) {
    const { data, error } = await supabase
      .from("boats")
      .select("id, name, type, capacity")
      .eq("provider_id", user.id)
      .eq("is_active", true);
    if (!error && data) {
      boats = data.map((boat: any) => ({
        id: boat.id,
        name: boat.name,
        type: (boat.type === "jetski" || boat.type === "kayak" || boat.type === "paddle") ? "private" : boat.type,
        capacity: boat.capacity
      }));
    }
  }

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
      .eq("provider_id", user.id);
    if (!error && data) {
      bookings = data;
    }
  }

  const availabilitySettings: Record<string, any> = {};
  for (const boat of boats) {
    availabilitySettings[boat.id] = await getBoatAvailability(boat.id);
  }

  if (boats.length === 0) {
    return (
      <div className="max-w-container-max mx-auto px-4 md:px-10 py-12 text-center">
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-12 shadow-sm max-w-lg mx-auto">
          <h2 className="text-display-md font-display-md text-primary mb-2">Aucun équipement</h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            Vous n'avez pas encore d'équipement enregistré. Veuillez contacter l'administrateur Safar DZ pour ajouter un bateau ou un jet ski à votre flotte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6">
      <AvailabilityScheduler 
        boats={boats} 
        initialBookings={bookings} 
        initialAvailability={availabilitySettings} 
      />
    </div>
  );
}
