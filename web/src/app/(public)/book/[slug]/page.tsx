"use client";

import { useState, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/stores/booking-store";
import { createBooking } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPriceDA } from "@/lib/utils/format";
import { Calendar, Users, FileText, CheckCircle2 } from "lucide-react";
import { MOCK_EXPERIENCES } from "@/lib/queries/experiences";

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { currentStep, nextStep, prevStep, setStep, guestCount, setGuestCount, clientName, clientPhone, clientNotes, setClientInfo, setDate, setTimeSlot } = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const experience = MOCK_EXPERIENCES.find(e => e.slug === resolvedParams.slug) || MOCK_EXPERIENCES[0];
  const totalAmount = experience.type === "shared"
    ? (experience.price_per_seat || 0) * guestCount
    : (experience.price_total || 0);

  // Auto-set mock data for now
  const handleDateSelect = () => {
    setDate("2026-07-20");
    setTimeSlot("slot-1", "09:00");
    nextStep();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Simuler un peu d'attente
    await new Promise(r => setTimeout(r, 1000));
    
    const result = await createBooking({
      experience_id: experience.id,
      time_slot_id: null,
      client_name: clientName || "Client Sans Nom",
      client_phone: clientPhone || "000000000",
      client_notes: clientNotes,
      guest_count: guestCount,
      booking_date: "2026-07-20",
      booking_time: "09:00",
      total_amount: totalAmount,
      booking_type: experience.type === "shared" ? "shared" : "private"
    });

    setIsSubmitting(false);
    if (result.success) {
      useBookingStore.getState().reset();
      router.push(`/booking/confirmation/${result.booking_ref}`);
    } else {
      alert("Erreur lors de la réservation : " + result.error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Main Booking Flow */}
        <div className="flex-1">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-surface-variant -z-10 -translate-y-1/2" />
            
            <div className="flex flex-col items-center bg-surface-container-lowest px-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 'DATE_TIME' ? 'bg-primary text-white' : 'bg-primary-container text-on-primary-container'}`}>1</div>
              <span className="text-xs mt-1 font-medium">Date</span>
            </div>
            <div className="flex flex-col items-center bg-surface-container-lowest px-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 'GUESTS' ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'}`}>2</div>
              <span className="text-xs mt-1 font-medium">Passagers</span>
            </div>
            <div className="flex flex-col items-center bg-surface-container-lowest px-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 'CLIENT_INFO' ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'}`}>3</div>
              <span className="text-xs mt-1 font-medium">Infos</span>
            </div>
          </div>

          <Card className="p-6 custom-shadow border-0">
            {currentStep === 'DATE_TIME' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl font-bold font-mono">Choisissez votre créneau</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center border-primary bg-primary/5" onClick={handleDateSelect}>
                    <Calendar className="h-5 w-5 mb-1 text-primary" />
                    <span>Aujourd'hui</span>
                    <span className="text-xs text-on-surface-variant">09:00</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={handleDateSelect}>
                    <Calendar className="h-5 w-5 mb-1" />
                    <span>Demain</span>
                    <span className="text-xs text-on-surface-variant">14:00</span>
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'GUESTS' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-2xl font-bold font-mono">Combien de personnes ?</h2>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="icon" onClick={() => setGuestCount(guestCount - 1)} disabled={guestCount <= 1}>-</Button>
                  <span className="text-2xl font-bold w-12 text-center">{guestCount}</span>
                  <Button variant="outline" size="icon" onClick={() => setGuestCount(guestCount + 1)} disabled={guestCount >= experience.max_guests}>+</Button>
                </div>
                <p className="text-sm text-on-surface-variant">Capacité maximale : {experience.max_guests} personnes.</p>
                <div className="pt-6 flex justify-between">
                  <Button variant="ghost" onClick={prevStep}>Retour</Button>
                  <Button onClick={nextStep}>Continuer</Button>
                </div>
              </div>
            )}

            {currentStep === 'CLIENT_INFO' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h2 className="text-2xl font-bold font-mono">Vos coordonnées</h2>
                <p className="text-sm text-on-surface-variant">Ces informations seront partagées avec le propriétaire du bateau.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nom complet</label>
                    <Input placeholder="Ex: Amine B." value={clientName} onChange={e => setClientInfo({ name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Numéro de téléphone (WhatsApp si possible)</label>
                    <Input placeholder="05..." type="tel" value={clientPhone} onChange={e => setClientInfo({ phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Demande spéciale (Optionnel)</label>
                    <Input placeholder="Anniversaire, demande en mariage..." value={clientNotes} onChange={e => setClientInfo({ notes: e.target.value })} />
                  </div>
                </div>
                <div className="pt-6 flex justify-between">
                  <Button variant="ghost" onClick={prevStep}>Retour</Button>
                  <Button onClick={handleConfirm} disabled={!clientName || !clientPhone || isSubmitting} className="bg-success text-white hover:bg-success/90">
                    {isSubmitting ? "Confirmation..." : "Confirmer la réservation"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Summary */}
        <aside className="w-full md:w-80 flex-shrink-0">
          <Card className="overflow-hidden">
            <div className="relative h-32 w-full">
              <Image src={experience.main_image_url} alt="Boat" fill className="object-cover" />
            </div>
            <div className="p-5">
              <Badge variant="secondary" className="mb-2">
                {experience.type === "private" ? "Bateau Privé" : "Sortie Partagée"}
              </Badge>
              <h3 className="font-bold font-mono text-lg mb-4">{experience.title}</h3>
              
              <div className="space-y-2 text-sm text-on-surface-variant pb-4 border-b border-surface-variant">
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="font-medium text-on-surface">20 Juil 2026</span>
                </div>
                <div className="flex justify-between">
                  <span>Heure</span>
                  <span className="font-medium text-on-surface">09:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Passagers</span>
                  <span className="font-medium text-on-surface">{guestCount} pers.</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-end">
                <span className="font-semibold">Total à payer</span>
                <span className="text-2xl font-bold font-mono text-primary">{formatPriceDA(totalAmount)}</span>
              </div>
              <p className="text-xs text-center text-on-surface-variant mt-2 bg-surface-variant p-2 rounded">
                À payer sur place le jour J
              </p>
            </div>
          </Card>
        </aside>

      </div>
    </div>
  );
}
