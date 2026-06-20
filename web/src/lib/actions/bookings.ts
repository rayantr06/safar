"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { generateBookingRef, calculateCommission } from "@/lib/utils/booking-ref";
import { revalidatePath } from "next/cache";

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

export type BookingRequest = {
  experience_id: string;
  time_slot_id: string | null;
  client_name: string;
  client_phone: string;
  client_notes: string;
  guest_count: number;
  booking_date: string;
  booking_time: string;
  total_amount: number; // calculated in frontend, verified in backend ideally
  booking_type: "private" | "shared";
  duration_minutes?: number;
};

export async function createBooking(data: BookingRequest) {
  const supabase = createAdminClient() as any;

  try {
    // 1. Fetch the provider_id and boat_id for this experience
    const { data: expData, error: expError } = await supabase
      .from("experiences")
      .select("boat_id, boats(provider_id)")
      .eq("id", data.experience_id)
      .single();

    if (expError) throw new Error("Experience introuvable");
    const providerId = expData?.boats?.provider_id;
    const boatId = expData?.boat_id;

    // Validate that there are no overlapping bookings for the same boat on that date
    // Note: We bypass this verification since this is now a manual confirmation request system.
    // The admin will review overlaps manually and confirm/reschedule bookings.
    /*
    if (boatId) {
      const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
      let activeBookings: any[] = [];
      if (isPlaceholder) {
        const { getMockDb } = require("../supabase/mock-db-helper");
        const db = getMockDb();
        activeBookings = (db.bookings || []).filter(
          (b: any) =>
            b.boat_id === boatId &&
            b.booking_date === data.booking_date &&
            b.status !== "cancelled"
        );
      } else {
        const { data: dbBookings } = await supabase
          .from("bookings")
          .select("booking_time, duration_minutes, booking_ref")
          .eq("boat_id", boatId)
          .eq("booking_date", data.booking_date)
          .neq("status", "cancelled");
        activeBookings = dbBookings || [];
      }

      const bookStart = timeToMinutes(data.booking_time);
      const bookEnd = bookStart + (data.duration_minutes || 120);

      for (const b of activeBookings) {
        const bStart = timeToMinutes(b.booking_time || b.start_time || "09:00");
        const bDuration = b.duration_minutes || 120;
        const bEnd = bStart + bDuration;

        if (bookStart < bEnd && bStart < bookEnd) {
          throw new Error(`Ce créneau est déjà réservé par la réservation ${b.booking_ref} (${b.booking_time || b.start_time} - ${minutesToTime(bEnd)})`);
        }
      }
    }
    */

    // 2. Fetch the provider's commission rate (default to 15)
    let commissionRate = 15.00;
    if (providerId) {
      const { data: provData } = await supabase
        .from("providers")
        .select("commission_rate")
        .eq("id", providerId)
        .single();
      if (provData && provData.commission_rate !== undefined) {
        commissionRate = Number(provData.commission_rate);
      }
    }

    // 3. Calculate financial splits with the resolved commission rate
    const finance = calculateCommission(data.total_amount, commissionRate);
    const bookingRef = generateBookingRef();

    // Calculate end time
    const durationMinutes = data.duration_minutes || 120;
    const startTime = data.booking_time;
    let endTime = "";
    if (startTime) {
      const [h, m] = startTime.split(":").map(Number);
      const startMins = h * 60 + m;
      const endMins = startMins + durationMinutes;
      const endH = Math.floor(endMins / 60) % 24;
      const endM = endMins % 60;
      endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
    }

    // 4. Insert into bookings table
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        booking_ref: bookingRef,
        experience_id: data.experience_id,
        time_slot_id: data.time_slot_id,
        provider_id: providerId,
        client_name: data.client_name,
        client_phone: data.client_phone,
        client_notes: data.client_notes,
        guest_count: data.guest_count,
        booking_type: data.booking_type,
        total_amount: finance.totalAmount,
        commission_amount: finance.commissionAmount,
        provider_amount: finance.providerAmount,
        commission_rate: commissionRate,
        status: "new",
        booking_date: data.booking_date,
        booking_time: data.booking_time,
        booking_source: "SAFAR_DZ",
        created_by: "CUSTOMER",
        duration_minutes: durationMinutes,
        start_time: startTime,
        end_time: endTime,
        boat_id: boatId,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // 3. Update booked seats in time_slot if it's a shared experience
    if (data.time_slot_id && data.booking_type === "shared") {
      const { data: slot } = await supabase
        .from("time_slots")
        .select("booked_seats, total_seats")
        .eq("id", data.time_slot_id)
        .single();
        
      if (slot) {
        await supabase
          .from("time_slots")
          .update({ booked_seats: slot.booked_seats + data.guest_count })
          .eq("id", data.time_slot_id);
      }
    }

    // 4. Log status history
    await supabase.from("booking_status_history").insert({
      booking_id: booking.id,
      new_status: "new",
      note: "Réservation initiale du client",
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/partner/bookings");

    return { success: true, booking_ref: bookingRef };
  } catch (error: any) {
    console.error("Booking Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getExperienceAvailability(experienceId: string, date: string) {
  const supabase = createAdminClient() as any;
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

  try {
    let boatId = "";
    let providerId = "";

    if (isPlaceholder) {
      const { getMockDb } = require("../supabase/mock-db-helper");
      const db = getMockDb();
      
      // Look for the experience in MOCK_EXPERIENCES or db overrides
      const exp = (db.createdExperiences || []).find((e: any) => e.id === experienceId) || 
                  Object.values(db.experiences || {}).find((e: any) => e.id === experienceId);
      
      if (exp) {
        boatId = exp.boat_id || "1";
      } else {
        // Fallback for mock IDs
        if (experienceId === "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" || experienceId === "1") {
          boatId = "1";
        } else if (experienceId === "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e" || experienceId === "2") {
          boatId = "2";
        } else {
          boatId = "1";
        }
      }
      providerId = db.boats?.[boatId]?.provider_id || "mock-partner-id";
    } else {
      const { data: expData } = await supabase
        .from("experiences")
        .select("boat_id, boats(provider_id)")
        .eq("id", experienceId)
        .single();
      boatId = expData?.boat_id;
      providerId = expData?.boats?.provider_id;
    }

    if (!boatId) {
      return { success: true, busySlots: [], availabilitySettings: null };
    }

    let bookings: any[] = [];
    let availabilitySettings: any = null;

    if (isPlaceholder) {
      const { getMockDb } = require("../supabase/mock-db-helper");
      const db = getMockDb();
      bookings = (db.bookings || []).filter(
        (b: any) => b.boat_id === boatId && b.booking_date === date && b.status !== "cancelled"
      );
      availabilitySettings = db.boat_availability?.[boatId] || {
        workingHours: { start: "08:00", end: "20:00" },
        breakTime: { start: "13:00", end: "14:00" },
        unavailableDays: [],
        maintenanceDates: []
      };
    } else {
      const { data: dbBookings } = await supabase
        .from("bookings")
        .select("booking_time, start_time, duration_minutes")
        .eq("boat_id", boatId)
        .eq("booking_date", date)
        .neq("status", "cancelled");
      bookings = dbBookings || [];

      const { data: dbAvail } = await supabase
        .from("boat_availability")
        .select("settings")
        .eq("boat_id", boatId)
        .single();
      availabilitySettings = dbAvail?.settings || {
        workingHours: { start: "08:00", end: "20:00" },
        breakTime: { start: "13:00", end: "14:00" },
        unavailableDays: [],
        maintenanceDates: []
      };
    }

    const busySlots = bookings.map((b: any) => {
      const start = b.booking_time || b.start_time || "09:00";
      const duration = b.duration_minutes || 120;
      const startMins = timeToMinutes(start);
      const endMins = startMins + duration;
      return {
        start,
        end: minutesToTime(endMins)
      };
    });

    return {
      success: true,
      busySlots,
      availabilitySettings
    };
  } catch (error: any) {
    console.error("Failed to load experience availability:", error);
    return { success: false, error: error.message };
  }
}
