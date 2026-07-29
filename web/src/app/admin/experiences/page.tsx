import { createClient } from "@/lib/supabase/server";
import { ExperiencesListAdmin } from "@/components/admin/experiences-list-admin";
import { getAdminPartners } from "@/lib/actions/admin-bookings";

export const dynamic = "force-dynamic";

export default async function AdminExperiencesPage() {
  const supabase = await createClient();

  let experiences: any[] = [];
  try {
    const { data, error } = await supabase
      .from("experiences")
      .select(`
        *,
        boats (
          id,
          name,
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
    if (error) throw error;
      
    if (data && data.length > 0) {
      experiences = data.map((e: any) => ({
        id: e.id,
        title: e.title,
        partner: e.boats?.providers?.company_name || "Partenaire",
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
        contentStatus: e.status || "draft",
        main_image_url: e.main_image_url,
        description: e.description,
      }));
    }
  } catch (err) {
    console.error("Failed to fetch experiences:", err);
  }

  let partnersList: any[] = [];
  const partnersRes = await getAdminPartners();
  if (partnersRes.success && partnersRes.partners) {
    partnersList = partnersRes.partners;
  }

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
