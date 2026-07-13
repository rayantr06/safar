"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRole } from "@/lib/utils/auth-check";
import { revalidatePath } from "next/cache";
import { getMockDb, saveMockDb } from "../supabase/mock-db-helper";
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
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    const bookStart = timeToMinutes(time);
    const bookEnd = bookStart + durationMinutes;

    if (isPlaceholder) {
      const db = getMockDb();
      
      // 1. Check if the partner exists in mock db
      const partner = db.partners?.[providerId];
      if (!partner) return { available: true }; // Fallback

      // 2. Check partner's boats availability settings
      // We will check availability settings for the partner's boats
      const availabilitySettings = db.boat_availability || {};
      
      // Get all active bookings for this provider on that date
      const activeBookings = (db.bookings || []).filter(
        (b: any) =>
          b.provider_id === providerId &&
          b.booking_date === date &&
          b.status !== "cancelled" &&
          b.id !== excludeBookingId
      );

      // Check overlaps
      for (const b of activeBookings) {
        const bStart = timeToMinutes(b.booking_time || b.start_time || "09:00");
        const bDuration = b.duration_minutes || 120;
        const bEnd = bStart + bDuration;

        if (bookStart < bEnd && bStart < bookEnd) {
          return {
            available: false,
            reason: `Conflit avec la réservation ${b.booking_ref} (${b.booking_time || b.start_time} - ${minutesToTime(bEnd)})`
          };
        }
      }

      // Check if day is blocked or in maintenance in boat availability
      // We'll inspect any availability settings registered for the partner's boats
      const dateObj = new Date(date);
      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });

      for (const boatId in availabilitySettings) {
        const avail = availabilitySettings[boatId];
        // If this boat belongs to this partner (or we assume it does)
        const boatMatches = db.bookings?.some((b: any) => b.boat_id === boatId && b.provider_id === providerId) || providerId === "mock-partner-id";
        
        if (boatMatches && avail) {
          // Closed Day check
          if (avail.unavailableDays?.includes(dayName)) {
            return {
              available: false,
              reason: `Fermé le ${dateObj.toLocaleDateString("fr-FR", { weekday: "long" })} (Jour off)`
            };
          }
          // Maintenance check
          if (avail.maintenanceDates?.includes(date)) {
            return {
              available: false,
              reason: "Navire en maintenance planifiée"
            };
          }
          // Working hours check
          const workStart = timeToMinutes(avail.workingHours?.start || "08:00");
          const workEnd = timeToMinutes(avail.workingHours?.end || "20:00");
          if (bookStart < workStart || bookEnd > workEnd) {
            return {
              available: false,
              reason: `En dehors des heures de travail (${avail.workingHours?.start} - ${avail.workingHours?.end})`
            };
          }
        }
      }

      return { available: true };
    } else {
      // 1. Fetch partner's boats
      const { data: boats } = await supabase
        .from("boats")
        .select("id, name")
        .eq("provider_id", providerId);

      if (!boats || boats.length === 0) {
        return { available: true }; // No boat constraints
      }

      // 2. Fetch active bookings for this provider at this date
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

      // 3. Check boat availability settings from database
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

          // Closed day
          if (settings.unavailableDays?.includes(dayName)) {
            return {
              available: false,
              reason: `Bateau ${(boats as any[]).find(b => b.id === record.boat_id)?.name} non dispo le ${dateObj.toLocaleDateString("fr-FR", { weekday: "long" })}`
            };
          }

          // Maintenance
          if (settings.maintenanceDates?.includes(date)) {
            return {
              available: false,
              reason: `Bateau ${(boats as any[]).find(b => b.id === record.boat_id)?.name} en maintenance`
            };
          }

          // Work hours
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
    }
  } catch (error: any) {
    console.error("Availability check failed:", error);
    return { available: false, reason: error.message };
  }
}

export async function getAdminBookings() {
  try {
    await checkRole(["admin"]);
    const supabase = await createClient();
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    if (isPlaceholder) {
      const db = getMockDb();
      return { success: true, bookings: db.bookings || [] };
    } else {
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
    }
  } catch (error: any) {
    console.error("Failed to load admin bookings:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminPartners() {
  try {
    await checkRole(["admin"]);
    const supabase = await createClient();
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    if (isPlaceholder) {
      const db = getMockDb();
      const list = Object.values(db.partners || {}).map((p: any) => {
        const providerBoats = Object.values(db.boats || {}).filter((b: any) => b.provider_id === p.id);
        return {
          ...p,
          boatsList: providerBoats.length > 0 ? providerBoats : (p.id === "mock-partner-id"
            ? [{ id: "1", name: "Salim Boat", type: "Yacht" }]
            : [{ id: "2", name: "Evasion Boat", type: "Catamaran" }])
        };
      });
      return { success: true, partners: list };
    } else {
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
    }
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
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    // Load booking first to check details
    let bookingDate = "";
    let bookingTime = "";
    let durationMinutes = 120;

    if (isPlaceholder) {
      const db = getMockDb();
      const b = db.bookings?.find((b: any) => b.id === bookingId);
      if (b) {
        bookingDate = b.booking_date;
        bookingTime = b.booking_time;
        durationMinutes = b.duration_minutes || 120;
      }
    } else {
      const { data: bData } = await supabase
        .from("bookings")
        .select("booking_date, booking_time, duration_minutes")
        .eq("id", bookingId)
        .single();
      const b = bData as any;
      if (b) {
        bookingDate = b.booking_date;
        bookingTime = b.booking_time || "09:00";
        durationMinutes = b.duration_minutes || 120;
      }
    }

    // Check availability before assignment
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

    if (isPlaceholder) {
      const db = getMockDb();
      const bIdx = db.bookings?.findIndex((b: any) => b.id === bookingId);
      if (bIdx !== -1 && db.bookings) {
        const partner = db.partners?.[providerId];
        db.bookings[bIdx].provider_id = providerId;
        db.bookings[bIdx].boat_id = boatId;
        db.bookings[bIdx].partner = partner?.name || "Partenaire Assigné";
        
        // Update commission rate to the partner's rate if marketplace booking
        if (db.bookings[bIdx].booking_source === "SAFAR_DZ") {
          const rate = partner?.commission_rate || 15;
          db.bookings[bIdx].commission_rate = rate;
          const gross = db.bookings[bIdx].total_amount;
          db.bookings[bIdx].commission_amount = gross * (rate / 100);
          db.bookings[bIdx].provider_amount = gross - db.bookings[bIdx].commission_amount;
        }

        saveMockDb(db);
      }
    } else {
      // Get partner commission rate
      const { data: prov } = await supabase
        .from("providers")
        .select("commission_rate")
        .eq("id", providerId)
        .single();
      
      const commRate = (prov as any)?.commission_rate || 15.00;

      // Update in database
      const { data: bData } = await supabase
        .from("bookings")
        .select("total_amount, booking_source")
        .eq("id", bookingId)
        .single();

      const updates: any = {
        provider_id: providerId,
        boat_id: boatId
      };

      const bDataTyped = bData as any;
      if (bDataTyped && bDataTyped.booking_source === "SAFAR_DZ") {
        const gross = bDataTyped.total_amount;
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
    }

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
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    // 1. If assigned, check conflict
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

    // Resolve rates
    let commissionRate = 15;
    if (bookingData.booking_source === "PARTNER_DIRECT") {
      commissionRate = 0;
    } else if (bookingData.provider_id) {
      if (isPlaceholder) {
        commissionRate = getMockDb().partners?.[bookingData.provider_id]?.commission_rate || 15;
      } else {
        const { data: prov } = await supabase
          .from("providers")
          .select("commission_rate")
          .eq("id", bookingData.provider_id)
          .single();
        commissionRate = (prov as any)?.commission_rate || 15;
      }
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
      experience_id: "1" // Default template
    };

    if (isPlaceholder) {
      const db = getMockDb();
      if (!db.bookings) db.bookings = [];
      const created = {
        id: `b-admin-${Date.now()}`,
        created_at: new Date().toISOString(),
        partner: bookingData.provider_id ? (db.partners?.[bookingData.provider_id]?.name || "Capitaine") : "Non assigné",
        experiences: {
          title: newBooking.experience_id === "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e" || newBooking.experience_id === "2"
            ? "Sortie Pêche & Baignade - Les Falaises"
            : newBooking.experience_id === "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f"
            ? "Tour Partagé - Île des Pisans (Boulimate)"
            : "Balade privée Cap Carbon & Aiguades",
          duration_minutes: bookingData.duration_minutes,
          max_guests: 12
        },
        ...newBooking
      };
      db.bookings.push(created);
      saveMockDb(db);
    } else {
      const { error } = await (supabase
        .from("bookings") as any)
        .insert(newBooking);
      if (error) throw error;
    }

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
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    // Load booking to check provider and duration
    let providerId: string | null = null;
    let durationMinutes = 120;

    if (isPlaceholder) {
      const db = getMockDb();
      const b = db.bookings?.find((b: any) => b.id === bookingId);
      if (b) {
        providerId = b.provider_id;
        durationMinutes = b.duration_minutes || 120;
      }
    } else {
      const { data: bData } = await supabase
        .from("bookings")
        .select("provider_id, duration_minutes")
        .eq("id", bookingId)
        .single();
      const b = bData as any;
      if (b) {
        providerId = b.provider_id;
        durationMinutes = b.duration_minutes || 120;
      }
    }

    // If assigned, check conflict at the new date/time
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

    if (isPlaceholder) {
      const db = getMockDb();
      const bIdx = db.bookings?.findIndex((b: any) => b.id === bookingId);
      if (bIdx !== -1 && db.bookings) {
        db.bookings[bIdx].booking_date = date;
        db.bookings[bIdx].booking_time = time;
        db.bookings[bIdx].start_time = time;
        db.bookings[bIdx].end_time = endTimeStr;
        saveMockDb(db);
      }
    } else {
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
    }

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
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    if (isPlaceholder) {
      const db = getMockDb();
      const bIdx = db.bookings?.findIndex((b: any) => b.id === bookingId);
      if (bIdx !== -1 && db.bookings) {
        db.bookings[bIdx].status = "cancelled";
        saveMockDb(db);
      }
    } else {
      const { error } = await (supabase
        .from("bookings") as any)
        .update({ status: "cancelled" })
        .eq("id", bookingId);
      if (error) throw error;
    }

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
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

    if (isPlaceholder) {
      const db = getMockDb();
      const bIdx = db.bookings?.findIndex((b: any) => b.id === bookingId);
      if (bIdx !== -1 && db.bookings) {
        db.bookings[bIdx].status = "confirmed";
        saveMockDb(db);
      }
    } else {
      const { error } = await (supabase
        .from("bookings") as any)
        .update({ status: "confirmed" })
        .eq("id", bookingId);
      if (error) throw error;
    }

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
