import { createClient } from "@/lib/supabase/server";
import { DestinationsListAdmin } from "@/components/admin/destinations-list-admin";
import { getPersistedMockData } from "@/lib/actions/experiences";

export const dynamic = "force-dynamic";

const isPlaceholder = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

export default async function AdminDestinationsPage() {
  const supabase = await createClient();

  let destinations: any[] = [];
  try {
    const { data } = await supabase.from("destinations").select("*");
    if (data && data.length > 0) {
      destinations = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        description: d.description || "",
        photo_url: d.photo_url || "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
        experience_count: 0,
        is_active: d.is_active ?? true,
        is_featured: false,
        location: "Béjaïa, Algérie",
        bookings_count: 0,
        revenue_dzd: "0",
        rating: 4.8,
      }));
    }
  } catch (err) {
    console.error("Failed to fetch destinations:", err);
  }

  // The local JSON mock DB is a local-dev-only fallback (isPlaceholder mode);
  // it must never overlay/replace real Supabase data in production.
  if (isPlaceholder()) {
    const mockDb = await getPersistedMockData();
    if (mockDb) {
      destinations = destinations.map((d) => {
        const updates = mockDb.destinations?.[d.id];
        if (updates) {
          return { ...d, ...updates };
        }
        return d;
      });

      if (mockDb.createdDestinations) {
        destinations = [...destinations, ...mockDb.createdDestinations];
      }
    }
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6">
      <DestinationsListAdmin initialDestinations={destinations} />
    </div>
  );
}
