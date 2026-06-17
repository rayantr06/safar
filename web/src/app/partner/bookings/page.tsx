import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar, Users, Phone } from "lucide-react";
import { formatPriceDA, formatPhone } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/server";
import { BookingActions } from "@/components/partner/booking-actions";

export default async function PartnerBookingsPage() {
  const supabase = await createClient();
  
  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Fetch real bookings
  let bookings: any[] = [];
  if (user) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences ( title )
      `)
      .eq("provider_id", user.id)
      .order("created_at", { ascending: false });
      
    if (!error && data) bookings = data;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return <Badge className="bg-success text-white">Confirmé</Badge>;
      case "new": return <Badge className="bg-primary text-white">Nouvelle</Badge>;
      case "pending": return <Badge className="bg-warning text-white">En attente</Badge>;
      case "completed": return <Badge className="bg-surface-variant text-on-surface-variant">Terminé</Badge>;
      case "cancelled": return <Badge className="bg-danger text-white">Annulé</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold font-mono text-on-surface">Toutes les réservations</h1>
      </div>

      <Card className="border-none custom-shadow bg-surface">
        <CardHeader className="border-b border-surface-variant flex flex-col sm:flex-row gap-4 items-center justify-between pb-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input placeholder="Chercher par nom, réf ou téléphone..." className="pl-10" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Filter className="h-4 w-4 mr-2" /> Statut
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Calendar className="h-4 w-4 mr-2" /> Date
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-x-auto">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">
              Aucune réservation trouvée.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-container-lowest text-xs text-on-surface-variant uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Référence</th>
                  <th className="px-6 py-4 font-semibold">Client</th>
                  <th className="px-6 py-4 font-semibold">Expérience</th>
                  <th className="px-6 py-4 font-semibold">Date & Heure</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                  <th className="px-6 py-4 font-semibold text-right">Net Partenaire</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{booking.booking_ref}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-on-surface">{booking.client_name}</div>
                      <div className="text-on-surface-variant text-xs flex items-center mt-1">
                        <Phone className="h-3 w-3 mr-1" /> {formatPhone(booking.client_phone)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-on-surface">{booking.experiences?.title || "Activité"}</div>
                      <div className="text-on-surface-variant text-xs flex items-center mt-1">
                        <Users className="h-3 w-3 mr-1" /> {booking.guest_count} pers.
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-on-surface">{booking.booking_date}</div>
                      <div className="text-on-surface-variant text-xs">{booking.booking_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold">
                      {formatPriceDA(booking.provider_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <BookingActions bookingId={booking.id} currentStatus={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
