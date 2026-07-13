"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useBookingStore } from "@/stores/booking-store";
import { createBooking, getExperienceAvailability } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPriceDA } from "@/lib/utils/format";
import {
  Calendar as CalendarIcon,
  Users,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

// Helper to convert HH:MM to minutes from midnight
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// Helper to convert minutes from midnight to HH:MM
function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface BookingClientProps {
  experience: any;
}

export function BookingClient({ experience }: BookingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    currentStep,
    nextStep,
    prevStep,
    guestCount,
    setGuestCount,
    clientName,
    clientPhone,
    clientNotes,
    setClientInfo,
    selectedDate: date,
    setDate,
    selectedTime: timeSlot,
    selectedTimeSlotId: timeSlotId,
    setTimeSlot,
  } = useBookingStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(120);

  // Availability state
  const [busySlots, setBusySlots] = useState<any[]>([]);
  const [availabilitySettings, setAvailabilitySettings] = useState<any>(null);
  const [availLoading, setAvailLoading] = useState(false);

  // Sync URL parameters with Zustand store
  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const seatsParam = searchParams.get("seats");
  const durationParam = searchParams.get("duration");

  useEffect(() => {
    if (dateParam) setDate(dateParam);
    if (timeParam) setTimeSlot(`slot-${timeParam}`, timeParam);
    if (seatsParam) setGuestCount(parseInt(seatsParam, 10));
    if (durationParam) setDurationMinutes(parseInt(durationParam, 10));
  }, [dateParam, timeParam, seatsParam, durationParam, setDate, setTimeSlot, setGuestCount]);

  // Load availability settings whenever date changes
  useEffect(() => {
    if (!date) return;
    
    async function loadAvailability() {
      setAvailLoading(true);
      try {
        const res = await getExperienceAvailability(experience.id, date!);
        if (res.success) {
          setBusySlots(res.busySlots || []);
          setAvailabilitySettings(res.availabilitySettings);
        }
      } catch (err) {
        console.error("Failed to load experience availability:", err);
      } finally {
        setAvailLoading(false);
      }
    }

    loadAvailability();
  }, [date, experience.id, durationMinutes]);

  const today = new Date();
  
  // Track currently viewed year and month in the calendar navigation
  const [viewYear, setViewYear] = useState(() => {
    if (date) {
      const parts = date.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        if (!isNaN(y)) return y;
      }
    }
    return today.getFullYear();
  });

  const [viewMonth, setViewMonth] = useState(() => {
    if (date) {
      const parts = date.split('-');
      if (parts.length === 3) {
        const m = parseInt(parts[1], 10) - 1; // 0-indexed
        if (!isNaN(m) && m >= 0 && m < 12) return m;
      }
    }
    return today.getMonth();
  });

  // Sync viewed month/year when the store date changes (e.g. from URL params on load)
  useEffect(() => {
    if (date) {
      const parts = date.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m) && m >= 0 && m < 12) {
          setViewYear(y);
          setViewMonth(m);
        }
      }
    }
  }, [date]);

  // Format the month and year header in French
  const getMonthHeader = () => {
    const d = new Date(viewYear, viewMonth, 1);
    const monthName = new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(d);
    const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    return `${capitalized} ${viewYear}`;
  };

  // Compute start padding cells (Monday-indexed: Mon=0, Tue=1, ..., Sun=6)
  const firstDay = new Date(viewYear, viewMonth, 1);
  const dayOfWeek = firstDay.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const startPaddingCells = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Number of days in the viewed month
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInMonth = Array.from({ length: totalDays }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const isDateDisabled = (dayNum: number) => {
    const cellDate = new Date(viewYear, viewMonth, dayNum);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return cellDate < todayMidnight;
  };

  const defaultDuration = 
    experience.type === "jetski" ? 60 : 
    experience.type === "kayak" || experience.type === "paddle" ? 60 : 120;
    
  const pricePerUnit =
    experience.type === "shared"
      ? (experience.price_per_seat || 0)
      : (experience.price_total || 1000000);

  const totalAmount =
    experience.type === "shared"
      ? pricePerUnit * guestCount
      : Math.round((pricePerUnit / defaultDuration) * durationMinutes);

  const handleDateClick = (dayNum: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(dayNum).padStart(2, "0");
    const selectedFullDate = `${viewYear}-${formattedMonth}-${formattedDay}`;
    setDate(selectedFullDate);
  };

  const isSlotBlocked = (slotTime: string) => {
    const slotStart = timeToMinutes(slotTime);
    const slotEnd = slotStart + durationMinutes;

    if (availabilitySettings) {
      const workStart = timeToMinutes(availabilitySettings.workingHours?.start || "08:00");
      const workEnd = timeToMinutes(availabilitySettings.workingHours?.end || "20:00");
      if (slotStart < workStart || slotEnd > workEnd) return true;

      if (availabilitySettings.breakTime?.start && availabilitySettings.breakTime?.end) {
        const breakStart = timeToMinutes(availabilitySettings.breakTime.start);
        const breakEnd = timeToMinutes(availabilitySettings.breakTime.end);
        if (slotStart < breakEnd && breakStart < slotEnd) return true;
      }
    }

    // Overlaps an existing confirmed booking on the same boat/date
    return busySlots.some((busy) => {
      const busyStart = timeToMinutes(busy.start);
      const busyEnd = timeToMinutes(busy.end);
      return slotStart < busyEnd && busyStart < slotEnd;
    });
  };

  // Date block details helper
  const isDateFullyBlocked = () => {
    if (!date || !availabilitySettings) return false;

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [y, m, d] = date.split("-").map(Number);
    const dayName = dayNames[new Date(y, m - 1, d).getDay()];

    if ((availabilitySettings.unavailableDays || []).includes(dayName)) return true;
    if ((availabilitySettings.maintenanceDates || []).includes(date)) return true;
    return false;
  };

  const handleConfirm = async () => {
    if (isSubmitting) return; // STRICT GUARD: Prevent duplicate submissions
    setIsSubmitting(true);
    
    try {
      const result = await createBooking({
        experience_id: experience.id,
        time_slot_id: timeSlotId || "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9b",
        client_name: clientName || "Client Sans Nom",
        client_phone: clientPhone || "0500000000",
        client_notes: clientNotes || "",
        guest_count: guestCount,
        booking_date: date || new Date().toISOString().split('T')[0],
        booking_time: timeSlot || "10:00",
        total_amount: totalAmount,
        booking_type: experience.type === "shared" ? "shared" : "private",
        duration_minutes: durationMinutes,
      });

      if (result.success) {
        useBookingStore.getState().reset();
        router.push(`/booking/confirmation/${result.booking_ref}`);
      } else {
        alert("Erreur lors de la réservation : " + result.error);
      }
    } catch (err: any) {
      console.error("Booking submission error:", err);
      alert("Erreur de communication : " + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryLabel = 
    experience.type === "private" ? "Bateau Privé" :
    experience.type === "shared" ? "Place Partagée" :
    experience.type === "jetski" ? "Jet Ski" :
    experience.type === "kayak" ? "Kayak" :
    experience.type === "paddle" ? "Paddle" : experience.type;

  const dateBlock = isDateFullyBlocked();

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Stepper bar */}
      <nav className="flex justify-between items-center bg-surface-container rounded-2xl p-4 overflow-x-auto no-scrollbar border border-outline-variant/20">
        <button
          onClick={() => useBookingStore.getState().setStep("DATE_TIME")}
          className={`flex items-center gap-3 px-4 py-2 border-b-2 transition-all whitespace-nowrap ${
            currentStep === "DATE_TIME"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-on-surface-variant"
          }`}
        >
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              currentStep === "DATE_TIME"
                ? "bg-primary text-on-primary"
                : "bg-outline-variant text-on-surface"
            }`}
          >
            1
          </span>
          <span>Date &amp; Horaire</span>
        </button>

        <button
          onClick={() => {
            if (date && timeSlot) useBookingStore.getState().setStep("GUESTS");
          }}
          disabled={!date || !timeSlot}
          className={`flex items-center gap-3 px-4 py-2 border-b-2 transition-all whitespace-nowrap ${
            currentStep === "GUESTS"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-on-surface-variant disabled:opacity-50"
          }`}
        >
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              currentStep === "GUESTS"
                ? "bg-primary text-on-primary"
                : "bg-outline-variant text-on-surface"
            }`}
          >
            2
          </span>
          <span>Voyageurs</span>
        </button>

        <button
          onClick={() => {
            if (date && timeSlot) useBookingStore.getState().setStep("CLIENT_INFO");
          }}
          disabled={!date || !timeSlot}
          className={`flex items-center gap-3 px-4 py-2 border-b-2 transition-all whitespace-nowrap ${
            currentStep === "CLIENT_INFO"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-on-surface-variant disabled:opacity-50"
          }`}
        >
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              currentStep === "CLIENT_INFO"
                ? "bg-primary text-on-primary"
                : "bg-outline-variant text-on-surface"
            }`}
          >
            3
          </span>
          <span>Coordonnées</span>
        </button>
      </nav>

      {/* Stepper Panels */}
      {currentStep === "DATE_TIME" && (
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,54,147,0.05)] border border-outline-variant/30 space-y-8 animate-in fade-in duration-300">
          <h2 className="text-headline-sm font-headline-sm text-on-surface flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-secondary" /> Choisissez le Jour &amp; l'Heure
          </h2>

          {experience.type !== "shared" && (
            <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-outline-variant/10">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Durée de la sortie</label>
              <select
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(Number(e.target.value));
                  setTimeSlot("", ""); // reset slot on duration change
                }}
                className="w-full bg-white border border-outline-variant/40 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
              >
                {experience.type === "jetski" ? (
                  <>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 heure (Recommandé)</option>
                    <option value={120}>2 heures</option>
                    <option value={180}>3 heures</option>
                  </>
                ) : experience.type === "kayak" || experience.type === "paddle" ? (
                  <>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 heure</option>
                    <option value={120}>2 heures</option>
                    <option value={180}>3 heures</option>
                  </>
                ) : (
                  <>
                    <option value={60}>1 heure</option>
                    <option value={120}>2 heures (Standard)</option>
                    <option value={180}>3 heures</option>
                    <option value={240}>4 heures (Demi-journée)</option>
                    <option value={360}>6 heures</option>
                    <option value={480}>8 heures (Journée complète)</option>
                  </>
                )}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Calendar Widget */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-label-md text-label-md text-primary font-bold">{getMonthHeader()}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-surface-container rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-surface-container rounded-full transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center text-label-sm font-label-sm text-on-surface-variant mb-2 font-bold">
                <div>L</div>
                <div>M</div>
                <div>M</div>
                <div>J</div>
                <div>V</div>
                <div>S</div>
                <div>D</div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {/* Dynamically align start of the month using startPaddingCells */}
                {Array.from({ length: startPaddingCells }).map((_, idx) => (
                  <div key={`pad-${idx}`} className="p-2"></div>
                ))}

                {daysInMonth.map((dayNum) => {
                  const formattedMonth = String(viewMonth + 1).padStart(2, "0");
                  const dayStr = String(dayNum).padStart(2, "0");
                  const dateStr = `${viewYear}-${formattedMonth}-${dayStr}`;
                  const isSelected = date === dateStr;
                  const disabled = isDateDisabled(dayNum);
                  
                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        handleDateClick(dayNum);
                        setTimeSlot("", ""); // reset time slot on date change
                      }}
                      className={`p-2 text-center text-label-md font-mono rounded-lg transition-all ${
                        disabled
                          ? "opacity-30 cursor-not-allowed text-outline"
                          : isSelected
                          ? "bg-primary text-on-primary font-bold shadow-lg ring-2 ring-primary ring-offset-2 active:scale-90"
                          : "hover:bg-primary/10 hover:text-primary active:scale-90"
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            <div className="space-y-4">
              <span className="font-label-md text-label-md text-primary block font-bold">Heure de Départ souhaitée</span>
              
              {availLoading ? (
                <div className="flex items-center justify-center py-12 text-on-surface-variant text-xs font-semibold gap-2">
                  <Clock className="h-4 w-4 animate-spin text-primary" /> Chargement...
                </div>
              ) : dateBlock ? (
                <div className="flex items-center gap-2 py-8 px-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  Cette date n&apos;est pas disponible. Merci de choisir un autre jour.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
                    "14:00", "15:00", "16:00", "17:00", "18:00"
                  ].map((time) => {
                    const isSelected = timeSlot === time;
                    const blocked = isSlotBlocked(time);

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={blocked}
                        onClick={() => setTimeSlot(`slot-${time}`, time)}
                        className={`flex items-center justify-center py-3.5 px-2 border rounded-xl transition-all active:scale-[0.98] font-mono text-sm font-bold ${
                          blocked
                            ? "opacity-30 cursor-not-allowed border-outline-variant text-outline line-through"
                            : isSelected
                            ? "border-2 border-primary bg-primary/5 text-primary shadow-sm"
                            : "border-outline-variant hover:border-primary hover:bg-surface-container text-on-surface"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-6">
                <button
                  onClick={nextStep}
                  disabled={!date || !timeSlot || dateBlock || isSlotBlocked(timeSlot)}
                  className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all text-xs uppercase tracking-wider"
                >
                  Continuer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === "GUESTS" && (
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,54,147,0.05)] border border-outline-variant/30 space-y-6 animate-in fade-in duration-300">
          <h2 className="text-headline-sm font-headline-sm text-on-surface flex items-center gap-2">
            <Users className="h-6 w-6 text-secondary" /> Nombre de Voyageurs
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Combien de passagers participent à cette aventure ?
          </p>
          <div className="flex items-center space-x-6 bg-surface-container-low p-4 rounded-xl max-w-xs">
            <button
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              disabled={guestCount <= 1}
              className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-primary font-bold shadow-sm disabled:opacity-50 active:scale-90 transition-all text-xl"
            >
              -
            </button>
            <span className="text-2xl font-bold w-12 text-center">{guestCount}</span>
            <button
              onClick={() => setGuestCount(Math.min(experience.max_guests, guestCount + 1))}
              disabled={guestCount >= experience.max_guests}
              className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-primary font-bold shadow-sm disabled:opacity-50 active:scale-90 transition-all text-xl"
            >
              +
            </button>
          </div>
          <p className="text-label-sm text-on-surface-variant font-medium">
            Capacité limite de l'embarcation/équipement : {experience.max_guests} passagers.
          </p>

          <div className="bg-tertiary-fixed p-4 rounded-xl flex justify-between items-center border border-tertiary-fixed-dim/30 mt-6 max-w-md">
            <span className="text-label-md font-label-md text-on-tertiary-fixed font-bold">Total Estimé ({guestCount} voyageur{guestCount > 1 ? 's' : ''})</span>
            <span className="text-headline-sm font-headline-sm text-tertiary font-bold font-mono">
              {formatPriceDA(totalAmount)}
            </span>
          </div>

          <div className="pt-6 flex justify-between border-t border-outline-variant/20">
            <button
              onClick={prevStep}
              className="px-6 py-2.5 border border-outline-variant text-on-surface-variant font-bold rounded-xl hover:bg-surface-container transition-all text-xs uppercase tracking-wider"
            >
              Retour
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all text-xs uppercase tracking-wider"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {currentStep === "CLIENT_INFO" && (
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,54,147,0.05)] border border-outline-variant/30 space-y-6 animate-in fade-in duration-300">
          <h2 className="text-headline-sm font-headline-sm text-on-surface flex items-center gap-2">
            <Users className="h-6 w-6 text-secondary" /> Vos Coordonnées
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Ces informations permettront au capitaine de valider votre embarquement.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-label-md text-on-surface-variant ml-1 font-bold">
                Nom Complet
              </label>
              <input
                className="bg-surface border border-outline-variant/40 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Ex: Amine B."
                type="text"
                value={clientName}
                onChange={(e) => setClientInfo({ name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-label-md text-on-surface-variant ml-1 font-bold">
                Téléphone (WhatsApp conseillé)
              </label>
              <input
                className="bg-surface border border-outline-variant/40 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Ex: 0550 12 34 56"
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientInfo({ phone: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-label-md font-label-md text-on-surface-variant ml-1 font-bold">
                Demandes particulières (Optionnel)
              </label>
              <textarea
                className="bg-surface border border-outline-variant/40 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Anniversaire, repas spécial, besoins particuliers..."
                rows={4}
                value={clientNotes}
                onChange={(e) => setClientInfo({ notes: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 space-y-3.5 text-sm mt-6">
            <h3 className="font-bold text-primary font-headline-sm text-base mb-1">Détails de la demande</h3>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Activité</span>
              <span className="font-bold">{experience.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Catégorie</span>
              <span className="font-bold">{categoryLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Date &amp; Horaire</span>
              <span className="font-bold">{date} à {timeSlot}</span>
            </div>
            {experience.type !== "shared" && (
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Durée</span>
                <span className="font-bold">{durationMinutes >= 60 ? `${durationMinutes / 60} heures` : `${durationMinutes} minutes`}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Passagers</span>
              <span className="font-bold">{guestCount} voyageurs</span>
            </div>
            <div className="flex justify-between border-t border-outline-variant/20 pt-3.5 font-bold text-primary text-base">
              <span>Total Estimé</span>
              <span className="font-mono">{formatPriceDA(totalAmount)}</span>
            </div>
          </div>

          <div className="pt-6 flex justify-between border-t border-outline-variant/20">
            <button
              onClick={prevStep}
              className="px-6 py-2.5 border border-outline-variant text-on-surface-variant font-bold rounded-xl hover:bg-surface-container transition-all text-xs uppercase tracking-wider"
            >
              Retour
            </button>
            <button
              onClick={handleConfirm}
              disabled={!clientName || !clientPhone || isSubmitting}
              className="px-8 py-3 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all flex items-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-primary/10"
            >
              {isSubmitting ? "Envoi en cours..." : "Confirmer la Réservation"}
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
