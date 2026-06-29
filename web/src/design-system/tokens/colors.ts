// Safar DZ — Design Tokens: Colors
// Canonical brand palette (Mediterranean adventure / marine / premium travel).
// Mirrors the CSS custom properties added to `src/app/globals.css` under
// "Safar DZ Brand Tokens" — keep both in sync.
//
// These are additive to (not a replacement of) the legacy Material-style
// tokens already used by the live site (primary/secondary/surface/etc. in
// globals.css). New components built in src/design-system/** must use this
// palette exclusively — never hardcode hex values in component files.

export const colors = {
  primary: {
    DEFAULT: "#1E4DB6",
    name: "Ocean Blue",
  },
  secondary: {
    DEFAULT: "#F9BB1A",
    name: "Sun Gold",
  },
  accent: {
    DEFAULT: "#8195CD",
    name: "Soft Ocean",
  },
  dark: {
    DEFAULT: "#2E2E2E",
    name: "Ink",
  },
  neutral: {
    cream: "#FFF8EC",
    sand: "#E8D9BE",
    sunset: "#FF7A59",
  },
} as const;

export type Colors = typeof colors;
