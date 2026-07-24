import { createClient } from "@/lib/supabase/server";
import { FleetList } from "@/components/partner/fleet-list";
import { IMAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PartnerBoatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6">
      <FleetList initialExperiences={experiences} />
    </div>
  );
}
