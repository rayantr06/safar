import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Users, BedDouble, Bath, ArrowLeft, Check, Calendar, ShieldCheck, MessageCircle, Info } from "lucide-react";
import { getAccommodations, getCmsConfig } from "@/lib/actions/website-cms";
import MapComponent from "@/components/ui/map-component";

export const dynamic = "force-dynamic";

export default async function AccommodationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [accommodations, cms] = await Promise.all([
    getAccommodations(),
    getCmsConfig(),
  ]);

  const accommodation = (accommodations || []).find((a: any) => a.slug === slug);

  if (!accommodation || accommodation.is_active === false) {
    notFound();
  }

  const whatsappNumber = cms?.contact_info?.whatsapp?.replace(/[^\d]/g, "") || "213556483634";
  const accWhatsapp = accommodation.whatsapp_phone?.replace(/[^\d]/g, "") || whatsappNumber;

  function formatPrice(p: number) {
    return new Intl.NumberFormat("fr-DZ").format(p);
  }

  const typeLabels: Record<string, string> = {
    villa: "Villa",
    appartement: "Appartement",
    maison_hotes: "Maison d'hôtes",
    hotel: "Hôtel",
    studio: "Studio",
  };

  const imagesList = accommodation.images && accommodation.images.length > 0
    ? accommodation.images
    : [accommodation.image_url].filter(Boolean);

  // Set default coordinates if none provided (e.g. Boulimate, Béjaïa)
  const mapCenter: [number, number] = accommodation.lat && accommodation.lng
    ? [accommodation.lat, accommodation.lng]
    : [36.8118, 4.9742];

  const mapMarkers = [
    {
      position: mapCenter,
      title: accommodation.title,
      description: accommodation.location || accommodation.city || "Béjaïa",
    },
  ];

  const whatsappMessage = encodeURIComponent(
    `Bonjour Safar DZ, je souhaite réserver l'hébergement "${accommodation.title}" (${typeLabels[accommodation.type] || accommodation.type}) situé à ${accommodation.location || accommodation.city || "Béjaïa"}.\n\nMerci de me recontacter pour confirmer la disponibilité.`
  );

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-24">
      {/* Top navigation banner */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6">
        <Link
          href="/accommodations"
          className="inline-flex items-center gap-2 text-on-surface-variant font-bold text-xs uppercase tracking-wider hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voir tous les hébergements
        </Link>
      </div>

      {/* Image Gallery (Airbnb layout) */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-8">
        {imagesList.length === 0 ? (
          <div className="w-full aspect-[21/9] bg-surface-container rounded-3xl flex items-center justify-center text-6xl">
            🏠
          </div>
        ) : imagesList.length === 1 ? (
          <div className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-sm">
            <Image
              src={imagesList[0]}
              alt={accommodation.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-3xl overflow-hidden aspect-[21/10]">
            {/* Main large photo */}
            <div className="relative md:col-span-2 h-full w-full">
              <Image
                src={imagesList[0]}
                alt={`${accommodation.title} 1`}
                fill
                className="object-cover hover:scale-[1.02] transition-all duration-500 cursor-pointer"
                priority
              />
            </div>
            {/* Right side Grid */}
            <div className="hidden md:grid md:grid-cols-2 md:col-span-2 gap-4">
              {imagesList.slice(1, 5).map((img: string, i: number) => (
                <div key={i} className="relative w-full h-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-container">
                  <Image
                    src={img}
                    alt={`${accommodation.title} ${i + 2}`}
                    fill
                    className="object-cover hover:scale-[1.03] transition-all duration-500 cursor-pointer"
                  />
                  {i === 3 && imagesList.length > 5 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm pointer-events-none">
                      + {imagesList.length - 5} photos
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Detail Layout Grid */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left main info column */}
        <div className="lg:col-span-8 space-y-8">
          <div>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {typeLabels[accommodation.type] || accommodation.type}
            </span>
            <h1 className="font-display-lg text-display-sm-mobile md:text-display-sm text-on-surface font-bold mt-3 mb-2">
              {accommodation.title}
            </h1>
            <p className="text-on-surface-variant flex items-center gap-1 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              {accommodation.location || `${accommodation.address || ""}, ${accommodation.city || ""}, ${accommodation.wilaya}`}
            </p>
          </div>

          {/* Key specs row */}
          <div className="flex flex-wrap items-center gap-6 py-6 border-y border-outline-variant/15 text-sm text-on-surface-variant font-bold">
            <span className="flex items-center gap-2 bg-surface-container px-4 py-2.5 rounded-2xl">
              <Users className="h-4 w-4 text-primary" /> {accommodation.max_guests} Voyageurs max.
            </span>
            <span className="flex items-center gap-2 bg-surface-container px-4 py-2.5 rounded-2xl">
              <BedDouble className="h-4 w-4 text-primary" /> {accommodation.rooms_count} Chambres • {accommodation.beds_count} Lits
            </span>
            <span className="flex items-center gap-2 bg-surface-container px-4 py-2.5 rounded-2xl">
              <Bath className="h-4 w-4 text-primary" /> {accommodation.bathrooms_count} SDB
            </span>
            {accommodation.min_stay_nights > 1 && (
              <span className="flex items-center gap-2 bg-surface-container px-4 py-2.5 rounded-2xl">
                <Calendar className="h-4 w-4 text-primary" /> Min. {accommodation.min_stay_nights} Nuits
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="font-headline-sm text-lg font-bold text-on-surface">À propos de ce logement</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap">
              {accommodation.description || accommodation.short_description || "Aucune description fournie pour cet hébergement."}
            </p>
          </div>

          {/* Amenities checklist */}
          <div className="space-y-6">
            <h2 className="font-headline-sm text-lg font-bold text-on-surface">Équipements inclus</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(accommodation.amenities || []).map((amenity: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
              {(accommodation.custom_amenities || []).map((amenity: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="italic">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Local Map */}
          <div className="space-y-6 pt-6">
            <div>
              <h2 className="font-headline-sm text-lg font-bold text-on-surface">Emplacement du logement</h2>
              <p className="text-xs text-on-surface-variant mt-1">L&apos;emplacement exact vous sera communiqué après réservation.</p>
            </div>
            <div className="h-[350px] w-full rounded-3xl overflow-hidden">
              <MapComponent center={mapCenter} markers={mapMarkers} zoom={14} />
            </div>
          </div>
        </div>

        {/* Right sticky booking widget */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 shadow-lg sticky top-28 space-y-6">
            <div>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Tarif séjour</span>
              <div className="flex items-baseline gap-2">
                {accommodation.promo_price ? (
                  <>
                    <span className="font-display-lg text-primary text-3xl font-bold">
                      {formatPrice(accommodation.promo_price)} DA
                    </span>
                    <span className="text-sm text-on-surface-variant line-through font-medium">
                      {formatPrice(accommodation.price)} DA
                    </span>
                  </>
                ) : (
                  <span className="font-display-lg text-primary text-3xl font-bold">
                    {formatPrice(accommodation.price)} DA
                  </span>
                )}
                <span className="text-xs text-on-surface-variant font-medium">/ nuit</span>
              </div>
            </div>

            {/* Quick security notice */}
            <div className="bg-surface-container p-4 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-on-surface">Safar DZ Garanti</h4>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  Réservation directe avec l&apos;hôte validé. Pas de frais cachés.
                </p>
              </div>
            </div>

            {/* CTA Book Button */}
            <a
              href={`https://wa.me/${accWhatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-2xl text-sm font-bold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg active:scale-[0.98] duration-200"
            >
              <MessageCircle className="h-5 w-5 fill-current" /> Réserver via WhatsApp
            </a>

            {/* Extra rules */}
            <div className="pt-4 border-t border-outline-variant/10 space-y-2 text-[10px] text-on-surface-variant font-medium">
              <p className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-primary" /> Séjour minimum : {accommodation.min_stay_nights} nuits.</p>
              <p className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-primary" /> Arrivée flexible après validation avec l&apos;hôte.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
