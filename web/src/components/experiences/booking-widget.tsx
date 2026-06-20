"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Users, Clock, Calendar } from "lucide-react";
import { formatPriceDA } from "@/lib/utils/format";

type ExperienceDetail = {
  id: string;
  title: string;
  slug: string;
  type: string;
  price_total: number | null;
  price_per_seat: number | null;
  max_guests: number;
};

interface BookingWidgetProps {
  experience: ExperienceDetail;
}

export function BookingWidget({ experience }: BookingWidgetProps) {
  // Price calculations
  const price =
    experience.type === "shared"
      ? experience.price_per_seat || 350000 // default 3500 DA in cents
      : experience.price_total || 1000000; // default 10000 DA in cents

  const categoryLabel = 
    experience.type === "private" ? "Bateau Privé" :
    experience.type === "shared" ? "Place Partagée" :
    experience.type === "jetski" ? "Jet Ski" :
    experience.type === "kayak" ? "Kayak" :
    experience.type === "paddle" ? "Paddle" : experience.type;

  return (
    <div className="bg-white border border-outline-variant/30 rounded-2xl p-8 shadow-[0_4px_12px_rgba(0,54,147,0.05)] space-y-6">
      <div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
          Réserver l&apos;expérience
        </h3>
        <p className="text-label-sm text-outline font-medium">
          Processus d&apos;inscription &amp; validation simple
        </p>
      </div>

      <div className="bg-surface-container/40 p-5 rounded-2xl border border-outline-variant/10 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-label-md text-on-surface-variant font-medium">Tarif</span>
          <span className="font-bold text-headline-sm text-primary font-mono">
            {formatPriceDA(price)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant pt-2 border-t border-outline-variant/10">
          <span>Type</span>
          <span>{categoryLabel}</span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
          <span>Capacité max</span>
          <span>{experience.max_guests} voyageurs</span>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href={`/book/${experience.slug}`}
          className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-body-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-primary/10"
        >
          Réserver l&apos;expérience
        </Link>
        <a
          href="https://wa.me/213556483634"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 border border-outline text-on-surface py-4 rounded-xl font-bold text-body-lg hover:bg-surface transition-all active:scale-95"
        >
          <MessageCircle className="h-5 w-5 fill-current text-green-600" />
          Contacter sur WhatsApp
        </a>
      </div>
      <p className="text-center text-label-sm text-outline font-medium">
        Aucun paiement ne sera requis aujourd&apos;hui
      </p>
    </div>
  );
}

