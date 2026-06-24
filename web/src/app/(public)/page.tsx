import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Handshake, Zap, Star, Calendar, MessageSquare } from "lucide-react";
import { ExperienceCard } from "@/components/experiences/experience-card";
import { AccommodationsList } from "@/components/accommodations/accommodations-list";
import { HeroSection } from "@/components/hero/hero-section";
import { getFeaturedExperiences, getDestinations } from "@/lib/queries/experiences";
import { getCmsConfig, getAccommodations } from "@/lib/actions/website-cms";
import { IMAGES } from "@/lib/constants";
import { formatPriceDA } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [experiences, destinations, cms, accommodations] = await Promise.all([
    getFeaturedExperiences(),
    getDestinations(),
    getCmsConfig(),
    getAccommodations(),
  ]);

  // CMS Mappings with defaults
  const hero = cms?.hero || {
    title: "Choisissez votre prochaine aventure",
    subtitle: "Des sorties en mer, des découvertes et des moments inoubliables au cœur de la Méditerranée.",
    media_url: IMAGES.HERO_BANNER,
    media_type: "image",
    cta_text: "Réserver",
    cta_link: "/experiences"
  };

  const banners = cms?.banners || [];
  const testimonials = cms?.testimonials || [];
  const partners = cms?.partners_logos || [];

  const whatsappNumber = cms?.contact_info?.whatsapp?.replace(/[^\d]/g, "") || "213556483634";

  const defaultCategories = [
    { name: "Bateau privé", icon: "🚤", image: IMAGES.CAT_PRIVATE_BOATS, bg: "from-blue-500/10 to-cyan-500/10", border: "border-blue-500/20", text: "text-blue-600" },
    { name: "Bateau par place", icon: "⛵", image: IMAGES.CAT_BOAT_RIDE, bg: "from-teal-500/10 to-emerald-500/10", border: "border-teal-500/20", text: "text-teal-600" },
    { name: "Jet Ski", icon: "⚡", image: IMAGES.CAT_JET_SKI, bg: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/20", text: "text-amber-600" },
    { name: "Kayak", icon: "🛶", image: IMAGES.DESTINATION_CAP_CARBON, bg: "from-sky-500/10 to-indigo-500/10", border: "border-sky-500/20", text: "text-sky-600" },
    { name: "Paddle", icon: "🏄", image: IMAGES.DESTINATION_ILE_PISANS, bg: "from-purple-500/10 to-pink-500/10", border: "border-purple-500/20", text: "text-purple-600" },
    { name: "Quads", icon: "🏎️", image: IMAGES.DESTINATION_GOURAYA, bg: "from-rose-500/10 to-red-500/10", border: "border-rose-500/20", text: "text-rose-600" }
  ];

  // Use CMS hero_gallery if available, otherwise use defaults
  const categories = cms?.hero_gallery?.length
    ? cms.hero_gallery.map((card: any, i: number) => ({
        ...defaultCategories[i % defaultCategories.length],
        name: card.name || defaultCategories[i % defaultCategories.length]?.name,
        icon: card.icon || defaultCategories[i % defaultCategories.length]?.icon,
        image: card.image || defaultCategories[i % defaultCategories.length]?.image,
      }))
    : defaultCategories;

  return (
    <div className="flex flex-col w-full">
      {/* ===== Promo Banners (If Active) ===== */}
      {banners.filter((b: any) => b.is_active).map((banner: any) => (
        <div key={banner.id} className="w-full bg-primary text-on-primary py-3 px-6 text-center text-label-sm font-bold flex items-center justify-center gap-3 relative z-30">
          <span>🎉 {banner.title} : {banner.subtitle}</span>
          {banner.link && (
            <Link href={banner.link} className="underline text-tertiary-fixed-dim hover:text-white flex items-center gap-1">
              Profiter <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      ))}

      {/* ===== 1. Hero Section (Full-bleed with 3D Carousel) ===== */}
      <HeroSection hero={hero} categories={categories} />

      {/* ===== 4. Activités disponibles ===== */}
      <section className="py-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary mb-2">
              Activités disponibles
            </h2>
            <p className="text-on-surface-variant">
              Nos aventures en mer et activités nautiques les plus populaires.
            </p>
          </div>
          <Link
            href="/experiences"
            className="text-primary font-bold hover:underline flex items-center gap-2 hidden md:flex"
          >
            Parcourir le catalogue <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        {experiences.length === 0 ? (
          <div className="text-center py-16 bg-surface-container rounded-[2rem] border border-outline-variant/15 p-8 max-w-xl mx-auto shadow-sm">
            <span className="text-5xl block mb-4">⛵</span>
            <h3 className="font-bold text-on-surface text-base mb-1">Activités bientôt en ligne</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Nous préparons une sélection d&apos;activités et sorties en mer inoubliables pour votre saison à Béjaïa.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {experiences.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} />
              ))}
            </div>
            <div className="mt-12 text-center md:hidden">
              <Link
                href="/experiences"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full text-label-md font-bold"
              >
                Parcourir le catalogue <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* ===== 5. Hébergements Section ===== */}
      <section className="py-24 bg-surface-container-low/80 border-t border-b border-outline-variant/10">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary font-bold uppercase tracking-wider text-xs block mb-1">Stays & Villas</span>
              <h2 className="font-headline-md text-headline-md text-primary mb-2">
                Hébergements recommandés
              </h2>
              <p className="text-on-surface-variant">
                Combinez vos activités nautiques avec un séjour de rêve sur la côte.
              </p>
            </div>
            <span className="text-xs text-outline font-medium hidden md:inline-block">
              Géré par Safar Admin
            </span>
          </div>

          <AccommodationsList accommodations={accommodations} whatsappNumber={whatsappNumber} />
        </div>
      </section>

      {/* ===== 6. Destinations incontournables ===== */}
      <section id="destinations" className="py-24 overflow-hidden">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <h2 className="font-headline-md text-headline-md text-primary mb-12">
            Destinations incontournables
          </h2>
          {destinations.length === 0 ? (
            <div className="text-center py-16 bg-surface-container rounded-[2rem] border border-outline-variant/15 p-8 max-w-xl mx-auto shadow-sm">
              <span className="text-5xl block mb-4">📍</span>
              <h3 className="font-bold text-on-surface text-base mb-1">Destinations à découvrir</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Les plus beaux spots nautiques de Béjaïa (Cap Carbon, Île des Pisans, Aiguades) seront bientôt disponibles.
              </p>
            </div>
          ) : (
            <div className="flex gap-8 overflow-x-auto pb-8 snap-x no-scrollbar">
              {destinations.map((dest) => (
                <Link
                  key={dest.id}
                  href={`/experiences?destination=${dest.slug}`}
                  className="min-w-[300px] md:min-w-[400px] snap-center flex-shrink-0"
                >
                  <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/3] group">
                    <Image
                      src={dest.photo_url}
                      alt={dest.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-8 left-8 text-white">
                      <h3 className="font-headline-md text-headline-sm mb-2">{dest.name}</h3>
                      <p className="text-body-md opacity-90 max-w-[250px]">{dest.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== 7. Call to Action ===== */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
        <div className="bg-primary rounded-[40px] p-12 md:p-24 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4)_0%,transparent_70%)]" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg text-white mb-6">
              Votre prochaine aventure vous attend
            </h2>
            <p className="text-surface-variant text-body-lg mb-10 opacity-90">
              Rejoignez les voyageurs qui ont découvert les trésors cachés de la Méditerranée avec nos experts locaux.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/experiences"
                className="bg-tertiary-fixed-dim text-on-tertiary-fixed-variant px-10 py-4 rounded-2xl text-label-md font-label-md hover:scale-105 active:scale-95 transition-all"
              >
                Commencer à réserver
              </Link>
              <Link
                href="/contact"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-2xl text-label-md font-label-md hover:bg-white/20 transition-all flex items-center justify-center"
              >
                Contacter le support
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Partners & Testimonials Section ===== */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-surface-container-low/40">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-primary font-bold uppercase tracking-wider text-xs">Avis Clients</span>
              <h2 className="font-headline-md text-headline-md text-primary">Ce que disent nos clients</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {testimonials.map((t: any) => (
                <div key={t.id} className="bg-white p-8 rounded-3xl border border-outline-variant/20 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex gap-1 text-amber-500">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-on-surface text-body-md italic leading-relaxed">
                      &quot;{t.comment}&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-outline-variant/10">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative bg-surface-container-high shrink-0">
                      <Image
                        src={t.avatar || IMAGES.GUIDE_IMAGE}
                        alt={t.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">{t.name}</h4>
                      <p className="text-xs text-outline font-medium">{t.role || "Voyageur"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {partners.length > 0 && (
        <section className="py-16 bg-white border-t border-outline-variant/10">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-outline mb-10">Ils nous font confiance</p>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-70">
              {partners.map((p: any) => (
                <div key={p.id} className="flex flex-col items-center gap-2 group">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-surface-container-low border border-outline-variant/10 group-hover:scale-105 transition-transform">
                    {p.logo_url ? (
                      <Image
                        src={p.logo_url}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-primary/10 text-primary">
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
