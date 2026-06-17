// Safar DZ — Utility: cn() helper
// Combines clsx + tailwind-merge for conditional class names

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
