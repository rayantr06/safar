import { createClient } from "@/lib/supabase/server";
import { ExperiencesListAdmin } from "@/components/admin/experiences-list-admin";
import { getPersistedMockData } from "@/lib/actions/experiences";
import { getAdminPartners } from "@/lib/actions/admin-bookings";

export const dynamic = "force-dynamic";

export default async function AdminExperiencesPage() {
  const supabase = await createClient();
  
  const INITIAL_EXPERIENCES = [
    { id: "1", title: "Balade privée Cap Carbon & Aiguades", partner: "Capitaine Salim", provider_id: "mock-partner-id", boat_id: "1", destination: "Cap Carbon", destination_id: "d1", type: "private", price_total: 2000000, price_per_seat: null, duration_minutes: 120, max_guests: 6, status: "approved", main_image_url: "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020", description: "Une balade privée exceptionnelle à la découverte du phare de Cap Carbon et des criques des Aiguades." },
    { id: "2", title: "Sortie Pêche - Les Falaises", partner: "Evasion Marine", provider_id: "p2", boat_id: "2", destination: "Les Falaises", destination_id: "d4", type: "private", price_total: 2500000, price_per_seat: null, duration_minutes: 180, max_guests: 8, status: "pending_approval", main_image_url: "https://lh3.googleusercontent.com/p/AF1QipP_n0cM3r_G9pE3D_nF8wWvTf2FhQ4-1B1H4o0R=s1360-w1360-h1020", description: "Pêchez dans les meilleurs spots côtiers et profitez d'une baignade rafraîchissante dans des criques sauvages." },
    { id: "3", title: "Tour Partagé - Île des Pisans", partner: "Nautica DZ", provider_id: "mock-partner-id", boat_id: "1", destination: "Île des Pisans", destination_id: "d2", type: "shared", price_total: null, price_per_seat: 350000, duration_minutes: 150, max_guests: 10, status: "approved", main_image_url: "https://lh3.googleusercontent.com/p/AF1QipNjQZ5hNfWw9O9n5zXgZ4E9FkO6W4W3oR2Z8x9C=s1360-w1360-h1020", description: "Rejoignez un groupe et explorez la splendide île sauvage des Pisans près de Boulimate." },
  ];

  let experiences: any[] = [];
  try {
    const { data } = await supabase
      .from("experiences")
      .select(`
        *,
        boats (
          id,
          name,
          owner_name,
          providers (
            id,
            company_name
          )
        ),
        destinations (
          id,
          name
        )
      `);
      
    if (data && data.length > 0) {
      experiences = data.map((e: any) => ({
        id: e.id,
        title: e.title,
        partner: e.boats?.providers?.company_name || e.boats?.owner_name || "Partenaire",
        provider_id: e.boats?.providers?.id || null,
        boat_id: e.boats?.id || null,
        destination: e.destinations?.name || "Béjaïa",
        destination_id: e.destinations?.id || null,
        type: e.type,
        price_total: e.price_total,
        price_per_seat: e.price_per_seat,
        duration_minutes: e.duration_minutes,
        max_guests: e.max_guests,
        status: e.is_published ? "approved" : "rejected",
        main_image_url: e.main_image_url,
        description: e.description,
      }));
    }
  } catch (err) {
    console.error("Failed to fetch experiences:", err);
  }

  if (experiences.length === 0) {
    experiences = INITIAL_EXPERIENCES;
  }

  // Load mock db overrides if placeholder
  const mockDb = await getPersistedMockData();
  if (mockDb) {
    experiences = experiences.map((exp) => {
      const updates = mockDb.experiences?.[exp.id];
      if (updates) {
        const status = updates.is_published !== undefined 
          ? (updates.is_published ? "approved" : "rejected")
          : (updates.status || exp.status);
        return {
          ...exp,
          ...updates,
          status
        };
      }
      return exp;
    });
    if (mockDb.createdExperiences) {
      const mappedCreated = mockDb.createdExperiences.map((c: any) => ({
        id: c.id,
        title: c.title,
        partner: c.partnerName || "Nouveau Partenaire",
        provider_id: c.provider_id || null,
        boat_id: c.boat_id || null,
        destination: c.destinationName || "Béjaïa",
        destination_id: c.destination_id || null,
        type: c.type,
        price_total: c.price_total,
        price_per_seat: c.price_per_seat,
        duration_minutes: c.duration_minutes,
        max_guests: c.max_guests,
        status: c.is_published ? "approved" : (c.status || "rejected"),
        main_image_url: c.main_image_url,
        description: c.description || "",
        images: c.images || [c.main_image_url],
        included_services: c.included_services || "",
        requirements: c.requirements || "",
      }));
      experiences = [...experiences, ...mappedCreated];
    }
  }

  // Fetch partners
  let partnersList: any[] = [];
  const partnersRes = await getAdminPartners();
  if (partnersRes.success && partnersRes.partners) {
    partnersList = partnersRes.partners;
  } else {
    partnersList = [
      { id: "mock-partner-id", name: "Capitaine Salim" },
      { id: "p2", name: "Evasion Marine" },
      { id: "p3", name: "Azul Sea Voyager" }
    ];
  }

  // Define destinations
  const destinationsList = [
    { id: "d1", name: "Cap Carbon" },
    { id: "d2", name: "Île des Pisans" },
    { id: "d3", name: "Gouraya" },
    { id: "d4", name: "Les Falaises" }
  ];

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6">
      <ExperiencesListAdmin 
        initialExperiences={experiences} 
        partners={partnersList} 
        destinations={destinationsList} 
      />
    </div>
  );
}
