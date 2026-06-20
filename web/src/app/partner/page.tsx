import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { 
  Clock, 
  Users, 
  ArrowRight, 
  MessageSquare, 
  Settings, 
  Map, 
  TrendingUp, 
  Calendar,
  Anchor,
  Smartphone,
  CheckCircle2,
  FileText
} from "lucide-react";
import { formatPriceDA } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function PartnerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all bookings for calculation
  let allBookings: any[] = [];
  if (user) {
    const { data } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences (
          title,
          max_guests
        )
      `)
      .eq("provider_id", user.id)
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true });
    if (data) allBookings = data;
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Today's Trips
  const todayTrips = allBookings.filter(
    (b) => b.booking_date === todayStr && b.status !== "cancelled"
  );

  // 2. Upcoming Reservations (future dates)
  const upcomingBookings = allBookings.filter(
    (b) => b.booking_date > todayStr && b.status !== "cancelled"
  );

  // 3. Monthly net revenue (total minus commissions for Safar bookings, 100% for manual bookings)
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
  
  const monthlyActiveBookings = allBookings.filter((b) => 
    b.booking_date.startsWith(currentMonthPrefix) && 
    b.status !== "cancelled"
  );
  
  const monthlyRevenue = monthlyActiveBookings.reduce((sum, b) => {
    if (b.booking_source === "PARTNER_DIRECT" || b.booking_source === "PARTNER_MANUAL") {
      return sum + (b.total_amount || 0);
    }
    return sum + (b.provider_amount || 0); // safar amount minus commission
  }, 0);

  // 4. Safar vs Manual bookings count
  const safarBookings = allBookings.filter((b) => b.booking_source !== "PARTNER_DIRECT" && b.booking_source !== "PARTNER_MANUAL");
  const manualBookings = allBookings.filter((b) => b.booking_source === "PARTNER_DIRECT" || b.booking_source === "PARTNER_MANUAL");

  // 5. Available boats
  const availableBoatsCount = 2; // Sirène de Béjaïa and Le Pêcheur II are both active

  // Next trip today
  const nextTrip = todayTrips.find(
    (b) => b.status === "confirmed" || b.status === "pending" || b.status === "new"
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dashboard Greeting Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="text-display-md font-display-md text-primary">Tableau de bord</h1>
          <p className="text-body-lg text-on-surface-variant">Gérez votre flotte et suivez votre activité en temps réel.</p>
        </div>
        <Link 
          href="/partner/bookings" 
          className="bg-secondary text-white px-6 py-3 rounded-full font-bold text-xs shadow-md shadow-secondary/15 flex items-center gap-2 hover:opacity-95"
        >
          <PlusIcon className="h-4 w-4" /> Ajouter Réservation
        </Link>
      </div>

      {/* ===== Operational KPI Dashboard Cards ===== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {/* Today's Trips */}
        <div className="bg-primary-container text-on-primary-container p-5 rounded-2xl shadow-sm border border-primary/10 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-85 mb-2">Sorties aujourd&apos;hui</p>
            <h2 className="text-3xl font-mono font-bold leading-none">{String(todayTrips.length).padStart(2, "0")}</h2>
          </div>
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-white/10 text-[10px] opacity-80">
            <span>Actives</span>
            <Anchor className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Réservations futures</p>
            <h2 className="text-3xl font-mono font-bold text-on-surface leading-none">{String(upcomingBookings.length).padStart(2, "0")}</h2>
          </div>
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-outline-variant/20 text-[10px] text-on-surface-variant font-bold">
            <span>À venir</span>
            <Calendar className="h-4.5 w-4.5 text-primary" />
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Revenu mensuel net</p>
            <h2 className="text-3xl font-mono font-bold text-primary leading-none">
              {formatPriceDA(monthlyRevenue)}
            </h2>
          </div>
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-outline-variant/20 text-[10px] text-on-surface-variant font-bold">
            <span>Mois en cours</span>
            <TrendingUp className="h-4.5 w-4.5 text-secondary" />
          </div>
        </div>

        {/* Safar DZ Bookings */}
        <div className="bg-blue-50/50 p-5 rounded-2xl shadow-sm border border-blue-200/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-2">Bookings Safar DZ</p>
            <h2 className="text-3xl font-mono font-bold text-blue-800 leading-none">{String(safarBookings.length).padStart(2, "0")}</h2>
          </div>
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-blue-200/40 text-[10px] text-blue-700 font-bold">
            <span>Plateforme</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          </div>
        </div>

        {/* Manual Bookings */}
        <div className="bg-orange-50/50 p-5 rounded-2xl shadow-sm border border-orange-200/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700 mb-2">Bookings Manuels</p>
            <h2 className="text-3xl font-mono font-bold text-orange-800 leading-none">{String(manualBookings.length).padStart(2, "0")}</h2>
          </div>
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-orange-200/40 text-[10px] text-orange-700 font-bold">
            <span>Direct</span>
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          </div>
        </div>
      </section>

      {/* ===== Operational Bento Grid Layout ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Next Trip Details card (7 cols) */}
        <section className="lg:col-span-7 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Sortie Suivante
                </span>
                {nextTrip ? (
                  <>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mt-4">
                      {nextTrip.experiences?.title || "Expédition Marine"}
                    </h3>
                    <p className="text-body-md text-on-surface-variant flex items-center gap-2 mt-2 font-mono">
                      <Clock className="h-4 w-4 text-primary" />
                      Heure de départ : {nextTrip.booking_time || "—"}
                    </p>
                  </>
                ) : (
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-4">
                    Aucune sortie prévue pour aujourd&apos;hui
                  </h3>
                )}
              </div>

              {nextTrip && (
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Voyageurs</span>
                  <span className="font-mono text-xl font-bold text-primary">{nextTrip.guest_count} Personnes</span>
                </div>
              )}
            </div>

            {nextTrip ? (
              <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 mt-6 space-y-4">
                <div className="flex justify-between text-xs font-bold py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Nom du Client</span>
                  <span className="text-on-surface">{nextTrip.client_name}</span>
                </div>
                <div className="flex justify-between text-xs font-bold py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Téléphone</span>
                  <span className="text-on-surface font-mono">{nextTrip.client_phone}</span>
                </div>
                <div className="flex justify-between text-xs font-bold py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Source de réservation</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase ${
                    (nextTrip.booking_source === "PARTNER_DIRECT" || nextTrip.booking_source === "PARTNER_MANUAL") ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {(nextTrip.booking_source === "PARTNER_DIRECT" || nextTrip.booking_source === "PARTNER_MANUAL") ? "Manuel" : "Safar DZ"}
                  </span>
                </div>
                {nextTrip.client_notes && (
                  <div className="text-xs py-1">
                    <span className="text-on-surface-variant block mb-1">Notes :</span>
                    <span className="text-on-surface italic">{nextTrip.client_notes}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-65">
                <Clock className="h-10 w-10 text-outline mb-2" />
                <p className="text-xs font-bold text-on-surface-variant">Aucune activité immédiate aujourd&apos;hui.</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <Link
              href="/partner/availability"
              className="flex-1 bg-surface border border-outline-variant text-on-surface font-bold text-xs py-3.5 rounded-xl hover:bg-surface-container transition-all text-center"
            >
              Consulter le calendrier
            </Link>
            {nextTrip && (
              <a
                href={`https://wa.me/${nextTrip.client_phone.replace(/\D/g, "")}`}
                target="_blank"
                className="flex-1 bg-primary text-white font-bold text-xs py-3.5 rounded-xl hover:opacity-95 transition-all text-center flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4" /> WhatsApp Client
              </a>
            )}
          </div>
        </section>

        {/* Queue List (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-5 bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm">Réservations récentes</h3>
            <Link
              href="/partner/bookings"
              className="text-xs font-bold text-primary hover:underline"
            >
              Voir tout ({allBookings.length})
            </Link>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1">
            {allBookings.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant italic text-xs">
                Aucune réservation enregistrée.
              </div>
            ) : (
              allBookings.slice(0, 5).map((b) => {
                const isManual = b.booking_source === "PARTNER_DIRECT" || b.booking_source === "PARTNER_MANUAL";
                const isPending = b.status === "new" || b.status === "pending";

                return (
                  <Link
                    key={b.id}
                    href="/partner/bookings"
                    className={`block p-4 bg-surface hover:bg-surface-container-low border rounded-2xl transition-all ${
                      isManual ? "border-green-100 hover:border-green-200" : "border-outline-variant/60 hover:border-primary/20"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">{b.client_name}</h4>
                        <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                          isManual ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {isManual ? "Manuel" : "Safar DZ"}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === "confirmed" ? "bg-green-100 text-green-800" :
                        b.status === "completed" ? "bg-gray-100 text-gray-800" :
                        b.status === "cancelled" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {b.status === "confirmed" ? "Confirmé" :
                         b.status === "completed" ? "Terminé" :
                         b.status === "cancelled" ? "Annulé" : "En attente"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-bold border-t border-outline-variant/10 pt-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span className="font-mono">{b.booking_date} • {b.booking_time || b.start_time}</span>
                      </div>
                      <span className="font-mono text-primary">{formatPriceDA(b.total_amount || b.provider_amount)}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Available Fleet Info */}
      <section className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center">
            <Anchor className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-on-surface">Votre flotte en service</h3>
            <p className="text-xs text-on-surface-variant">{availableBoatsCount} bateaux configurés et disponibles aux réservations.</p>
          </div>
        </div>
        <Link 
          href="/partner/boats" 
          className="border border-outline-variant bg-surface hover:bg-surface-container font-bold text-xs px-5 py-3 rounded-xl transition-all"
        >
          Gérer la Flotte
        </Link>
      </section>

      {/* Quick Actions Footer */}
      <div className="flex flex-wrap gap-4 pt-4">
        <Link
          href="/partner/bookings"
          className="flex items-center gap-3 px-5 py-4 bg-surface-container-high border border-outline-variant rounded-2xl hover:bg-surface-variant transition-all flex-1 min-w-[200px]"
        >
          <FileText className="h-5 w-5 text-primary" />
          <div className="text-left">
            <p className="text-xs font-bold">Liste de passagers</p>
            <p className="text-[10px] text-on-surface-variant">Exporter les manifestes</p>
          </div>
        </Link>
        <Link
          href="/partner/availability"
          className="flex items-center gap-3 px-5 py-4 bg-surface-container-high border border-outline-variant rounded-2xl hover:bg-surface-variant transition-all flex-1 min-w-[200px]"
        >
          <Settings className="h-5 w-5 text-primary" />
          <div className="text-left">
            <p className="text-xs font-bold">Disponibilités</p>
            <p className="text-[10px] text-on-surface-variant">Horaires & jours de repos</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
