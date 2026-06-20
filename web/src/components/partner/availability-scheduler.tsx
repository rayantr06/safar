"use client";

import { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Unlock, 
  Plus, 
  Clock, 
  Users, 
  Calendar as CalendarIcon, 
  Settings, 
  X, 
  Trash2, 
  Loader2, 
  Check, 
  Info,
  CalendarDays,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPriceDA, formatPhone } from "@/lib/utils/format";
import { 
  createManualBooking, 
  saveBoatAvailability, 
  checkConflict
} from "@/lib/actions/partner-bookings";
import { BoatAvailabilitySettings } from "@/lib/supabase/mock-db-helper";

interface TimelineItem {
  type: "free" | "break" | "booking" | "unavailable" | "maintenance";
  start?: number;
  end?: number;
  label?: string;
  data?: any;
}



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

interface Boat {
  id: string;
  name: string;
  type: "private" | "shared" | "jetski";
  capacity: number;
}

interface AvailabilitySchedulerProps {
  boats: Boat[];
  initialBookings: any[];
  initialAvailability: Record<string, BoatAvailabilitySettings>;
}

export function AvailabilityScheduler({ 
  boats, 
  initialBookings, 
  initialAvailability 
}: AvailabilitySchedulerProps) {
  const [activeBoatId, setActiveBoatId] = useState<string>(boats[0]?.id || "1");
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<any[]>(initialBookings);
  const [availability, setAvailability] = useState<Record<string, BoatAvailabilitySettings>>(initialAvailability);

  // Drawer / Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<BoatAvailabilitySettings>({
    workingHours: { start: "08:00", end: "20:00" },
    breakTime: { start: "13:00", end: "14:00" },
    unavailableDays: [],
    maintenanceDates: []
  });
  const [newMaintenanceDate, setNewMaintenanceDate] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Add reservation form state
  const [addForm, setAddForm] = useState({
    client_name: "",
    client_phone: "",
    booking_date: "",
    booking_time: "",
    duration_hours: 2,
    guest_count: 2,
    total_amount: 10000,
    client_notes: ""
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const activeBoat = useMemo(() => {
    return boats.find(b => b.id === activeBoatId) || boats[0];
  }, [boats, activeBoatId]);

  const activeAvailability = useMemo(() => {
    return availability[activeBoatId] || {
      workingHours: { start: "08:00", end: "20:00" },
      breakTime: { start: "13:00", end: "14:00" },
      unavailableDays: [],
      maintenanceDates: []
    };
  }, [availability, activeBoatId]);

  // Date manipulation helpers
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  };

  const formatDateISO = (d: Date) => {
    return d.toISOString().split("T")[0];
  };

  // Generate week days list (Mon - Sun)
  const weekDays = useMemo(() => {
    const startOfWeek = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + idx);
      const dayNameEn = d.toLocaleDateString("en-US", { weekday: "long" });
      const dayNameFr = d.toLocaleDateString("fr-FR", { weekday: "short" });
      const formatted = formatDateISO(d);
      return {
        date: d,
        dateStr: formatted,
        dayNameEn,
        dayNameFr: dayNameFr.charAt(0).toUpperCase() + dayNameFr.slice(1),
        dayNum: d.getDate(),
        isToday: formatDateISO(new Date()) === formatted
      };
    });
  }, [currentDate]);

  // Generate days in the current month (for grid view)
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Find how many padding days we need from previous month
    // JS getDay(): 0 is Sunday, 1 is Monday...
    let startPadding = firstDay.getDay() - 1;
    if (startPadding < 0) startPadding = 6; // Sunday padding
    
    const days = [];
    
    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        dateStr: formatDateISO(d),
        dayNum: d.getDate(),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const formatted = formatDateISO(d);
      days.push({
        date: d,
        dateStr: formatted,
        dayNum: i,
        isCurrentMonth: true,
        isToday: formatDateISO(new Date()) === formatted
      });
    }
    
    // Next month padding to complete the grid of 42 (6 rows of 7)
    const totalSlots = 42;
    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dateStr: formatDateISO(d),
        dayNum: i,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return days;
  }, [currentDate]);

  // Navigate dates
  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === "daily") {
      nextDate.setDate(currentDate.getDate() - 1);
    } else if (viewMode === "weekly") {
      nextDate.setDate(currentDate.getDate() - 7);
    } else {
      nextDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === "daily") {
      nextDate.setDate(currentDate.getDate() + 1);
    } else if (viewMode === "weekly") {
      nextDate.setDate(currentDate.getDate() + 7);
    } else {
      nextDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(nextDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Open settings drawer
  const handleOpenSettings = () => {
    setSettingsForm({ ...activeAvailability });
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    const res = await saveBoatAvailability(activeBoatId, settingsForm);
    if (res.success) {
      setAvailability(prev => ({
        ...prev,
        [activeBoatId]: settingsForm
      }));
      setIsSettingsOpen(false);
    } else {
      alert("Erreur lors de la sauvegarde: " + res.error);
    }
    setSettingsLoading(false);
  };

  const addMaintenanceDate = () => {
    if (!newMaintenanceDate) return;
    if (settingsForm.maintenanceDates.includes(newMaintenanceDate)) return;
    setSettingsForm(prev => ({
      ...prev,
      maintenanceDates: [...prev.maintenanceDates, newMaintenanceDate].sort()
    }));
    setNewMaintenanceDate("");
  };

  const removeMaintenanceDate = (date: string) => {
    setSettingsForm(prev => ({
      ...prev,
      maintenanceDates: prev.maintenanceDates.filter(d => d !== date)
    }));
  };

  const toggleUnavailableDay = (dayName: string) => {
    setSettingsForm(prev => {
      const current = prev.unavailableDays || [];
      const updated = current.includes(dayName)
        ? current.filter(d => d !== dayName)
        : [...current, dayName];
      return { ...prev, unavailableDays: updated };
    });
  };

  // Open creation modal with preset values
  const handleOpenAddModal = (dateStr: string, timeStr?: string) => {
    setFormError(null);
    setAddForm({
      client_name: "",
      client_phone: "",
      booking_date: dateStr,
      booking_time: timeStr || "09:00",
      duration_hours: 2,
      guest_count: 2,
      total_amount: activeBoat.type === "jetski" ? 8000 : 10000,
      client_notes: ""
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const res = await createManualBooking({
        client_name: addForm.client_name,
        client_phone: addForm.client_phone,
        booking_date: addForm.booking_date,
        booking_time: addForm.booking_time,
        duration_minutes: addForm.duration_hours * 60,
        guest_count: addForm.guest_count,
        boat_id: activeBoatId,
        total_amount: addForm.total_amount * 100, // into cents
        client_notes: addForm.client_notes
      });

      if (res.success) {
        // Fetch bookings updates optimistically (let server component reload page, but add to local state to reflect instantly)
        const newBookingLocal = {
          id: `b-man-${Date.now()}`,
          booking_ref: `#PR-${Math.floor(1000 + Math.random() * 9000)}`,
          client_name: addForm.client_name,
          client_phone: addForm.client_phone,
          booking_date: addForm.booking_date,
          booking_time: addForm.booking_time,
          duration_minutes: addForm.duration_hours * 60,
          guest_count: addForm.guest_count,
          total_amount: addForm.total_amount * 100,
          provider_amount: addForm.total_amount * 100,
          status: "confirmed",
          booking_source: "PARTNER_DIRECT",
          created_by: "PARTNER",
          boat_id: activeBoatId,
          experiences: {
            title: activeBoat.name,
            duration_minutes: addForm.duration_hours * 60,
            max_guests: activeBoat.capacity
          }
        };

        setBookings(prev => [newBookingLocal, ...prev]);
        setIsAddModalOpen(false);
      } else {
        setFormError(res.error || "Une erreur est survenue.");
      }
    } catch (err: any) {
      setFormError(err.message || "Une erreur est survenue.");
    } finally {
      setFormLoading(false);
    }
  };

  // Generate day timelines for display
  const getDayTimelineItems = (dateStr: string): TimelineItem[] => {
    const dayBookings = bookings.filter(b => b.boat_id === activeBoatId && b.booking_date === dateStr);
    const dateObj = new Date(dateStr);
    const dayNameEn = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    // 1. Blocked Day Check
    if (activeAvailability.unavailableDays?.includes(dayNameEn)) {
      return [{ type: "unavailable", label: "Fermé (Jour off)" }];
    }

    // 2. Maintenance Date Check
    if (activeAvailability.maintenanceDates?.includes(dateStr)) {
      return [{ type: "maintenance", label: "Maintenance Navire" }];
    }

    const workStart = timeToMinutes(activeAvailability.workingHours?.start || "08:00");
    const workEnd = timeToMinutes(activeAvailability.workingHours?.end || "20:00");
    const breakStart = timeToMinutes(activeAvailability.breakTime?.start || "13:00");
    const breakEnd = timeToMinutes(activeAvailability.breakTime?.end || "14:00");

    const events: Array<{ start: number; end: number; type: "break" | "booking"; data?: any }> = [];

    // Add break
    if (breakStart < workEnd && breakEnd > workStart) {
      events.push({
        start: Math.max(breakStart, workStart),
        end: Math.min(breakEnd, workEnd),
        type: "break"
      });
    }

    // Add active bookings
    dayBookings.forEach(b => {
      if (b.status === "cancelled") return;
      const bStart = timeToMinutes(b.booking_time || b.start_time || "09:00");
      const bDuration = b.duration_minutes || 120;
      events.push({
        start: bStart,
        end: bStart + bDuration,
        type: "booking",
        data: b
      });
    });

    // Sort chronologically
    events.sort((a, b) => a.start - b.start);

    // Build items with free slots in between
    const timeline: TimelineItem[] = [];
    let currentMins = workStart;

    for (const event of events) {
      if (event.start > currentMins) {
        timeline.push({
          start: currentMins,
          end: event.start,
          type: "free"
        });
      }
      timeline.push({
        start: event.start,
        end: event.end,
        type: event.type,
        data: event.data
      });
      currentMins = Math.max(currentMins, event.end);
    }

    if (currentMins < workEnd) {
      timeline.push({
        start: currentMins,
        end: workEnd,
        type: "free"
      });
    }

    return timeline;
  };


  // Helper to format booking detail display color
  const getBookingColorClasses = (b: any) => {
    if (b.status === "cancelled") {
      return "bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100";
    }
    if (b.booking_source === "PARTNER_DIRECT" || b.booking_source === "PARTNER_MANUAL") {
      return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
    }
    return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"; // Safar DZ booking (Default)
  };

  const getBookingLabel = (b: any) => {
    if (b.status === "cancelled") return "Annulé";
    if (b.booking_source === "PARTNER_DIRECT" || b.booking_source === "PARTNER_MANUAL") return "Partner Direct";
    return "Safar DZ";
  };

  // Date range display title
  const dateRangeTitle = useMemo(() => {
    if (viewMode === "daily") {
      return currentDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
    if (viewMode === "weekly") {
      const first = weekDays[0].date;
      const last = weekDays[6].date;
      if (first.getMonth() === last.getMonth()) {
        return `${first.getDate()} - ${last.getDate()} ${first.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
      }
      return `${first.getDate()} ${first.toLocaleDateString("fr-FR", { month: "short" })} - ${last.getDate()} ${last.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}`;
    }
    return currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }, [viewMode, currentDate, weekDays]);

  return (
    <div className="space-y-6">
      {/* Calendar Header with Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-display-md font-display-md text-primary mb-2">Calendrier d&apos;activité</h2>
          <p className="text-body-md text-on-surface-variant mb-4">Gérez les disponibilités, suivez vos sorties clients et planifiez vos réservations directes.</p>
          
          {/* Active Boat Selection */}
          <div className="flex items-center gap-2 flex-wrap bg-surface-container-high p-1 rounded-xl w-fit">
            {boats.map((boat) => (
              <button
                key={boat.id}
                onClick={() => setActiveBoatId(boat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeBoatId === boat.id
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-bright"
                }`}
              >
                ⛵ {boat.name} ({boat.type === "private" ? "Privé" : "Partagé"})
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* View Mode Selector */}
          <div className="inline-flex bg-surface-container-high p-1 rounded-xl text-xs font-bold">
            <button 
              onClick={() => setViewMode("daily")}
              className={`px-4 py-2 rounded-lg transition-all ${viewMode === "daily" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"}`}
            >
              Jour
            </button>
            <button 
              onClick={() => setViewMode("weekly")}
              className={`px-4 py-2 rounded-lg transition-all ${viewMode === "weekly" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"}`}
            >
              Semaine
            </button>
            <button 
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-2 rounded-lg transition-all ${viewMode === "monthly" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"}`}
            >
              Mois
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button shape="pill" variant="outline" onClick={handleToday} className="text-xs font-bold">
              Aujourd&apos;hui
            </Button>
            <div className="flex items-center border border-outline-variant rounded-full bg-surface">
              <button onClick={handlePrev} className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold px-3 select-none min-w-[120px] text-center capitalize">{dateRangeTitle}</span>
              <button onClick={handleNext} className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <Button 
              shape="pill" 
              variant="outline" 
              onClick={handleOpenSettings}
              className="border-outline-variant font-bold text-xs flex items-center gap-2"
            >
              <Settings className="h-3.5 w-3.5" /> Config. Bateau
            </Button>
          </div>
        </div>
      </div>

      {/* 1. WEEKLY TIMELINE CALENDAR VIEW */}
      {viewMode === "weekly" && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-sm overflow-x-auto">
          <div className="grid grid-cols-7 gap-4 min-w-[900px]">
            {weekDays.map((day) => {
              const timeline = getDayTimelineItems(day.dateStr);

              return (
                <div key={day.dateStr} className={`flex flex-col min-h-[500px] border-r border-outline-variant/10 pr-2 last:border-r-0`}>
                  {/* Header Day */}
                  <div className={`text-center pb-4 mb-4 border-b border-outline-variant/20 relative ${day.isToday ? "bg-primary/5 rounded-2xl py-2" : ""}`}>
                    <p className={`text-[10px] font-bold uppercase ${day.isToday ? "text-primary" : "text-on-surface-variant"}`}>
                      {day.dayNameFr}
                    </p>
                    <p className={`text-2xl font-mono font-bold mt-0.5 ${day.isToday ? "text-primary" : "text-on-surface"}`}>
                      {day.dayNum}
                    </p>
                    {day.isToday && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />}
                  </div>

                  {/* Timeline Blocks */}
                  <div className="space-y-3 flex-1 flex flex-col justify-start">
                    {timeline.map((item, index) => {
                      if (item.type === "unavailable") {
                        return (
                          <div key={index} className="flex-1 bg-surface-container border border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center p-3 text-center text-on-surface-variant opacity-60">
                            <Lock className="h-4 w-4 mb-2 text-on-surface-variant" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                          </div>
                        );
                      }
                      
                      if (item.type === "maintenance") {
                        return (
                          <div key={index} className="flex-1 bg-surface-container border border-dashed border-error/20 rounded-2xl flex flex-col items-center justify-center p-3 text-center text-error">
                            <Lock className="h-4 w-4 mb-2 text-error" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                          </div>
                        );
                      }

                      if (item.type === "break") {
                        return (
                          <div key={index} className="bg-surface-container border border-outline-variant/20 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-on-surface-variant/80 text-[10px] font-bold">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Pause Déjeuner ({minutesToTime(item.start!)} - {minutesToTime(item.end!)})</span>
                          </div>
                        );
                      }

                      if (item.type === "booking") {
                        const bookingData = item.data;
                        const durationHrs = bookingData.duration_minutes ? bookingData.duration_minutes / 60 : 2;
                        
                        return (
                          <div
                            key={bookingData.id}
                            onClick={() => setSelectedBooking(bookingData)}
                            className={`p-3.5 border rounded-2xl shadow-xs transition-all cursor-pointer flex flex-col justify-between min-h-[100px] ${getBookingColorClasses(bookingData)}`}
                          >
                            <div>
                              <div className="flex justify-between items-start text-[9px] font-bold opacity-80 uppercase mb-1">
                                <span>{getBookingLabel(bookingData)}</span>
                                <span>{bookingData.booking_time || bookingData.start_time}</span>
                              </div>
                              <h4 className="font-bold text-xs leading-tight mb-1 line-clamp-2">{bookingData.client_name}</h4>
                            </div>
                            <div className="flex items-center justify-between text-[10px] opacity-80 mt-2">
                              <span className="flex items-center gap-0.5"><Users className="h-3 w-3" /> {bookingData.guest_count} pers.</span>
                              <span className="font-bold">{durationHrs}h</span>
                            </div>
                          </div>
                        );
                      }

                      // Free slot
                      return (
                        <div
                          key={index}
                          onClick={() => handleOpenAddModal(day.dateStr, minutesToTime(item.start!))}
                          className="group border border-dashed border-outline-variant/60 hover:border-primary/50 hover:bg-primary/[0.01] rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all opacity-40 hover:opacity-100 min-h-[80px]"
                        >
                          <Plus className="h-4.5 w-4.5 text-on-surface-variant group-hover:text-primary transition-colors" />
                          <span className="text-[10px] font-mono font-bold text-on-surface-variant group-hover:text-primary transition-colors">
                            {minutesToTime(item.start!)} - {minutesToTime(item.end!)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. DAILY VIEW TIMELINE */}
      {viewMode === "daily" && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-sm max-w-3xl mx-auto">
          <div className="text-center pb-4 border-b border-outline-variant/20 mb-6">
            <h3 className="font-bold text-lg text-primary">{currentDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</h3>
            <span className="text-xs text-on-surface-variant uppercase font-bold">Planning de la journée</span>
          </div>

          <div className="space-y-4">
            {(() => {
              const dateStr = formatDateISO(currentDate);
              const timeline = getDayTimelineItems(dateStr);

              if (timeline.length === 1 && (timeline[0].type === "unavailable" || timeline[0].type === "maintenance")) {
                return (
                  <div className="py-12 text-center text-on-surface-variant flex flex-col items-center gap-3">
                    <Lock className="h-10 w-10 text-outline" />
                    <p className="font-bold text-md">{timeline[0].label}</p>
                    <p className="text-xs">Aucune réservation possible ce jour-là.</p>
                  </div>
                );
              }

              return timeline.map((item, index) => {
                if (item.type === "break") {
                  return (
                    <div key={index} className="bg-surface-container border border-outline-variant/30 p-4 rounded-2xl flex items-center justify-between text-on-surface-variant">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-on-surface-variant" />
                        <div>
                          <p className="font-bold text-sm">Pause équipage</p>
                          <p className="text-xs font-mono">{minutesToTime(item.start!)} à {minutesToTime(item.end!)}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Bloqué</Badge>
                    </div>
                  );
                }

                if (item.type === "booking") {
                  const b = item.data;
                  const durationHrs = b.duration_minutes ? b.duration_minutes / 60 : 2;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className={`p-5 border rounded-3xl shadow-sm transition-all cursor-pointer flex justify-between items-center ${getBookingColorClasses(b)}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70">
                            {getBookingLabel(b)}
                          </span>
                          <span className="font-mono text-xs font-bold">
                            {b.booking_time || b.start_time} - {minutesToTime(timeToMinutes(b.booking_time || b.start_time) + (b.duration_minutes || 120))}
                          </span>
                        </div>
                        <h4 className="font-bold text-base leading-tight">{b.client_name}</h4>
                        <p className="text-xs opacity-80">{b.experiences?.title || activeBoat.name}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right text-xs opacity-90 hidden sm:block">
                          <p className="font-bold">👥 {b.guest_count} Voyageurs</p>
                          <p className="font-mono font-bold mt-0.5">{formatPriceDA(b.total_amount || b.provider_amount)}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 opacity-60" />
                      </div>
                    </div>
                  );
                }

                // Free slot
                return (
                  <div
                    key={index}
                    onClick={() => handleOpenAddModal(dateStr, minutesToTime(item.start!))}
                    className="border border-dashed border-outline-variant hover:border-primary/50 hover:bg-primary/[0.01] rounded-3xl p-5 flex items-center justify-between cursor-pointer transition-all text-on-surface-variant hover:text-primary group"
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="h-5 w-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                      <div>
                        <p className="font-bold text-sm group-hover:text-primary transition-colors">Créneau disponible</p>
                        <p className="font-mono text-xs text-on-surface-variant group-hover:text-primary transition-colors">
                          De {minutesToTime(item.start!)} à {minutesToTime(item.end!)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-primary group-hover:underline">
                      Réserver
                    </Button>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* 3. MONTHLY VIEW GRID */}
      {viewMode === "monthly" && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-sm overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 border-b border-outline-variant/20 pb-3 mb-2 text-center text-xs font-bold text-on-surface-variant">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mer</div>
            <div>Jeu</div>
            <div>Ven</div>
            <div>Sam</div>
            <div>Dim</div>
          </div>

          <div className="grid grid-cols-7 gap-1 border border-outline-variant/10 rounded-2xl overflow-hidden bg-outline-variant/10">
            {monthDays.map((day, idx) => {
              const dayBookings = bookings.filter(b => b.boat_id === activeBoatId && b.booking_date === day.dateStr && b.status !== "cancelled");
              const isBlocked = activeAvailability.unavailableDays?.includes(day.date.toLocaleDateString("en-US", { weekday: "long" })) ||
                               activeAvailability.maintenanceDates?.includes(day.dateStr);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentDate(day.date);
                    setViewMode("daily");
                  }}
                  className={`min-h-[100px] p-2 bg-surface hover:bg-surface-container-low transition-colors cursor-pointer flex flex-col justify-between ${
                    !day.isCurrentMonth ? "opacity-30" : ""
                  } ${day.isToday ? "bg-primary/[0.03]" : ""}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-mono text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                      day.isToday ? "bg-primary text-white" : "text-on-surface"
                    }`}>
                      {day.dayNum}
                    </span>
                    {isBlocked && <Lock className="h-3 w-3 text-on-surface-variant opacity-60" />}
                  </div>

                  <div className="space-y-1 mt-2 flex-1 flex flex-col justify-end">
                    {dayBookings.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(b);
                        }}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate border ${
                          b.status === "cancelled"
                            ? "bg-neutral-100 text-neutral-500 border-neutral-200"
                            : b.booking_source === "PARTNER_DIRECT" || b.booking_source === "PARTNER_MANUAL"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        }`}
                      >
                        {b.booking_time || b.start_time} {b.client_name}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-[9px] text-center font-bold text-primary">
                        + {dayBookings.length - 3} autres
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button for Manual Booking */}
      <div className="fixed bottom-24 right-6 z-50">
        <button
          onClick={() => handleOpenAddModal(formatDateISO(newDate()))}
          className="w-14 h-14 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 group"
          title="Ajouter Réservation Manuelle"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>

      {/* 4. MANUAL RESERVATION ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-surface-container-lowest border border-outline-variant max-w-xl w-full rounded-[2rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh] z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
                ⛵ Créer une Réservation Manuelle
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-surface-container rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-6">
              {formError && (
                <div className="p-4 bg-error-container/20 border border-error/30 text-error rounded-xl text-xs font-bold flex gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nom du Client</label>
                  <Input
                    required
                    type="text"
                    placeholder="Ex: Mourad S."
                    value={addForm.client_name}
                    onChange={(e) => setAddForm({ ...addForm, client_name: e.target.value })}
                    className="bg-surface rounded-xl"
                  />
                </div>

                {/* Customer Phone */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">N° Téléphone</label>
                  <Input
                    required
                    type="tel"
                    placeholder="Ex: 0771 22 33 44"
                    value={addForm.client_phone}
                    onChange={(e) => setAddForm({ ...addForm, client_phone: e.target.value })}
                    className="bg-surface rounded-xl"
                  />
                </div>

                {/* Date */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Date de sortie</label>
                  <Input
                    required
                    type="date"
                    value={addForm.booking_date}
                    onChange={(e) => setAddForm({ ...addForm, booking_date: e.target.value })}
                    className="bg-surface rounded-xl"
                  />
                </div>

                {/* Start Time */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Heure de Départ</label>
                  <Input
                    required
                    type="time"
                    value={addForm.booking_time}
                    onChange={(e) => setAddForm({ ...addForm, booking_time: e.target.value })}
                    className="bg-surface rounded-xl"
                  />
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Durée (Heures)</label>
                  <select
                    value={addForm.duration_hours}
                    onChange={(e) => setAddForm({ ...addForm, duration_hours: Number(e.target.value) })}
                    className="bg-surface border border-outline-variant rounded-xl p-2.5 text-sm"
                  >
                    <option value={1}>1 Heure</option>
                    <option value={2}>2 Heures</option>
                    <option value={3}>3 Heures</option>
                    <option value={4}>4 Heures</option>
                    <option value={6}>6 Heures</option>
                    <option value={8}>8 Heures (Journée)</option>
                  </select>
                </div>

                {/* Guests */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nombre de Personnes</label>
                  <Input
                    required
                    type="number"
                    min={1}
                    max={activeBoat.capacity}
                    value={addForm.guest_count}
                    onChange={(e) => setAddForm({ ...addForm, guest_count: Number(e.target.value) })}
                    className="bg-surface rounded-xl"
                  />
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tarif Reçu (DZD)</label>
                  <Input
                    required
                    type="number"
                    value={addForm.total_amount}
                    onChange={(e) => setAddForm({ ...addForm, total_amount: Number(e.target.value) })}
                    className="bg-surface rounded-xl"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Notes complémentaires</label>
                <textarea
                  placeholder="Note sur le client, exigences spéciales..."
                  value={addForm.client_notes}
                  onChange={(e) => setAddForm({ ...addForm, client_notes: e.target.value })}
                  className="bg-surface border border-outline-variant rounded-xl p-3 text-sm min-h-[80px]"
                />
              </div>

              <div className="pt-6 border-t border-outline-variant/30 flex gap-3">
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-secondary text-white font-bold flex items-center justify-center gap-2"
                  shape="pill"
                >
                  {formLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  <span>Enregistrer la Réservation</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 font-bold"
                  shape="pill"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. BOOKING DETAIL SIDEBAR DRAWER */}
      {selectedBooking && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
            onClick={() => setSelectedBooking(null)}
          />

          <aside className="fixed top-0 right-0 h-screen w-full md:w-[480px] bg-surface-container-lowest z-[70] shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Détails Réservation</h2>
                <span className="text-xs font-mono text-on-surface-variant">Réf: {selectedBooking.booking_ref}</span>
              </div>
              <button className="p-2 hover:bg-surface-variant rounded-full transition-colors" onClick={() => setSelectedBooking(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              <section>
                <h3 className="text-label-sm font-bold text-primary uppercase tracking-widest mb-4">Informations Client</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xl">
                    {selectedBooking.client_name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{selectedBooking.client_name}</p>
                    <p className="text-on-surface-variant text-xs">{(selectedBooking.booking_source === "PARTNER_DIRECT" || selectedBooking.booking_source === "PARTNER_MANUAL") ? "Client Direct" : "Client Safar DZ"}</p>
                  </div>
                </div>
                <div className="p-3 bg-surface-container rounded-lg">
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Téléphone</p>
                  <p className="font-mono text-sm">{formatPhone(selectedBooking.client_phone)}</p>
                </div>
              </section>

              <section>
                <h3 className="text-label-sm font-bold text-primary uppercase tracking-widest mb-4">Détails de la sortie</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-on-surface-variant">Bateau</span>
                    <span className="font-bold">{activeBoat.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-on-surface-variant">Date & Heure</span>
                    <span className="font-mono">{selectedBooking.booking_date} • {selectedBooking.booking_time || selectedBooking.start_time}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-on-surface-variant">Durée</span>
                    <span className="font-bold">{(selectedBooking.duration_minutes || 120) / 60} Heures</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                    <span className="text-on-surface-variant">Passagers</span>
                    <span className="font-bold">{selectedBooking.guest_count} personnes</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-on-surface-variant">Source</span>
                    <Badge variant={(selectedBooking.booking_source === "PARTNER_DIRECT" || selectedBooking.booking_source === "PARTNER_MANUAL") ? "warning" : "default"}>
                      {(selectedBooking.booking_source === "PARTNER_DIRECT" || selectedBooking.booking_source === "PARTNER_MANUAL") ? "Manuel" : "Safar DZ"}
                    </Badge>
                  </div>
                </div>
              </section>

              {selectedBooking.client_notes && (
                <section>
                  <h3 className="text-label-sm font-bold text-primary uppercase tracking-widest mb-2">Notes</h3>
                  <p className="text-body-md text-on-surface-variant bg-surface p-4 rounded-xl border border-outline-variant/30 leading-relaxed">
                    {selectedBooking.client_notes}
                  </p>
                </section>
              )}

              <section className="bg-primary/5 p-5 rounded-xl border border-primary/10">
                <h3 className="text-label-sm font-bold text-primary uppercase tracking-widest mb-4">Revenu</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tarif Client</span>
                    <span className="font-mono">{formatPriceDA(selectedBooking.total_amount)}</span>
                  </div>
                  {!(selectedBooking.booking_source === "PARTNER_DIRECT" || selectedBooking.booking_source === "PARTNER_MANUAL") && (
                    <div className="flex justify-between text-on-surface-variant italic">
                      <span>Commission Safar ({selectedBooking.commission_rate || 15}%)</span>
                      <span className="font-mono">- {formatPriceDA((selectedBooking.total_amount || 0) * ((selectedBooking.commission_rate || 15) / 100))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-4 text-primary border-t border-outline-variant mt-2">
                    <span>Revenu Net</span>
                    <span className="font-mono">
                      {(selectedBooking.booking_source === "PARTNER_DIRECT" || selectedBooking.booking_source === "PARTNER_MANUAL") 
                        ? formatPriceDA(selectedBooking.total_amount) 
                        : formatPriceDA(selectedBooking.provider_amount)}
                    </span>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="p-6 border-t border-outline-variant bg-surface-container-low">
              <Button
                shape="pill"
                variant="outline"
                className="w-full font-bold"
                onClick={() => {
                  const whatsappUrl = `https://wa.me/${selectedBooking.client_phone.replace(/\D/g, "")}`;
                  window.open(whatsappUrl, "_blank");
                }}
              >
                Contacter Client (WhatsApp)
              </Button>
            </div>
          </aside>
        </>
      )}

      {/* 6. BOAT AVAILABILITY CONFIGURATION DRAWER */}
      {isSettingsOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
            onClick={() => setIsSettingsOpen(false)}
          />

          <aside className="fixed top-0 right-0 h-screen w-full md:w-[480px] bg-surface-container-lowest z-[70] shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Configuration de disponibilité</h2>
                <span className="text-xs font-bold text-primary">⛵ {activeBoat.name}</span>
              </div>
              <button className="p-2 hover:bg-surface-variant rounded-full transition-colors" onClick={() => setIsSettingsOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              {/* Working Hours */}
              <section className="space-y-4">
                <h3 className="text-label-sm font-bold text-primary uppercase tracking-widest border-b border-outline-variant/20 pb-2">Heures de travail</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Heure de début</label>
                    <Input
                      type="time"
                      value={settingsForm.workingHours.start}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        workingHours: { ...settingsForm.workingHours, start: e.target.value }
                      })}
                      className="bg-surface rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Heure de fin</label>
                    <Input
                      type="time"
                      value={settingsForm.workingHours.end}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        workingHours: { ...settingsForm.workingHours, end: e.target.value }
                      })}
                      className="bg-surface rounded-xl"
                    />
                  </div>
                </div>
              </section>

              {/* Break Time */}
              <section className="space-y-4">
                <h3 className="text-label-sm font-bold text-primary uppercase tracking-widest border-b border-outline-variant/20 pb-2">Pause de l&apos;équipage</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Début de pause</label>
                    <Input
                      type="time"
                      value={settingsForm.breakTime.start}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        breakTime: { ...settingsForm.breakTime, start: e.target.value }
                      })}
                      className="bg-surface rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Fin de pause</label>
                    <Input
                      type="time"
                      value={settingsForm.breakTime.end}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        breakTime: { ...settingsForm.breakTime, end: e.target.value }
                      })}
                      className="bg-surface rounded-xl"
                    />
                  </div>
                </div>
              </section>

              {/* Closed days */}
              <section className="space-y-4">
                <h3 className="text-label-sm font-bold text-primary uppercase tracking-widest border-b border-outline-variant/20 pb-2">Jours indisponibles</h3>
                <p className="text-xs text-on-surface-variant">Sélectionnez les jours de la semaine de fermeture régulière.</p>
                <div className="grid grid-cols-2 gap-3">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                    const frenchName = {
                      Monday: "Lundi",
                      Tuesday: "Mardi",
                      Wednesday: "Mercredi",
                      Thursday: "Jeudi",
                      Friday: "Vendredi",
                      Saturday: "Samedi",
                      Sunday: "Dimanche"
                    }[day] || day;
                    
                    const isClosed = (settingsForm.unavailableDays || []).includes(day);

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleUnavailableDay(day)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex justify-between items-center ${
                          isClosed
                            ? "bg-error-container/20 border-error text-error"
                            : "bg-surface border-outline-variant/50 text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        <span>{frenchName}</span>
                        {isClosed && <Lock className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Maintenance Dates */}
              <section className="space-y-4">
                <h3 className="text-label-sm font-bold text-primary uppercase tracking-widest border-b border-outline-variant/20 pb-2">Dates de maintenance</h3>
                <p className="text-xs text-on-surface-variant">Bloquez des dates spécifiques pour entretien ou indisponibilité exceptionnelle.</p>
                
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={newMaintenanceDate}
                    onChange={(e) => setNewMaintenanceDate(e.target.value)}
                    className="bg-surface rounded-xl"
                  />
                  <Button
                    type="button"
                    onClick={addMaintenanceDate}
                    className="bg-primary text-white text-xs font-bold px-4 shrink-0"
                    shape="pill"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {settingsForm.maintenanceDates.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic">Aucune date de maintenance planifiée.</p>
                  ) : (
                    settingsForm.maintenanceDates.map((date) => (
                      <div key={date} className="flex justify-between items-center bg-surface p-3 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface font-mono">
                        <span>{new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                        <button
                          type="button"
                          onClick={() => removeMaintenanceDate(date)}
                          className="text-error hover:bg-error-container/20 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
            
            <div className="p-6 border-t border-outline-variant bg-surface-container-low flex gap-3">
              <Button
                type="button"
                disabled={settingsLoading}
                className="flex-1 bg-primary text-white font-bold flex items-center justify-center gap-2"
                onClick={handleSaveSettings}
                shape="pill"
              >
                {settingsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                <span>Enregistrer la Configuration</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 font-bold"
                shape="pill"
              >
                Annuler
              </Button>
            </div>
          </aside>
        </>
      )}

      {/* Legend Footer */}
      <div className="pt-8 border-t border-outline-variant flex flex-wrap gap-8 items-center text-xs text-on-surface-variant font-bold">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-blue-400"></div>
          <span>Réservation Safar DZ (Marketplace)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-green-500 border border-green-400"></div>
          <span>Réservation Propre (Directe)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-neutral-400 border border-neutral-300"></div>
          <span>Annulée / Bloquée / Indisponible</span>
        </div>
      </div>
    </div>
  );
}

// Simple client-side helper to allow using newDate() directly in JSX safely
function newDate() {
  return new Date();
}
