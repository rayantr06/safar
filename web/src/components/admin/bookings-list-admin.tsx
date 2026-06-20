"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  Users,
  Phone,
  X,
  Check,
  Loader2,
  AlertTriangle,
  MoreVertical,
  Plus,
  Clock,
  Coins,
  ShieldCheck,
  User,
  ArrowUpRight,
  ExternalLink,
  Info
} from "lucide-react";
import { formatPriceDA, formatPhone } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  checkPartnerAvailabilityForBooking,
  assignBookingToPartner,
  createAdminBooking,
  rescheduleAdminBooking,
  cancelAdminBooking,
  confirmAdminBooking
} from "@/lib/actions/admin-bookings";

interface BookingsListAdminProps {
  initialBookings: any[];
  partners: any[];
}

export function BookingsListAdmin({ initialBookings, partners }: BookingsListAdminProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [partnerFilter, setPartnerFilter] = useState("All");

  // Manual Booking Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBookingData, setNewBookingData] = useState({
    client_name: "",
    client_phone: "",
    booking_date: new Date().toISOString().split("T")[0],
    booking_time: "10:00",
    duration_minutes: 120,
    guest_count: 2,
    total_amount: 15000,
    booking_source: "SAFAR_DZ" as "SAFAR_DZ" | "PARTNER_DIRECT",
    provider_id: "",
    boat_id: "",
  });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  // Smart availability state
  const [partnerAvailabilities, setPartnerAvailabilities] = useState<
    Record<string, { available: boolean; reason?: string }>
  >({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [assigningPartnerId, setAssigningPartnerId] = useState<string | null>(null);

  // Keep internal list in sync with server component props
  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  // Check all partners' availability when selection or date/time changes
  useEffect(() => {
    if (selectedBooking && selectedBooking.status !== "cancelled") {
      const activeDate = rescheduleDate || selectedBooking.booking_date;
      const activeTime = rescheduleTime || selectedBooking.booking_time || selectedBooking.start_time || "09:00";
      const activeDuration = selectedBooking.duration_minutes || 120;

      const runCheck = async () => {
        setCheckingAvailability(true);
        const results: Record<string, { available: boolean; reason?: string }> = {};
        for (const partner of partners) {
          const res = await checkPartnerAvailabilityForBooking(
            partner.id,
            activeDate,
            activeTime,
            activeDuration,
            selectedBooking.id
          );
          results[partner.id] = res;
        }
        setPartnerAvailabilities(results);
        setCheckingAvailability(false);
      };

      runCheck();
    } else {
      setPartnerAvailabilities({});
    }
  }, [selectedBooking, rescheduleDate, rescheduleTime, partners]);

  // Clean form and select booking when drawer closes
  const closeDrawer = () => {
    setSelectedBooking(null);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleError("");
    setAssignmentError("");
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking_ref?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.partner && booking.partner.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "All" || booking.status === statusFilter.toLowerCase();
    
    let matchesPartner = true;
    if (partnerFilter !== "All") {
      if (partnerFilter === "unassigned") {
        matchesPartner = !booking.provider_id;
      } else {
        matchesPartner = booking.provider_id === partnerFilter;
      }
    }

    return matchesSearch && matchesStatus && matchesPartner;
  });

  // Calculate stats dynamically
  const stats = {
    pending: bookings.filter((b) => b.status === "pending" || b.status === "new").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success">Confirmé</Badge>;
      case "pending":
      case "new":
        return <Badge variant="warning">En attente</Badge>;
      case "completed":
        return <Badge variant="info">Terminé</Badge>;
      case "cancelled":
        return <Badge variant="danger">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    if (source === "SAFAR_DZ") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Safar DZ Client
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Partner Direct
        </span>
      );
    }
  };

  // Actions
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    try {
      const res = await createAdminBooking({
        client_name: newBookingData.client_name,
        client_phone: newBookingData.client_phone,
        booking_date: newBookingData.booking_date,
        booking_time: newBookingData.booking_time,
        duration_minutes: Number(newBookingData.duration_minutes),
        guest_count: Number(newBookingData.guest_count),
        total_amount: Number(newBookingData.total_amount),
        booking_source: newBookingData.booking_source,
        provider_id: newBookingData.provider_id || undefined,
        boat_id: newBookingData.boat_id || undefined,
      });

      if (res.success) {
        setIsCreateModalOpen(false);
        setNewBookingData({
          client_name: "",
          client_phone: "",
          booking_date: new Date().toISOString().split("T")[0],
          booking_time: "10:00",
          duration_minutes: 120,
          guest_count: 2,
          total_amount: 15000,
          booking_source: "SAFAR_DZ",
          provider_id: "",
          boat_id: "",
        });
        startTransition(() => {
          router.refresh();
        });
      } else {
        setCreateError(res.error || "Une erreur est survenue.");
      }
    } catch (err: any) {
      setCreateError(err.message || "Erreur de connexion.");
    } finally {
      setCreating(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !rescheduleDate || !rescheduleTime) return;
    setRescheduling(true);
    setRescheduleError("");

    try {
      const res = await rescheduleAdminBooking(
        selectedBooking.id,
        rescheduleDate,
        rescheduleTime
      );

      if (res.success) {
        // update selected booking details local view
        setSelectedBooking((prev: any) => ({
          ...prev,
          booking_date: rescheduleDate,
          booking_time: rescheduleTime,
          start_time: rescheduleTime,
        }));
        setRescheduleDate("");
        setRescheduleTime("");
        startTransition(() => {
          router.refresh();
        });
      } else {
        setRescheduleError(res.error || "Impossible de reprogrammer.");
      }
    } catch (err: any) {
      setRescheduleError(err.message || "Erreur de report.");
    } finally {
      setRescheduling(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedBooking) return;
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;

    try {
      const res = await cancelAdminBooking(selectedBooking.id);
      if (res.success) {
        setSelectedBooking((prev: any) => ({
          ...prev,
          status: "cancelled",
        }));
        startTransition(() => {
          router.refresh();
        });
      } else {
        alert(res.error || "Impossible d'annuler.");
      }
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'annulation.");
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedBooking) return;
    if (!confirm("Êtes-vous sûr de vouloir confirmer cette réservation ?")) return;

    try {
      const res = await confirmAdminBooking(selectedBooking.id);
      if (res.success) {
        setSelectedBooking((prev: any) => ({
          ...prev,
          status: "confirmed",
        }));
        startTransition(() => {
          router.refresh();
        });
      } else {
        alert(res.error || "Impossible de confirmer.");
      }
    } catch (err: any) {
      alert(err.message || "Erreur lors de la confirmation.");
    }
  };

  const handleAssignPartner = async (partnerId: string, boatId: string) => {
    if (!selectedBooking) return;
    setAssigningPartnerId(partnerId);
    setAssignmentError("");

    try {
      const res = await assignBookingToPartner(selectedBooking.id, partnerId, boatId);
      if (res.success) {
        const partnerObj = partners.find((p) => p.id === partnerId);
        setSelectedBooking((prev: any) => ({
          ...prev,
          provider_id: partnerId,
          boat_id: boatId,
          partner: partnerObj?.name || "Partenaire Assigné",
        }));
        startTransition(() => {
          router.refresh();
        });
      } else {
        setAssignmentError(res.error || "Échec de l'assignation.");
      }
    } catch (err: any) {
      setAssignmentError(err.message || "Erreur de communication.");
    } finally {
      setAssigningPartnerId(null);
    }
  };

  // Helper to handle manual modal boat change based on provider selection
  const handleProviderChangeInForm = (providerId: string) => {
    const partner = partners.find((p) => p.id === providerId);
    const firstBoatId = partner?.boatsList?.[0]?.id || "";
    setNewBookingData((prev) => ({
      ...prev,
      provider_id: providerId,
      boat_id: firstBoatId,
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in text-on-surface">
      {/* Overview Cards Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-warning-container text-on-warning-container rounded-lg text-lg">⏳</span>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">Reçu</span>
          </div>
          <div>
            <p className="font-mono font-bold text-headline-sm text-primary">{stats.pending}</p>
            <p className="text-xs font-bold text-on-surface-variant">Demandes en attente</p>
          </div>
        </div>

        {/* Confirmed */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-success-container text-on-success-container rounded-lg text-lg">✓</span>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">Confirmé</span>
          </div>
          <div>
            <p className="font-mono font-bold text-headline-sm text-primary">{stats.confirmed}</p>
            <p className="text-xs font-bold text-on-surface-variant">Sorties confirmées</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-info-container text-on-info-container rounded-lg text-lg">⛵</span>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">Terminé</span>
          </div>
          <div>
            <p className="font-mono font-bold text-headline-sm text-primary">{stats.completed}</p>
            <p className="text-xs font-bold text-on-surface-variant font-medium">Sorties terminées</p>
          </div>
        </div>

        {/* Cancelled */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-error-container text-on-error-container rounded-lg text-lg">✕</span>
            <span className="text-[10px] font-bold text-error bg-error-container/20 px-2 py-0.5 rounded-full">Annulé</span>
          </div>
          <div>
            <p className="font-mono font-bold text-headline-sm text-primary">{stats.cancelled}</p>
            <p className="text-xs font-bold text-on-surface-variant">Annulations</p>
          </div>
        </div>
      </section>

      {/* Control Filters & Manual Booking creation */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Table Column (left) */}
        <div className="flex-1 space-y-6">
          {/* Advanced Filters & Add Button */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-1 ml-1 uppercase">Statut</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl text-xs py-2.5 px-3 focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="All">Tous les statuts</option>
                  <option value="Pending">En attente</option>
                  <option value="Confirmed">Confirmé</option>
                  <option value="Completed">Terminé</option>
                  <option value="Cancelled">Annulé</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-1 ml-1 uppercase">Partenaire</label>
                <select
                  value={partnerFilter}
                  onChange={(e) => setPartnerFilter(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl text-xs py-2.5 px-3 focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="All">Tous les capitaines</option>
                  <option value="unassigned">Non assigné ⚠️</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-1 ml-1 uppercase">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ID, client, capitaine..."
                    className="pl-9 h-9 border-none bg-surface-container-low rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            <Button
              shape="pill"
              className="bg-primary text-white hover:bg-primary/95 flex items-center gap-2 h-10 px-6 shrink-0 font-bold"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Créer Réservation
            </Button>
          </div>

          {/* Bookings Table */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant/20 text-[10px] font-bold uppercase text-on-surface-variant">
                  <tr>
                    <th className="px-6 py-4">ID / Réf</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Date & Heure</th>
                    <th className="px-6 py-4">Capitaine Assigné</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-xs text-on-surface">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                        Aucune réservation correspondante.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        onClick={() => {
                          setSelectedBooking(booking);
                          setRescheduleDate("");
                          setRescheduleTime("");
                          setRescheduleError("");
                          setAssignmentError("");
                        }}
                        className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-primary">
                          {booking.booking_ref || booking.ref || `#SF-${booking.id.slice(0, 4)}`}
                        </td>
                        <td className="px-6 py-4">
                          {getSourceBadge(booking.booking_source)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold">{booking.client_name}</div>
                          <div className="text-[10px] text-on-surface-variant">
                            {formatPhone(booking.client_phone)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold">{booking.booking_date}</p>
                          <p className="text-[10px] text-on-surface-variant">
                            {booking.booking_time || booking.start_time} ({booking.duration_minutes || 120} min)
                          </p>
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {booking.provider_id ? (
                            partners.find((p) => p.id === booking.provider_id)?.name || booking.partner || "Partenaire"
                          ) : (
                            <span className="text-warning font-semibold flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Non assigné
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setRescheduleDate("");
                              setRescheduleTime("");
                              setRescheduleError("");
                              setAssignmentError("");
                            }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-surface-container-low/20 border-t border-outline-variant/10 flex justify-between items-center text-[10px] text-on-surface-variant font-bold">
              <span>Affichage de {filteredBookings.length} réservations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Booking Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-xl rounded-2xl shadow-2xl border border-outline-variant overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-display-lg text-lg font-bold text-primary">Créer une Réservation Manuelle</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 hover:bg-surface-container-low rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {createError && (
                <div className="p-3.5 bg-error-container/20 border-l-4 border-error rounded-xl text-error text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Nom du client *</label>
                  <Input
                    required
                    value={newBookingData.client_name}
                    onChange={(e) => setNewBookingData((prev) => ({ ...prev, client_name: e.target.value }))}
                    placeholder="Amine"
                    className="h-10 text-xs border-outline-variant bg-surface-container-low rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Téléphone *</label>
                  <Input
                    required
                    value={newBookingData.client_phone}
                    onChange={(e) => setNewBookingData((prev) => ({ ...prev, client_phone: e.target.value }))}
                    placeholder="0550123456"
                    className="h-10 text-xs border-outline-variant bg-surface-container-low rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Date de départ *</label>
                  <Input
                    required
                    type="date"
                    value={newBookingData.booking_date}
                    onChange={(e) => setNewBookingData((prev) => ({ ...prev, booking_date: e.target.value }))}
                    className="h-10 text-xs border-outline-variant bg-surface-container-low rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Heure *</label>
                  <Input
                    required
                    type="time"
                    value={newBookingData.booking_time}
                    onChange={(e) => setNewBookingData((prev) => ({ ...prev, booking_time: e.target.value }))}
                    className="h-10 text-xs border-outline-variant bg-surface-container-low rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Durée (minutes) *</label>
                  <select
                    value={newBookingData.duration_minutes}
                    onChange={(e) => setNewBookingData((prev) => ({ ...prev, duration_minutes: Number(e.target.value) }))}
                    className="w-full bg-surface-container-low border border-outline-variant text-xs rounded-xl h-10 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={60}>1 Heure (60 min)</option>
                    <option value={120}>2 Heures (120 min)</option>
                    <option value={180}>3 Heures (180 min)</option>
                    <option value={240}>4 Heures (240 min)</option>
                    <option value={360}>6 Heures (360 min)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Nombre d'invités *</label>
                  <Input
                    required
                    type="number"
                    min={1}
                    value={newBookingData.guest_count}
                    onChange={(e) => setNewBookingData((prev) => ({ ...prev, guest_count: Number(e.target.value) }))}
                    className="h-10 text-xs border-outline-variant bg-surface-container-low rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Montant total (DA) *</label>
                  <Input
                    required
                    type="number"
                    min={0}
                    value={newBookingData.total_amount}
                    onChange={(e) => setNewBookingData((prev) => ({ ...prev, total_amount: Number(e.target.value) }))}
                    className="h-10 text-xs border-outline-variant bg-surface-container-low rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Source de réservation</label>
                  <select
                    value={newBookingData.booking_source}
                    onChange={(e) =>
                      setNewBookingData((prev) => ({
                        ...prev,
                        booking_source: e.target.value as "SAFAR_DZ" | "PARTNER_DIRECT",
                      }))
                    }
                    className="w-full bg-surface-container-low border border-outline-variant text-xs rounded-xl h-10 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="SAFAR_DZ">Safar DZ Client</option>
                    <option value="PARTNER_DIRECT">Partner Direct</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-surface-container rounded-2xl space-y-3">
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Assignation Directe (Optionnel)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Capitaine / Partenaire</label>
                    <select
                      value={newBookingData.provider_id}
                      onChange={(e) => handleProviderChangeInForm(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant text-xs rounded-xl h-10 px-3 focus:outline-none"
                    >
                      <option value="">-- Non assigné --</option>
                      {partners.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.boatsList?.length || 0} bateaux)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Navire / Bateau</label>
                    <select
                      value={newBookingData.boat_id}
                      onChange={(e) => setNewBookingData((prev) => ({ ...prev, boat_id: e.target.value }))}
                      disabled={!newBookingData.provider_id}
                      className="w-full bg-surface-container-low border border-outline-variant text-xs rounded-xl h-10 px-3 focus:outline-none disabled:opacity-50"
                    >
                      <option value="">-- Sélectionner un bateau --</option>
                      {(partners.find((p) => p.id === newBookingData.provider_id)?.boatsList || []).map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/10 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  shape="pill"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="font-bold text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  shape="pill"
                  disabled={creating}
                  className="bg-primary text-white hover:bg-primary/95 font-bold text-xs flex items-center gap-2"
                >
                  {creating && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                  Créer et Enregistrer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Side Drawer details overlay */}
      {selectedBooking && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={closeDrawer}
          />
          <aside className="fixed top-0 right-0 h-screen w-full md:w-[500px] bg-surface-container-lowest z-[70] shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300 border-l border-outline-variant text-on-surface">
            {/* Drawer Header */}
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-primary font-headline-sm text-lg flex items-center gap-2">
                  <span>Détails Réservation Admin</span>
                  {getStatusBadge(selectedBooking.status)}
                </h3>
                <span className="text-xs font-mono text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                  ID: {selectedBooking.booking_ref || selectedBooking.ref || selectedBooking.id}
                  • Source : {selectedBooking.booking_source}
                </span>
              </div>
              <button
                className="p-2 hover:bg-surface-container-low rounded-full transition-colors"
                onClick={closeDrawer}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {/* Customer Info */}
              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Informations Client</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">
                    {selectedBooking.client_name?.substring(0, 2).toUpperCase() || "CL"}
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{selectedBooking.client_name}</p>
                    <p className="text-[11px] text-on-surface-variant font-mono">{formatPhone(selectedBooking.client_phone)}</p>
                  </div>
                </div>
                <Button
                  shape="pill"
                  variant="outline"
                  className="w-full text-xs font-bold border-outline-variant mt-1"
                  onClick={() => {
                    const cleanPhone = selectedBooking.client_phone?.replace(/\D/g, "");
                    const whatsappUrl = `https://wa.me/${cleanPhone}`;
                    window.open(whatsappUrl, "_blank");
                  }}
                >
                  WhatsApp Client <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </Button>
              </section>

              {/* Booking Info Card */}
              <section className="space-y-3 pt-4 border-t border-outline-variant/20">
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Détails de la Sortie</h4>
                <div className="p-4 bg-surface-container-low rounded-2xl space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Activité</span>
                    <span className="font-bold">{selectedBooking.experiences?.title || selectedBooking.title || "Balade en mer"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Date de départ</span>
                    <span className="font-mono font-bold">{selectedBooking.booking_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Horaire & Durée</span>
                    <span className="font-mono font-bold">
                      {selectedBooking.booking_time || selectedBooking.start_time} ({selectedBooking.duration_minutes || 120} min)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Nombre d'invités</span>
                    <span className="font-bold">{selectedBooking.guest_count} personnes</span>
                  </div>
                  <div className="flex justify-between border-t border-outline-variant/20 pt-2 font-bold text-primary">
                    <span>Partenaire Assigné</span>
                    <span>
                      {selectedBooking.provider_id
                        ? partners.find((p) => p.id === selectedBooking.provider_id)?.name || selectedBooking.partner || "Partenaire"
                        : "Non assigné"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Financials & Commission System */}
              <section className="bg-surface-container-low p-4 rounded-2xl space-y-3">
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-primary" />
                  Commission & Recettes Safar DZ
                </h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Prix client total</span>
                    <span className="font-mono font-bold">{formatPriceDA(selectedBooking.total_amount)}</span>
                  </div>
                  
                  {selectedBooking.booking_source === "SAFAR_DZ" ? (
                    <>
                      <div className="flex justify-between text-[11px] text-on-surface-variant">
                        <span>Commission Safar ({selectedBooking.commission_rate || 15}%)</span>
                        <span className="font-mono text-error">
                          -{formatPriceDA(selectedBooking.commission_amount || (selectedBooking.total_amount * (selectedBooking.commission_rate || 15) / 100))}
                        </span>
                      </div>
                      <div className="flex justify-between text-success font-bold pt-2 border-t border-outline-variant/20">
                        <span>Revenu reversé au partenaire</span>
                        <span className="font-mono">
                          {formatPriceDA(
                            selectedBooking.provider_amount ||
                            (selectedBooking.total_amount - (selectedBooking.total_amount * (selectedBooking.commission_rate || 15) / 100))
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-[11px] text-on-surface-variant">
                        <span>Source Directe (0% commission)</span>
                        <span className="font-mono text-success">0 DA</span>
                      </div>
                      <div className="flex justify-between text-success font-bold pt-2 border-t border-outline-variant/20 font-headline-sm">
                        <span>Revenu reversé au partenaire (100%)</span>
                        <span className="font-mono">{formatPriceDA(selectedBooking.total_amount)}</span>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Smart Partner Availability & Reassignment Panel */}
              {selectedBooking.status !== "cancelled" && (
                <section className="space-y-3 pt-4 border-t border-outline-variant/20">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Smart Partner Availability & Assignment
                    </h4>
                    {checkingAvailability && (
                      <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        Vérification...
                      </span>
                    )}
                  </div>

                  {assignmentError && (
                    <div className="p-3 bg-error-container/20 border-l-4 border-error text-error text-xs rounded-lg">
                      {assignmentError}
                    </div>
                  )}

                  <div className="space-y-3">
                    {partners.map((partner) => {
                      const avail = partnerAvailabilities[partner.id];
                      const isAssignedToThis = selectedBooking.provider_id === partner.id;
                      
                      return (
                        <div
                          key={partner.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isAssignedToThis
                              ? "bg-primary/[0.03] border-primary"
                              : "bg-surface-container-low border-outline-variant/30"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold flex items-center gap-2">
                                {partner.name}
                                {isAssignedToThis && (
                                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] uppercase tracking-wider rounded-full font-bold">
                                    Assigné Actuel
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-on-surface-variant mt-0.5">
                                Commission: {partner.commission_rate || 15}% • Bateaux: {partner.boatsList?.length || 0}
                              </p>
                            </div>

                            <div className="text-right">
                              {checkingAvailability ? (
                                <span className="h-4 w-4 rounded-full bg-surface-container-highest animate-pulse inline-block" />
                              ) : avail ? (
                                avail.available ? (
                                  <span className="text-[10px] text-success font-bold flex items-center gap-0.5 bg-success/10 px-2 py-0.5 rounded-full">
                                    Disponible ✅
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-error font-bold flex items-center gap-0.5 bg-error/10 px-2 py-0.5 rounded-full">
                                    Occupé ❌
                                  </span>
                                )
                              ) : (
                                <span className="text-[10px] text-on-surface-variant">—</span>
                              )}
                            </div>
                          </div>

                          {/* Boat Selection and Assign Button */}
                          {avail && avail.available && partner.boatsList?.length > 0 && (
                            <div className="mt-3 flex items-center gap-3 pt-3 border-t border-outline-variant/10">
                              <select
                                id={`boat-select-${partner.id}`}
                                defaultValue={partner.boatsList[0].id}
                                className="bg-surface-container-low text-[11px] rounded-lg border border-outline-variant px-2 py-1 focus:outline-none"
                              >
                                {partner.boatsList.map((b: any) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name} ({b.type})
                                  </option>
                                ))}
                              </select>

                              <Button
                                shape="pill"
                                size="sm"
                                disabled={assigningPartnerId !== null}
                                className="bg-primary text-white hover:bg-primary/95 text-[10px] font-bold px-4 py-1 h-7 ml-auto"
                                onClick={() => {
                                  const selectEl = document.getElementById(`boat-select-${partner.id}`) as HTMLSelectElement;
                                  const boatId = selectEl ? selectEl.value : partner.boatsList[0].id;
                                  handleAssignPartner(partner.id, boatId);
                                }}
                              >
                                {assigningPartnerId === partner.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Assigner"
                                )}
                              </Button>
                            </div>
                          )}

                          {avail && !avail.available && (
                            <div className="mt-2 text-[10px] text-error font-medium flex items-start gap-1 bg-error-container/10 p-2 rounded-lg border border-error/10">
                              <Info className="h-3.5 w-3.5 shrink-0" />
                              <span>{avail.reason}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Reschedule Booking Section */}
              {selectedBooking.status !== "cancelled" && (
                <section className="space-y-3 pt-4 border-t border-outline-variant/20">
                  <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Reporter la Réservation (Reschedule)
                  </h4>
                  
                  {rescheduleError && (
                    <div className="p-3 bg-error-container/20 border-l-4 border-error text-error text-xs rounded-lg">
                      {rescheduleError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Nouvelle Date</label>
                      <Input
                        type="date"
                        value={rescheduleDate || selectedBooking.booking_date}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="h-9 text-xs border-outline-variant bg-surface-container-low rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-on-surface-variant uppercase mb-1">Nouvel Horaire</label>
                      <Input
                        type="time"
                        value={rescheduleTime || selectedBooking.booking_time || selectedBooking.start_time}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="h-9 text-xs border-outline-variant bg-surface-container-low rounded-xl"
                      />
                    </div>
                  </div>

                  <Button
                    shape="pill"
                    disabled={rescheduling || (!rescheduleDate && !rescheduleTime)}
                    onClick={handleReschedule}
                    className="w-full bg-primary text-white hover:bg-primary/95 text-xs font-bold flex items-center justify-center gap-1.5 h-9"
                  >
                    {rescheduling && <Loader2 className="h-4 w-4 animate-spin" />}
                    Enregistrer le report
                  </Button>
                </section>
              )}
            </div>

            {/* Drawer Footer / Operations */}
            <div className="p-6 bg-surface-container border-t border-outline-variant/30 flex flex-col gap-3">
              {(selectedBooking.status === "pending" || selectedBooking.status === "new") && (
                <Button
                  shape="pill"
                  onClick={handleConfirmBooking}
                  className="w-full bg-primary text-white hover:bg-primary/95 font-bold text-xs h-10"
                >
                  Accepter la demande
                </Button>
              )}
              <div className="flex gap-3 w-full">
                {selectedBooking.status !== "cancelled" && selectedBooking.status !== "completed" && (
                  <Button
                    variant="outline"
                    shape="pill"
                    onClick={handleCancel}
                    className="w-full font-bold text-error hover:bg-error/5 hover:text-error border-error text-xs h-10"
                  >
                    Annuler la réservation
                  </Button>
                )}
                <Button
                  variant="outline"
                  shape="pill"
                  onClick={closeDrawer}
                  className="w-full font-bold text-xs h-10"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
