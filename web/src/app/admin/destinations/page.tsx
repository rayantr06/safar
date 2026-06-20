import { createClient } from "@/lib/supabase/server";
import { DestinationsListAdmin } from "@/components/admin/destinations-list-admin";
import { getPersistedMockData } from "@/lib/actions/experiences";

export const dynamic = "force-dynamic";

export default async function AdminDestinationsPage() {
  const supabase = await createClient();
  
  const INITIAL_DESTINATIONS = [
    {
      id: "d1",
      name: "Cap Carbon",
      slug: "cap-carbon",
      description:
        "Abritant le plus haut phare naturel au monde, ce cap emblématique offre des vues panoramiques à couper le souffle et des grottes marines cachées.",
      photo_url: "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
      experience_count: 12,
      is_active: true,
      is_featured: true,
      location: "Béjaïa, Algérie",
      bookings_count: 1248,
      revenue_dzd: "4.2M",
      rating: 4.9,
    },
    {
      id: "d2",
      name: "Gouraya National Park",
      slug: "gouraya-park",
      description:
        "Une réserve de biosphère où les montagnes rencontrent la mer. Célèbre pour ses singes magots et ses forts historiques perchés sur les falaises.",
      photo_url: "https://lh3.googleusercontent.com/p/AF1QipO9oV9R-lO7T3p5E6qR2t9U8W1O-vP3Z2J6c3O1=s1360-w1360-h1020",
      experience_count: 15,
      is_active: true,
      is_featured: false,
      location: "Béjaïa, Algérie",
      bookings_count: 852,
      revenue_dzd: "2.8M",
      rating: 4.8,
    },
    {
      id: "d3",
      name: "Île des Pisans",
      slug: "ile-des-pisans",
      description:
        "Magnifique île sauvage accessible uniquement par la mer, idéale pour la plongée, la baignade tranquille et le pique-nique côtier.",
      photo_url: "https://lh3.googleusercontent.com/p/AF1QipNjQZ5hNfWw9O9n5zXgZ4E9FkO6W4W3oR2Z8x9C=s1360-w1360-h1020",
      experience_count: 5,
      is_active: false,
      is_featured: false,
      location: "Boulimate, Béjaïa",
      bookings_count: 310,
      revenue_dzd: "1.1M",
      rating: 4.5,
    },
    {
      id: "d4",
      name: "Les Falaises",
      slug: "les-falaises",
      description:
        "Falaises rocheuses impressionnantes idéales pour les sorties de pêche, les baignades sauvages et l'exploration côtière.",
      photo_url: "https://lh3.googleusercontent.com/p/AF1QipP_n0cM3r_G9pE3D_nF8wWvTf2FhQ4-1B1H4o0R=s1360-w1360-h1020",
      experience_count: 3,
      is_active: true,
      is_featured: false,
      location: "Côte Ouest Béjaïa",
      bookings_count: 245,
      revenue_dzd: "850K",
      rating: 4.7,
    },
  ];

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

  if (destinations.length === 0) {
    destinations = INITIAL_DESTINATIONS;
  }

  // Overlay local filesystem mock overrides
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

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6">
      <DestinationsListAdmin initialDestinations={destinations} />
    </div>
  );
}
