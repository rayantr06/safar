// Safar DZ — Design Tokens: Shadows
// Soft, premium elevation only — no harsh or high-contrast shadows.
// Mirrors --shadow-safar-* custom properties in `src/app/globals.css`.
// Tailwind utilities: shadow-safar-sm / shadow-safar-md / shadow-safar-lg / shadow-safar-premium

export const shadows = {
  sm: "0 2px 8px rgba(30, 77, 182, 0.08)",
  md: "0 8px 24px rgba(30, 77, 182, 0.10)",
  lg: "0 16px 40px rgba(30, 77, 182, 0.12)",
  premium: "0 24px 64px rgba(30, 77, 182, 0.16)",
} as const;

export type Shadows = typeof shadows;
