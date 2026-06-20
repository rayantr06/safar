import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { MapPin, Calendar, Clock, Users, ArrowLeft, MessageCircle, Search, HelpCircle } from "lucide-react";
import { formatPriceDA, getWhatsAppLink } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function BookingTrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const resolvedParams = await searchParams;
  const ref = resolvedParams.ref || "";

  let booking: any = null;
  let errorMsg = "";

  if (ref) {
    const supabase = createAdminClient();
    try {
      // Normalize reference input (e.g. remove # or spaces)
      const formattedRef = ref.trim().startsWith("#") ? ref.trim() : `#${ref.trim()}`;
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          experiences (
            title,
            main_image_url
          )
        `)
        .eq("booking_ref", formattedRef)
        .single();

      if (error || !data) {
        // Try exact match without adding #
        const { data: data2, error: error2 } = await supabase
          .from("bookings")
          .select(`
            *,
            experiences (
              title,
              main_image_url
            )
          `)
          .eq("booking_ref", ref.trim())
          .single();

        if (error2 || !data2) {
          errorMsg = `Réservation introuvable pour la référence "${ref}".`;
        } else {
          booking = data2;
        }
      } else {
        booking = data;
      }
    } catch (err) {
      console.error("Error tracking booking:", err);
      errorMsg = "Une erreur est survenue lors de la recherche.";
    }
  }

  // WhatsApp support link
  const supportWhatsappLink = getWhatsAppLink(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "213556483634",
    ref ? `Bonjour Safar DZ ! Je souhaite avoir des informations sur ma réservation ${ref}.` : "Bonjour Safar DZ ! Je souhaite avoir des informations concernant une sortie en mer."
  );

  return (
    <div className="min-h-screen py-16 px-4 md:px-10 flex flex-col justify-center max-w-4xl mx-auto w-full">
      <div className="mb-10 text-center">
        <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-primary mb-3">
          Suivi de Réservation ⚓
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
          Entrez votre référence Safar DZ pour consulter le statut de votre expédition en temps réel.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-outline-variant/30 shadow-sm mb-8">
        <form method="GET" className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
            <input
              required
              name="ref"
              defaultValue={ref}
              placeholder="Ex: #SF-9042 ou SF-9042"
              className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-body-md font-mono"
            />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary/95 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-primary/10 text-sm flex items-center justify-center gap-2"
          >
            Rechercher
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-4 bg-error-container/20 border border-error/20 text-error rounded-xl text-xs font-bold">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Booking Details Display */}
      {booking && (
        <div className="bg-white rounded-[2.5rem] border border-outline-variant/35 shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-400">
          <div className="bg-primary/5 p-8 border-b border-outline-variant/25 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Référence</span>
              <h2 className="font-mono text-xl font-bold text-primary">{booking.booking_ref}</h2>
            </div>
            <div>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">Statut</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide inline-block ${
                booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                booking.status === "completed" ? "bg-gray-100 text-gray-800" :
                booking.status === "cancelled" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {booking.status === "confirmed" ? "Confirmé" :
                 booking.status === "completed" ? "Terminé" :
                 booking.status === "cancelled" ? "Annulé" : "En attente"}
              </span>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Experience Image */}
            <div className="md:col-span-4 aspect-video sm:aspect-square relative rounded-xl overflow-hidden border border-outline-variant/35 shadow-sm">
              <img
                src={booking.experiences?.main_image_url || "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020"}
                alt={booking.experiences?.title || "Expérience"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info specs */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Activité</span>
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                  {booking.experiences?.title || "Balade en Mer"}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">Date &amp; Horaire</span>
                  <span className="font-mono text-xs font-bold text-on-surface">
                    {booking.booking_date} à {booking.booking_time || booking.start_time || "—"}
                  </span>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">Passagers</span>
                  <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-secondary" /> {booking.guest_count} Personnes
                  </span>
                </div>
              </div>

              <div className="p-4 bg-tertiary-fixed rounded-xl border border-tertiary-fixed-dim/35 flex justify-between items-center">
                <span className="text-xs font-bold text-on-tertiary-fixed">Prix total (à régler sur place)</span>
                <span className="font-mono font-bold text-lg text-tertiary">
                  {formatPriceDA(booking.total_amount || booking.provider_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-8 border-t border-outline-variant/20 bg-surface-container-lowest/50 flex flex-col sm:flex-row gap-4">
            <a
              href={supportWhatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-primary text-on-primary font-bold py-3.5 px-6 rounded-xl hover:opacity-95 text-center flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md shadow-primary/10"
            >
              <MessageCircle className="h-4 w-4 fill-current" /> Contacter le Capitaine (WhatsApp)
            </a>
            <Link
              href="/experiences"
              className="px-6 py-3.5 border border-outline-variant text-on-surface-variant font-bold rounded-xl text-center hover:bg-surface-container transition-all text-xs uppercase tracking-wider"
            >
              Voir d&apos;autres activités
            </Link>
          </div>
        </div>
      )}

      {/* Support help card */}
      {!booking && (
        <div className="p-8 bg-surface-container-low rounded-[2rem] border border-outline-variant border-dashed text-center max-w-md mx-auto w-full">
          <HelpCircle className="h-8 w-8 mx-auto mb-3 text-secondary" />
          <h4 className="font-bold text-on-surface mb-1">Besoin d&apos;aide ?</h4>
          <p className="text-xs text-on-surface-variant mb-6">
            Si vous n&apos;avez pas reçu votre code de référence ou si vous rencontrez des difficultés, contactez notre équipe sur WhatsApp.
          </p>
          <a
            href={supportWhatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-bold text-xs hover:underline"
          >
            Contacter le support client <MessageCircle className="h-4 w-4 fill-current" />
          </a>
        </div>
      )}
    </div>
  );
}
