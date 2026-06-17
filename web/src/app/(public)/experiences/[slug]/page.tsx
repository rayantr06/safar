import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Users, MapPin, Star, ShieldCheck, Anchor } from "lucide-react";
import { getAllExperiences, getDestinations } from "@/lib/queries/experiences";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPriceDA } from "@/lib/utils/format";

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experiences = await getAllExperiences();
  
  const experience = experiences.find(e => e.slug === slug);
  
  if (!experience) {
    notFound();
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen pb-24">
      {/* 1. Header / Gallery */}
      <div className="w-full h-[50vh] min-h-[400px] relative">
        <Image
          src={experience.main_image_url}
          alt={experience.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 text-white">
          <div className="container mx-auto">
            <div className="flex gap-2 mb-4">
              <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-none">
                {experience.type === "private" ? "Bateau Privé" : "Sortie Partagée"}
              </Badge>
              {experience.badge && (
                <Badge variant="warning" className="border-none shadow-lg">
                  {experience.badge}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-mono mb-4">{experience.title}</h1>
            <div className="flex items-center gap-6 text-sm md:text-base font-medium">
              <span className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> {experience.destination_name}</span>
              <span className="flex items-center gap-2"><Star className="h-5 w-5 text-warning fill-warning" /> {experience.rating} (Superbe)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* 2. Main Content */}
        <div className="flex-1 space-y-12">
          {/* Key Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-surface-variant">
            <div className="flex flex-col gap-1">
              <Clock className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm text-on-surface-variant">Durée</span>
              <span className="font-semibold text-on-surface">{experience.duration_minutes / 60} heures</span>
            </div>
            <div className="flex flex-col gap-1">
              <Users className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm text-on-surface-variant">Capacité</span>
              <span className="font-semibold text-on-surface">Jusqu'à {experience.max_guests} pers.</span>
            </div>
            <div className="flex flex-col gap-1">
              <Anchor className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm text-on-surface-variant">Bateau</span>
              <span className="font-semibold text-on-surface">Standard</span>
            </div>
            <div className="flex flex-col gap-1">
              <ShieldCheck className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm text-on-surface-variant">Paiement</span>
              <span className="font-semibold text-on-surface">Sur place</span>
            </div>
          </div>

          {/* Description */}
          <section>
            <h2 className="text-2xl font-bold font-mono mb-4 text-on-surface">À propos de cette expérience</h2>
            <div className="prose prose-on-surface max-w-none">
              <p className="text-on-surface-variant text-lg leading-relaxed">
                Découvrez la beauté exceptionnelle de la côte bougiote avec cette sortie en mer inoubliable. 
                Que ce soit pour une balade relaxante, une session de baignade dans des eaux cristallines, ou 
                simplement pour admirer le coucher du soleil, cette expérience est faite pour vous.
              </p>
              <p className="text-on-surface-variant text-lg leading-relaxed mt-4">
                Nos capitaines expérimentés connaissent parfaitement la région et vous feront découvrir 
                les coins les plus secrets et les plus spectaculaires de {experience.destination_name}.
              </p>
            </div>
          </section>

          {/* Location Map Placeholder */}
          <section>
            <h2 className="text-2xl font-bold font-mono mb-4 text-on-surface">Point de départ</h2>
            <div className="w-full h-64 bg-surface-variant rounded-2xl flex items-center justify-center border border-outline-variant">
              <div className="text-center text-on-surface-variant">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Port de Béjaïa</p>
                <p className="text-sm">Le point de rendez-vous exact vous sera communiqué après réservation.</p>
              </div>
            </div>
          </section>
        </div>

        {/* 3. Booking Widget (Sidebar) */}
        <aside className="w-full lg:w-96 flex-shrink-0">
          <div className="sticky top-24 bg-surface rounded-2xl border border-outline-variant p-6 custom-shadow">
            <div className="mb-6 pb-6 border-b border-surface-variant">
              <div className="text-2xl font-bold font-mono text-primary mb-1">
                {experience.type === "shared" ? (
                  <>
                    {formatPriceDA(experience.price_per_seat || 0)} <span className="text-base text-on-surface-variant font-sans font-normal">/ pers</span>
                  </>
                ) : (
                  formatPriceDA(experience.price_total || 0)
                )}
              </div>
              <p className="text-sm text-on-surface-variant">
                {experience.type === "private" ? "Pour tout le bateau (jusqu'à 6 pers.)" : "Prix par place"}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-primary-container/30 rounded-xl p-4 flex gap-3 text-sm">
                <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-on-surface-variant">
                  <strong className="text-on-surface block mb-1">Réservation Gratuite</strong>
                  Vous payez le montant total directement au propriétaire le jour de la sortie.
                </p>
              </div>
            </div>

            <Button size="lg" className="w-full text-lg h-14" asChild>
              <Link href={`/book/${experience.slug}`}>
                Vérifier les disponibilités
              </Link>
            </Button>
            
            <p className="text-center text-xs text-on-surface-variant mt-4">
              Aucun paiement requis maintenant
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
}
