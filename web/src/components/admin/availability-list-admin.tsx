"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Search,
  Ship,
  Compass,
  Calendar as CalendarIcon,
  Clock,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Info,
  User,
  Phone,
  Filter,
  CheckCircle,
  XCircle,
  X,
  HelpCircle,
  MapPin,
  Coins
} from "lucide-react";
import { formatPriceDA, formatPhone } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

interface AvailabilityListAdminProps {
  initialBookings: any[];
  partners: any[];
}

export function AvailabilityListAdmin({ initialBookings, partners }: AvailabilityListAdminProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [currentDate, setCurrentDate] = useState<Date>(new Date("2026-06-18")); // Anchor on current local date from prompt metadata
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  // Filters
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Detail Modal State
  const [activeBookingDetails, setActiveBookingDetails] = useState<any | null>(null);

  // Sync initial bookings
  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  // Date Navigators
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "month") next.setMonth(next.getMonth() - 1);
      else if (viewMode === "week") next.setDate(next.getDate() - 7);
      else next.setDate(next.getDate() - 1);
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "month") next.setMonth(next.getMonth() + 1);
      else if (viewMode === "week") next.setDate(next.getDate() + 7);
      else next.setDate(next.getDate() + 1);
      return next;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date("2026-06-18"));
  };

  // Helper date conversions
  const getYearMonthLabel = () => {
    return currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

  const formatDateString = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    // Partner filter
    if (selectedPartnerId !== "All") {
      if (selectedPartnerId === "unassigned") {
        if (b.provider_id) return false;
      } else if (b.provider_id !== selectedPartnerId) {
        return false;
      }
    }

    // Status filter
    if (selectedStatus !== "All" && b.status !== selectedStatus.toLowerCase()) {
      return false;
    }

    // Search query filter (client, ref, partner name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const refMatches = b.booking_ref?.toLowerCase().includes(query) || b.ref?.toLowerCase().includes(query) || b.id?.toLowerCase().includes(query);
      const clientMatches = b.client_name?.toLowerCase().includes(query);
      const partnerMatches = b.partner?.toLowerCase().includes(query) || (b.provider_id && partners.find(p => p.id === b.provider_id)?.name?.toLowerCase().includes(query));
      const expMatches = b.experiences?.title?.toLowerCase().includes(query) || b.title?.toLowerCase().includes(query);

      if (!refMatches && !clientMatches && !partnerMatches && !expMatches) {
        return false;
      }
    }

    return true;
  });

  // Calculate stats dynamically for cards
  const stats = {
    totalBookings: filteredBookings.length,
    confirmedCount: filteredBookings.filter(b => b.status === "confirmed").length,
    pendingCount: filteredBookings.filter(b => b.status === "pending" || b.status === "new").length,
    cancelledCount: filteredBookings.filter(b => b.status === "cancelled").length
  };

  // Get days in current month grid
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Determine starting empty spaces (Monday is index 0 in fr-FR)
    // getDay() returns 0 for Sunday, 1 for Monday...
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6; // Sunday

    const days: (Date | null)[] = Array(startOffset).fill(null);

    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Get week date list (Monday to Sunday)
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  // Styling helper for status badges
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/10 text-success border border-success/20";
      case "pending":
      case "new":
        return "bg-warning/10 text-warning border border-warning/20";
      case "completed":
        return "bg-info/10 text-info border border-info/20";
      case "cancelled":
        return "bg-danger/10 text-danger border border-danger/20";
      default:
        return "bg-surface-container text-on-surface-variant";
    }
  };

  // Render cells for Month View
  const renderMonthGrid = () => {
    const days = getDaysInMonth();

    return (
      <div className="grid grid-cols-7 gap-px bg-outline-variant/30 rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm bg-white">
        {/* Days Header */}
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((dayName) => (
          <div key={dayName} className="p-3 bg-surface-container-low text-center font-bold text-[10px] uppercase text-on-surface-variant tracking-wider border-b border-outline-variant/20">
            {dayName}
          </div>
        ))}

        {/* Days Cells */}
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="bg-surface-container-lowest/40 h-32 p-2" />;
          }

          const dateStr = formatDateString(date);
          const dayBookings = filteredBookings.filter((b) => b.booking_date === dateStr);
          const isToday = dateStr === "2026-06-18";

          return (
            <div
              key={dateStr}
              className={`bg-white h-36 p-2 flex flex-col justify-between hover:bg-surface-container-low/20 transition-colors ${
                isToday ? "ring-2 ring-primary ring-inset" : ""
              }`}
            >
              {/* Day Number */}
              <div className="flex justify-between items-center mb-1">
                <span
                  className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-md ${
                    isToday ? "bg-primary text-white" : "text-on-surface-variant"
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayBookings.length > 0 && (
                  <span className="text-[9px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded-full">
                    {dayBookings.length} rsv
                  </span>
                )}
              </div>

              {/* Day Bookings List */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 mt-1">
                {dayBookings.map((b) => {
                  const isSafar = b.booking_source === "SAFAR_DZ";
                  const pName = b.provider_id ? (partners.find(p => p.id === b.provider_id)?.name || b.partner || "Partenaire") : "Non assigné";
                  
                  return (
                    <div
                      key={b.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveBookingDetails(b);
                      }}
                      className={`p-1.5 rounded-lg text-[9px] font-semibold flex flex-col gap-0.5 cursor-pointer hover:scale-[1.02] transition-transform select-none ${
                        isSafar
                          ? "bg-blue-500/10 text-blue-800 border border-blue-500/20"
                          : "bg-green-500/10 text-green-800 border border-green-500/20"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold truncate shrink-0 max-w-[50px]">{b.booking_ref || b.ref || `#SF-${b.id.slice(0,4)}`}</span>
                        <span className="text-[8px] font-mono shrink-0">{b.booking_time || b.start_time}</span>
                      </div>
                      <span className="truncate opacity-90">{b.experiences?.title || b.title || "Balade"}</span>
                      <span className="truncate text-[8px] opacity-80 uppercase tracking-tighter">
                        ⚓ {pName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const days = getWeekDays();

    return (
      <div className="grid grid-cols-7 gap-4">
        {days.map((date) => {
          const dateStr = formatDateString(date);
          const dayBookings = filteredBookings.filter((b) => b.booking_date === dateStr);
          const isToday = dateStr === "2026-06-18";
          const dayLabel = date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

          return (
            <div key={dateStr} className="flex flex-col h-[600px] bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
              {/* Day Header */}
              <div className={`p-4 border-b border-outline-variant/10 text-center flex flex-col justify-center items-center ${
                isToday ? "bg-primary/5" : "bg-surface-container-lowest"
              }`}>
                <p className={`text-xs font-bold capitalize ${isToday ? "text-primary font-headline-sm" : "text-on-surface"}`}>{dayLabel}</p>
                <span className="text-[10px] text-on-surface-variant mt-0.5 font-bold">{dayBookings.length} Réservation(s)</span>
              </div>

              {/* Day Content */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-surface-container-low/20">
                {dayBookings.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="text-[10px] text-on-surface-variant/60 font-medium">Aucun départ</p>
                  </div>
                ) : (
                  dayBookings.map((b) => {
                    const isSafar = b.booking_source === "SAFAR_DZ";
                    const pName = b.provider_id ? (partners.find(p => p.id === b.provider_id)?.name || b.partner || "Partenaire") : "Non assigné";

                    return (
                      <div
                        key={b.id}
                        onClick={() => setActiveBookingDetails(b)}
                        className={`p-3 rounded-xl shadow-xs border transition-all cursor-pointer hover:shadow-md ${
                          isSafar
                            ? "bg-blue-500/[0.03] hover:bg-blue-500/[0.06] border-blue-500/20 text-blue-900"
                            : "bg-green-500/[0.03] hover:bg-green-500/[0.06] border-green-500/20 text-green-900"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="font-mono font-bold text-[10px]">{b.booking_ref || b.ref || `#SF-${b.id.slice(0,4)}`}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                            isSafar ? "bg-blue-500/10 text-blue-600" : "bg-green-500/10 text-green-600"
                          }`}>
                            {isSafar ? "Safar Client" : "Direct"}
                          </span>
                        </div>

                        <p className="text-[11px] font-bold truncate">{b.experiences?.title || b.title || "Expérience"}</p>
                        
                        <div className="mt-2 space-y-1 text-[9px] text-on-surface-variant font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{b.booking_time || b.start_time} • {b.duration_minutes || 120} min</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate">{b.client_name} ({b.guest_count} pers)</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-primary">
                            <Ship className="h-3 w-3 shrink-0" />
                            <span className="truncate">{pName}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Day View
  const renderDayView = () => {
    const dateStr = formatDateString(currentDate);
    const dayBookings = filteredBookings.filter((b) => b.booking_date === dateStr);
    const formattedDate = currentDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    return (
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        {/* Timeline Header */}
        <div className="p-5 border-b border-outline-variant/10 bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-headline-sm text-lg capitalize text-primary">{formattedDate}</h3>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">Planning général des activités</p>
          </div>
          <Badge variant="outline" className="font-bold font-mono">
            {dayBookings.length} départ(s)
          </Badge>
        </div>

        {/* Timeline Content */}
        <div className="p-6 space-y-6">
          {dayBookings.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant">
              <Compass className="h-10 w-10 text-on-surface-variant/40 mx-auto mb-3 animate-bounce" />
              <p className="text-xs font-bold">Aucune réservation pour cette journée</p>
              <p className="text-[11px] text-on-surface-variant/60 mt-1">Utilisez le filtre de recherche ou naviguez vers un autre jour.</p>
            </div>
          ) : (
            <div className="relative border-l border-outline-variant/40 pl-6 ml-4 space-y-8">
              {dayBookings.map((b) => {
                const isSafar = b.booking_source === "SAFAR_DZ";
                const pName = b.provider_id ? (partners.find(p => p.id === b.provider_id)?.name || b.partner || "Partenaire") : "Non assigné";

                return (
                  <div key={b.id} className="relative">
                    {/* Time dot on timeline line */}
                    <span className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white ring-2 ring-inset ${
                      isSafar ? "bg-blue-500 ring-blue-500" : "bg-green-500 ring-green-500"
                    }`} />

                    {/* Booking Card */}
                    <div
                      onClick={() => setActiveBookingDetails(b)}
                      className={`p-4 rounded-2xl shadow-xs border transition-all cursor-pointer hover:scale-[1.01] hover:shadow-md ${
                        isSafar
                          ? "bg-blue-500/[0.02] border-blue-500/20 text-blue-900"
                          : "bg-green-500/[0.02] border-green-500/20 text-green-900"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-xs text-primary">{b.booking_time || b.start_time}</span>
                          <span className="text-[10px] text-on-surface-variant font-bold">({b.duration_minutes || 120} min)</span>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            isSafar ? "bg-blue-500/10 text-blue-600" : "bg-green-500/10 text-green-600"
                          }`}>
                            {isSafar ? "Safar Client" : "Partner Direct"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${getStatusStyle(b.status)}`}>
                            {b.status}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-sm font-headline-sm">{b.experiences?.title || b.title || "Balade en mer"}</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3.5 text-xs text-on-surface-variant font-medium pt-3.5 border-t border-outline-variant/10">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-on-surface-variant/70 leading-none mb-0.5">Client</p>
                            <span className="font-semibold text-on-surface">{b.client_name} ({b.guest_count} pers)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-on-surface-variant/70 leading-none mb-0.5">Téléphone</p>
                            <span className="font-mono font-semibold text-on-surface">{formatPhone(b.client_phone)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ship className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-on-surface-variant/70 leading-none mb-0.5">Partenaire Assigné</p>
                            <span className="font-semibold text-primary">{pName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-on-surface">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary">Gestion du Planning Général</h1>
          <p className="text-body-lg text-on-surface-variant">Centralisez et filtrez l'ensemble des réservations et des capitaines.</p>
        </div>
        
        {/* Day / Week / Month tab selector */}
        <div className="bg-surface-container-low p-1 rounded-xl flex items-center shadow-inner border border-outline-variant/15">
          <button
            onClick={() => setViewMode("month")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === "month" ? "bg-white text-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Mois
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === "week" ? "bg-white text-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setViewMode("day")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === "day" ? "bg-white text-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Jour
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 bg-primary-container/20 text-primary rounded-xl flex items-center justify-center shrink-0">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Réservations affichées</p>
            <p className="font-mono font-bold text-headline-sm text-on-surface leading-none mt-1">
              {stats.totalBookings}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 bg-success-container/20 text-success rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Confirmées</p>
            <p className="font-mono font-bold text-headline-sm text-success leading-none mt-1">
              {stats.confirmedCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 bg-warning-container/20 text-warning rounded-xl flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">En attente</p>
            <p className="font-mono font-bold text-headline-sm text-warning leading-none mt-1">
              {stats.pendingCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 bg-error-container/20 text-error rounded-xl flex items-center justify-center shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Annulées</p>
            <p className="font-mono font-bold text-headline-sm text-error leading-none mt-1">
              {stats.cancelledCount}
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Filter panel & Date Navigator */}
      <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 border border-outline-variant/50 hover:bg-surface-container rounded-xl transition-all"
            title="Précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 border border-outline-variant/50 hover:bg-surface-container rounded-xl font-bold text-xs transition-all"
          >
            Aujourd'hui
          </button>
          <button
            onClick={handleNext}
            className="p-2 border border-outline-variant/50 hover:bg-surface-container rounded-xl transition-all"
            title="Suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="font-headline-sm text-sm capitalize text-primary font-bold ml-2">
            {viewMode === "month" && getYearMonthLabel()}
            {viewMode === "week" && `Semaine du ${getWeekDays()[0].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`}
            {viewMode === "day" && currentDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Partner Selector */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs py-2 px-3 focus:outline-none font-bold"
            >
              <option value="All">Tous les partenaires</option>
              <option value="unassigned">Non assigné ⚠️</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs py-2 px-3 focus:outline-none font-bold"
          >
            <option value="All">Tous les statuts</option>
            <option value="Pending">En attente</option>
            <option value="Confirmed">Confirmé</option>
            <option value="Completed">Terminé</option>
            <option value="Cancelled">Annulé</option>
          </select>

          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 xl:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Legend Card */}
      <div className="bg-surface-container-low/30 p-3 rounded-2xl border border-outline-variant/15 flex flex-wrap items-center gap-6 justify-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-blue-500/20 border border-blue-500/30" />
          <span>Safar DZ Client (Marketplace)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-green-500/20 border border-green-500/30" />
          <span>Partner Direct (Manuel)</span>
        </div>
        <div className="w-px h-4 bg-outline-variant/40 hidden sm:block" />
        <p className="text-primary italic">Cliquez sur une réservation pour inspecter les détails administratifs.</p>
      </div>

      {/* Calendar Grid Container */}
      <div className="animate-in fade-in duration-300">
        {viewMode === "month" && renderMonthGrid()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "day" && renderDayView()}
      </div>

      {/* Booking Details Modal Popup */}
      {activeBookingDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl border border-outline-variant overflow-hidden animate-in zoom-in duration-200 text-on-surface">
            {/* Modal Header */}
            <div className="p-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/20">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary font-mono">
                  {activeBookingDetails.booking_ref || activeBookingDetails.ref || `#SF-${activeBookingDetails.id.slice(0, 4)}`}
                </span>
                <h3 className="font-display-lg text-md font-bold text-on-surface mt-0.5">Fiche Réservation Admin</h3>
              </div>
              <button
                onClick={() => setActiveBookingDetails(null)}
                className="p-1.5 hover:bg-surface-container-low rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Customer */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container/30 text-primary flex items-center justify-center font-bold text-xs uppercase">
                  {activeBookingDetails.client_name?.substring(0, 2).toUpperCase() || "CL"}
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight text-on-surface">{activeBookingDetails.client_name}</p>
                  <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">{formatPhone(activeBookingDetails.client_phone)}</p>
                </div>
              </div>

              {/* Trip details */}
              <div className="bg-surface-container p-4 rounded-xl space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Activité</span>
                  <span className="font-bold text-on-surface">
                    {activeBookingDetails.experiences?.title || activeBookingDetails.title || "Sortie privée en bateau"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Date de départ</span>
                  <span className="font-mono font-bold text-on-surface">{activeBookingDetails.booking_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Créneau horaire</span>
                  <span className="font-mono font-bold text-on-surface">
                    {activeBookingDetails.booking_time || activeBookingDetails.start_time} ({activeBookingDetails.duration_minutes || 120} min)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Nombre de convives</span>
                  <span className="font-bold text-on-surface">{activeBookingDetails.guest_count} personnes</span>
                </div>
                <div className="flex justify-between border-t border-outline-variant/20 pt-2 font-bold">
                  <span className="text-on-surface-variant">Source</span>
                  <span className={activeBookingDetails.booking_source === "SAFAR_DZ" ? "text-blue-600" : "text-green-600"}>
                    {activeBookingDetails.booking_source === "SAFAR_DZ" ? "Safar DZ Client" : "Partner Direct"}
                  </span>
                </div>
              </div>

              {/* Partner */}
              <div className="p-4 bg-primary/[0.02] border border-primary/10 rounded-xl text-xs space-y-2">
                <p className="text-[9px] uppercase font-bold tracking-wider text-on-surface-variant/80">Partenaire Assigné</p>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-primary">
                    {activeBookingDetails.provider_id
                      ? partners.find((p) => p.id === activeBookingDetails.provider_id)?.name || activeBookingDetails.partner || "Partenaire"
                      : "Non assigné"}
                  </span>
                  {activeBookingDetails.provider_id && (
                    <span className="text-[10px] text-on-surface-variant/80 font-normal">
                      Commission : {partners.find(p => p.id === activeBookingDetails.provider_id)?.commission_rate || 15}%
                    </span>
                  )}
                </div>
              </div>

              {/* Financial calculations */}
              <div className="p-4 bg-surface-container rounded-xl text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Total payé</span>
                  <span className="font-mono font-bold">{formatPriceDA(activeBookingDetails.total_amount)}</span>
                </div>

                {activeBookingDetails.booking_source === "SAFAR_DZ" ? (
                  <>
                    <div className="flex justify-between text-error font-medium">
                      <span>Commission Safar ({activeBookingDetails.commission_rate || 15}%)</span>
                      <span className="font-mono">
                        -{formatPriceDA(activeBookingDetails.commission_amount || (activeBookingDetails.total_amount * (activeBookingDetails.commission_rate || 15) / 100))}
                      </span>
                    </div>
                    <div className="flex justify-between text-success font-bold pt-2 border-t border-outline-variant/20">
                      <span>Règlement Partenaire</span>
                      <span className="font-mono">
                        {formatPriceDA(
                          activeBookingDetails.provider_amount ||
                          (activeBookingDetails.total_amount - (activeBookingDetails.total_amount * (activeBookingDetails.commission_rate || 15) / 100))
                        )}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-success font-medium">
                      <span>Commission Directe</span>
                      <span className="font-mono">0 DA (0%)</span>
                    </div>
                    <div className="flex justify-between text-success font-bold pt-2 border-t border-outline-variant/20">
                      <span>Règlement Partenaire (100%)</span>
                      <span className="font-mono">{formatPriceDA(activeBookingDetails.total_amount)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-surface-container-low border-t border-outline-variant/10 flex justify-end">
              <button
                onClick={() => setActiveBookingDetails(null)}
                className="px-6 py-2 bg-primary text-white hover:bg-primary/95 text-xs font-bold rounded-xl"
              >
                Fermer la fiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
