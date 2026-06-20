import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDestinations, getAllExperiences } from "@/lib/queries/experiences";
import { ExperienceCard } from "@/components/experiences/experience-card";
import { ArrowLeft, MapPin } from "lucide-react";

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

  const allExperiences = await getAllExperiences();
  // Filter experiences by destination name match
  const filteredExperiences = allExperiences.filter(
    (exp) =>
      exp.destination_name?.toLowerCase() === destination.name.toLowerCase() ||
      exp.destination_name?.toLowerCase().includes(slug.replace(/-/g, " "))
  );

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Gallery Header banner */}
      <section className="relative h-[55vh] min-h-[400px] flex items-end pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={destination.photo_url}
            alt={destination.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/45 to-transparent" />
        </div>
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full text-white">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-surface-variant font-bold text-xs uppercase tracking-wider mb-6 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux destinations
          </Link>
          <div className="max-w-2xl">
            <div className="flex items-center gap-1.5 mb-2 text-surface-variant font-medium">
              <MapPin className="h-4 w-4 text-secondary-fixed" />
              <span>Béjaïa, Algérie</span>
            </div>
            <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg leading-tight mb-4">
              {destination.name}
            </h1>
            <p className="text-body-lg text-surface-variant opacity-95">
              {destination.description}
            </p>
          </div>
        </div>
      </section>

      {/* Linked Experiences Catalog */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="mb-10">
          <h2 className="font-headline-md text-headline-sm text-primary mb-2">
            Sorties en mer vers {destination.name}
          </h2>
          <p className="text-on-surface-variant">
            Explorez les meilleures sorties privées et partagées pour cette destination.
          </p>
        </div>

        {filteredExperiences.length === 0 ? (
          <div className="p-16 text-center text-on-surface-variant bg-surface-container-lowest rounded-3xl border border-outline-variant/30 max-w-xl mx-auto">
            <span className="text-4xl block mb-4">⛵</span>
            <p className="font-bold text-base mb-1">Aucune sortie en ligne pour le moment</p>
            <p className="text-sm">Nous préparons de nouveaux itinéraires de navigation vers {destination.name}.</p>
            <Link href="/experiences" className="mt-6 inline-block bg-primary text-white px-6 py-2.5 rounded-full font-bold text-xs">
              Découvrir les autres destinations
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExperiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
