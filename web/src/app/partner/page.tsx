import Link from "next/link";
import { CheckCircle2, Clock, MapPin, Users, Anchor, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPriceDA, formatTime } from "@/lib/utils/format";

export default async function PartnerDashboardPage() {
  // Dans la version finale, ces données seront récupérées depuis Supabase via l'ID du provider
  const MOCK_STATS = {
    todayRevenue: 4500000, // 45,000 DA
    todayBookings: 3,
    capacityLeft: 12,
  };

  const MOCK_TODAY_QUEUE = [
    { id: "1", ref: "SF-9042", time: "09:00", title: "Balade Cap Carbon", guests: 4, status: "confirmed", client: "Amine B." },
    { id: "2", ref: "SF-4190", time: "14:00", title: "Sortie Pêche", guests: 2, status: "pending", client: "Karim M." },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono text-on-surface">Bonjour, Capitaine</h1>
          <p className="text-on-surface-variant">Voici l'état de votre flotte pour aujourd'hui.</p>
        </div>
        <Button asChild>
          <Link href="/partner/availability">Gérer mes disponibilités</Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none custom-shadow bg-surface">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-primary-container flex items-center justify-center text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <Badge variant="success">+12% vs hier</Badge>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Revenus du jour (estimés)</p>
            <h2 className="text-3xl font-bold font-mono text-on-surface">{formatPriceDA(MOCK_STATS.todayRevenue)}</h2>
          </CardContent>
        </Card>

        <Card className="border-none custom-shadow bg-surface">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <Anchor className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Sorties prévues</p>
            <h2 className="text-3xl font-bold font-mono text-on-surface">{MOCK_STATS.todayBookings}</h2>
          </CardContent>
        </Card>

        <Card className="border-none custom-shadow bg-surface">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Places restantes</p>
            <h2 className="text-3xl font-bold font-mono text-on-surface">{MOCK_STATS.capacityLeft}</h2>
          </CardContent>
        </Card>
      </div>

      {/* Programme du jour */}
      <Card className="border-none custom-shadow">
        <CardHeader className="border-b border-surface-variant">
          <CardTitle className="font-mono text-xl">Programme de la journée</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-surface-variant">
            {MOCK_TODAY_QUEUE.map((booking) => (
              <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 hover:bg-surface-container-lowest transition-colors">
                <div className="flex items-start gap-4 mb-4 sm:mb-0">
                  <div className="bg-surface-variant px-3 py-2 rounded-lg text-center min-w-20">
                    <span className="block text-sm text-on-surface-variant font-medium">Heure</span>
                    <span className="block font-bold text-on-surface font-mono text-lg">{booking.time}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-on-surface">{booking.title}</h3>
                      {booking.status === "confirmed" ? (
                        <Badge variant="success">Confirmé</Badge>
                      ) : (
                        <Badge variant="warning">En attente</Badge>
                      )}
                    </div>
                    <div className="text-sm text-on-surface-variant flex items-center gap-4">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {booking.guests} pers.</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Client: {booking.client}</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full sm:w-auto flex gap-2">
                  <Button variant="outline" className="flex-1 sm:flex-none">Détails</Button>
                  {booking.status === "pending" && (
                    <Button className="flex-1 sm:flex-none bg-success hover:bg-success/90 text-white">Accepter</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
