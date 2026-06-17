import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";

export default async function PartnerAvailabilityPage() {
  // Mock data for July 2026
  const MOCK_DATES = [
    { day: "Lun", date: "13", hasSlots: true, isBlocked: false },
    { day: "Mar", date: "14", hasSlots: true, isBlocked: false },
    { day: "Mer", date: "15", hasSlots: true, isBlocked: true },
    { day: "Jeu", date: "16", hasSlots: true, isBlocked: false },
    { day: "Ven", date: "17", hasSlots: true, isBlocked: false },
    { day: "Sam", date: "18", hasSlots: true, isBlocked: false, selected: true },
    { day: "Dim", date: "19", hasSlots: true, isBlocked: false },
  ];

  const MOCK_SLOTS_FOR_18 = [
    { time: "09:00", duration: "2h", capacity: 6, booked: 6, status: "full" },
    { time: "11:30", duration: "2h", capacity: 6, booked: 0, status: "available" },
    { time: "14:00", duration: "2h", capacity: 6, booked: 2, status: "partial" },
    { time: "16:30", duration: "2h", capacity: 6, booked: 0, status: "blocked" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-2xl font-bold font-mono text-on-surface">Calendrier & Disponibilités</h1>
        <p className="text-sm text-on-surface-variant mt-1">Ouvrez ou fermez vos créneaux horaires pour recevoir des réservations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Calendar Column */}
        <div className="w-full lg:w-1/3">
          <Card className="border-none custom-shadow bg-surface sticky top-6">
            <CardHeader className="border-b border-surface-variant pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Juillet 2026</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                  <div key={i} className="text-xs font-semibold text-on-surface-variant py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Empty days padding */}
                <div className="p-2"></div>
                <div className="p-2"></div>
                
                {Array.from({ length: 31 }).map((_, i) => {
                  const date = i + 1;
                  const isPast = date < 13;
                  const isToday = date === 13;
                  const isSelected = date === 18;
                  const isBlocked = date === 15 || date === 22;
                  const hasBookings = date === 18 || date === 20;

                  return (
                    <button
                      key={date}
                      disabled={isPast}
                      className={`
                        relative w-full aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all
                        ${isPast ? 'opacity-30 cursor-not-allowed' : 'hover:bg-surface-variant cursor-pointer'}
                        ${isSelected ? 'bg-primary text-white hover:bg-primary' : 'text-on-surface'}
                        ${isToday && !isSelected ? 'border-2 border-primary text-primary font-bold' : ''}
                        ${isBlocked && !isSelected ? 'bg-error-container/50 text-error' : ''}
                      `}
                    >
                      <span>{date}</span>
                      {hasBookings && !isSelected && (
                        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-success"></span>
                      )}
                      {isSelected && hasBookings && (
                        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Schedule Column */}
        <div className="w-full lg:w-2/3">
          <Card className="border-none custom-shadow bg-surface">
            <CardHeader className="border-b border-surface-variant pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Samedi 18 Juillet 2026
                </CardTitle>
              </div>
              <Button variant="outline" className="text-error hover:text-error hover:bg-error-container">
                <Lock className="h-4 w-4 mr-2" /> Bloquer la journée
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-surface-variant">
                {MOCK_SLOTS_FOR_18.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between p-6 hover:bg-surface-container-lowest transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="text-2xl font-mono font-bold text-on-surface w-20">
                        {slot.time}
                      </div>
                      <div>
                        <div className="font-semibold text-on-surface mb-1">
                          Balade Cap Carbon <span className="text-xs text-on-surface-variant ml-2 font-normal">({slot.duration})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {slot.status === "full" && <Badge variant="success">Complet ({slot.booked}/{slot.capacity})</Badge>}
                          {slot.status === "partial" && <Badge variant="warning">{slot.booked}/{slot.capacity} réservés</Badge>}
                          {slot.status === "available" && <Badge variant="secondary">0/{slot.capacity} (Libre)</Badge>}
                          {slot.status === "blocked" && <Badge variant="danger">Créneau bloqué</Badge>}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {slot.status === "blocked" ? (
                        <Button variant="outline" size="sm">
                          <Unlock className="h-3 w-3 mr-2" /> Débloquer
                        </Button>
                      ) : slot.booked > 0 ? (
                        <Button variant="outline" size="sm">
                          Voir réservations
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-error hover:text-error hover:bg-error-container">
                          Fermer créneau
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t border-surface-variant bg-surface-container-lowest text-center">
                <Button variant="ghost" className="text-primary hover:bg-primary-container">
                  + Ajouter un créneau exceptionnel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
