import * as React from "react";
import Image from "next/image";
import { cn } from "../../utils/cn";

export interface ActivityCardProps {
  image: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  price: string | number;
  className?: string;
}

export function ActivityCard({ image, icon: Icon, title, description, price, className }: ActivityCardProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-safar-premium bg-cream shadow-safar-sm transition-all duration-300 ease-safar hover:-translate-y-1 hover:shadow-safar-md",
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover" />
        <div className="absolute -bottom-5 left-5 flex h-10 w-10 items-center justify-center rounded-full bg-ocean-blue text-white shadow-safar-md">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-5 pt-7">
        <h3 className="text-safar-heading-adventure text-ink">{title}</h3>
        <p className="text-safar-body-sm text-ink/70">{description}</p>
        <span className="text-safar-heading-sm text-ocean-blue">{price}</span>
      </div>
    </article>
  );
}
