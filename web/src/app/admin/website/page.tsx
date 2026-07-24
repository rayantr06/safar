import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WebsiteCmsAdmin } from "@/components/admin/website-cms-admin";
import { getCmsConfig, getAccommodations } from "@/lib/actions/website-cms";
import { getDestinations } from "@/lib/queries/experiences";

export const dynamic = "force-dynamic";

export default async function AdminWebsitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
      
    if ((profile as any)?.role !== "admin") {
      redirect("/admin");
    }
  } catch (err) {
    console.error("Auth check failed in admin/website:", err);
    redirect("/admin");
  }

  const cmsConfig = await getCmsConfig();

  let experiences: any[] = [];
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
