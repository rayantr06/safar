import { createClient } from "@/lib/supabase/server";
import { ExperiencesListAdmin } from "@/components/admin/experiences-list-admin";
import { getPersistedMockData } from "@/lib/actions/experiences";
import { getAdminPartners } from "@/lib/actions/admin-bookings";

export const dynamic = "force-dynamic";

const isPlaceholder = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

export default async function AdminExperiencesPage() {
  const supabase = await createClient();

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

  // The local JSON mock DB is a local-dev-only fallback (isPlaceholder mode);
  // it must never overlay/replace real Supabase data in production.
  if (isPlaceholder()) {
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
  }

  // Fetch partners
  let partnersList: any[] = [];
  const partnersRes = await getAdminPartners();
  if (partnersRes.success && partnersRes.partners) {
    partnersList = partnersRes.partners;
  }

  // Fetch destinations for the create/edit form dropdown
  let destinationsList: any[] = [];
  try {
    const { data } = await supabase.from("destinations").select("id, name").order("name");
    destinationsList = data || [];
  } catch (err) {
    console.error("Failed to fetch destinations for experiences page:", err);
  }

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
