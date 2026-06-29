// Safar DZ — Design Tokens: Spacing
// Mirrors --spacing-* custom properties in `src/app/globals.css`.

export const spacing = {
  gutter: "24px",
  containerMax: "1280px",
  marginDesktop: "40px",
  marginMobile: "16px",
} as const;

export type Spacing = typeof spacing;
