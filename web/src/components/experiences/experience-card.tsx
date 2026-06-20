import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, MapPin, Star, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPriceDA } from "@/lib/utils/format";

export interface ExperienceSummary {
  id: string;
  title: string;
  slug: string;
  type: "private" | "shared" | "jetski";
  price_total: number | null;
  price_per_seat: number | null;
  duration_minutes: number;
  max_guests: number;
  badge: string | null;
  destination_name: string;
  main_image_url: string;
  rating: number;
}

export function ExperienceCard({ experience }: { experience: ExperienceSummary }) {
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden postcard-shadow border border-surface-container-highest flex flex-col group hover:-translate-y-2 transition-all duration-300">
      {/* Image */}
      <div className="relative h-64">
        <Image
          src={experience.main_image_url || "/images/placeholder.jpg"}
          alt={experience.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {experience.badge && (
            <Badge variant="warning" className="shadow-sm">
              {experience.badge}
            </Badge>
          )}
          {!experience.badge && (
            <Badge variant="info" className="shadow-sm">
              {experience.type === "private"
                ? "Bateau Privé"
                : experience.type === "shared"
                ? "Partagé"
                : "Jet Ski"}
            </Badge>
          )}
        </div>
        {/* Favorite */}
        <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-primary hover:bg-white transition-all">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Title & Rating */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-headline-sm text-headline-sm text-primary line-clamp-1">
            {experience.title}
          </h3>
          <div className="flex items-center text-tertiary flex-shrink-0 ml-2">
            <Star className="h-[18px] w-[18px] fill-current" />
            <span className="font-bold ml-1">{experience.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Location */}
        <p className="text-on-surface-variant flex items-center gap-1 mb-6">
          <MapPin className="h-[18px] w-[18px]" /> {experience.destination_name}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-label-sm">{experience.duration_minutes / 60} Heures</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-label-sm">Jusqu&apos;à {experience.max_guests} pers.</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-label-sm text-on-surface-variant block uppercase tracking-tighter">
              À partir de
            </span>
            <span className="font-headline-md text-headline-sm text-primary">
              {experience.type === "shared"
                ? formatPriceDA(experience.price_per_seat || 0)
                : formatPriceDA(experience.price_total || 0)}
            </span>
          </div>
          <Link
            href={`/experiences/${experience.slug}`}
            className="bg-primary text-on-primary px-5 py-3 rounded-2xl hover:bg-primary-container hover:text-on-primary-container transition-all text-label-md font-bold active:scale-95"
          >
            Voir l&apos;expérience
          </Link>
        </div>
      </div>
    </div>
  );
}
