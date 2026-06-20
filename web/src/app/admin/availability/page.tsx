import { getAdminBookings, getAdminPartners } from "@/lib/actions/admin-bookings";
import { AvailabilityListAdmin } from "@/components/admin/availability-list-admin";

export const dynamic = "force-dynamic";

export default async function AdminAvailabilityPage() {
  const bookingsRes = await getAdminBookings();
  const partnersRes = await getAdminPartners();

  const bookings = bookingsRes.success && bookingsRes.bookings ? bookingsRes.bookings : [];
  const partners = partnersRes.success && partnersRes.partners ? partnersRes.partners : [];

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6">
      <AvailabilityListAdmin initialBookings={bookings} partners={partners} />
    </div>
  );
}

