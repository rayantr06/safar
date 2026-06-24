import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Users, ArrowRight, ChevronDown } from "lucide-react";
import { ExperienceCard } from "@/components/experiences/experience-card";
import { CatalogFilters } from "@/components/experiences/catalog-filters";
import { getAllExperiences, getDestinations } from "@/lib/queries/experiences";
import { IMAGES } from "@/lib/constants";

export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    destination?: string;
    date?: string;
    guests?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const paramCategory = resolvedParams.category || "";
  const paramDest = resolvedParams.destination || "";
  const paramGuests = resolvedParams.guests || "";

  const [experiences, destinations] = await Promise.all([
    getAllExperiences(),
    getDestinations(),
  ]);

  // Dynamically filter experiences based on query params
  let filteredExperiences = experiences;
  if (paramCategory) {
    filteredExperiences = filteredExperiences.filter(
      (e) => e.category?.toLowerCase() === paramCategory.toLowerCase()
    );
  }
  if (paramDest) {
    filteredExperiences = filteredExperiences.filter(
      (e) =>
        e.destination_name?.toLowerCase().replace(/\s+/g, "-") === paramDest ||
        e.destination_name?.toLowerCase().includes(paramDest.replace(/-/g, " "))
    );
  }
  if (paramGuests) {
    filteredExperiences = filteredExperiences.filter(
      (e) => (e.max_guests || 0) >= Number(paramGuests)
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* ===== Hero Banner ===== */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={IMAGES.CAT_DISCOVER_BEJAIA}
            alt="Vue sur la côte de Béjaïa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
          <div className="max-w-2xl text-white">
            <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg mb-6 leading-tight">
              Explorez nos aventures en mer
            </h1>
            <p className="text-body-lg font-body-lg text-surface-variant mb-10 opacity-90">
              Choisissez votre expérience et découvrez les plus beaux sites de la côte de Béjaïa.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#catalog"
                className="bg-primary text-on-primary px-8 py-4 rounded-xl text-label-md font-label-md flex items-center gap-2 hover:bg-primary-container transition-all"
              >
                Parcourir le catalogue <ChevronDown className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Filter System ===== */}
      <section className="relative z-20 -mt-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <CatalogFilters destinations={destinations} />
      </section>


      {/* ===== Categories ===== */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">
              Choisissez votre style d&apos;aventure
            </h2>
            <p className="text-on-surface-variant">
              Du calme de la voile à l&apos;excitation des sports mécaniques, trouvez l&apos;activité idéale pour votre séjour.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Bateau privé",
              icon: "🚤",
              description: "Profitez d'un bateau entier pour vous et vos proches avec skipper.",
              price: "20 000 DA",
              duration: "2h",
              location: "Cap Carbon, Boulimate",
              image: IMAGES.CAT_PRIVATE_BOATS,
            },
            {
              name: "Bateau par place",
              icon: "⛵",
              description: "Réservez vos places individuelles à bord d'une sortie collective.",
              price: "3 500 DA",
              duration: "2h30",
              location: "Île des Pisans",
              image: IMAGES.CAT_BOAT_RIDE,
            },
            {
              name: "Jet Ski",
              icon: "⚡",
              description: "Pilotez un jet ski et ressentez l'adrénaline de la vitesse.",
              price: "12 000 DA",
              duration: "1h",
              location: "Cap Carbon",
              image: IMAGES.CAT_JET_SKI,
            },
            {
              name: "Kayak",
              icon: "🛶",
              description: "Randonnées guidées en kayak le long des falaises sauvages.",
              price: "2 500 DA",
              duration: "2h",
              location: "Les Falaises",
              image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
            },
            {
              name: "Paddle",
              icon: "🏄",
              description: "Glissez sur l'eau calme des criques à votre propre rythme.",
              price: "1 500 DA",
              duration: "1h30",
              location: "Île des Pisans",
              image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80",
            },
            {
              name: "Quads",
              icon: "🏎️",
              description: "Randonnée terrestre sur les hauteurs du Gouraya.",
              price: "6 000 DA",
              duration: "2h",
              location: "Gouraya",
              image: "https://images.unsplash.com/photo-1531846802905-2b3f2385e509?auto=format&fit=crop&w=800&q=80",
            }
          ].map((cat) => (
            <div key={cat.name} className="group overflow-hidden rounded-[2.5rem] bg-white border border-surface-container-highest postcard-shadow hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden relative shrink-0">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5">
                  <span>{cat.icon}</span> <span>{cat.name}</span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="font-headline-sm text-headline-sm text-primary">{cat.name}</h3>
                  <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">{cat.description}</p>
                  <div className="flex flex-col gap-2 pt-2 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary shrink-0" /> {cat.duration}</span>
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary shrink-0" /> {cat.location}</span>
                  </div>
                </div>
                <div className="pt-4 mt-6 border-t border-outline-variant/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">À partir de</span>
                    <span className="font-headline-sm text-sm text-primary">{cat.price}</span>
                  </div>
                  <Link
                    href={`/experiences?category=${cat.name}`}
                    className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-container hover:text-on-primary-container transition-all"
                  >
                    Voir l&apos;activité
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Destinations Carousel ===== */}
      <section className="bg-surface-container-low py-20 mb-24">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="mb-12">
            <h2 className="font-headline-md text-headline-md text-primary mb-2">Destinations Incontournables</h2>
            <p className="text-on-surface-variant">Découvrez les perles de la côte de Béjaïa.</p>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x">
            {destinations.map((dest) => (
              <Link
                key={dest.id}
                href={`/experiences?destination=${dest.slug}`}
                className="min-w-[320px] md:min-w-[400px] snap-start group cursor-pointer"
              >
                <div className="aspect-video rounded-2xl overflow-hidden mb-4 relative">
                  <Image
                    src={dest.photo_url}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-headline-sm text-xl text-on-surface mb-1">{dest.name}</h4>
                    <p className="text-on-surface-variant line-clamp-1">{dest.description}</p>
                  </div>
                  <span className="text-primary font-bold text-label-md flex-shrink-0 ml-4">
                    {dest.experience_count}+ Sorties
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Activity Catalog Grid ===== */}
      <section id="catalog" className="py-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline-sm text-headline-sm text-primary">Activités Disponibles</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExperiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      </section>

      {/* ===== Final CTA ===== */}
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
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-2xl text-label-md font-label-md hover:bg-white/20 transition-all">
                Contacter le support
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
