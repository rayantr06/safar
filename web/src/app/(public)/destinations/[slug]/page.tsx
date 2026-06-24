import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDestinations, getAllExperiences } from "@/lib/queries/experiences";
import { getAccommodations } from "@/lib/actions/website-cms";
import { ExperienceCard } from "@/components/experiences/experience-card";
import { ArrowLeft, MapPin, BedDouble, Users, ArrowRight } from "lucide-react";
import MapComponent from "@/components/ui/map-component";

export const dynamic = "force-dynamic";

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destinations = await getDestinations();
  const destination = destinations.find((d) => d.slug === slug);

  if (!destination) {
    notFound();
  }

  const [allExperiences, allAccommodations] = await Promise.all([
    getAllExperiences(),
    getAccommodations(),
  ]);

  // Filter experiences by destination name match
  const filteredExperiences = allExperiences.filter(
    (exp) =>
      exp.destination_name?.toLowerCase() === destination.name.toLowerCase() ||
      exp.destination_id === destination.id ||
      exp.destination_name?.toLowerCase().includes(slug.replace(/-/g, " "))
  );

  // Filter nearby accommodations (same city, or general fallback)
  const destCity = destination.name.toLowerCase();
  const nearbyAccommodations = (allAccommodations || [])
    .filter((acc: any) => acc.is_active !== false)
    .filter(
      (acc: any) =>
        acc.city?.toLowerCase().includes(destCity) ||
        destCity.includes(acc.city?.toLowerCase() || "") ||
        (destination.location && acc.city && destination.location.toLowerCase().includes(acc.city.toLowerCase()))
    )
    .slice(0, 3);

  // Fallback to general accommodations if none matching exactly
  const finalAccommodations = nearbyAccommodations.length > 0
    ? nearbyAccommodations
    : (allAccommodations || []).filter((acc: any) => acc.is_active !== false).slice(0, 3);

  // Set up Map Markers
  const mapCenter: [number, number] = destination.lat && destination.lng
    ? [destination.lat, destination.lng]
    : [36.7510, 5.0642]; // Default Béjaïa coordinates

  const mapMarkers = [
    {
      position: mapCenter,
      title: destination.name,
      description: destination.location || "Point d'intérêt principal",
    },
  ];

  // Add experiences coordinates if available
  filteredExperiences.forEach(exp => {
    if (exp.lat && exp.lng) {
      mapMarkers.push({
        position: [exp.lat, exp.lng],
        title: exp.title,
        description: `${exp.price_total ? `${exp.price_total / 100} DA` : `${exp.price_per_seat / 100} DA / place`}`,
      });
    }
  });

  return (
    <div className="flex flex-col w-full pb-24 bg-surface-container-lowest">
      {/* Gallery Header banner */}
      <section className="relative h-[60vh] min-h-[450px] flex items-end pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={destination.hero_image_url || destination.photo_url}
            alt={destination.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full text-white">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-white/80 font-bold text-xs uppercase tracking-wider mb-6 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux destinations
          </Link>
          <div className="max-w-3xl">
            <div className="flex items-center gap-1.5 mb-2 text-white/90 font-medium">
              <MapPin className="h-4 w-4 text-secondary-fixed" />
              <span>{destination.location || "Béjaïa, Algérie"}</span>
            </div>
            <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg leading-tight mb-4 text-white">
              {destination.name}
            </h1>
            <p className="text-body-lg text-white/90 opacity-95 max-w-2xl leading-relaxed">
              {destination.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Details and Sections */}
      <div className="max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16">
        
        {/* Left Side: Gallery & Map */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Gallery Section */}
          {destination.gallery && destination.gallery.length > 0 && (
            <div className="space-y-6">
              <h2 className="font-headline-sm text-xl font-bold text-on-surface">Galerie photos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {destination.gallery.map((img: string, idx: number) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container group shadow-sm">
                    <Image
                      src={img}
                      alt={`${destination.name} gallery ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Map */}
          <div className="space-y-6">
            <div>
              <h2 className="font-headline-sm text-xl font-bold text-on-surface">Carte & Itinéraires</h2>
              <p className="text-sm text-on-surface-variant mt-1">Explorez l&apos;emplacement de {destination.name} et les départs à proximité.</p>
            </div>
            <div className="h-[380px] rounded-3xl overflow-hidden">
              <MapComponent center={mapCenter} markers={mapMarkers} zoom={13} />
            </div>
          </div>

          {/* Linked Experiences Catalog */}
          <div className="space-y-8 pt-6">
            <div>
              <h2 className="font-headline-sm text-xl font-bold text-on-surface">
                Sorties en mer vers {destination.name}
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Découvrez les sorties en bateau (privé/partagé), excursions de jet ski et paddles disponibles.
              </p>
            </div>

            {filteredExperiences.length === 0 ? (
              <div className="p-16 text-center text-on-surface-variant bg-surface-container-lowest rounded-3xl border border-outline-variant/30 max-w-xl mx-auto">
                <span className="text-4xl block mb-4">⛵</span>
                <p className="font-bold text-base mb-1 text-on-surface">Aucune sortie en ligne pour le moment</p>
                <p className="text-xs text-on-surface-variant">Nous préparons de nouveaux itinéraires de navigation vers {destination.name}.</p>
                <Link href="/experiences" className="mt-6 inline-block bg-primary text-white px-6 py-2.5 rounded-full font-bold text-xs hover:bg-primary/95 transition-all">
                  Découvrir les autres activités
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredExperiences.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Accommodations & Highlights */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Nearby Stays */}
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="font-bold text-on-surface text-base">Hébergements suggérés</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Trouvez où loger près de cette destination.</p>
            </div>

            {finalAccommodations.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic">Aucun hébergement trouvé dans les environs.</p>
            ) : (
              <div className="space-y-4">
                {finalAccommodations.map((acc: any) => (
                  <Link
                    key={acc.id}
                    href={`/accommodations/${acc.slug}`}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-surface-container-lowest hover:bg-primary/5 border border-outline-variant/10 hover:border-primary/20 transition-all group"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                      {acc.image_url ? (
                        <Image src={acc.image_url} alt={acc.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors">
                        {acc.title}
                      </h4>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-0.5">
                        <MapPin className="h-3 w-3 text-primary" /> {acc.city || "Béjaïa"}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-primary font-bold">
                          {acc.promo_price ? new Intl.NumberFormat("fr-DZ").format(acc.promo_price) : new Intl.NumberFormat("fr-DZ").format(acc.price)} DA <span className="font-normal text-on-surface-variant">/ nuit</span>
                        </span>
                        <ArrowRight className="h-3 w-3 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            <Link
              href="/accommodations"
              className="w-full text-center block text-xs font-bold text-primary hover:underline"
            >
              Voir tous les hébergements
            </Link>
          </div>

          {/* Quick tips */}
          <div className="border border-outline-variant/10 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-on-surface text-sm">Conseils voyageurs</h3>
            <ul className="space-y-3 text-xs text-on-surface-variant font-medium">
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary p-1 rounded-full text-[10px] font-bold">1</span>
                <span>Idéalement accessible en bateau privé ou partagé au départ du port de Béjaïa.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary p-1 rounded-full text-[10px] font-bold">2</span>
                <span>Pensez à prendre de la crème solaire, des chapeaux et de l&apos;eau pour votre séjour.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary p-1 rounded-full text-[10px] font-bold">3</span>
                <span>Réservez vos places à l&apos;avance en haute saison (juillet - août).</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
