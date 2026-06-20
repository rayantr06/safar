import { createClient } from "@/lib/supabase/server";
import { FinanceClient } from "@/components/admin/finance-client";
import { getPersistedMockData } from "@/lib/actions/experiences";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  const supabase = await createClient();

  let transactions: any[] = [];
  let partners: any[] = [];

  try {
    // 1. Fetch bookings with experience and provider details
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_ref,
        client_name,
        total_amount,
        commission_amount,
        provider_amount,
        status,
        experiences (
          title,
          boats (
            owner_name,
            owner_phone,
            provider_id
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (!bookingsError && bookingsData && bookingsData.length > 0) {
      transactions = bookingsData.map((b: any) => ({
        id: b.id,
        ref: b.booking_ref || `#SF-${b.id.substring(0, 4)}`,
        client: b.client_name || "Client Safar",
        experience: b.experiences?.title || "Aventure Marine",
        partner: b.experiences?.boats?.owner_name || "Partenaire Safar",
        total: b.total_amount ? b.total_amount / 100 : 0,
        commission: b.commission_amount ? b.commission_amount / 100 : 0,
        net: b.provider_amount ? b.provider_amount / 100 : 0,
        status: b.status === "completed" ? "Paid" : b.status === "confirmed" ? "Processing" : "Pending",
      }));

      // 2. Aggregate partner payouts dynamically
      const partnersMap: Record<string, any> = {};
      bookingsData.forEach((b: any) => {
        const boat = b.experiences?.boats;
        if (!boat) return;

        const providerId = boat.provider_id || "unknown";
        const ownerName = boat.owner_name || "Partenaire Safar";

        if (!partnersMap[providerId]) {
          partnersMap[providerId] = {
            id: providerId,
            name: ownerName,
            trips: 0,
            amountOwed: 0,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNjrwGq8MgjrMapq5mDEd6FKw8ThW8zSN3TtsIQYov7aLyaAB72oRtdKbe2XD8eVciZaTSiGgGSnKfUY_V1lRqUSRHs0S_Gg4NE83_2S1c6ygxInCX_-rGHTsufI-qUKr17rQpEuRBySl3Uhvg4ikOnOVeauNkSS1pFWEGIf4GO5pOSLHJ_obPinnX0nXhBXb1kmi_xZuYHghTjRlysvSD0_uflU6ESH_wa7VLEeojHn3QKoY6TQLk41Lg-Y3cOM9IviVXREbpktA", // Captain default
            status: "unsettled",
          };
        }

        partnersMap[providerId].trips += 1;
        if (b.status === "confirmed" || b.status === "completed") {
          partnersMap[providerId].amountOwed += b.provider_amount ? b.provider_amount / 100 : 0;
        }
      });

      partners = Object.values(partnersMap);
    }
  } catch (err) {
    console.error("Error loading admin finance data from DB:", err);
  }

  // Load commission rate override from mock db
  let initialCommissionRate = 15;
  const mockDb = await getPersistedMockData();
  if (mockDb && typeof mockDb.commission_rate === "number") {
    initialCommissionRate = mockDb.commission_rate;
  }

  return (
    <FinanceClient
      initialTransactions={transactions.length > 0 ? transactions : undefined}
      initialPartners={partners.length > 0 ? partners : undefined}
      initialCommissionRate={initialCommissionRate}
    />
  );
}
