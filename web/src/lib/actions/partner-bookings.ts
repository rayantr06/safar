"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkRole } from "@/lib/utils/auth-check";
import { createNotification } from "./notifications";

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

export interface BoatAvailabilitySettings {
  workingHours: { start: string; end: string };
  breakTime: { start: string; end: string };
  unavailableDays: string[];
  maintenanceDates: string[];
}

export async function checkConflict(
  boatId: string,
  date: string,
  startTimeStr: string,
  durationMinutes: number
) {
  const supabase = await createClient();

  const { data: dbBookings } = await supabase
    .from("bookings")
    .select("booking_time, start_time, duration_minutes, booking_ref, boat_id, booking_date, status")
    .eq("boat_id", boatId)
    .eq("booking_date", date)
    .neq("status", "cancelled") as { data: { booking_time: string; start_time: string; duration_minutes: number; booking_ref: string; boat_id: string; booking_date: string; status: string }[] | null };
  const bookings = dbBookings || [];

  const { data: dbAvail } = await (supabase as any)
    .from("boat_availability")
    .select("settings")
    .eq("boat_id", boatId)
    .single();
  const availability: BoatAvailabilitySettings = dbAvail?.settings || {
    workingHours: { start: "08:00", end: "20:00" },
    breakTime: { start: "13:00", end: "14:00" },
    unavailableDays: [],
    maintenanceDates: []
  };

  const bookStart = timeToMinutes(startTimeStr);
  const bookEnd = bookStart + durationMinutes;

  // Check unavailable day of the week
  if (availability.unavailableDays && availability.unavailableDays.length > 0) {
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    if (availability.unavailableDays.includes(dayName)) {
      return {
        conflict: true,
        reason: `Ce bateau n'est pas disponible le ${dateObj.toLocaleDateString("fr-FR", { weekday: "long" })}.`
      };
    }
  }

  // Check maintenance dates
  if (availability.maintenanceDates && availability.maintenanceDates.includes(date)) {
    return {
      conflict: true,
      reason: "Ce bateau est en maintenance à cette date."
    };
  }

  // Check working hours constraint
  const workStart = timeToMinutes(availability.workingHours.start);
  const workEnd = timeToMinutes(availability.workingHours.end);
  if (bookStart < workStart || bookEnd > workEnd) {
    return {
      conflict: true,
      reason: `Les heures de réservation doivent être comprises dans les heures de travail (${availability.workingHours.start} - ${availability.workingHours.end}).`
    };
  }

  // Check break time overlap
  const breakStart = timeToMinutes(availability.breakTime.start);
  const breakEnd = timeToMinutes(availability.breakTime.end);
  if (bookStart < breakEnd && breakStart < bookEnd) {
    return {
      conflict: true,
      reason: `Le créneau demandé chevauche la pause de l'équipage (${availability.breakTime.start} - ${availability.breakTime.end}).`
    };
  }

  // Check overlap with other active bookings for the same boat
  const activeBookings = bookings.filter(
    (b: any) =>
      b.boat_id === boatId &&
      b.booking_date === date &&
      b.status !== "cancelled"
  );

  for (const b of activeBookings) {
    const otherStart = timeToMinutes(b.booking_time || b.start_time);
    const otherDuration = b.duration_minutes || 120;
    const otherEnd = otherStart + otherDuration;

    if (bookStart < otherEnd && otherStart < bookEnd) {
      return {
        conflict: true,
        reason: `Ce bateau est déjà réservé durant cette période (${minutesToTime(otherStart)} - ${minutesToTime(otherEnd)}).`
      };
    }
  }

  return { conflict: false };
}

export async function createManualBooking(bookingData: {
  client_name: string;
  client_phone: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  guest_count: number;
  boat_id: string;
  total_amount: number;
  client_notes?: string;
}) {
  try {
    const { user, role } = await checkRole(["provider", "admin"]);
    const supabase = await createClient();

    const { data: boat } = await supabase.from("boats").select("provider_id").eq("id", bookingData.boat_id).single() as any;
    if (role === "provider" && boat && boat.provider_id !== user.id) {
      throw new Error("Non autorisé : Ce navire ne vous appartient pas");
    }

    const providerId = user?.id || "unknown";

    // Use atomic database function with advisory locking to prevent overbooking
    const { data: result, error: rpcError } = await (supabase as any)
      .rpc("atomic_create_partner_booking", {
        p_boat_id: bookingData.boat_id,
        p_booking_date: bookingData.booking_date,
        p_booking_time: bookingData.booking_time,
        p_duration_minutes: bookingData.duration_minutes,
        p_client_name: bookingData.client_name,
        p_client_phone: bookingData.client_phone,
        p_client_notes: bookingData.client_notes || "",
        p_guest_count: bookingData.guest_count,
        p_total_amount: bookingData.total_amount,
        p_provider_id: providerId,
      });

    if (rpcError) throw rpcError;
    if (!result?.success) throw new Error(result?.error || "Échec de la création de la réservation");

    revalidatePath("/partner/bookings");
    revalidatePath("/partner/availability");
    revalidatePath("/partner");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create manual booking:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  try {
    const { user, role } = await checkRole(["provider", "admin"]);
    const supabase = await createClient();

    const { data: booking } = await supabase.from("bookings").select("provider_id").eq("id", bookingId).single() as any;
    if (role === "provider" && booking?.provider_id !== user.id) {
      throw new Error("Non autorisé : Cette réservation ne vous appartient pas");
    }

    const { error } = await (supabase as any)
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);
    if (error) throw error;

    if (newStatus === "cancelled" || newStatus === "confirmed" || newStatus === "completed") {
      try {
        await createNotification({
          type: newStatus === "cancelled" ? "cancellation" : "payment_status",
          title: newStatus === "cancelled" ? "Réservation annulée" : "Statut de réservation mis à jour",
          message: `Le partenaire a marqué la réservation comme "${newStatus}".`,
          metadata: { booking_id: bookingId, status: newStatus },
        });
      } catch (notifErr) {
        console.error("Failed to create status-change notification:", notifErr);
      }
    }

    revalidatePath("/partner/bookings");
    revalidatePath("/partner/availability");
    revalidatePath("/partner");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update status:", error);
    return { success: false, error: error.message };
  }
}

export async function saveBoatAvailability(boatId: string, settings: BoatAvailabilitySettings) {
  try {
    const { user, role } = await checkRole(["provider", "admin"]);
    const supabase = await createClient();

    const { data: boat } = await supabase.from("boats").select("provider_id").eq("id", boatId).single() as any;
    if (role === "provider" && boat && boat.provider_id !== user.id) {
      throw new Error("Non autorisé : Ce navire ne vous appartient pas");
    }

    const { error } = await (supabase as any)
      .from("boat_availability")
      .upsert({ boat_id: boatId, settings });
    if (error) throw error;

    revalidatePath("/partner/availability");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save boat availability:", error);
    return { success: false, error: error.message };
  }
}

export async function getBoatAvailability(boatId: string): Promise<BoatAvailabilitySettings> {
  const { user, role } = await checkRole(["provider", "admin"]);
  const defaultSettings: BoatAvailabilitySettings = {
    workingHours: { start: "08:00", end: "20:00" },
    breakTime: { start: "13:00", end: "14:00" },
    unavailableDays: [],
    maintenanceDates: []
  };

  try {
    const supabase = await createClient();
    const { data: boat } = await supabase.from("boats").select("provider_id").eq("id", boatId).single() as any;
    if (role === "provider" && boat && boat.provider_id !== user.id) {
      throw new Error("Non autorisé : Ce navire ne vous appartient pas");
    }

    const { data, error } = await (supabase as any)
      .from("boat_availability")
      .select("settings")
      .eq("boat_id", boatId)
      .single();
    if (error || !data) return defaultSettings;
    return data.settings as BoatAvailabilitySettings;
  } catch (err: any) {
    if (err.message?.includes("Non autorisé")) throw err;
    return defaultSettings;
  }
}
