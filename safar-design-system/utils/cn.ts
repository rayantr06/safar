// Safar DZ Design System — Utility: cn()
// Combines clsx + tailwind-merge for conditional class names.

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
