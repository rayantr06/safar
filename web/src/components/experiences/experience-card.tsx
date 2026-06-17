import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <Link href={`/experiences/${experience.slug}`}>
      <Card className="group overflow-hidden cursor-pointer transition-all hover:shadow-md border-outline-variant h-full flex flex-col bg-surface">
        {/* Image Container */}
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={experience.main_image_url || "/images/placeholder.jpg"}
            alt={experience.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {experience.badge && (
              <Badge variant="warning" className="shadow-sm">
                {experience.badge}
              </Badge>
            )}
            <Badge variant="secondary" className="shadow-sm capitalize">
              {experience.type === "private" ? "Bateau Privé" : experience.type === "shared" ? "Partagé" : "Jet Ski"}
            </Badge>
          </div>

          {/* Location & Rating */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <div className="flex items-center space-x-1 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{experience.destination_name}</span>
            </div>
            <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md text-sm font-bold">
              <Star className="h-4 w-4 text-warning fill-warning" />
              <span>{experience.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-on-surface line-clamp-1 mb-3 group-hover:text-primary transition-colors">
            {experience.title}
          </h3>
          
          {/* Details */}
          <div className="grid grid-cols-2 gap-y-2 text-sm text-on-surface-variant mb-4 flex-1">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{experience.duration_minutes / 60}h</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Jusqu'à {experience.max_guests} pers.</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="pt-4 border-t border-outline-variant flex items-end justify-between">
            <div className="text-sm text-on-surface-variant">À partir de</div>
            <div className="text-right">
              {experience.type === "shared" ? (
                <>
                  <span className="text-xl font-bold font-mono text-primary">
                    {formatPriceDA(experience.price_per_seat || 0)}
                  </span>
                  <span className="text-sm text-on-surface-variant ml-1">/ pers</span>
                </>
              ) : (
                <span className="text-xl font-bold font-mono text-primary">
                  {formatPriceDA(experience.price_total || 0)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
