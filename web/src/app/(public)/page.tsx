import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Anchor, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExperienceCard } from "@/components/experiences/experience-card";
import { getFeaturedExperiences, getDestinations } from "@/lib/queries/experiences";

export default async function HomePage() {
  const [experiences, destinations] = await Promise.all([
    getFeaturedExperiences(),
    getDestinations(),
  ]);

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020"
            alt="Cap Carbon, Béjaïa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-start text-white">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md text-primary-fixed text-sm font-semibold tracking-wide mb-6">
            L'excellence maritime en Algérie
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-3xl leading-[1.1] mb-6 font-mono text-shadow-sm">
            Découvrez la beauté de <span className="text-primary-fixed">Béjaïa</span> par la mer
          </h1>
          <p className="text-lg md:text-xl text-surface-variant max-w-2xl mb-10 leading-relaxed text-shadow-sm">
            Réservez les meilleures expériences nautiques, des bateaux privés luxueux aux sorties familiales partagées.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-lg" asChild>
              <Link href="/experiences">
                Voir les expériences <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white" asChild>
              <Link href="#how-it-works">
                Comment ça marche ?
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Features / Trust Section */}
      <section className="py-16 bg-surface-container-lowest border-b border-surface-variant">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4 p-6 rounded-2xl bg-surface hover:shadow-md transition-shadow">
            <div className="p-3 bg-primary-container text-on-primary-container rounded-xl">
              <Anchor className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Flotte vérifiée</h3>
              <p className="text-on-surface-variant text-sm">Tous nos bateaux et capitaines sont certifiés et inspectés par notre équipe.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-6 rounded-2xl bg-surface hover:shadow-md transition-shadow">
            <div className="p-3 bg-primary-container text-on-primary-container rounded-xl">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Réservation instantanée</h3>
              <p className="text-on-surface-variant text-sm">Bloquez votre créneau en 2 minutes sans créer de compte compliqué.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-6 rounded-2xl bg-surface hover:shadow-md transition-shadow">
            <div className="p-3 bg-primary-container text-on-primary-container rounded-xl">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Paiement sur place</h3>
              <p className="text-on-surface-variant text-sm">Zéro risque. Vous payez directement le jour de votre sortie en mer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Experiences */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold font-mono text-on-surface mb-4">Expériences à la une</h2>
              <p className="text-on-surface-variant text-lg">Nos sorties les plus populaires et les mieux notées par la communauté.</p>
            </div>
            <Button variant="ghost" className="hidden md:flex" asChild>
              <Link href="/experiences">
                Tout voir <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/experiences">Voir toutes les expériences</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Destinations */}
      <section className="py-24 bg-surface-container-low">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-mono text-on-surface mb-4">Destinations de Rêve</h2>
            <p className="text-on-surface-variant text-lg">Explorez les joyaux cachés de la côte bougiote.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <Link key={dest.id} href={`/experiences?destination=${dest.slug}`} className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer">
                <Image
                  src={dest.photo_url}
                  alt={dest.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />
                <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                  <h3 className="text-2xl font-bold mb-1 font-mono">{dest.name}</h3>
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">{dest.description}</p>
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">
                    {dest.experience_count} expériences
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA Partner */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold font-mono mb-6 text-primary-fixed">Vous êtes propriétaire de bateau ?</h2>
          <p className="text-lg md:text-xl text-primary-fixed-dim mb-10">
            Rejoignez la plateforme leader à Béjaïa. Gérez vos réservations, augmentez votre visibilité et développez votre activité.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-bold" asChild>
              <Link href="/login">Rejoindre les partenaires</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
