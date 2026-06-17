import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Anchor, TrendingUp, AlertCircle, DollarSign, Activity } from "lucide-react";
import { formatPriceDA } from "@/lib/utils/format";

export default async function AdminDashboardPage() {
  const ADMIN_STATS = {
    totalRevenuePlatform: 25000000, // 250,000 DA
    totalCommissionsSafar: 3750000, // 37,500 DA (15%)
    activePartners: 12,
    totalBookingsMonth: 84,
  };

  const RECENT_ALERTS = [
    { id: 1, type: "pending_approval", msg: "Nouveau bateau en attente de validation (Sirène II)", time: "Il y a 2h" },
    { id: 2, type: "payment_due", msg: "Commission en retard de paiement (Capitaine Salim)", time: "Il y a 5h" },
  ];

  const RECENT_BOOKINGS = [
    { id: "1", ref: "SF-9042", date: "Aujourd'hui, 09:00", partner: "Capitaine Salim", total: 20000, commission: 3000, status: "confirmed" },
    { id: "2", ref: "SF-4190", date: "Aujourd'hui, 14:00", partner: "Evasion Marine", total: 15000, commission: 2250, status: "pending" },
    { id: "3", ref: "SF-8831", date: "Hier, 16:00", partner: "Capitaine Salim", total: 10500, commission: 1575, status: "cancelled" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-bold font-mono text-on-surface">Vue Globale Safar DZ</h1>
        <p className="text-on-surface-variant">Statistiques et santé de la plateforme.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none custom-shadow bg-surface">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <Badge variant="success" className="text-xs">+18%</Badge>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Volume d'Affaires (Mois)</p>
            <h2 className="text-2xl font-bold font-mono text-on-surface">{formatPriceDA(ADMIN_STATS.totalRevenuePlatform)}</h2>
          </CardContent>
        </Card>

        <Card className="border-none custom-shadow bg-surface border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-full bg-success-container flex items-center justify-center text-on-success-container">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Revenus Safar DZ (15%)</p>
            <h2 className="text-2xl font-bold font-mono text-on-surface">{formatPriceDA(ADMIN_STATS.totalCommissionsSafar)}</h2>
          </CardContent>
        </Card>

        <Card className="border-none custom-shadow bg-surface">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Partenaires Actifs</p>
            <h2 className="text-2xl font-bold font-mono text-on-surface">{ADMIN_STATS.activePartners}</h2>
          </CardContent>
        </Card>

        <Card className="border-none custom-shadow bg-surface">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-on-surface-variant mb-1">Réservations (Mois)</p>
            <h2 className="text-2xl font-bold font-mono text-on-surface">{ADMIN_STATS.totalBookingsMonth}</h2>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Feed */}
        <div className="lg:col-span-2">
          <Card className="border-none custom-shadow h-full">
            <CardHeader className="border-b border-surface-variant">
              <CardTitle className="font-mono text-xl">Dernières transactions réseau</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-surface-variant">
                {RECENT_BOOKINGS.map((booking) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-surface-container-lowest transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-primary">{booking.ref}</span>
                        {booking.status === "confirmed" && <Badge variant="success">Confirmé</Badge>}
                        {booking.status === "pending" && <Badge variant="warning">En attente</Badge>}
                        {booking.status === "cancelled" && <Badge variant="danger">Annulé</Badge>}
                      </div>
                      <div className="text-sm text-on-surface-variant">
                        <span className="font-medium">{booking.partner}</span> • {booking.date}
                      </div>
                    </div>
                    <div className="text-right mt-2 sm:mt-0">
                      <div className="font-bold text-on-surface">{formatPriceDA(booking.total * 100)}</div>
                      <div className="text-xs font-semibold text-success flex items-center justify-end">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        + {formatPriceDA(booking.commission * 100)} Safar
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Tasks */}
        <div>
          <Card className="border-none custom-shadow bg-surface-container-lowest h-full">
            <CardHeader className="border-b border-surface-variant">
              <CardTitle className="font-mono text-xl flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-warning" /> 
                Alertes & Tâches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-surface-variant">
                {RECENT_ALERTS.map((alert) => (
                  <div key={alert.id} className="p-4">
                    <p className="text-sm font-medium text-on-surface mb-2">{alert.msg}</p>
                    <div className="flex justify-between items-center text-xs text-on-surface-variant">
                      <span>{alert.time}</span>
                      <a href="#" className="text-primary hover:underline font-semibold">Traiter</a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
