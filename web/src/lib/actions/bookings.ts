"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateBookingRef, calculateCommission } from "@/lib/utils/booking-ref";
import { createNotification } from "@/lib/actions/notifications";
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
  total_amount: number;
  booking_type: "private" | "shared";
  duration_minutes?: number;
};

export async function createBooking(data: BookingRequest) {
  const supabase = createAdminClient() as any;

  let clientId: string | null = null;
  try {
    const sessionClient = await createClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    clientId = user?.id ?? null;
  } catch {
    clientId = null;
  }

  try {
    const { data: expData, error: expError } = await supabase
      .from("experiences")
      .select("boat_id, price_total, price_per_seat, title, boats(provider_id)")
      .eq("id", data.experience_id)
      .single();

    if (expError) throw new Error("Experience introuvable");
    const providerId = expData?.boats?.provider_id;
    const boatId = expData?.boat_id;

    let canonicalTotal = data.total_amount;
    if (expData) {
      canonicalTotal =
        data.booking_type === "shared"
          ? Math.round((expData.price_per_seat || 0) * data.guest_count)
          : (expData.price_total || 0);
    }

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

    const finance = calculateCommission(canonicalTotal, commissionRate);

    // Use atomic database function with advisory locking to prevent overbooking
    const { data: result, error: rpcError } = await supabase
      .rpc("atomic_create_booking", {
        p_boat_id: boatId,
        p_booking_date: data.booking_date,
        p_booking_time: data.booking_time,
        p_duration_minutes: data.duration_minutes || 120,
        p_experience_id: data.experience_id,
        p_client_name: data.client_name,
        p_client_phone: data.client_phone,
        p_client_notes: data.client_notes || "",
        p_guest_count: data.guest_count,
        p_booking_type: data.booking_type,
        p_total_amount: finance.totalAmount,
        p_commission_amount: finance.commissionAmount,
        p_provider_amount: finance.providerAmount,
        p_commission_rate: commissionRate,
        p_provider_id: providerId,
        p_client_id: clientId,
        p_time_slot_id: data.time_slot_id,
      });

    if (rpcError) throw rpcError;
    if (!result?.success) throw new Error(result?.error || "Échec de la création de la réservation");

    const bookingRef = result.booking_ref;

    try {
      await createNotification({
        type: "new_reservation",
        title: "Nouvelle réservation",
        message: `${data.client_name} a réservé "${expData?.title || "une expérience"}" pour le ${data.booking_date} (${bookingRef}).`,
        metadata: { booking_id: result.booking_id, booking_ref: bookingRef },
      });
    } catch (notifErr) {
      console.error("Failed to create booking notification:", notifErr);
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/partner/bookings");
    revalidatePath("/admin/notifications");

    return { success: true, booking_ref: bookingRef };
  } catch (error: any) {
    console.error("Booking Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getExperienceAvailability(experienceId: string, date: string) {
  const supabase = createAdminClient() as any;

  try {
    const { data: expData } = await supabase
      .from("experiences")
      .select("boat_id, boats(provider_id)")
      .eq("id", experienceId)
      .single();
    const boatId = expData?.boat_id;
    const providerId = expData?.boats?.provider_id;

    if (!boatId) {
      return { success: true, busySlots: [], availabilitySettings: null };
    }

    const { data: dbBookings } = await supabase
      .from("bookings")
      .select("booking_time, start_time, duration_minutes")
      .eq("boat_id", boatId)
      .eq("booking_date", date)
      .neq("status", "cancelled");
    const bookings = dbBookings || [];

    const { data: dbAvail } = await supabase
      .from("boat_availability")
      .select("settings")
      .eq("boat_id", boatId)
      .single();
    const availabilitySettings = dbAvail?.settings || {
      workingHours: { start: "08:00", end: "20:00" },
      breakTime: { start: "13:00", end: "14:00" },
      unavailableDays: [],
      maintenanceDates: []
    };

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
