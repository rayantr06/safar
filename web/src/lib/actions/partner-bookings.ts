"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const supabase = (await createClient()) as any;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé");

    // Verify this booking belongs to the provider
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("provider_id, status")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) throw new Error("Réservation introuvable");
    if (booking.provider_id !== user.id) throw new Error("Action non autorisée sur cette réservation");

    // Update status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (updateError) throw updateError;

    // Log status history
    await supabase.from("booking_status_history").insert({
      booking_id: bookingId,
      old_status: booking.status,
      new_status: newStatus,
      changed_by: user.id,
      note: "Statut mis à jour par le partenaire",
    });

    revalidatePath("/partner/bookings");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur mise à jour statut:", error);
    return { success: false, error: error.message };
  }
}
