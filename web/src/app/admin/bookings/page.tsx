import { getAdminBookings, getAdminPartners } from "@/lib/actions/admin-bookings";
import { BookingsListAdmin } from "@/components/admin/bookings-list-admin";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookingsRes = await getAdminBookings();
  const partnersRes = await getAdminPartners();

  const bookings = bookingsRes.success && bookingsRes.bookings ? bookingsRes.bookings : [];
  const partners = partnersRes.success && partnersRes.partners ? partnersRes.partners : [];

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary mb-1">Gestion des réservations</h1>
          <p className="text-body-lg text-on-surface-variant">Gérez les réservations clients et assignez-les aux meilleurs partenaires disponibles.</p>
        </div>
      </div>
      <BookingsListAdmin initialBookings={bookings} partners={partners} />
    </div>
  );
}

