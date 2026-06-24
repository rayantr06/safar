import Image from "next/image";
import Link from "next/link";
import { IMAGES } from "@/lib/constants";
import { getDestinations } from "@/lib/queries/experiences";
import { MapPin, Compass, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Hero Header */}
      <section className="relative h-[45vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={IMAGES.DESTINATION_GOURAYA}
            alt="Béjaïa Côte"
            fill
            className="object-cover brightness-[0.7]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <span className="bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 mb-4 inline-block">
            Exploration
          </span>
          <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg leading-tight mb-4">
            Nos Destinations
          </h1>
          <p className="text-body-lg text-surface-variant max-w-xl mx-auto opacity-95">
            Découvrez les joyaux cachés et les plus beaux caps de la côte Est algérienne autour de Béjaïa.
          </p>
        </div>
      </section>

      {/* Destination Grid */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {destinations.map((dest) => (
            <Link
              key={dest.id}
              href={`/destinations/${dest.slug}`}
              className="group bg-surface-container-lowest border border-outline-variant/30 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col"
            >
              <div className="aspect-[16/10] relative overflow-hidden">
                <Image
                  src={dest.photo_url}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  {dest.experience_count}+ Sorties
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-2 group-hover:text-secondary transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-body-md text-on-surface-variant line-clamp-3 mb-6">
                    {dest.description}
                  </p>
                </div>
                <div className="border-t border-outline-variant/10 pt-4 flex items-center justify-between mt-auto">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
                    <MapPin className="h-4 w-4 text-primary" /> Béjaïa, Algérie
                  </span>
                  <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:underline">
                    Découvrir l&apos;itinéraire <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
