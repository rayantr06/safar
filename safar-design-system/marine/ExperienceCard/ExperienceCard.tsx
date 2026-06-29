import * as React from "react";
import Image from "next/image";
import { MapPin, Clock, Star } from "lucide-react";
import { cn } from "../../utils/cn";
import { SafarButton } from "../../components/Button";

export interface ExperienceCardProps {
  image: string;
  title: string;
  location: string;
  duration: string;
  price: string | number;
  rating?: number;
  ctaLabel?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function ExperienceCard({
  image,
  title,
  location,
  duration,
  price,
  rating,
  ctaLabel,
  onCtaClick,
  className,
}: ExperienceCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-safar-premium bg-cream shadow-safar-sm transition-all duration-300 ease-safar hover:-translate-y-1 hover:shadow-safar-md",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 ease-safar group-hover:scale-105"
        />
        {rating !== undefined && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-safar-sm bg-cream/90 px-2.5 py-1 shadow-safar-sm">
            <Star className="h-3.5 w-3.5 fill-sun-gold text-sun-gold" />
            <span className="text-safar-caption-md text-ink">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-5">
        <h3 className="text-safar-heading-adventure text-ink">{title}</h3>

        <div className="flex items-center gap-4 text-soft-ocean">
          <span className="flex items-center gap-1.5 text-safar-caption-md text-ink/70">
            <MapPin className="h-4 w-4 text-soft-ocean" />
            {location}
          </span>
          <span className="flex items-center gap-1.5 text-safar-caption-md text-ink/70">
            <Clock className="h-4 w-4 text-soft-ocean" />
            {duration}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-safar-heading-sm text-ocean-blue">{price}</span>
          {ctaLabel && (
            <SafarButton variant="primary" size="small" onClick={onCtaClick}>
              {ctaLabel}
            </SafarButton>
          )}
        </div>
      </div>
    </article>
  );
}
