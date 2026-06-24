import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccommodationsListAdmin } from "@/components/admin/accommodations-list-admin";
import { getAccommodations } from "@/lib/actions/website-cms";

export const dynamic = "force-dynamic";

export default async function AdminAccommodationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const accommodations = await getAccommodations();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface text-2xl font-bold">
            Hébergements
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Gérez les villas, appartements et logements sur la plateforme.
          </p>
        </div>
      </div>
      <AccommodationsListAdmin initialAccommodations={accommodations} />
    </div>
  );
}
