import Link from "next/link";
import Image from "next/image";
import { IMAGES } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { MessageCircle, CheckCircle, Users, Calendar, ArrowRight, Anchor } from "lucide-react";
import { formatPriceDA, getWhatsAppLink } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const supabase = createAdminClient();

  // Try to query real booking details
  let booking: any = null;
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences (
          title,
          main_image_url
        )
      `)
      .eq("booking_ref", ref)
      .single();

    if (!error && data) {
      booking = data;
    }
  } catch (err) {
    console.error("Error fetching booking confirmation details:", err);
  }

  // Fallback default details
  const experienceTitle = booking?.experiences?.title || "Balade privée Cap Carbon";
  const experienceImage = booking?.experiences?.main_image_url || IMAGES.EXPERIENCE_CAP_CARBON;
  const guestCount = booking?.guest_count || 5;
  const bookingDate = booking?.booking_date || "2026-08-15";
  const bookingTime = booking?.booking_time || "15:00";
  const totalAmount = booking?.total_amount ? booking.total_amount / 100 : 20000;

  const whatsappLink = getWhatsAppLink(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "213556483634",
    `Bonjour Safar DZ ! J'ai effectué une demande de réservation avec la référence ${ref} pour l'expérience "${experienceTitle}".`
  );

  return (
    <div className="min-h-screen py-16 px-4 md:px-10 flex items-center justify-center">
      <div className="max-w-container-max w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Rotated Postcard Graphic */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="bg-white p-4 pb-12 rotate-[-2deg] rounded-sm border border-outline-variant/30 shadow-[12px_12px_0px_0px_rgba(0,54,147,0.05)] transform transition-transform hover:rotate-0 duration-500 max-w-md md:max-w-xl w-full">
            <div className="aspect-[4/3] overflow-hidden rounded-sm relative">
              <img
                src={experienceImage}
                alt="Visual de l'expérience"
                className="w-full h-full object-cover grayscale-[0.2] sepia-[0.1]"
              />
              <div className="absolute top-4 right-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 font-headline-sm text-[14px] rounded-sm border-2 border-dashed border-on-tertiary-fixed/30 rotate-12">
                BÉJAÏA
              </div>
            </div>
            <div className="mt-8 flex justify-between items-end px-2">
              <div>
                <p className="font-display-lg text-[24px] text-primary leading-none opacity-80">Safar DZ</p>
                <p className="text-label-sm text-[10px] uppercase tracking-widest mt-2 text-outline">Postale de Méditerranée</p>
              </div>
              <div className="w-16 h-16 border-2 border-primary/20 rounded-full flex items-center justify-center opacity-40">
                <span className="text-3xl text-primary">⚓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Confirmation Details */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success-container text-success font-bold">
              <Check className="h-4 w-4" />
              <span className="text-label-sm font-bold uppercase tracking-wider">Confirmée (Demande reçue)</span>
            </div>
            <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-primary leading-tight">
              Votre demande de réservation a bien été reçue 🌊
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-lg">
              Notre équipe support va vous contacter très rapidement via WhatsApp pour valider et confirmer définitivement les détails de votre réservation.
            </p>
          </div>

          {/* Bento Style Booking Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-surface-container-high p-6 rounded-2xl border border-outline-variant/20">
              <p className="text-label-sm text-outline uppercase font-bold tracking-widest mb-1">Activité</p>
              <p className="text-headline-sm font-headline-sm text-primary">{experienceTitle}</p>
            </div>
            <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/20">
              <p className="text-label-sm text-outline uppercase font-bold tracking-widest mb-1">Référence</p>
              <p className="text-body-md font-bold text-on-surface">{ref}</p>
            </div>
            <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/20">
              <p className="text-label-sm text-outline uppercase font-bold tracking-widest mb-1">Voyageurs</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-secondary" />
                <p className="text-body-md font-bold text-on-surface">{guestCount} Passagers</p>
              </div>
            </div>
            <div className="col-span-2 bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-center justify-between">
              <div>
                <p className="text-label-sm text-outline uppercase font-bold tracking-widest mb-1">Date &amp; Horaire</p>
                <p className="text-body-lg font-bold text-primary">{bookingDate} à {bookingTime}</p>
              </div>
              <Calendar className="h-10 w-10 text-primary opacity-25" />
            </div>
            <div className="col-span-2 bg-tertiary-fixed p-6 rounded-2xl border border-tertiary-fixed-dim/40 flex items-center justify-between">
              <div>
                <p className="text-label-sm text-on-tertiary-fixed uppercase font-bold tracking-widest mb-1">Montant total à régler sur place</p>
                <p className="text-headline-sm font-headline-sm text-tertiary">{formatPriceDA(totalAmount * 100)}</p>
              </div>
              <span className="text-3xl">🇩🇿</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a
              className="flex-1 bg-primary text-on-primary flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-label-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-5 w-5 fill-current" /> Contacter Safar DZ sur WhatsApp
            </a>
            <Link
              className="px-8 py-4 rounded-xl border-2 border-outline-variant text-on-surface-variant font-label-md text-center hover:bg-surface-container-highest active:scale-95 transition-all"
              href="/experiences"
            >
              Voir les expériences
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// Minimal check icon since "Check" wasn't imported initially from lucide-react but we mapped it
function Check(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
