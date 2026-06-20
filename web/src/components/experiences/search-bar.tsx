"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (date) params.set("date", date);
    if (guests) params.set("guests", guests);
    
    router.push(`/experiences?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full glass-card p-4 md:p-6 rounded-[2rem] shadow-lg border border-white/50 flex flex-col md:flex-row gap-4 items-center">
      <div className="w-full md:flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Destination Input */}
        <div className="flex flex-col gap-1 px-4 py-2 md:border-r border-outline-variant/30">
          <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">
            Destination
          </label>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <input
              className="bg-transparent border-none p-0 focus:ring-0 focus:outline-none text-on-surface font-semibold placeholder:text-outline w-full"
              placeholder="Où allez-vous ?"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
        </div>

        {/* Date Input */}
        <div className="flex flex-col gap-1 px-4 py-2 md:border-r border-outline-variant/30">
          <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">
            Dates
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <input
              className="bg-transparent border-none p-0 focus:ring-0 focus:outline-none text-on-surface font-semibold placeholder:text-outline w-full"
              placeholder="Ajouter dates"
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
        </div>

        {/* Guests Input */}
        <div className="flex flex-col gap-1 px-4 py-2">
          <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">
            Passagers
          </label>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <input
              className="bg-transparent border-none p-0 focus:ring-0 focus:outline-none text-on-surface font-semibold placeholder:text-outline w-full"
              placeholder="Qui vient ?"
              type="text"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full md:w-auto aspect-square bg-primary text-on-primary rounded-full flex items-center justify-center hover:bg-primary-container transition-all shadow-md group h-12 w-12 cursor-pointer"
      >
        <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
