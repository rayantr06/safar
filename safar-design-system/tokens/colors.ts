// Safar DZ Design System — Tokens: Colors
// Mirrors the CSS custom properties in ../tokens.css. Use this when a token
// value is needed in JS/TS (charts, canvas, inline SVG) rather than as a
// Tailwind utility class.

export const colors = {
  primary: { DEFAULT: "#1E4DB6", name: "Ocean Blue" },
  secondary: { DEFAULT: "#F9BB1A", name: "Sun Gold" },
  accent: { DEFAULT: "#8195CD", name: "Soft Ocean" },
  dark: { DEFAULT: "#2E2E2E", name: "Ink" },
  neutral: {
    cream: "#FFF8EC",
    sand: "#E8D9BE",
    sunset: "#FF7A59",
  },
} as const;

export type Colors = typeof colors;
