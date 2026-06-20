import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Users, ArrowRight, ChevronDown } from "lucide-react";
import { ExperienceCard } from "@/components/experiences/experience-card";
import { CatalogFilters } from "@/components/experiences/catalog-filters";
import { getAllExperiences, getDestinations } from "@/lib/queries/experiences";

export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    destination?: string;
    date?: string;
    guests?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const paramType = resolvedParams.type || "";
  const paramDest = resolvedParams.destination || "";
  const paramGuests = resolvedParams.guests || "";

  const [experiences, destinations] = await Promise.all([
    getAllExperiences(),
    getDestinations(),
  ]);

  // Dynamically filter experiences based on query params
  let filteredExperiences = experiences;
  if (paramType) {
    filteredExperiences = filteredExperiences.filter((e) => e.type === paramType);
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
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEIO3dJlqQ_hbSiiVKSKpdFN4JsvTmiOhdZzeHndi5mnsSx_-_XZ7MNpFys7CU7LFZaPVi5RzWanUhNrxqZcBKi5Z--Bu5pxF9q1N_I7hyMmLlYTIooCAcOjNoRn9pmROBvwrvibRigKXhYyvNn4aFq926r5eMrEgMI9fud1zdAyrjV9TJM62pJF6pWv2NhlCa93Oi0ZV_j_PGGYpJSgnNGM898KfdKAvHK_CFUSGh4pJKdxKGMAjMXNAdlaGU2ND-SUnCTYx5i2Q"
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
              Choisissez votre style de navigation
            </h2>
            <p className="text-on-surface-variant">
              Que vous cherchiez un moment privé ou une sortie entre amis, nous avons le bateau parfait.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Private Boats */}
          <div className="group relative overflow-hidden rounded-3xl bg-white custom-shadow hover:-translate-y-2 transition-all duration-300">
            <div className="aspect-[4/5] overflow-hidden relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU0GaWIf8X-AuDtQ4lgbf71u3OX5tkvLks9mFdp9L0DJ3pMDDeu2VHtSMh4moWclv3t8bBF7um-XGmQMexb67oErDcgcrm6RaCBt60Sqfhsd2W3YA0iNrEX8lqkeH9XsMaTCkB4ee3TiE-ilyQIgRSgh2rr0iGBk6iYCy3Zt8WVaLs2rytO6XZJZqyeeKg7vXn0YAAdFzwEos3L04yItTuEinnIN1PGbTFqO8hKOe-U__jnkKp9fuvB_wKi7HUF612op_nq47uzrk"
                alt="Bateau privé"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 p-8 text-white w-full">
              <span className="inline-block px-3 py-1 bg-primary text-white text-label-sm font-label-sm rounded-full mb-4">
                Exclusif
              </span>
              <h3 className="font-headline-sm text-headline-sm mb-2">Bateaux Privés</h3>
              <div className="flex flex-col gap-1 text-surface-variant mb-6">
                <span className="flex items-center gap-2"><Clock className="h-5 w-5" /> 4 à 8 heures</span>
                <span className="flex items-center gap-2"><Users className="h-5 w-5" /> Jusqu&apos;à 12 pers.</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-label-sm opacity-80 uppercase tracking-wider">À partir de</span>
                  <span className="font-headline-sm text-headline-sm text-tertiary-fixed-dim">15 000 DA</span>
                </div>
                <Link href="/experiences" className="bg-white text-primary w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Shared Boats */}
          <div className="group relative overflow-hidden rounded-3xl bg-white custom-shadow hover:-translate-y-2 transition-all duration-300">
            <div className="aspect-[4/5] overflow-hidden relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoAZxfzFEWyFLJ0esVwho9rG-1eoD96aqdNCZl4J8cbyKqlsg8ieNYrv7BpGMeOWXHuZvJ8Ij7J7eS8_A2n09Q1H_dacBtmZPl-fvYV8Tqj8uV9rowsLE6BsGJSlrbidZ74ewuYRgyUMrRC0L9HHn38fCfOPpXoYTSSBYgkJuZllxUixKlU8FWs84xIkwnDsYED74SbedSlKo8H4aYqmNSqWwiu-B2KbGliUuDmXXpWTgRl7f9GVZ8n99_pgeFQT6aJxS-ITkXj5Q"
                alt="Sortie partagée"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 p-8 text-white w-full">
              <span className="inline-block px-3 py-1 bg-secondary text-white text-label-sm font-label-sm rounded-full mb-4">
                Social
              </span>
              <h3 className="font-headline-sm text-headline-sm mb-2">Places en Bateau</h3>
              <div className="flex flex-col gap-1 text-surface-variant mb-6">
                <span className="flex items-center gap-2"><Clock className="h-5 w-5" /> 2 heures</span>
                <span className="flex items-center gap-2"><Users className="h-5 w-5" /> Par personne</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-label-sm opacity-80 uppercase tracking-wider">Par personne</span>
                  <span className="font-headline-sm text-headline-sm text-tertiary-fixed-dim">2 500 DA</span>
                </div>
                <Link href="/experiences" className="bg-white text-primary w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Jet Ski Coming Soon */}
          <div className="group relative overflow-hidden rounded-3xl bg-surface-container-high border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6 text-primary/30">
              <span className="text-5xl">🏄</span>
            </div>
            <span className="px-3 py-1 bg-tertiary-fixed-dim text-on-tertiary-fixed-variant text-label-sm font-label-sm rounded-full mb-4">
              Bientôt
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface-variant mb-2">Jet Ski</h3>
            <p className="text-on-surface-variant max-w-[200px]">
              Nous préparons des aventures à grande vitesse pour la prochaine saison.
            </p>
            <button className="mt-8 px-6 py-2 border border-outline text-on-surface-variant rounded-full text-label-md font-label-md">
              Me prévenir
            </button>
          </div>
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
