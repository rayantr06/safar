// Safar DZ — Design Tokens: Typography
// Mirrors font-family + utility classes added to `src/app/globals.css`.
//
// Fonts:
// - Cascadia Mono   → primary UI (body, buttons, captions, controls)
// - Pristine Script → brand headings
// - Kumquat         → special adventure / experience titles
//
// Note: Cascadia Mono, Pristine Script and Kumquat are not Google Fonts —
// the actual font files must be self-hosted (e.g. @font-face in globals.css
// or next/font/local) for these to render as intended. Fallback stacks are
// provided below so the UI degrades gracefully until then.

export const fontFamily = {
  ui: "'Cascadia Mono', ui-monospace, monospace",
  heading: "'Pristine Script', cursive",
  adventure: "'Kumquat', cursive",
} as const;

export const headingStyles = {
  xl: { fontSize: "56px", lineHeight: 1.1, fontWeight: 700, fontFamily: "heading", twClassName: "text-safar-heading-xl" },
  lg: { fontSize: "40px", lineHeight: 1.15, fontWeight: 700, fontFamily: "heading", twClassName: "text-safar-heading-lg" },
  md: { fontSize: "28px", lineHeight: 1.2, fontWeight: 600, fontFamily: "heading", twClassName: "text-safar-heading-md" },
  sm: { fontSize: "22px", lineHeight: 1.25, fontWeight: 600, fontFamily: "heading", twClassName: "text-safar-heading-sm" },
  adventure: { fontSize: "26px", lineHeight: 1.2, fontWeight: 600, fontFamily: "adventure", twClassName: "text-safar-heading-adventure" },
} as const;

export const bodyStyles = {
  lg: { fontSize: "18px", lineHeight: 1.6, fontWeight: 400, fontFamily: "ui", twClassName: "text-safar-body-lg" },
  md: { fontSize: "16px", lineHeight: 1.55, fontWeight: 400, fontFamily: "ui", twClassName: "text-safar-body-md" },
  sm: { fontSize: "14px", lineHeight: 1.5, fontWeight: 400, fontFamily: "ui", twClassName: "text-safar-body-sm" },
} as const;

export const buttonStyles = {
  lg: { fontSize: "16px", lineHeight: 1.2, fontWeight: 600, letterSpacing: "0.01em", fontFamily: "ui", twClassName: "text-safar-button-lg" },
  md: { fontSize: "14px", lineHeight: 1.2, fontWeight: 600, letterSpacing: "0.01em", fontFamily: "ui", twClassName: "text-safar-button-md" },
  sm: { fontSize: "13px", lineHeight: 1.2, fontWeight: 600, letterSpacing: "0.01em", fontFamily: "ui", twClassName: "text-safar-button-sm" },
} as const;

export const captionStyles = {
  md: { fontSize: "13px", lineHeight: 1.4, fontWeight: 500, fontFamily: "ui", twClassName: "text-safar-caption-md" },
  sm: { fontSize: "11px", lineHeight: 1.4, fontWeight: 500, fontFamily: "ui", twClassName: "text-safar-caption-sm" },
} as const;

export const typography = {
  fontFamily,
  heading: headingStyles,
  body: bodyStyles,
  button: buttonStyles,
  caption: captionStyles,
} as const;

export type Typography = typeof typography;
