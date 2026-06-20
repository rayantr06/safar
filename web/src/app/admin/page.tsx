import { Badge } from "@/components/ui/badge";
import { formatPriceDA } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

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
    <div className="space-y-10 animate-fade-in">
      {/* KPIs Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Bookings */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col justify-between h-36 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-primary/10 rounded-xl text-lg">🎫</span>
            <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Réservations Aujourd&apos;hui</p>
            <h3 className="font-headline-sm text-headline-sm font-bold text-2xl">
              24 <span className="text-xs text-on-surface-variant font-normal">réservations</span>
            </h3>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col justify-between h-36 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-tertiary-fixed rounded-xl text-lg">💰</span>
            <span className="text-xs font-bold text-on-surface-variant">DA</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Paiements Reçus</p>
            <h3 className="font-headline-sm text-headline-sm font-bold text-2xl">
              {formatPriceDA(ADMIN_STATS.totalRevenuePlatform)}
            </h3>
          </div>
        </div>

        {/* Safar Commission */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col justify-between h-36 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-secondary-container rounded-xl text-lg">📈</span>
            <span className="text-xs font-bold text-primary">15%</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Commission Safar DZ</p>
            <h3 className="font-headline-sm text-headline-sm font-bold text-2xl">
              {formatPriceDA(ADMIN_STATS.totalCommissionsSafar)}
            </h3>
          </div>
        </div>

        {/* Active Vessels */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col justify-between h-36 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-green-100 text-green-700 rounded-xl text-lg">⛵</span>
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Bateaux en Ligne</p>
            <h3 className="font-headline-sm text-headline-sm font-bold text-2xl">
              18 <span className="text-xs text-on-surface-variant font-normal">navires</span>
            </h3>
          </div>
        </div>
      </section>

      {/* Main Grid: Operations & Activity */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Operations & Charts (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Today's Operations */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/30 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface text-lg font-bold">Opérations en cours</h2>
              <span className="text-xs text-primary font-bold hover:underline cursor-pointer">Tout voir →</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Op Card 1 */}
              <div className="bg-surface-container p-4 rounded-2xl flex gap-4 transition-colors hover:bg-surface-container-high cursor-pointer">
                <div className="w-16 h-16 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
                  ⛵
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-on-surface truncate">Cap Carbon Explorer</h4>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed rounded">En cours</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-1">Capitaine Yacine</p>
                  <p className="text-xs font-bold text-on-surface">6 Passagers</p>
                </div>
              </div>

              {/* Op Card 2 */}
              <div className="bg-surface-container p-4 rounded-2xl flex gap-4 transition-colors hover:bg-surface-container-high cursor-pointer">
                <div className="w-16 h-16 rounded-xl bg-secondary-container flex items-center justify-center text-secondary font-bold text-2xl flex-shrink-0">
                  🌅
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-on-surface truncate">Sunset Serenity</h4>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-blue-100 text-primary rounded">Départ 17:30</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-1">Capitaine Salim</p>
                  <p className="text-xs font-bold text-on-surface">4 Passagers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart Widget */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/30 shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface text-lg font-bold">Vue des Revenus</h2>
                <p className="text-xs text-on-surface-variant">Performances des réservations hebdomadaires</p>
              </div>
              <div className="flex gap-4 text-xs font-bold">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span>Revenus (DA)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-tertiary-fixed-dim rounded-full" />
                  <span>Réservations</span>
                </div>
              </div>
            </div>

            {/* Simulated Weekly Chart Bars */}
            <div className="h-60 w-full flex items-end justify-between px-4 pb-6 border-b border-outline-variant/20 relative">
              {[
                { day: "LUN", revHeight: "55%", bookHeight: "40%" },
                { day: "MAR", revHeight: "45%", bookHeight: "30%" },
                { day: "MER", revHeight: "75%", bookHeight: "55%" },
                { day: "JEU", revHeight: "85%", bookHeight: "45%" },
                { day: "VEN", revHeight: "92%", bookHeight: "65%" },
                { day: "SAM", revHeight: "100%", bookHeight: "85%" },
                { day: "DIM", revHeight: "70%", bookHeight: "50%" },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    <div className="w-2.5 bg-tertiary-fixed-dim rounded-t-lg transition-all" style={{ height: item.bookHeight }} />
                    <div className="w-6 bg-primary rounded-t-lg transition-all" style={{ height: item.revHeight }} />
                  </div>
                  <span className="font-mono text-[10px] text-on-surface-variant font-bold">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Activity, Alerts & Vintage Map (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Recent Alerts Panel */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/30 shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface text-base font-bold mb-4 flex items-center gap-2">
              🚨 Alertes opérationnelles
            </h2>
            <div className="divide-y divide-outline-variant/15 text-sm">
              {RECENT_ALERTS.map((alert) => (
                <div key={alert.id} className="py-4 first:pt-0 last:pb-0">
                  <p className="font-bold text-on-surface mb-1 text-xs">{alert.msg}</p>
                  <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant">
                    <span>{alert.time}</span>
                    <span className="text-primary hover:underline cursor-pointer">Traiter</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Partner Performance list */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/30 shadow-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface text-base font-bold mb-4">
              Top Partenaires
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                    AB
                  </div>
                  <div>
                    <p className="font-bold text-xs">Amine Boat</p>
                    <p className="text-[10px] text-on-surface-variant font-bold">★ 4.9 (42 sorties)</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-primary">520k DA</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">
                    SN
                  </div>
                  <div>
                    <p className="font-bold text-xs">Salim Nautique</p>
                    <p className="text-[10px] text-on-surface-variant font-bold">★ 4.8 (38 sorties)</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-primary">485k DA</span>
              </div>
            </div>
          </div>

          {/* Vintage Map Card */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/30 shadow-sm relative overflow-hidden h-64 flex flex-col justify-between">
            {/* Map background */}
            <div
              className="absolute inset-0 opacity-60 bg-cover bg-center grayscale"
              style={{
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB7QQDHJGAXrp3GrA4xbiwiDnm54nVa0PDXlaQbWyCPcq3uPKZMArGCp7KT2OvmN569j1-fou7yYBHhZR9VL-omf-eOxpgE2jQvvRAeCVXLPyP0-I6La6Q2FfBkWLc0CpTisqchL2eufbvtvzeEee91ACOBdJqnPj2YucA0YMnmDNZycYkjiQr8j7uyTbClaFSoGK62fWg7lDRaTcOfrYkj9c8lVEQ3cCe5YXKEbbnShZBZSD7223RC8D2caBJkLklkjhyEZAETHYg')",
              }}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />

            <div className="relative z-10 bg-white/90 backdrop-blur-md p-2 px-3 rounded-xl inline-flex items-center gap-1.5 self-start shadow-sm border border-outline-variant/30">
              <span className="text-primary text-xs">📍</span>
              <span className="text-[10px] font-bold text-on-surface uppercase">Béjaïa Live Coast</span>
            </div>

            {/* Ping Marker */}
            <div className="absolute top-1/2 left-1/3 w-3 h-3 z-10">
              <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
              <div className="absolute inset-0.5 bg-primary rounded-full border border-white shadow-lg" />
            </div>

            <div className="relative z-10 mt-auto">
              <button className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5">
                🗺️ Voir la carte live
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Quick Actions */}
      <section className="space-y-6">
        <h2 className="font-headline-sm text-headline-sm text-on-surface text-lg font-bold">Raccourcis Opérationnels</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <button className="group flex flex-col items-center justify-center gap-3 p-8 bg-surface-container rounded-3xl border border-outline-variant/15 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm active:scale-95 text-center">
            <div className="p-3 bg-white/20 rounded-xl text-xl">⛵</div>
            <span className="font-bold text-xs uppercase tracking-wider">Ajouter Expérience</span>
          </button>
          <button className="group flex flex-col items-center justify-center gap-3 p-8 bg-surface-container rounded-3xl border border-outline-variant/15 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm active:scale-95 text-center">
            <div className="p-3 bg-white/20 rounded-xl text-xl">🤝</div>
            <span className="font-bold text-xs uppercase tracking-wider">Ajouter Partenaire</span>
          </button>
          <button className="group flex flex-col items-center justify-center gap-3 p-8 bg-surface-container rounded-3xl border border-outline-variant/15 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm active:scale-95 text-center">
            <div className="p-3 bg-white/20 rounded-xl text-xl">🎫</div>
            <span className="font-bold text-xs uppercase tracking-wider">Voir Réservations</span>
          </button>
          <button className="group flex flex-col items-center justify-center gap-3 p-8 bg-surface-container rounded-3xl border border-outline-variant/15 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm active:scale-95 text-center">
            <div className="p-3 bg-white/20 rounded-xl text-xl">🗓️</div>
            <span className="font-bold text-xs uppercase tracking-wider">Gérer Disponibilités</span>
          </button>
        </div>
      </section>
    </div>
  );
}
