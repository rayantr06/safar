import { notFound } from "next/navigation";
import Image from "next/image";
import { Clock, MapPin } from "lucide-react";
import { getAllExperiences } from "@/lib/queries/experiences";
import { BookingClient } from "@/components/booking/booking-client";

export const dynamic = "force-dynamic";

interface BookingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const resolvedParams = await params;
  const experiences = await getAllExperiences();
  const experience = experiences.find((e) => e.slug === resolvedParams.slug);

  if (!experience) {
    notFound();
  }

  const categoryLabel = 
    experience.type === "private" ? "Bateau Privé" :
    experience.type === "shared" ? "Place Partagée" :
    experience.type === "jetski" ? "Jet Ski" :
    experience.type === "kayak" ? "Kayak" :
    experience.type === "paddle" ? "Paddle" : experience.type;

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-12 animate-fade-in">
      {/* Header section with postcard image on left and title on right */}
      <section className="mb-12 flex flex-col md:flex-row gap-8 items-center border-b border-outline-variant/30 pb-8">
        <div className="w-32 h-40 md:w-40 md:h-48 rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,54,147,0.1)] shrink-0 relative border border-outline-variant/30">
          <Image
            src={experience.main_image_url || "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020"}
            alt={experience.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-headline-md md:text-display-lg font-display-lg text-primary mb-2">
            Réservez votre aventure
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-on-surface-variant text-sm font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary" /> {experience.destination_name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-primary" /> {experience.duration_minutes / 60} heures
            </span>
            <span className="flex items-center gap-1 text-primary font-bold">
              {categoryLabel}
            </span>
          </div>
          <p className="mt-2 text-headline-sm font-headline-sm text-secondary">
            {experience.title}
          </p>
        </div>
      </section>

      {/* Booking client workspace */}
      <BookingClient experience={experience} />
    </div>
  );
}
