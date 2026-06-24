import { createClient } from "@/lib/supabase/server";
import { FleetList } from "@/components/partner/fleet-list";
import { getPersistedMockData } from "@/lib/actions/experiences";
import { IMAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PartnerBoatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const MOCK_EXPERIENCES = [
    {
      id: "1",
      title: "Balade privée Cap Carbon & Aiguades",
      boatName: "Sirène de Béjaïa",
      type: "private",
      price_total: 2000000, // 20,000 DA
      duration_minutes: 120,
      max_guests: 6,
      is_published: true,
      main_image_url: IMAGES.EXPERIENCE_CAP_CARBON,
    },
    {
      id: "2",
      title: "Sortie Pêche - Les Falaises",
      boatName: "Le Pêcheur II",
      type: "shared",
      price_per_seat: 350000, // 3,500 DA
      duration_minutes: 180,
      max_guests: 8,
      is_published: false,
      main_image_url: IMAGES.EXPERIENCE_FALAISES,
    }
  ];

  let experiences: any[] = [];
  if (user) {
    const { data, error } = await supabase
      .from("experiences")
      .select("*, boats!inner(*)")
      .eq("boats.provider_id", user.id);

    if (!error && data) {
      experiences = data.map((exp: any) => ({
        id: exp.id,
        title: exp.title,
        boatName: exp.boats?.name || "Bateau",
        type: exp.type || "private",
        price_total: exp.price_total,
        price_per_seat: exp.price_per_seat,
        duration_minutes: exp.duration_minutes || 120,
        max_guests: exp.max_guests || 6,
        is_published: exp.is_published ?? true,
        main_image_url: exp.main_image_url || IMAGES.PLACEHOLDER,
      }));
    }
  }

  // Load filesystem mock DB overrides if we are in placeholder mode
  const mockDb = await getPersistedMockData();
  
  // Combine all experience sources
  let allExperiences = experiences.length > 0 ? experiences : [...MOCK_EXPERIENCES];
  
  if (mockDb) {
    // Merge updates from db.experiences
    allExperiences = allExperiences.map((exp) => {
      const updates = mockDb.experiences?.[exp.id];
      if (updates) {
        return { ...exp, ...updates };
      }
      return exp;
    });

    // Append createdExperiences
    if (mockDb.createdExperiences) {
      allExperiences = [...allExperiences, ...mockDb.createdExperiences];
    }
  }

  // Filter experiences to only include those belonging to the logged-in partner
  if (user) {
    experiences = allExperiences.filter((exp) => {
      let expProviderId = exp.provider_id;
      if (!expProviderId && exp.boat_id && mockDb?.boats?.[exp.boat_id]) {
        expProviderId = mockDb.boats[exp.boat_id].provider_id;
      }
      if (!expProviderId) {
        // Fallback mapping for static mock experiences
        if (exp.id === "1") expProviderId = "mock-partner-id";
        if (exp.id === "2") expProviderId = "p2";
      }
      return expProviderId === user.id;
    });
  } else {
    experiences = [];
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6">
      <FleetList initialExperiences={experiences} />
    </div>
  );
}
