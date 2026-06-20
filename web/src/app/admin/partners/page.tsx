import { createClient } from "@/lib/supabase/server";
import { PartnersListAdmin } from "@/components/admin/partners-list-admin";
import { getPersistedMockData } from "@/lib/actions/experiences";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  const supabase = await createClient();

  const MOCK_PARTNERS = [
    { 
      id: "mock-partner-id", 
      name: "Capitaine Salim", 
      phone: "0550123456", 
      email: "salim@example.com", 
      boats: 2, 
      boatsList: [
        { id: "mb1", name: "Sirène de Béjaïa", type: "private", capacity: 6 },
        { id: "mb2", name: "Dauphin Bleu", type: "shared", capacity: 12 }
      ],
      joined: "Mai 2026", 
      status: "active",
      commission_rate: 15.00,
      commission_effective_date: "2026-06-18",
      commission_status: "active",
      commission_last_modified: new Date().toISOString()
    },
    { 
      id: "p2", 
      name: "Evasion Marine", 
      phone: "0660987654", 
      email: "contact@evasion.dz", 
      boats: 2, 
      boatsList: [
        { id: "mb3", name: "Evasion Marine I", type: "private", capacity: 8 },
        { id: "mb4", name: "Evasion Marine II", type: "private", capacity: 10 }
      ],
      joined: "Avril 2026", 
      status: "active",
      commission_rate: 15.00,
      commission_effective_date: "2026-06-18",
      commission_status: "active",
      commission_last_modified: new Date().toISOString()
    },
    { 
      id: "p3", 
      name: "Nautica DZ", 
      phone: "0771223344", 
      email: "nautica@example.com", 
      boats: 1, 
      boatsList: [
        { id: "mb5", name: "Nautica Fast", type: "jetski", capacity: 2 }
      ],
      joined: "Juin 2026", 
      status: "pending",
      commission_rate: 15.00,
      commission_effective_date: "2026-06-18",
      commission_status: "active",
      commission_last_modified: new Date().toISOString()
    },
    { 
      id: "p4", 
      name: "Amine Boat", 
      phone: "0555667788", 
      email: "amine@example.com", 
      boats: 0, 
      boatsList: [],
      joined: "Aujourd'hui", 
      status: "pending",
      commission_rate: 15.00,
      commission_effective_date: "2026-06-18",
      commission_status: "active",
      commission_last_modified: new Date().toISOString()
    },
  ];

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
      partners = providersList.map((prov: any) => ({
        id: prov.id,
        name: prov.company_name || prov.profiles?.full_name || "Partenaire Safar",
        phone: prov.profiles?.phone || "0550000000",
        email: prov.profiles?.avatar_url || "partner@safar.dz",
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

  // Load filesystem mock DB overrides if we are in placeholder mode
  const mockDb = await getPersistedMockData();
  const dbBookings = mockDb?.bookings || bookings;

  if (mockDb && mockDb.partners) {
    // Load all partners dynamically from mock DB (including newly created ones)
    partners = Object.values(mockDb.partners);
  } else if (partners.length === 0) {
    partners = MOCK_PARTNERS;
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
