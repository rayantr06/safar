// Safar DZ — Design Tokens: Border Radius
// Mirrors --radius-safar-* custom properties in `src/app/globals.css`.
// Tailwind utilities: rounded-safar-sm / rounded-safar-md / rounded-safar-premium

export const radius = {
  small: "12px",
  medium: "20px",
  premium: "32px",
} as const;

export type Radius = typeof radius;
