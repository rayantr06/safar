import Image from "next/image";
import Link from "next/link";
import { IMAGES } from "@/lib/constants";
import { getAllExperiences } from "@/lib/queries/experiences";
import { ExperienceCard } from "@/components/experiences/experience-card";
import { Ship, Anchor, Users, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PrivateBoatsPage() {
  const experiences = await getAllExperiences();
  // Filter for private experiences
  const privateExperiences = experiences.filter((exp) => exp.type === "private");

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Hero Header */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={IMAGES.CAT_PRIVATE_BOATS}
            alt="Private Boat Charter"
            fill
            className="object-cover brightness-[0.75]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full text-white">
          <span className="bg-secondary-fixed/30 border border-primary/20 text-tertiary-fixed-dim text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block">
            Location Exclusive
          </span>
          <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg leading-tight mb-4">
            Bateaux Privatisés
          </h1>
          <p className="text-body-lg text-surface-variant max-w-xl opacity-95">
            Louez votre propre bateau avec équipage et profitez d&apos;une sortie exclusive en famille ou entre amis le long du Cap Carbon et des Aiguades.
          </p>
        </div>
      </section>

      {/* Private Charters Grid */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="mb-12">
          <h2 className="font-headline-md text-headline-sm text-primary mb-2">
            Nos Bateaux Privés Disponibles
          </h2>
          <p className="text-on-surface-variant">
            Choisissez l&apos;embarcation qui vous convient pour une sortie sur mesure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {privateExperiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      </section>

      {/* Info Perks */}
      <section className="py-12 bg-surface-container-low/40 border-y border-outline-variant/20">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-primary flex items-center justify-center mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Privatisation Totale</h4>
            <p className="text-xs text-on-surface-variant max-w-xs">
              Le bateau est entièrement à vous. Pas d&apos;inconnus à bord, l&apos;équipage s&apos;occupe uniquement de votre groupe.
            </p>
          </div>
          <div className="flex flex-col items-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-primary flex items-center justify-center mb-4">
              <Anchor className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Itinéraire Flexible</h4>
            <p className="text-xs text-on-surface-variant max-w-xs">
              Personnalisez les escales, passez plus de temps à vous baigner ou à pêcher dans vos criques favorites.
            </p>
          </div>
          <div className="flex flex-col items-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-primary flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Sécurité &amp; Skipper Pro</h4>
            <p className="text-xs text-on-surface-variant max-w-xs">
              Tous nos bateaux sont menés par des capitaines agréés avec gilets de sauvetage et armement complet de sécurité.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
