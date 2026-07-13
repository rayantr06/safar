import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PartnersListAdmin } from "@/components/admin/partners-list-admin";
import { getPersistedMockData } from "@/lib/actions/experiences";

export const dynamic = "force-dynamic";

const isPlaceholder = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

export default async function AdminPartnersPage() {
  const supabase = await createClient();

  let partners: any[] = [];
  let bookings: any[] = [];
  try {
    const { data: providersList, error: provError } = await supabase
      .from("providers")
      .select(`
        id,
        company_name,
        is_active,
        commission_rate,
        commission_effective_date,
        commission_status,
        commission_last_modified,
        profiles (
          full_name,
          phone,
          avatar_url
        ),
        boats (
          id,
          name,
          type,
          capacity
        )
      `);

    if (!provError && providersList) {
      // profiles has no email column (email lives on auth.users) — fetch it
      // via the admin API instead of the earlier bug that displayed avatar_url.
      let emailById: Record<string, string> = {};
      if (!isPlaceholder()) {
        try {
          const admin = createAdminClient() as any;
          const { data: usersRes } = await admin.auth.admin.listUsers({ perPage: 1000 });
          emailById = Object.fromEntries(
            (usersRes?.users || []).map((u: any) => [u.id, u.email])
          );
        } catch (err) {
          console.error("Failed to fetch partner emails:", err);
        }
      }

      partners = providersList.map((prov: any) => ({
        id: prov.id,
        name: prov.company_name || prov.profiles?.full_name || "Partenaire Safar",
        phone: prov.profiles?.phone || "0550000000",
        email: emailById[prov.id] || "partner@safar.dz",
        boats: prov.boats?.length || 0,
        boatsList: prov.boats || [],
        joined: "Récemment",
        status: prov.is_active ? "active" : "pending",
        commission_rate: Number(prov.commission_rate || 15.00),
        commission_effective_date: prov.commission_effective_date || "2026-06-18",
        commission_status: prov.commission_status || "active",
        commission_last_modified: prov.commission_last_modified || new Date().toISOString()
      }));
    }

    const { data: bookingsList } = await supabase
      .from("bookings")
      .select("provider_id, total_amount, commission_amount, booking_source, status");
    if (bookingsList) {
      bookings = bookingsList;
    }
  } catch (err) {
    console.error("Error fetching admin partners:", err);
  }

  // The local JSON mock DB is a local-dev-only fallback (isPlaceholder mode);
  // it must never overlay/replace real Supabase data in production.
  const mockDb = isPlaceholder() ? await getPersistedMockData() : null;
  const dbBookings = mockDb?.bookings || bookings;

  if (mockDb && mockDb.partners) {
    // Load all partners dynamically from mock DB (including newly created ones)
    partners = Object.values(mockDb.partners);
  }

  // Dynamically resolve fleet count and boats list for each partner from mockDb.boats
  if (mockDb) {
    const allBoats = Object.values(mockDb.boats || {}) as any[];
    partners = partners.map((p) => {
      const partnerBoats = allBoats.filter((b: any) => b.provider_id === p.id);
      return {
        ...p,
        boats: partnerBoats.length,
        boatsList: partnerBoats
      };
    });
  }

  // Calculate dynamic stats from bookings for each partner
  partners = partners.map((p) => {
    const pBookings = dbBookings.filter(
      (b: any) => b.provider_id === p.id && b.status !== "cancelled"
    );
    const safarBookings = pBookings.filter((b: any) => b.booking_source === "SAFAR_DZ");
    const directBookings = pBookings.filter(
      (b: any) => b.booking_source === "PARTNER_DIRECT" || b.booking_source === "PARTNER_MANUAL"
    );

    const safarRevenue = safarBookings.reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0) / 100;
    const safarCommissions = safarBookings.reduce((sum: number, b: any) => sum + Number(b.commission_amount || 0), 0) / 100;
    const directRevenue = directBookings.reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0) / 100;

    return {
      ...p,
      safar_revenue: safarRevenue,
      safar_commissions: safarCommissions,
      direct_revenue: directRevenue,
      total_revenue: safarRevenue + directRevenue // Total gross revenue in DA
    };
  });

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary mb-1">Partenaires</h1>
          <p className="text-body-lg text-on-surface-variant">Gérez le réseau de propriétaires et capitaines de la plateforme.</p>
        </div>
      </div>
      <PartnersListAdmin initialPartners={partners} />
    </div>
  );
}
