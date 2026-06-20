// Safar DZ — Booking Reference Generator
// Format: SF-XXXX (4 digit unique reference)

/**
 * Generate a unique booking reference
 * Format: SF-XXXX where X is a digit
 */
export function generateBookingRef(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `SF-${digits}`;
}

/**
 * Generate a slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Calculate commission amounts
 */
export function calculateCommission(
  totalCentimes: number,
  commissionRate: number = 15,
  commissionType: "percentage" | "fixed" = "percentage"
) {
  let commissionAmount = 0;
  if (commissionType === "fixed") {
    // commissionRate is given in DZD, convert it to centimes for calculation
    commissionAmount = Math.min(totalCentimes, Math.round(commissionRate * 100));
  } else {
    commissionAmount = Math.round(totalCentimes * (commissionRate / 100));
  }
  const providerAmount = Math.max(0, totalCentimes - commissionAmount);
  return {
    totalAmount: totalCentimes,
    commissionAmount,
    providerAmount,
    commissionRate,
    commissionType,
  };
}
