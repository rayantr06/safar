"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getMockDb, saveMockDb, BoatAvailabilitySettings } from "../supabase/mock-db-helper";
import { checkRole } from "@/lib/utils/auth-check";

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

export async function checkConflict(
  boatId: string,
  date: string,
  startTimeStr: string,
  durationMinutes: number
) {
  const db = getMockDb();
  const bookings = db.bookings || [];
  
  const bookStart = timeToMinutes(startTimeStr);
  const bookEnd = bookStart + durationMinutes;

  // 1. Check working hours & break times for this boat
  const availability: BoatAvailabilitySettings = db.boat_availability?.[boatId] || {
    workingHours: { start: "08:00", end: "20:00" },
    breakTime: { start: "13:00", end: "14:00" },
    unavailableDays: [],
    maintenanceDates: []
  };

  // Check unavailable day of the week
  if (availability.unavailableDays && availability.unavailableDays.length > 0) {
    // Get day name in English (e.g. "Monday")
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

  // 2. Check overlap with other active bookings for the same boat
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

    // Check overlap: startA < endB and startB < endA
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
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    // Check conflicts first
    const conflictRes = await checkConflict(
      bookingData.boat_id,
      bookingData.booking_date,
      bookingData.booking_time,
      bookingData.duration_minutes
    );

    if (conflictRes.conflict) {
      return { success: false, error: conflictRes.reason };
    }

    if (isPlaceholder) {
      const db = getMockDb();
      const boat = db.boats?.[bookingData.boat_id];
      if (role === "provider" && boat && boat.provider_id !== user.id) {
        throw new Error("Non autorisé : Ce navire ne vous appartient pas");
      }
    } else {
      const { data: boat } = await supabase.from("boats").select("provider_id").eq("id", bookingData.boat_id).single() as any;
      if (role === "provider" && boat && boat.provider_id !== user.id) {
        throw new Error("Non autorisé : Ce navire ne vous appartient pas");
      }
    }

    const providerId = user?.id || "mock-partner-id";

    const startTime = bookingData.booking_time;
    const endTimeMins = timeToMinutes(startTime) + bookingData.duration_minutes;
    const endTime = minutesToTime(endTimeMins);

    const newBooking = {
      booking_ref: `#PR-${Math.floor(1000 + Math.random() * 9000)}`,
      client_name: bookingData.client_name,
      client_phone: bookingData.client_phone,
      booking_date: bookingData.booking_date,
      booking_time: bookingData.booking_time,
      duration_minutes: bookingData.duration_minutes,
      start_time: startTime,
      end_time: endTime,
      guest_count: bookingData.guest_count,
      booking_type: "private",
      total_amount: bookingData.total_amount,
      commission_amount: 0, // No commission for manual bookings
      provider_amount: bookingData.total_amount,
      commission_rate: 0, // 0% commission for partner direct
      status: "confirmed" as const, // Auto-confirmed
      booking_source: "PARTNER_DIRECT" as const,
      created_by: "PARTNER" as const,
      boat_id: bookingData.boat_id,
      provider_id: providerId,
      client_notes: bookingData.client_notes || "",
      experience_id: "1" // Fallback link
    };

    if (isPlaceholder) {
      const db = getMockDb();
      if (!db.bookings) db.bookings = [];
      const created = {
        id: `b-manual-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...newBooking
      };
      db.bookings.push(created);
      saveMockDb(db);
    } else {
      const { error } = await (supabase as any)
        .from("bookings")
        .insert(newBooking);
      if (error) throw error;
    }

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
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    if (isPlaceholder) {
      const db = getMockDb();
      const list = db.bookings || [];
      const booking = list.find((b: any) => b.id === bookingId);
      if (!booking) throw new Error("Réservation introuvable");

      if (role === "provider" && booking.provider_id !== user.id) {
        throw new Error("Non autorisé : Cette réservation ne vous appartient pas");
      }

      booking.status = newStatus;
      db.bookings = list;
      saveMockDb(db);
    } else {
      const { data: booking } = await supabase.from("bookings").select("provider_id").eq("id", bookingId).single() as any;
      if (role === "provider" && booking?.provider_id !== user.id) {
        throw new Error("Non autorisé : Cette réservation ne vous appartient pas");
      }

      const { error } = await (supabase as any)
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);
      if (error) throw error;
    }

    revalidatePath("/partner/bookings");
    revalidatePath("/partner/availability");
    revalidatePath("/partner");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update status:", error);
    return { success: false, error: error.message };
  }
}

export async function saveBoatAvailability(boatId: string, settings: BoatAvailabilitySettings) {
  try {
    const { user, role } = await checkRole(["provider", "admin"]);
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    if (isPlaceholder) {
      const db = getMockDb();
      const boat = db.boats?.[boatId];
      if (role === "provider" && boat && boat.provider_id !== user.id) {
        throw new Error("Non autorisé : Ce navire ne vous appartient pas");
      }

      if (!db.boat_availability) db.boat_availability = {};
      db.boat_availability[boatId] = settings;
      saveMockDb(db);
    } else {
      const supabase = await createClient();
      const { data: boat } = await supabase.from("boats").select("provider_id").eq("id", boatId).single() as any;
      if (role === "provider" && boat && boat.provider_id !== user.id) {
        throw new Error("Non autorisé : Ce navire ne vous appartient pas");
      }

      const { error } = await (supabase as any)
        .from("boat_availability")
        .upsert({ boat_id: boatId, settings });
      if (error) throw error;
    }

    revalidatePath("/partner/availability");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save boat availability:", error);
    return { success: false, error: error.message };
  }
}

export async function getBoatAvailability(boatId: string): Promise<BoatAvailabilitySettings> {
  const { user, role } = await checkRole(["provider", "admin"]);
  const db = getMockDb();
  const defaultSettings = {
    workingHours: { start: "08:00", end: "20:00" },
    breakTime: { start: "13:00", end: "14:00" },
    unavailableDays: [],
    maintenanceDates: []
  };

  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
  if (isPlaceholder) {
    const boat = db.boats?.[boatId];
    if (role === "provider" && boat && boat.provider_id !== user.id) {
      throw new Error("Non autorisé : Ce navire ne vous appartient pas");
    }
    return db.boat_availability?.[boatId] || defaultSettings;
  } else {
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
}
