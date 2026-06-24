"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, X, Check, Users, Heart, MessageSquare, Info, ShieldAlert, Calendar, Home, Bed, Eye, HelpCircle } from "lucide-react";

interface Accommodation {
  id: string;
  title: string;
  type?: "villa" | "appartement" | "maison" | "studio";
  wilaya?: string;
  city?: string;
  address?: string;
  short_description?: string;
  description: string;
  location: string;
  price: number;
  promo_price?: number | null;
  currency?: string;
  pricing_type?: "night" | "stay";
  availability: string;
  image_url: string;
  images?: string[];
  is_active: boolean;
  contact_phone?: string;
  max_guests?: number;
  rooms_count?: number;
  beds_count?: number;
  bathrooms_count?: number;
  amenities?: string[];
  custom_amenities?: string[];
  booking_type?: "direct" | "manual" | "whatsapp";
  whatsapp_phone?: string;
  min_stay_nights?: number;
  blocked_dates?: string[];
}

export function AccommodationsList({
  accommodations,
  whatsappNumber,
}: {
  accommodations: Accommodation[];
  whatsappNumber: string;
}) {
  const [selectedAcc, setSelectedAcc] = useState<Accommodation | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const openDetails = (acc: Accommodation) => {
    setSelectedAcc(acc);
    setActiveImageIdx(0);
  };

  const closeDetails = () => {
    setSelectedAcc(null);
  };

  return (
    <div>
      {/* Grid List of Accommodations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {accommodations.filter((a) => a.is_active).map((acc) => {
          const pricingTypeText = acc.pricing_type === "stay" ? "séjour" : "nuit";
          return (
            <div
              key={acc.id}
              className="bg-white rounded-[2rem] overflow-hidden postcard-shadow border border-surface-container-highest flex flex-col group hover:-translate-y-2 transition-all duration-300"
            >
              {/* Image & Badges */}
              <div className="relative h-60 w-full overflow-hidden cursor-pointer" onClick={() => openDetails(acc)}>
                <Image
                  src={acc.image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"}
                  alt={acc.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm text-white ${
                      acc.availability === "Disponible"
                        ? "bg-emerald-500"
                        : acc.availability === "Sur demande"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  >
                    {acc.availability}
                  </span>
                  {acc.type && (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-primary/90 text-on-primary uppercase tracking-wider self-start shadow-sm">
                      {acc.type}
                    </span>
                  )}
                </div>
              </div>

              {/* Content Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    className="font-headline-sm text-headline-sm text-primary mb-2 line-clamp-1 cursor-pointer hover:text-secondary-fixed-dim transition-colors"
                    onClick={() => openDetails(acc)}
                  >
                    {acc.title}
                  </h3>
                  <p className="text-on-surface-variant text-xs flex items-center gap-1 mb-3 font-semibold">
                    <MapPin className="h-4 w-4 text-secondary shrink-0" /> {acc.city ? `${acc.city}, ${acc.wilaya || "Béjaïa"}` : acc.location}
                  </p>
                  <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">
                    {acc.short_description || acc.description}
                  </p>
                  
                  {/* Brief Capacity Badges */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="text-[10px] bg-surface-container-low px-2 py-0.5 rounded-md font-bold text-on-surface-variant">
                      👥 {acc.max_guests || 6} voyageurs
                    </span>
                    <span className="text-[10px] bg-surface-container-low px-2 py-0.5 rounded-md font-bold text-on-surface-variant">
                      🚪 {acc.rooms_count || 2} chambres
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">
                      Tarif / {pricingTypeText}
                    </span>
                    <div className="flex items-baseline gap-1">
                      {acc.promo_price ? (
                        <>
                          <span className="font-headline-sm text-headline-sm text-primary">
                            {(acc.promo_price).toLocaleString("fr-DZ")} {acc.currency || "DA"}
                          </span>
                          <span className="text-xs text-outline line-through">
                            {(acc.price).toLocaleString("fr-DZ")}
                          </span>
                        </>
                      ) : (
                        <span className="font-headline-sm text-headline-sm text-primary">
                          {acc.price ? `${acc.price.toLocaleString("fr-DZ")} ${acc.currency || "DA"}` : "Sur demande"}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => openDetails(acc)}
                    className="bg-primary text-on-primary px-5 py-3 rounded-2xl hover:bg-primary-container hover:text-on-primary-container transition-all text-xs font-bold active:scale-95 shrink-0"
                  >
                    Détails & Réserver
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {selectedAcc && (() => {
        const imagesList = selectedAcc.images && selectedAcc.images.length > 0
          ? selectedAcc.images
          : [selectedAcc.image_url].filter(Boolean);

        const allAmenities = [
          ...(selectedAcc.amenities || []),
          ...(selectedAcc.custom_amenities || [])
        ];

        // Format phone number for WhatsApp API
        let targetPhone = (selectedAcc.whatsapp_phone || whatsappNumber || "").replace(/[^\d]/g, "");
        if (targetPhone.startsWith("0")) {
          targetPhone = "213" + targetPhone.substring(1);
        } else if (targetPhone.length === 9 && (targetPhone.startsWith("5") || targetPhone.startsWith("6") || targetPhone.startsWith("7"))) {
          targetPhone = "213" + targetPhone;
        }

        const pricingTypeText = selectedAcc.pricing_type === "stay" ? "séjour" : "nuit";

        // Pre-filled WhatsApp message
        const messageText = `Bonjour Safar DZ, je suis intéressé par l'hébergement "${selectedAcc.title}" situé à ${selectedAcc.location} pour un séjour.\n\n` +
          `• Type: ${selectedAcc.type || "Logement"}\n` +
          `• Tarif: ${selectedAcc.promo_price || selectedAcc.price} ${selectedAcc.currency || "DA"} / ${pricingTypeText}\n` +
          (selectedAcc.min_stay_nights ? `• Séjour minimum: ${selectedAcc.min_stay_nights} nuits\n` : "") +
          `• Capacité: ${selectedAcc.max_guests || 6} voyageurs (${selectedAcc.rooms_count || 2} chambres, ${selectedAcc.beds_count || 4} lits)\n\n` +
          `Est-il disponible pour mes dates ? Merci d'avance.`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
              onClick={closeDetails}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 md:p-10 shadow-2xl space-y-6 border border-outline-variant/20 flex flex-col md:flex-row gap-8 animate-in zoom-in-95 duration-200">
              
              {/* Close Button */}
              <button
                onClick={closeDetails}
                className="absolute top-4 right-4 p-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant rounded-full transition-colors z-10"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Left Column: Image Gallery */}
              <div className="w-full md:w-1/2 space-y-4 shrink-0 flex flex-col">
                {/* Active Image */}
                <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] bg-surface-container shadow-inner">
                  <Image
                    src={imagesList[activeImageIdx] || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"}
                    alt={selectedAcc.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Gallery Grid (If multiples are available) */}
                {imagesList.length > 1 && (
                  <div className="grid grid-cols-4 gap-3 shrink-0">
                    {imagesList.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                          activeImageIdx === idx ? "border-primary scale-95 shadow-md" : "border-transparent opacity-75 hover:opacity-100"
                        }`}
                      >
                        <Image src={imgUrl} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Accommodation Info */}
              <div className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                          selectedAcc.availability === "Disponible"
                            ? "bg-emerald-100 text-emerald-700"
                            : selectedAcc.availability === "Sur demande"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {selectedAcc.availability}
                      </span>
                      {selectedAcc.type && (
                        <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                          {selectedAcc.type}
                        </span>
                      )}
                    </div>
                    <h2 className="text-headline-md font-headline-md text-primary leading-tight">
                      {selectedAcc.title}
                    </h2>
                    <p className="text-on-surface-variant text-sm flex items-center gap-1 mt-2 font-semibold">
                      <MapPin className="h-4 w-4 text-secondary shrink-0" /> 
                      {selectedAcc.address ? `${selectedAcc.address}, ` : ""}
                      {selectedAcc.city ? `${selectedAcc.city}, ` : ""}
                      {selectedAcc.wilaya || selectedAcc.location}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-bold text-xs uppercase text-outline mb-2">Description</h4>
                    <p className="text-body-md text-on-surface-variant leading-relaxed">
                      {selectedAcc.description}
                    </p>
                  </div>

                  {/* Capacity metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/10">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-outline uppercase tracking-wider">Voyageurs max</span>
                      <span className="text-xs font-extrabold text-on-surface mt-1">👥 {selectedAcc.max_guests || 6} pers.</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-outline uppercase tracking-wider">Chambres</span>
                      <span className="text-xs font-extrabold text-on-surface mt-1">🚪 {selectedAcc.rooms_count || 2} ch.</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-outline uppercase tracking-wider">Lits</span>
                      <span className="text-xs font-extrabold text-on-surface mt-1">🛏️ {selectedAcc.beds_count || 4} lits</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-outline uppercase tracking-wider">Salles de bain</span>
                      <span className="text-xs font-extrabold text-on-surface mt-1">🚿 {selectedAcc.bathrooms_count || 1} sdb</span>
                    </div>
                  </div>

                  {/* Min stay alert if set */}
                  {selectedAcc.min_stay_nights && selectedAcc.min_stay_nights > 1 && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 text-xs font-bold rounded-2xl border border-amber-200">
                      <Info className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                      <span>Séjour minimum requis de {selectedAcc.min_stay_nights} nuits pour cet hébergement.</span>
                    </div>
                  )}

                  {/* Amenities List */}
                  <div>
                    <h4 className="font-bold text-xs uppercase text-outline mb-3">Équipements inclus</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {allAmenities.length > 0 ? (
                        allAmenities.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))
                      ) : (
                        ["Climatisation", "Connexion Wi-Fi", "Cuisine équipée", "Terrasse / Balcon", "Parking gratuit"].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Reservation Actions */}
                <div className="pt-6 border-t border-outline-variant/10 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">
                      Tarif / {pricingTypeText}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      {selectedAcc.promo_price ? (
                        <>
                          <span className="text-headline-md font-headline-md text-primary">
                            {(selectedAcc.promo_price).toLocaleString("fr-DZ")} {selectedAcc.currency || "DA"}
                          </span>
                          <span className="text-xs text-outline line-through">
                            {(selectedAcc.price).toLocaleString("fr-DZ")}
                          </span>
                        </>
                      ) : (
                        <span className="text-headline-md font-headline-md text-primary">
                          {selectedAcc.price ? `${selectedAcc.price.toLocaleString("fr-DZ")} ${selectedAcc.currency || "DA"}` : "Sur demande"}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${targetPhone}?text=${encodeURIComponent(messageText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-on-primary px-8 py-4 rounded-2xl hover:bg-primary-container hover:text-on-primary-container transition-all text-sm font-bold active:scale-95 shadow-md flex items-center gap-2"
                  >
                    <MessageSquare className="h-4.5 w-4.5" /> Réserver sur WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
