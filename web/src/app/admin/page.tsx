import { getPersistedMockData } from "@/lib/actions/experiences";
import { formatPriceDA } from "@/lib/utils/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const db = await getPersistedMockData();

  // Calculate real stats from mock DB
  const bookings = db.bookings || [];
  const partners = db.partners || {};
  const boats = db.boats || {};
  const experiences = db.experiences || {};
  const createdExperiences = db.createdExperiences || [];

  const activePartners = Object.values(partners).filter((p: any) => p.status === "active" || !p.is_disabled).length;
  const activeBoats = Object.values(boats).filter((b: any) => b.is_active !== false).length;
  const totalExperiences = Object.keys(experiences).length + createdExperiences.length;

  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b: any) => b.booking_date === today);
  const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
  const totalCommission = bookings.reduce((sum: number, b: any) => sum + (b.commission_amount || 0), 0);

  const recentBookings = bookings.slice(-5).reverse();

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-green-100 text-green-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusLabels: Record<string, string> = {
    new: "Nouveau",
    pending: "En attente",
    confirmed: "Confirmé",
    completed: "Terminé",
    cancelled: "Annulé",
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* KPIs Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Bookings */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col justify-between h-36 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-primary/10 rounded-xl text-lg">🎫</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Réservations Aujourd&apos;hui</p>
            <h3 className="font-headline-sm text-headline-sm font-bold text-2xl">
              {todayBookings.length} <span className="text-xs text-on-surface-variant font-normal">réservations</span>
            </h3>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col justify-between h-36 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-tertiary-fixed rounded-xl text-lg">💰</span>
            <span className="text-xs font-bold text-on-surface-variant">DA</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Revenus Total</p>
            <h3 className="font-headline-sm text-headline-sm font-bold text-2xl">
              {totalRevenue > 0 ? formatPriceDA(totalRevenue) : "0 DA"}
            </h3>
          </div>
        </div>

        {/* Commission */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col justify-between h-36 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-secondary-container rounded-xl text-lg">📈</span>
            <span className="text-xs font-bold text-primary">{db.commission_rate || 15}%</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Commission Safar DZ</p>
            <h3 className="font-headline-sm text-headline-sm font-bold text-2xl">
              {totalCommission > 0 ? formatPriceDA(totalCommission) : "0 DA"}
            </h3>
          </div>
        </div>

        {/* Active Partners */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col justify-between h-36 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-green-100 text-green-700 rounded-xl text-lg">🤝</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Partenaires Actifs</p>
            <h3 className="font-headline-sm text-headline-sm font-bold text-2xl">
              {activePartners} <span className="text-xs text-on-surface-variant font-normal">partenaires</span>
            </h3>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Recent Bookings */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/30 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface text-lg font-bold">Dernières réservations</h2>
              <Link href="/admin/bookings" className="text-xs text-primary font-bold hover:underline">
                Tout voir →
              </Link>
            </div>
            {recentBookings.length > 0 ? (
              <div className="divide-y divide-outline-variant/15">
                {recentBookings.map((b: any) => (
                  <div key={b.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {b.booking_ref?.slice(0, 4) || "SF"}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{b.client_name}</p>
                        <p className="text-xs text-on-surface-variant">{b.booking_date} · {b.booking_time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-on-surface">
                        {formatPriceDA(b.total_amount || 0)}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${statusColors[b.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabels[b.status] || b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-on-surface-variant font-bold text-sm">Aucune réservation</p>
                <p className="text-xs text-outline mt-1">Les réservations apparaîtront ici</p>
              </div>
            )}
          </div>

          {/* Platform Stats */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/30 shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface text-lg font-bold mb-6">Vue d&apos;ensemble</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-surface-container rounded-2xl">
                <p className="text-2xl font-bold text-primary">{totalExperiences}</p>
                <p className="text-xs text-on-surface-variant font-bold mt-1">Expériences</p>
              </div>
              <div className="text-center p-4 bg-surface-container rounded-2xl">
                <p className="text-2xl font-bold text-primary">{activeBoats}</p>
                <p className="text-xs text-on-surface-variant font-bold mt-1">Bateaux</p>
              </div>
              <div className="text-center p-4 bg-surface-container rounded-2xl">
                <p className="text-2xl font-bold text-primary">{activePartners}</p>
                <p className="text-xs text-on-surface-variant font-bold mt-1">Partenaires</p>
              </div>
              <div className="text-center p-4 bg-surface-container rounded-2xl">
                <p className="text-2xl font-bold text-primary">{bookings.length}</p>
                <p className="text-xs text-on-surface-variant font-bold mt-1">Réservations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* System Status */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/30 shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface text-base font-bold mb-4 flex items-center gap-2">
              ⚙️ Statut du système
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-xl">
                <span className="text-xs font-bold text-on-surface">Plateforme</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Opérationnelle
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-xl">
                <span className="text-xs font-bold text-on-surface">Base de données</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Connectée
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-xl">
                <span className="text-xs font-bold text-on-surface">Contenu</span>
                <span className="text-[10px] font-bold text-amber-600">
                  {totalExperiences === 0 ? "En attente de contenu" : `${totalExperiences} expériences`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/30 shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface text-base font-bold mb-4">
              Raccourcis
            </h2>
            <div className="space-y-3">
              <Link href="/admin/experiences" className="flex items-center gap-3 p-3 bg-surface-container rounded-xl hover:bg-primary hover:text-white transition-all group">
                <span className="text-lg">⛵</span>
                <span className="text-xs font-bold uppercase tracking-wider">Gérer Expériences</span>
              </Link>
              <Link href="/admin/accommodations" className="flex items-center gap-3 p-3 bg-surface-container rounded-xl hover:bg-primary hover:text-white transition-all group">
                <span className="text-lg">🏠</span>
                <span className="text-xs font-bold uppercase tracking-wider">Gérer Hébergements</span>
              </Link>
              <Link href="/admin/partners" className="flex items-center gap-3 p-3 bg-surface-container rounded-xl hover:bg-primary hover:text-white transition-all group">
                <span className="text-lg">🤝</span>
                <span className="text-xs font-bold uppercase tracking-wider">Gérer Partenaires</span>
              </Link>
              <Link href="/admin/destinations" className="flex items-center gap-3 p-3 bg-surface-container rounded-xl hover:bg-primary hover:text-white transition-all group">
                <span className="text-lg">📍</span>
                <span className="text-xs font-bold uppercase tracking-wider">Gérer Destinations</span>
              </Link>
              <Link href="/admin/website" className="flex items-center gap-3 p-3 bg-surface-container rounded-xl hover:bg-primary hover:text-white transition-all group">
                <span className="text-lg">🌐</span>
                <span className="text-xs font-bold uppercase tracking-wider">Gestion du site</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
