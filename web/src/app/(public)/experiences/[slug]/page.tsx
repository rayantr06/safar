import Image from "next/image";
import Link from "next/link";
import { IMAGES } from "@/lib/constants";

import { notFound } from "next/navigation";
import {
  Clock,
  Users,
  MapPin,
  Star,
  ShieldAlert,
  Anchor,
  Compass,
  Camera,
  Layers,
  Award,
  ChevronRight,
} from "lucide-react";
import { getAllExperiences } from "@/lib/queries/experiences";
import { Badge } from "@/components/ui/badge";
import { formatPriceDA } from "@/lib/utils/format";
import { BookingWidget } from "@/components/experiences/booking-widget";

export const dynamic = "force-dynamic";

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experiences = await getAllExperiences();

  const experience = experiences.find((e) => e.slug === slug);

  if (!experience) {
    notFound();
  }

  // Gallery Side Images (Mock fallbacks for high visual fidelity)
  const fallbackSide1 = IMAGES.FALLBACK_SIDE_1;
  const fallbackSide2 = IMAGES.FALLBACK_SIDE_2;

  const galleryImages = (experience as any).images || [];
  const sideImage1 = galleryImages[1] || fallbackSide1;
  const sideImage2 = galleryImages[2] || fallbackSide2;

  // Guide captain photo
  const guideImage = IMAGES.GUIDE_IMAGE;

  return (
    <div className="bg-background min-h-screen pb-24 animate-in fade-in duration-500">
      {/* Experience Gallery Hero Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 h-[300px] md:h-[500px] max-w-container-max mx-auto px-4 md:px-10">
        <div className="md:col-span-3 relative overflow-hidden rounded-2xl border border-outline-variant/10 shadow-sm">
          <Image
            src={experience.main_image_url || IMAGES.PLACEHOLDER}
            alt={experience.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute top-4 left-4 bg-tertiary-fixed text-on-tertiary-fixed px-4 py-1.5 rounded-full font-label-md text-label-md border border-tertiary-fixed-dim/20">
            {experience.type === "shared" ? "Places Individuelles" : "Bateau Privatisé"}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div className="hidden md:flex flex-col gap-4">
          <div className="h-1/2 overflow-hidden rounded-2xl relative border border-outline-variant/10">
            <Image
              src={sideImage1}
              alt="Détail côte de Béjaïa"
              fill
              className="object-cover"
            />
          </div>
          <div className="h-1/2 overflow-hidden rounded-2xl relative border border-outline-variant/10">
            <Image
              src={sideImage2}
              alt="Bateau en mer"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-container-max mx-auto px-4 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side Content */}
        <div className="lg:col-span-8 space-y-12">
          {/* Header Details */}
          <div>
            <div className="flex items-center gap-1.5 mb-3 text-on-surface-variant font-medium">
              <MapPin className="h-4.5 w-4.5 text-primary" />
              <span className="text-label-md">{experience.destination_name}, Algérie</span>
            </div>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary leading-tight">
              {experience.title}
            </h1>

            {/* Features Info Box */}
            <div className="flex flex-wrap gap-6 p-6 bg-surface-container rounded-2xl mt-6 border border-outline-variant/20">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Durée</span>
                <span className="text-body-lg font-bold text-on-surface">
                  {experience.duration_minutes / 60} Heures
                </span>
              </div>
              <div className="w-px h-10 bg-outline-variant hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Capacité</span>
                <span className="text-body-lg font-bold text-on-surface">
                  {experience.max_guests} Personnes max
                </span>
              </div>
              <div className="w-px h-10 bg-outline-variant hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Type</span>
                <span className="text-body-lg font-bold text-on-surface">
                  {experience.type === "shared" ? "Sortie Partagée" : "Bateau Privé"}
                </span>
              </div>
              <div className="w-px h-10 bg-outline-variant hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Tarif de départ</span>
                <span className="text-body-lg font-bold text-primary">
                  {experience.type === "shared" ? (
                    <>{formatPriceDA(experience.price_per_seat || 0)} <span className="text-[10px] text-outline font-normal">/ place</span></>
                  ) : (
                    formatPriceDA(experience.price_total || 0)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <section className="space-y-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Description du Voyage</h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Embarquez pour une aventure maritime unique le long de la magnifique côte de {experience.destination_name}. Ce voyage vous fera découvrir des criques sauvages, des grottes marines spectaculaires et des eaux turquoise transparentes idéales pour la plongée libre et la détente. Le capitaine et son équipage partageront avec vous l'histoire et les secrets locaux pour une immersion totale.
            </p>
          </section>

          {/* Features Bento */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-white border border-outline-variant/20 rounded-2xl flex items-start gap-4 shadow-[0_4px_12px_rgba(0,54,147,0.03)]">
              <div className="bg-primary-fixed p-3 rounded-lg text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface font-bold">Sortie Collective</h3>
                <p className="text-label-sm text-on-surface-variant mt-1">Rencontrez d'autres passionnés de la mer et partagez ce moment convivial.</p>
              </div>
            </div>
            <div className="p-6 bg-white border border-outline-variant/20 rounded-2xl flex items-start gap-4 shadow-[0_4px_12px_rgba(0,54,147,0.03)]">
              <div className="bg-primary-fixed p-3 rounded-lg text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface font-bold">Récits Locaux</h3>
                <p className="text-label-sm text-on-surface-variant mt-1">Découvrez la riche histoire maritime, la faune et les légendes côtières.</p>
              </div>
            </div>
            <div className="p-6 bg-white border border-outline-variant/20 rounded-2xl flex items-start gap-4 shadow-[0_4px_12px_rgba(0,54,147,0.03)]">
              <div className="bg-primary-fixed p-3 rounded-lg text-primary">
                <Anchor className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface font-bold">Arrêts Baignade</h3>
                <p className="text-label-sm text-on-surface-variant mt-1">Jetez l'ancre dans des eaux limpides pour nager en toute sécurité.</p>
              </div>
            </div>
            <div className="p-6 bg-white border border-outline-variant/20 rounded-2xl flex items-start gap-4 shadow-[0_4px_12px_rgba(0,54,147,0.03)]">
              <div className="bg-primary-fixed p-3 rounded-lg text-primary">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface font-bold">Prises de Vue</h3>
                <p className="text-label-sm text-on-surface-variant mt-1">Profitez de haltes photo aux meilleurs spots de la baie sous la lumière dorée.</p>
              </div>
            </div>
          </section>

          {/* Discovery Route */}
          <section className="space-y-6">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Itinéraire Découverte</h2>
            <div className="relative p-8 bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex flex-col items-center text-center max-w-[120px]">
                  <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm mb-3">1</div>
                  <span className="font-label-md text-label-md font-bold">Port de Béjaïa</span>
                </div>
                <div className="hidden md:block flex-1 h-px border-t-2 border-dashed border-primary/30"></div>
                <div className="flex flex-col items-center text-center max-w-[120px]">
                  <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm mb-3">2</div>
                  <span className="font-label-md text-label-md font-bold">Les Aiguades</span>
                </div>
                <div className="hidden md:block flex-1 h-px border-t-2 border-dashed border-primary/30"></div>
                <div className="flex flex-col items-center text-center max-w-[120px]">
                  <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm mb-3">3</div>
                  <span className="font-label-md text-label-md font-bold">Cap Carbon</span>
                </div>
                <div className="hidden md:block flex-1 h-px border-t-2 border-dashed border-primary/30"></div>
                <div className="flex flex-col items-center text-center max-w-[120px]">
                  <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm mb-3">4</div>
                  <span className="font-label-md text-label-md font-bold">Port de Béjaïa</span>
                </div>
              </div>
            </div>
          </section>

          {/* Captain & Safety details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-surface rounded-xl border border-outline-variant/30 flex flex-col justify-center">
              <h3 className="font-label-md text-label-md text-primary uppercase font-bold mb-4 tracking-wider">Votre Capitaine</h3>
              <div className="flex items-center gap-4">
                <img
                  alt="Capitaine"
                  className="w-16 h-16 rounded-full object-cover border border-outline-variant/20"
                  src={guideImage}
                />
                <div>
                  <h4 className="font-body-lg font-bold text-on-surface">Capitaine Ahmed</h4>
                  <p className="text-label-sm text-on-surface-variant font-medium">15 ans d'expérience locale</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-surface rounded-xl border border-outline-variant/30 flex flex-col justify-center">
              <h3 className="font-label-md text-label-md text-primary uppercase font-bold mb-4 tracking-wider">Équipement Securité</h3>
              <ul className="space-y-2 text-label-sm font-semibold text-on-surface-variant">
                <li className="flex items-center gap-2">✓ Gilets de sauvetage adaptés fournis</li>
                <li className="flex items-center gap-2">✓ Radio maritime &amp; balises opérationnelles</li>
                <li className="flex items-center gap-2">✓ Trousse de premiers secours à bord</li>
              </ul>
            </div>
          </section>

          {/* Traveler Stories */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Retours d'Expériences</h2>
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span>{experience.rating || 4.8}</span>
                <Star className="h-4.5 w-4.5 fill-tertiary-container text-tertiary-container" />
                <span className="text-on-surface-variant text-label-sm font-normal">(124 avis)</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-6 bg-white border border-outline-variant/25 rounded-2xl shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-label-md">Sarah K.</span>
                  <div className="flex text-tertiary-container gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  "Les criques aux Aiguades sont absolument magiques ! Ahmed est un guide formidable, très attentionné et sécurisant."
                </p>
              </div>
              <div className="p-6 bg-white border border-outline-variant/25 rounded-2xl shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-label-md">Mourad S.</span>
                  <div className="flex text-tertiary-container gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-current" : ""}`} />
                    ))}
                  </div>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  "Superbe expérience en groupe, très bon rapport qualité-prix. Recommandé sans hésitation pour découvrir Béjaïa autrement."
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar Booking Widget */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <BookingWidget experience={experience} />
        </aside>
      </div>
    </div>
  );
}
