"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { generateBookingRef, calculateCommission } from "@/lib/utils/booking-ref";
import { revalidatePath } from "next/cache";

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
};

export async function createBooking(data: BookingRequest) {
  const supabase = createAdminClient() as any;

  try {
    // 1. Calculate financial splits (SafarDZ takes 15%)
    const finance = calculateCommission(data.total_amount, 15);
    const bookingRef = generateBookingRef();

    // 2. Fetch the provider_id for this experience to link the booking to the correct partner
    const { data: expData, error: expError } = await supabase
      .from("experiences")
      .select("boats(provider_id)")
      .eq("id", data.experience_id)
      .single();

    if (expError) throw new Error("Experience introuvable");
    const providerId = expData?.boats?.provider_id;

    // 3. Insert into bookings table
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
        status: "new",
        booking_date: data.booking_date,
        booking_time: data.booking_time,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // 3. Update booked seats in time_slot if it's a shared experience
    if (data.time_slot_id && data.booking_type === "shared") {
      // In a real production app, we would use an RPC call to avoid race conditions
      // For MVP, we do a simple read then update
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
