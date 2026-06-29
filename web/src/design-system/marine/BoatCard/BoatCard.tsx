import * as React from "react";
import Image from "next/image";
import { Users, ShieldCheck, Anchor } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface BoatCardProps {
  image: string;
  boatName: string;
  capacity: number;
  captain: string;
  equipment: string[];
  price: string | number;
  className?: string;
}

export function BoatCard({
  image,
  boatName,
  capacity,
  captain,
  equipment,
  price,
  className,
}: BoatCardProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-safar-premium border border-soft-ocean/20 bg-cream shadow-safar-md transition-all duration-300 ease-safar hover:-translate-y-1 hover:shadow-safar-lg",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image src={image} alt={boatName} fill className="object-cover" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-safar-sm bg-ocean-blue/90 px-2.5 py-1 text-white shadow-safar-sm">
          <Anchor className="h-3.5 w-3.5" />
          <span className="text-safar-caption-md">{boatName}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5 text-safar-caption-md text-ink/70">
            <Users className="h-4 w-4 text-soft-ocean" />
            {capacity}
          </span>
          <span className="flex items-center gap-1.5 text-safar-caption-md text-ink/70">
            <ShieldCheck className="h-4 w-4 text-soft-ocean" />
            {captain}
          </span>
        </div>

        {equipment.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {equipment.map((item) => (
              <span
                key={item}
                className="rounded-safar-sm bg-soft-ocean/10 px-2.5 py-1 text-safar-caption-sm text-soft-ocean"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        <span className="text-safar-heading-sm text-ocean-blue">{price}</span>
      </div>
    </article>
  );
}
