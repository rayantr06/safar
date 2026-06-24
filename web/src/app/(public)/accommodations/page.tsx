import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, BedDouble, Bath, Star, ArrowRight } from "lucide-react";
import { getAccommodations, getCmsConfig } from "@/lib/actions/website-cms";

export const dynamic = "force-dynamic";

export default async function AccommodationsPage() {
  const [accommodations, cms] = await Promise.all([
    getAccommodations(),
    getCmsConfig(),
  ]);

  const activeAccommodations = (accommodations || []).filter((a: any) => a.is_active !== false);
  const whatsappNumber = cms?.contact_info?.whatsapp?.replace(/[^\d]/g, "") || "213556483634";

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

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="bg-primary py-20 px-margin-mobile md:px-margin-desktop relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3)_0%,transparent_60%)]" />
        </div>
        <div className="max-w-container-max mx-auto relative z-10">
          <span className="text-tertiary-fixed-dim font-bold uppercase tracking-wider text-xs block mb-3">Stays & Villas</span>
          <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-white mb-4">
            Hébergements à Béjaïa
          </h1>
          <p className="text-white/80 text-body-lg max-w-2xl">
            Trouvez le logement idéal pour votre séjour sur la côte méditerranéenne algérienne.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        {activeAccommodations.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">🏠</div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-3">
              Bientôt disponible
            </h2>
            <p className="text-on-surface-variant max-w-md mx-auto mb-8">
              Nous préparons une sélection d&apos;hébergements premium pour votre séjour à Béjaïa. Restez à l&apos;écoute !
            </p>
            <Link
              href="/experiences"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-label-md font-bold hover:bg-primary/90 transition-all"
            >
              Découvrir nos expériences <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <p className="text-on-surface-variant text-sm mb-8">
              {activeAccommodations.length} hébergement{activeAccommodations.length > 1 ? "s" : ""} disponible{activeAccommodations.length > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeAccommodations.map((acc: any) => (
                <div
                  key={acc.id}
                  className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {acc.image_url ? (
                      <Image
                        src={acc.image_url}
                        alt={acc.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container flex items-center justify-center text-5xl">🏠</div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-on-surface">
                        {typeLabels[acc.type] || acc.type}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-on-surface text-base mb-1 group-hover:text-primary transition-colors">
                      {acc.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-3">
                      <MapPin className="h-3 w-3" />
                      {acc.location || acc.city || "Béjaïa"}
                    </p>

                    {acc.short_description && (
                      <p className="text-xs text-on-surface-variant mb-4 line-clamp-2">
                        {acc.short_description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-5 pb-5 border-b border-outline-variant/10">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {acc.max_guests} pers.</span>
                      <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {acc.beds_count} lit{acc.beds_count > 1 ? "s" : ""}</span>
                      <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {acc.bathrooms_count} SDB</span>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between">
                      <div>
                        {acc.promo_price ? (
                          <div>
                            <span className="font-bold text-primary text-lg">{formatPrice(acc.promo_price)} DA</span>
                            <span className="text-xs text-on-surface-variant line-through ml-2">{formatPrice(acc.price)} DA</span>
                          </div>
                        ) : (
                          <span className="font-bold text-primary text-lg">{formatPrice(acc.price)} DA</span>
                        )}
                        <span className="text-[10px] text-on-surface-variant block">par nuit</span>
                      </div>
                      <a
                        href={`https://wa.me/${(acc.whatsapp_phone || whatsappNumber).replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Bonjour, je suis intéressé par "${acc.title}"`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-green-700 transition-colors flex items-center gap-1.5"
                      >
                        💬 Réserver
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
