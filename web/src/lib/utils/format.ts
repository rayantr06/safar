// Safar DZ — Formatting Utilities

/**
 * Format price in Algerian Dinar (DA)
 * Amounts stored in centimes → display in DA
 */
export function formatPrice(centimes: number): string {
  const da = centimes / 100;
  return new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(da);
}

/**
 * Format price with DA suffix
 */
export function formatPriceDA(centimes: number): string {
  return `${formatPrice(centimes)} DA`;
}

/**
 * Format a date string to localized french format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Format a short date (e.g., "15 Juil")
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

/**
 * Format time from "HH:MM:SS" or "HH:MM" to "HHhMM"
 */
export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  return `${hours}h${minutes}`;
}

/**
 * Calculate time remaining from now to a target time today
 * Returns minutes remaining or null if past
 */
export function getMinutesUntil(timeStr: string, dateStr?: string): number | null {
  const now = new Date();
  const target = dateStr ? new Date(`${dateStr}T${timeStr}`) : new Date();
  if (!dateStr) {
    target.setHours(
      parseInt(timeStr.split(":")[0]),
      parseInt(timeStr.split(":")[1]),
      0, 0
    );
  }
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;
  return Math.floor(diff / 60000);
}

/**
 * Format relative time (e.g., "il y a 2h", "il y a 3j")
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins}min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return formatDateShort(dateStr);
}

/**
 * Format phone number for display (+213 XXX XXX XXX)
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("213")) {
    const local = cleaned.slice(3);
    return `+213 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  if (cleaned.startsWith("0")) {
    return `+213 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Generate WhatsApp link with pre-filled message
 */
export function getWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const number = cleaned.startsWith("0") ? `213${cleaned.slice(1)}` : cleaned;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
