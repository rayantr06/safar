"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Users, Phone, X, Check, Loader2, Info, Plus, Save, Clock, HelpCircle } from "lucide-react";
import { formatPriceDA, formatPhone } from "@/lib/utils/format";
import { updateBookingStatus, createManualBooking } from "@/lib/actions/partner-bookings";

interface BookingsListProps {
  initialBookings: any[];
}

export function BookingsList({ initialBookings }: BookingsListProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "SAFAR_DZ" | "PARTNER_DIRECT" | "PARTNER_MANUAL">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    client_name: "",
    client_phone: "",
    booking_date: new Date().toISOString().split("T")[0],
    booking_time: "09:00",
    duration_hours: 2,
    guest_count: 2,
    boat_id: "1",
    total_amount: 15000,
    client_notes: ""
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    setActionLoading(bookingId);
    const res = await updateBookingStatus(bookingId, status);
    if (res.success) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev: any) => ({ ...prev, status }));
      }
    } else {
      alert("Erreur lors de la mise à jour : " + res.error);
    }
    setActionLoading(null);
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
        boat_id: addForm.boat_id,
        total_amount: addForm.total_amount * 100, // to cents
        client_notes: addForm.client_notes
      });

      if (res.success) {
        // Optimistic refresh by adding locally (or let it reload)
        const mockNew = {
          id: `b-manual-opt-${Date.now()}`,
          booking_ref: `#SF-M${Math.floor(1000 + Math.random() * 9000)}`,
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
          boat_id: addForm.boat_id,
          experiences: {
            title: addForm.boat_id === "2" ? "Sortie Pêche - Les Falaises" : "Balade privée Cap Carbon & Aiguades",
            duration_minutes: addForm.duration_hours * 60,
            max_guests: 12
          }
        };
        setBookings((prev) => [mockNew, ...prev]);
        setIsAddModalOpen(false);
        // Reset form
        setAddForm({
          client_name: "",
          client_phone: "",
          booking_date: new Date().toISOString().split("T")[0],
          booking_time: "09:00",
          duration_hours: 2,
          guest_count: 2,
          boat_id: "1",
          total_amount: 15000,
          client_notes: ""
        });
      } else {
        setFormError(res.error || "Une erreur est survenue.");
      }
    } catch (err: any) {
      setFormError(err.message || "Une erreur est survenue.");
    } finally {
      setFormLoading(false);
    }
  };

  // Helper filters
  const filteredBookings = bookings.filter((booking) => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      booking.client_name?.toLowerCase().includes(query) ||
      booking.booking_ref?.toLowerCase().includes(query) ||
      booking.client_phone?.toLowerCase().includes(query) ||
      booking.experiences?.title?.toLowerCase().includes(query);

    // 2. Source Filter
    const matchesSource =
      sourceFilter === "all" ||
      booking.booking_source === sourceFilter ||
      (sourceFilter === "SAFAR_DZ" && !booking.booking_source); // Default is Safar DZ

    // 3. Status Filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && (booking.status === "pending" || booking.status === "new")) ||
      booking.status === statusFilter;

    // 4. Date Filter
    const todayStr = new Date().toISOString().split("T")[0];
    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = booking.booking_date === todayStr;
    } else if (dateFilter === "week") {
      const bDate = new Date(booking.booking_date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - bDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      matchesDate = diffDays <= 7;
    } else if (dateFilter === "month") {
      const bDate = new Date(booking.booking_date);
      const now = new Date();
      matchesDate = bDate.getMonth() === now.getMonth() && bDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesSource && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success">Confirmé</Badge>;
      case "new":
      case "pending":
        return <Badge variant="warning">En attente</Badge>;
      case "completed":
        return <Badge variant="info">Terminé</Badge>;
      case "cancelled":
        return <Badge variant="danger">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with main Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary mb-2">Opérations &amp; Réservations</h2>
          <p className="text-body-lg text-on-surface-variant">Suivez et organisez toutes vos expéditions maritimes, qu&apos;elles proviennent de Safar DZ ou de votre clientèle directe.</p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-secondary text-white font-bold flex items-center gap-2 hover:opacity-95 shadow-md shadow-secondary/15"
          shape="pill"
        >
          <Plus className="h-5 w-5" /> Ajouter Réservation
        </Button>
      </div>

      {/* Filters Bar Bento Grid */}
      <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <Input
            placeholder="Nom, Réf, Téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-outline-variant bg-surface"
          />
        </div>

        {/* Source Filter */}
        <div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="w-full bg-surface border border-outline-variant rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer"
          >
            <option value="all">Toutes les sources</option>
            <option value="SAFAR_DZ">Safar DZ Booking</option>
            <option value="PARTNER_DIRECT">Partner Direct</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-surface border border-outline-variant rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente / Nouveau</option>
            <option value="confirmed">Confirmé</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="w-full bg-surface border border-outline-variant rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd&apos;hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois-ci</option>
          </select>
        </div>
      </div>

      {/* Booking Grid list */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
          Aucune réservation trouvée avec ces critères.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => {
            const isManual = booking.booking_source === "PARTNER_DIRECT" || booking.booking_source === "PARTNER_MANUAL";
            const isPending = booking.status === "pending" || booking.status === "new";
            const isConfirmed = booking.status === "confirmed";
            const isLoading = actionLoading === booking.id;

            return (
              <div
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className={`bg-surface-container-lowest border rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                  isManual 
                    ? "border-green-200 hover:border-green-400 bg-green-50/5"
                    : "border-outline-variant/35 hover:border-primary/40"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-label-md text-on-surface text-lg font-bold">
                        {booking.client_name}
                      </h3>
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isManual 
                          ? "bg-orange-100 text-orange-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {isManual ? "Manual Booking" : "Safar DZ Booking"}
                      </span>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-on-surface-variant">
                      <span className="text-primary-container text-lg">⛵</span>
                      <span className="font-label-md text-sm">
                        {booking.experiences?.title || "Expédition Marine"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-on-surface-variant">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-mono text-xs">
                        {booking.booking_date} • {booking.booking_time || booking.start_time}
                        {booking.duration_minutes && ` (${booking.duration_minutes / 60}h)`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-on-surface-variant">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-label-md text-sm">
                        {booking.guest_count} Voyageur{booking.guest_count > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-outline-variant/10 pt-4" onClick={(e) => e.stopPropagation()}>
                  <div className="font-mono font-bold text-primary text-sm">
                    {formatPriceDA(booking.total_amount || booking.provider_amount)}
                  </div>
                  <div className="flex gap-2">
                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          className="bg-primary text-white text-xs font-bold"
                          onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Accepter"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-error text-error text-xs font-bold hover:bg-error-container/20"
                          onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                          disabled={isLoading}
                        >
                          Refuser
                        </Button>
                      </>
                    )}
                    {isConfirmed && (
                      <Button
                        size="sm"
                        className="bg-secondary text-white text-xs font-bold"
                        onClick={() => handleStatusUpdate(booking.id, "completed")}
                        disabled={isLoading}
                      >
                        Terminer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Booking Add Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-surface-container-lowest border border-outline-variant max-w-xl w-full rounded-[2rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh] z-10 flex flex-col justify-between">
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
                    max={20}
                    value={addForm.guest_count}
                    onChange={(e) => setAddForm({ ...addForm, guest_count: Number(e.target.value) })}
                    className="bg-surface rounded-xl"
                  />
                </div>

                {/* Boat selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Bateau</label>
                  <select
                    value={addForm.boat_id}
                    onChange={(e) => setAddForm({ ...addForm, boat_id: e.target.value })}
                    className="bg-surface border border-outline-variant rounded-xl p-2.5 text-sm"
                  >
                    <option value="1">Sirène de Béjaïa</option>
                    <option value="2">Le Pêcheur II</option>
                  </select>
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
                  {formLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
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

      {/* Side Drawer details */}
      {selectedBooking && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
            onClick={() => setSelectedBooking(null)}
          />

          <aside className="fixed top-0 right-0 h-screen w-full md:w-[480px] bg-surface-container-lowest z-[70] shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Détails Réservation
                </h2>
                <span className="text-xs font-mono text-on-surface-variant">
                  Réf: {selectedBooking.booking_ref}
                </span>
              </div>
              <button
                className="p-2 hover:bg-surface-variant rounded-full transition-colors"
                onClick={() => setSelectedBooking(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              <section>
                <h3 className="text-label-sm font-bold text-primary uppercase tracking-widest mb-4">
                  Informations Client
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-2xl">
                    {selectedBooking.client_name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-headline-sm text-xl">{selectedBooking.client_name}</p>
                    <p className="text-on-surface-variant text-sm">
                      {(selectedBooking.booking_source === "PARTNER_DIRECT" || selectedBooking.booking_source === "PARTNER_MANUAL") ? "Client Direct" : "Client Safar DZ"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-surface-container rounded-lg">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Téléphone</p>
                    <p className="font-mono text-sm">{formatPhone(selectedBooking.client_phone)}</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-label-sm font-bold text-primary uppercase tracking-widest mb-4">
                  Détails de la sortie
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/50">
                    <span className="text-on-surface-variant text-sm">Bateau</span>
                    <span className="font-bold text-sm">
                      {selectedBooking.boat_id === "2" ? "Le Pêcheur II" : "Sirène de Béjaïa"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/50">
                    <span className="text-on-surface-variant text-sm">Date & Heure</span>
                    <span className="font-mono text-sm">
                      {selectedBooking.booking_date} • {selectedBooking.booking_time || selectedBooking.start_time}
                    </span>
                  </div>
                  {selectedBooking.duration_minutes && (
                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/50">
                      <span className="text-on-surface-variant text-sm">Durée</span>
                      <span className="font-bold text-sm">{selectedBooking.duration_minutes / 60} Heures</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/50">
                    <span className="text-on-surface-variant text-sm">Passagers</span>
                    <span className="font-bold text-sm">{selectedBooking.guest_count} personnes</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-on-surface-variant text-sm">Source</span>
                    <Badge variant={(selectedBooking.booking_source === "PARTNER_DIRECT" || selectedBooking.booking_source === "PARTNER_MANUAL") ? "success" : "default"}>
                      {(selectedBooking.booking_source === "PARTNER_DIRECT" || selectedBooking.booking_source === "PARTNER_MANUAL") ? "Direct" : "Safar DZ"}
                    </Badge>
                  </div>
                </div>
              </section>

              {selectedBooking.client_notes && (
                <section>
                  <h3 className="text-label-sm font-bold text-primary uppercase tracking-widest mb-2">
                    Notes
                  </h3>
                  <p className="text-body-md text-on-surface-variant bg-surface p-4 rounded-xl border border-outline-variant/30 leading-relaxed">
                    {selectedBooking.client_notes}
                  </p>
                </section>
              )}

              <section className="bg-primary/5 p-5 rounded-xl border border-primary/10">
                <h3 className="text-label-sm font-bold text-primary uppercase tracking-widest mb-4">
                  Détails Financiers
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Montant Client</span>
                    <span className="font-mono">{formatPriceDA(selectedBooking.total_amount || selectedBooking.provider_amount)}</span>
                  </div>
                  {!(selectedBooking.booking_source === "PARTNER_DIRECT" || selectedBooking.booking_source === "PARTNER_MANUAL") && (
                    <div className="flex justify-between text-on-surface-variant italic">
                      <span>Commission Safar ({selectedBooking.commission_rate || 15}%)</span>
                      <span className="font-mono">- {formatPriceDA((selectedBooking.total_amount || 0) * ((selectedBooking.commission_rate || 15) / 100))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-4 text-primary border-t border-outline-variant mt-2">
                    <span>Revenu Partenaire</span>
                    <span className="font-mono">
                      {(selectedBooking.booking_source === "PARTNER_DIRECT" || selectedBooking.booking_source === "PARTNER_MANUAL") 
                        ? formatPriceDA(selectedBooking.total_amount) 
                        : formatPriceDA(selectedBooking.provider_amount)}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-outline-variant bg-surface-container-low grid grid-cols-2 gap-4">
              {(selectedBooking.status === "pending" || selectedBooking.status === "new") && (
                <>
                  <Button
                    shape="pill"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                    onClick={() => handleStatusUpdate(selectedBooking.id, "confirmed")}
                    disabled={actionLoading === selectedBooking.id}
                  >
                    Accepter
                  </Button>
                  <Button
                    shape="pill"
                    variant="outline"
                    className="w-full border-error text-error hover:bg-error-container/20 font-bold"
                    onClick={() => handleStatusUpdate(selectedBooking.id, "cancelled")}
                    disabled={actionLoading === selectedBooking.id}
                  >
                    Refuser
                  </Button>
                </>
              )}

              {selectedBooking.status === "confirmed" && (
                <Button
                  shape="pill"
                  className="col-span-2 w-full bg-secondary text-white hover:bg-secondary/90 font-bold"
                  onClick={() => handleStatusUpdate(selectedBooking.id, "completed")}
                  disabled={actionLoading === selectedBooking.id}
                >
                  Marquer Terminé
                </Button>
              )}

              <Button
                shape="pill"
                variant="outline"
                className="col-span-2 w-full mt-2 font-bold"
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
    </div>
  );
}
