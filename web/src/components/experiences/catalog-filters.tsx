"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, MapPin, Users } from "lucide-react";

interface DestinationItem {
  id: string;
  name: string;
  slug: string;
}

interface CatalogFiltersProps {
  destinations: DestinationItem[];
}

export function CatalogFilters({ destinations }: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state initialized from URL
  const [type, setType] = useState(searchParams.get("type") || "");
  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [guests, setGuests] = useState(searchParams.get("guests") || "");

  // Sync state with URL change (e.g. from homepage search)
  useEffect(() => {
    setType(searchParams.get("type") || "");
    setDestination(searchParams.get("destination") || "");
    setDate(searchParams.get("date") || "");
    setGuests(searchParams.get("guests") || "");
  }, [searchParams]);

  // Push URL updates
  const updateFilters = (newType: string, newDest: string, newDate: string, newGuests: string) => {
    const params = new URLSearchParams();
    if (newType) params.set("type", newType);
    if (newDest) params.set("destination", newDest);
    if (newDate) params.set("date", newDate);
    if (newGuests) params.set("guests", newGuests);

    router.push(`/experiences?${params.toString()}`);
  };

  return (
    <div className="glass-card p-4 md:p-6 rounded-2xl shadow-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Type Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label-sm font-label-sm text-on-surface-variant px-1">Type</label>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                updateFilters(e.target.value, destination, date, guests);
              }}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-4 pr-10 appearance-none text-on-surface focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Toutes les expériences</option>
              <option value="private">Bateau Privé</option>
              <option value="shared">Partagé</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant h-5 w-5" />
          </div>
        </div>

        {/* Destination Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label-sm font-label-sm text-on-surface-variant px-1">Destination</label>
          <div className="relative">
            <select
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                updateFilters(type, e.target.value, date, guests);
              }}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-4 pr-10 appearance-none text-on-surface focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Toutes les destinations</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant h-5 w-5" />
          </div>
        </div>

        {/* Date Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label-sm font-label-sm text-on-surface-variant px-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              updateFilters(type, destination, e.target.value, guests);
            }}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* Passengers Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label-sm font-label-sm text-on-surface-variant px-1">Passagers</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={guests}
              onChange={(e) => {
                setGuests(e.target.value);
                updateFilters(type, destination, date, e.target.value);
              }}
              placeholder="Nombre"
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary outline-none"
            />
            <Users className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
