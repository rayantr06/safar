// Safar DZ — Design Tokens: Animations
// Smooth, restrained motion only (fade / slide / hover-lift) — no aggressive
// or bouncy animation. Mirrors keyframes + utility classes added to
// `src/app/globals.css` under "Safar DZ Brand Tokens".

export const duration = {
  fast: "150ms",
  base: "250ms",
  slow: "400ms",
} as const;

export const easing = {
  standard: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const presets = {
  fadeIn: { twClassName: "animate-safar-fade", duration: duration.base, easing: easing.standard },
  slideUp: { twClassName: "animate-safar-slide-up", duration: duration.slow, easing: easing.standard },
  hoverLift: {
    twClassName: "transition-all duration-300 ease-safar hover:-translate-y-1 hover:shadow-safar-md",
    duration: duration.base,
    easing: easing.standard,
  },
} as const;

export type Presets = typeof presets;
