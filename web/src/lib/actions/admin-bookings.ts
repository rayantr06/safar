"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRole } from "@/lib/utils/auth-check";
import { revalidatePath } from "next/cache";
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

export async function checkPartnerAvailabilityForBooking(
  providerId: string,
  date: string,
  time: string,
  durationMinutes: number,
  excludeBookingId?: string
) {
  try {
    const supabase = await createClient();
    const bookStart = timeToMinutes(time);
    const bookEnd = bookStart + durationMinutes;

    const { data: boats } = await supabase
      .from("boats")
      .select("id, name")
      .eq("provider_id", providerId);

    if (!boats || boats.length === 0) {
      return { available: true };
    }

    const { data: dbBookings } = await supabase
      .from("bookings")
      .select("id, booking_ref, booking_time, duration_minutes, status")
      .eq("provider_id", providerId)
      .eq("booking_date", date)
      .neq("status", "cancelled");

    if (dbBookings) {
      const filtered = (dbBookings as any[]).filter(b => b.id !== excludeBookingId);
      for (const b of filtered) {
        const bStart = timeToMinutes(b.booking_time || "09:00");
        const bDuration = b.duration_minutes || 120;
        const bEnd = bStart + bDuration;

        if (bookStart < bEnd && bStart < bookEnd) {
          return {
            available: false,
            reason: `Conflit avec la réservation ${b.booking_ref} (${b.booking_time} - ${minutesToTime(bEnd)})`
          };
        }
      }
    }

    const boatIds = (boats as any[]).map(b => b.id);
    const { data: availSettings } = await supabase
      .from("boat_availability")
      .select("boat_id, settings")
      .in("boat_id", boatIds);

    if (availSettings) {
      const dateObj = new Date(date);
      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });

      for (const record of (availSettings as any[])) {
        const settings = record.settings as any;
        if (!settings) continue;

        if (settings.unavailableDays?.includes(dayName)) {
          return {
            available: false,
            reason: `Bateau ${(boats as any[]).find(b => b.id === record.boat_id)?.name} non dispo le ${dateObj.toLocaleDateString("fr-FR", { weekday: "long" })}`
          };
        }

        if (settings.maintenanceDates?.includes(date)) {
          return {
            available: false,
            reason: `Bateau ${(boats as any[]).find(b => b.id === record.boat_id)?.name} en maintenance`
          };
        }

        const workStart = timeToMinutes(settings.workingHours?.start || "08:00");
        const workEnd = timeToMinutes(settings.workingHours?.end || "20:00");
        if (bookStart < workStart || bookEnd > workEnd) {
          return {
            available: false,
            reason: `Bateau ${(boats as any[]).find(b => b.id === record.boat_id)?.name} hors plages (${settings.workingHours?.start} - ${settings.workingHours?.end})`
          };
        }
      }
    }

    return { available: true };
  } catch (error: any) {
    console.error("Availability check failed:", error);
    return { available: false, reason: error.message };
  }
}

export async function getAdminBookings() {
  try {
    await checkRole(["admin"]);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences ( title, duration_minutes ),
        providers ( company_name )
      `)
      .order("booking_date", { ascending: false });
    
    if (error) throw error;
    return { success: true, bookings: data || [] };
  } catch (error: any) {
    console.error("Failed to load admin bookings:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminPartners() {
  try {
    await checkRole(["admin"]);
    const supabase = await createClient();

    const { data: providersList, error } = await supabase
      .from("providers")
      .select(`
        id,
        company_name,
        is_active,
        commission_rate,
        profiles (
          full_name,
          phone
        ),
        boats (
          id,
          name,
          type,
          capacity
        )
      `);
    if (error) throw error;
    
    const mapped = providersList.map((prov: any) => ({
      id: prov.id,
      name: prov.company_name || prov.profiles?.full_name || "Partenaire Safar",
      phone: prov.profiles?.phone || "0550000000",
      boats: prov.boats?.length || 0,
      boatsList: prov.boats || [],
      status: prov.is_active ? "active" : "pending",
      commission_rate: prov.commission_rate
    }));

    return { success: true, partners: mapped };
  } catch (error: any) {
    console.error("Failed to load admin partners:", error);
    return { success: false, error: error.message };
  }
}

export async function assignBookingToPartner(
  bookingId: string,
  providerId: string,
  boatId: string
) {
  try {
    await checkRole(["admin"]);
    const supabase = await createClient();

    const { data: bData } = await supabase
      .from("bookings")
      .select("booking_date, booking_time, duration_minutes")
      .eq("id", bookingId)
      .single();
    const b = bData as any;
    let bookingDate = b?.booking_date || "";
    let bookingTime = b?.booking_time || "09:00";
    let durationMinutes = b?.duration_minutes || 120;

    const check = await checkPartnerAvailabilityForBooking(
      providerId,
      bookingDate,
      bookingTime,
      durationMinutes,
      bookingId
    );

    if (!check.available) {
      return { success: false, error: `Conflit d'agenda pour ce capitaine : ${check.reason}` };
    }

    const { data: prov } = await supabase
      .from("providers")
      .select("commission_rate")
      .eq("id", providerId)
      .single();
    
    const commRate = (prov as any)?.commission_rate ?? 15.00;

    const { data: bAmounts } = await supabase
      .from("bookings")
      .select("total_amount, booking_source")
      .eq("id", bookingId)
      .single();

    const updates: any = {
      provider_id: providerId,
      boat_id: boatId
    };

    const bAmountsTyped = bAmounts as any;
    if (bAmountsTyped && bAmountsTyped.booking_source === "SAFAR_DZ") {
      const gross = bAmountsTyped.total_amount;
      const commAmount = gross * (commRate / 100);
      updates.commission_rate = commRate;
      updates.commission_amount = commAmount;
      updates.provider_amount = gross - commAmount;
    }

    const { error } = await (supabase
      .from("bookings") as any)
      .update(updates)
      .eq("id", bookingId);

    if (error) throw error;

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/availability");
    revalidatePath("/partner/bookings");
    revalidatePath("/partner/earnings");
    return { success: true };
  } catch (error: any) {
    console.error("Assignment failed:", error);
    return { success: false, error: error.message };
  }
}

export async function createAdminBooking(bookingData: {
  client_name: string;
  client_phone: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  guest_count: number;
  total_amount: number;
  provider_id?: string;
  boat_id?: string;
  booking_source: "SAFAR_DZ" | "PARTNER_DIRECT";
}) {
  try {
    await checkRole(["admin"]);
    const supabase = await createClient();

    if (bookingData.provider_id) {
      const check = await checkPartnerAvailabilityForBooking(
        bookingData.provider_id,
        bookingData.booking_date,
        bookingData.booking_time,
        bookingData.duration_minutes
      );
      if (!check.available) {
        return { success: false, error: `Conflit d'agenda pour ce capitaine : ${check.reason}` };
      }
    }

    const startMins = timeToMinutes(bookingData.booking_time);
    const endMins = startMins + bookingData.duration_minutes;
    const endTimeStr = minutesToTime(endMins);

    let commissionRate = 15;
    if (bookingData.booking_source === "PARTNER_DIRECT") {
      commissionRate = 0;
    } else if (bookingData.provider_id) {
      const { data: prov } = await supabase
        .from("providers")
        .select("commission_rate")
        .eq("id", bookingData.provider_id)
        .single();
      commissionRate = (prov as any)?.commission_rate ?? 15;
    }

    const gross = bookingData.total_amount;
    const commAmount = gross * (commissionRate / 100);
    const netAmount = gross - commAmount;

    const newBooking = {
      booking_ref: bookingData.booking_source === "PARTNER_DIRECT" 
        ? `#PR-${Math.floor(1000 + Math.random() * 9000)}`
        : `#SF-A${Math.floor(1000 + Math.random() * 9000)}`,
      client_name: bookingData.client_name,
      client_phone: bookingData.client_phone,
      booking_date: bookingData.booking_date,
      booking_time: bookingData.booking_time,
      duration_minutes: bookingData.duration_minutes,
      start_time: bookingData.booking_time,
      end_time: endTimeStr,
      guest_count: bookingData.guest_count,
      booking_type: "private",
      total_amount: gross,
      commission_amount: commAmount,
      provider_amount: netAmount,
      commission_rate: commissionRate,
      status: "confirmed" as const,
      booking_source: bookingData.booking_source,
      created_by: "ADMIN" as const,
      provider_id: bookingData.provider_id || null,
      boat_id: bookingData.boat_id || null,
      experience_id: null
    };

    const { error } = await (supabase
      .from("bookings") as any)
      .insert(newBooking);
    if (error) throw error;

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/availability");
    revalidatePath("/partner/bookings");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create admin booking:", error);
    return { success: false, error: error.message };
  }
}

export async function rescheduleAdminBooking(
  bookingId: string,
  date: string,
  time: string
) {
  try {
    await checkRole(["admin"]);
    const supabase = await createClient();

    const { data: bData } = await supabase
      .from("bookings")
      .select("provider_id, duration_minutes")
      .eq("id", bookingId)
      .single();
    const b = bData as any;
    let providerId: string | null = b?.provider_id || null;
    let durationMinutes = b?.duration_minutes || 120;

    if (providerId) {
      const check = await checkPartnerAvailabilityForBooking(
        providerId,
        date,
        time,
        durationMinutes,
        bookingId
      );
      if (!check.available) {
        return { success: false, error: `Conflit d'agenda à ce nouvel horaire : ${check.reason}` };
      }
    }

    const startMins = timeToMinutes(time);
    const endMins = startMins + durationMinutes;
    const endTimeStr = minutesToTime(endMins);

    const { error } = await (supabase
      .from("bookings") as any)
      .update({
        booking_date: date,
        booking_time: time,
        start_time: time,
        end_time: endTimeStr
      })
      .eq("id", bookingId);
    if (error) throw error;

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/availability");
    revalidatePath("/partner/bookings");
    return { success: true };
  } catch (error: any) {
    console.error("Reschedule failed:", error);
    return { success: false, error: error.message };
  }
}

export async function cancelAdminBooking(bookingId: string) {
  try {
    await checkRole(["admin"]);
    const supabase = await createClient();

    const { error } = await (supabase
      .from("bookings") as any)
      .update({ status: "cancelled" })
      .eq("id", bookingId);
    if (error) throw error;

    try {
      await createNotification({
        type: "cancellation",
        title: "Réservation annulée",
        message: `La réservation a été annulée par l'administrateur.`,
        metadata: { booking_id: bookingId },
      });
    } catch (notifErr) {
      console.error("Failed to create cancellation notification:", notifErr);
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/availability");
    revalidatePath("/partner/bookings");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Cancel failed:", error);
    return { success: false, error: error.message };
  }
}

export async function confirmAdminBooking(bookingId: string) {
  try {
    await checkRole(["admin"]);
    const supabase = await createClient();

    const { error } = await (supabase
      .from("bookings") as any)
      .update({ status: "confirmed" })
      .eq("id", bookingId);
    if (error) throw error;

    try {
      await createNotification({
        type: "payment_status",
        title: "Réservation confirmée",
        message: `La réservation a été confirmée.`,
        metadata: { booking_id: bookingId },
      });
    } catch (notifErr) {
      console.error("Failed to create confirmation notification:", notifErr);
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/availability");
    revalidatePath("/partner/bookings");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Confirm failed:", error);
    return { success: false, error: error.message };
  }
}
