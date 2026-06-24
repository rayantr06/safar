import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WebsiteCmsAdmin } from "@/components/admin/website-cms-admin";
import { getCmsConfig, getAccommodations } from "@/lib/actions/website-cms";
import { getPersistedMockData } from "@/lib/actions/experiences";
import { getDestinations } from "@/lib/queries/experiences";

export const dynamic = "force-dynamic";

export default async function AdminWebsitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check role
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
      
    if ((profile as any)?.role !== "admin") {
      redirect("/admin"); // Only admin can access website management
    }
  } catch (err) {
    console.error("Auth check failed in admin/website:", err);
    redirect("/admin");
  }

  // Fetch CMS config
  const cmsConfig = await getCmsConfig();

  // Load Experiences from mock DB
  let experiences: any[] = [];
  const mockDb = await getPersistedMockData();
  
  // Load from Supabase first
  try {
    const { data } = await supabase
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
      
    if (data && data.length > 0) {
      experiences = data.map((e: any) => ({
        id: e.id,
        title: e.title,
        partner: e.boats?.providers?.company_name || "Partenaire",
        provider_id: e.boats?.providers?.id || null,
        boat_id: e.boats?.id || null,
        destination: e.destinations?.name || "Béjaïa",
        type: e.type,
        price_total: e.price_total,
        main_image_url: e.main_image_url,
      }));
    }
  } catch (err) {
    console.error("Failed to fetch experiences:", err);
  }

  // Merge with mock DB data
  if (mockDb) {
    if (mockDb.experiences) {
      for (const [id, exp] of Object.entries(mockDb.experiences)) {
        const e = exp as any;
        if (!experiences.find((x: any) => x.id === id)) {
          experiences.push({
            id,
            title: e.title || "",
            partner: e.partnerName || e.partner || "Partenaire",
            provider_id: e.provider_id || null,
            boat_id: e.boat_id || null,
            destination: e.destinationName || e.destination || "Béjaïa",
            type: e.type || "private",
            price_total: e.price_total,
            main_image_url: e.main_image_url,
          });
        }
      }
    }

    if (mockDb.createdExperiences) {
      const mappedCreated = mockDb.createdExperiences.map((c: any) => ({
        id: c.id,
        title: c.title,
        partner: c.partnerName || "Nouveau Partenaire",
        provider_id: c.provider_id || null,
        boat_id: c.boat_id || null,
        destination: c.destinationName || "Béjaïa",
        type: c.type,
        price_total: c.price_total,
        main_image_url: c.main_image_url,
      }));
      experiences = [...experiences, ...mappedCreated];
    }
  }

  // Load Destinations
  const destinations = await getDestinations();
  const accommodations = await getAccommodations();

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6">
      <WebsiteCmsAdmin
        initialCms={cmsConfig}
        experiences={experiences}
        destinations={destinations}
        accommodations={accommodations}
      />
    </div>
  );
}
