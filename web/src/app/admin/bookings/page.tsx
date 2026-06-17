import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar, Users, Phone, Anchor } from "lucide-react";
import { formatPriceDA, formatPhone } from "@/lib/utils/format";

export default async function AdminBookingsPage() {
  const MOCK_BOOKINGS = [
    { id: "1", ref: "SF-9042", date: "2026-07-20", time: "09:00", title: "Balade Cap Carbon", guests: 4, status: "confirmed", client: "Amine B.", phone: "0550000000", total: 20000, partner: "Capitaine Salim" },
    { id: "2", ref: "SF-4190", date: "2026-07-20", time: "14:00", title: "Sortie Pêche", guests: 2, status: "pending", client: "Karim M.", phone: "0660000000", total: 15000, partner: "Evasion Marine" },
    { id: "3", ref: "SF-1122", date: "2026-07-19", time: "10:00", title: "Balade Cap Carbon", guests: 6, status: "completed", client: "Sarah L.", phone: "0770000000", total: 20000, partner: "Capitaine Salim" },
    { id: "4", ref: "SF-8831", date: "2026-07-18", time: "16:00", title: "Tour Partagé", guests: 1, status: "cancelled", client: "Yanis D.", phone: "0551111111", total: 3500, partner: "Nautica DZ" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return <Badge variant="success">Confirmé</Badge>;
      case "pending": return <Badge variant="warning">En attente</Badge>;
      case "completed": return <Badge variant="default" className="bg-primary text-white">Terminé</Badge>;
      case "cancelled": return <Badge variant="danger">Annulé</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold font-mono text-on-surface">Supervision des Réservations</h1>
        <Button variant="outline">Exporter la liste</Button>
      </div>

      <Card className="border-none custom-shadow bg-surface">
        <CardHeader className="border-b border-surface-variant flex flex-col sm:flex-row gap-4 items-center justify-between pb-4">
          <div className="relative w-full sm:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input placeholder="Chercher par réf, client, partenaire..." className="pl-10" />
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Filter className="h-4 w-4 mr-2" /> Statut
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Anchor className="h-4 w-4 mr-2" /> Partenaire
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Calendar className="h-4 w-4 mr-2" /> Date
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-container-lowest text-xs text-on-surface-variant uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Référence</th>
                <th className="px-6 py-4 font-semibold">Partenaire</th>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Activité & Date</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                <th className="px-6 py-4 font-semibold text-right">Montant Global</th>
                <th className="px-6 py-4 font-semibold text-right text-success">Com. (15%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {MOCK_BOOKINGS.map((booking) => (
                <tr key={booking.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-primary">{booking.ref}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-on-surface">{booking.partner}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-on-surface">{booking.client}</div>
                    <div className="text-on-surface-variant text-xs">{formatPhone(booking.phone)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-on-surface line-clamp-1">{booking.title}</div>
                    <div className="text-on-surface-variant text-xs">{booking.date} à {booking.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-on-surface-variant">
                    {formatPriceDA(booking.total * 100)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-success">
                    {formatPriceDA(booking.total * 100 * 0.15)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
