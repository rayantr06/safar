# Safar DZ — Design System

Source of truth for all UI built across the three Safar DZ surfaces: the public client website, the partner dashboard, and the admin dashboard.

Stack: React + TypeScript + Tailwind CSS v4 (token-driven via `src/app/globals.css`).

## Brand Philosophy

Safar DZ is a **Mediterranean adventure** brand: marine, premium travel, nature exploration. Every interface should feel like:

- **Marine** — ocean blues, sun-drenched golds, the calm of open water.
- **Premium** — soft shadows, generous rounding, no clutter, no aggressive motion.
- **Adventurous but trustworthy** — bold enough to sell an experience, grounded enough to sell a booking.

Concretely: warm cream backgrounds and sand tones instead of stark white/gray, ocean blue as the dominant accent, sun gold reserved for highlights and calls to action, sunset tones used sparingly for energy. Motion is always smooth — fade, slide, hover-lift — never bouncy or jarring.

## Colors

| Token | Hex | Name | Usage |
|---|---|---|---|
| `--color-ocean-blue` | `#1E4DB6` | Ocean Blue | Primary brand color — primary buttons, links, active states |
| `--color-sun-gold` | `#F9BB1A` | Sun Gold | Secondary — accents, secondary buttons, ratings/highlights |
| `--color-soft-ocean` | `#8195CD` | Soft Ocean | Accent — icons, borders, muted UI details |
| `--color-ink` | `#2E2E2E` | Dark | Body text on light surfaces |
| `--color-cream` | `#FFF8EC` | Cream | Default background |
| `--color-sand` | `#E8D9BE` | Sand | Secondary surfaces, dividers |
| `--color-sunset` | `#FF7A59` | Sunset | Sparingly — energetic accents, promo badges |

Defined in `src/app/globals.css` (`@theme inline`) and mirrored in TS at `src/design-system/tokens/colors.ts`. Tailwind utilities are auto-generated: `bg-ocean-blue`, `text-sun-gold`, `border-soft-ocean`, etc.

These are additive to the legacy Material-style tokens already in `globals.css` (`primary`, `secondary`, `surface`, etc.) used by the existing live site — that palette is untouched. New components in `src/design-system/**` use the brand palette above exclusively.

## Typography

| Font | Role |
|---|---|
| **Cascadia Mono** | Primary UI — body text, buttons, captions, form controls |
| **Pristine Script** | Brand headings |
| **Kumquat** | Special adventure / experience titles (card titles, hero callouts) |

> Cascadia Mono, Pristine Script, and Kumquat are not Google Fonts. The actual font files must be self-hosted (`@font-face` in `globals.css`, or `next/font/local`) before these render as intended — fallback stacks (`ui-monospace`/`cursive`) are wired up so the UI degrades gracefully in the meantime.

Reusable utility classes (`src/app/globals.css`) and their TS mirror (`src/design-system/tokens/typography.ts`):

- **Heading**: `text-safar-heading-xl` / `-lg` / `-md` / `-sm`, plus `text-safar-heading-adventure` for Kumquat titles.
- **Body**: `text-safar-body-lg` / `-md` / `-sm`.
- **Button**: `text-safar-button-lg` / `-md` / `-sm`.
- **Caption**: `text-safar-caption-md` / `-sm`.

Colors are never baked into a typography class — apply a color utility (`text-ink`, `text-ocean-blue`, etc.) separately so type and color stay independently composable.

## Spacing & Radius

Spacing follows the existing scale (`--spacing-gutter`, `--spacing-container-max`, `--spacing-margin-desktop/mobile`) in `globals.css`.

Border radius (brand-specific, additive to the existing `--radius-sm..3xl` scale):

| Token | Value | Utility |
|---|---|---|
| Small | `12px` | `rounded-safar-sm` |
| Medium | `20px` | `rounded-safar-md` |
| Premium | `32px` | `rounded-safar-premium` |

## Shadows

Soft, premium elevation only — never harsh or high-contrast:

| Token | Utility |
|---|---|
| `--shadow-safar-sm` | `shadow-safar-sm` |
| `--shadow-safar-md` | `shadow-safar-md` |
| `--shadow-safar-lg` | `shadow-safar-lg` |
| `--shadow-safar-premium` | `shadow-safar-premium` |

## Motion

Allowed: **fade**, **slide**, **hover-lift**. Nothing aggressive (no bounce, no spin-in, no large-scale pop).

- `animate-safar-fade` — opacity fade in
- `animate-safar-slide-up` — fade + translate-up (drawers, panels)
- Hover-lift — composed inline per component: `transition-all duration-300 ease-safar hover:-translate-y-1 hover:shadow-safar-md`

Easing is always `var(--ease-safar)` (`cubic-bezier(0.16, 1, 0.3, 1)`).

## Components

Located under `src/design-system/`:

```
components/   Brand-agnostic primitives: Button, Card, Badge, Input, Navbar, Modal, Avatar
marine/       Booking-domain components: ExperienceCard, BoatCard, ActivityCard
dashboard/    Dashboard-domain components: StatCard, DataTable, Notification
```

Implemented so far:

- **`SafarButton`** (`components/Button`) — variants `primary` / `secondary` / `outline`; sizes `small` / `medium` / `large`; states `default`, `hover`, `isLoading`, `disabled`. Built with `class-variance-authority`, tokens only, no hardcoded colors.
- **`SafarNavbar`** (`components/Navbar`) — `mode="marketing"` renders a transparent-over-hero header that solidifies on scroll with a mobile drawer; `mode="dashboard"` renders a sidebar nav. Logo is always rendered, never optional.
- **`ExperienceCard`** (`marine/ExperienceCard`) — image, title, location, duration, price, rating, CTA. Airbnb-inspired large-image layout.
- **`BoatCard`** (`marine/BoatCard`) — image, boat name, capacity, captain, equipment list, price. Luxury marine styling.
- **`ActivityCard`** (`marine/ActivityCard`) — image, icon, title, description, price for jetski/kayak/paddle-type activities.

Everything else in `components/`, `dashboard/` is scaffolded as an empty placeholder (`ComponentName.tsx` + `index.ts`) pending implementation.

## Usage Rules

1. **Tokens only.** Never write a raw hex code, arbitrary shadow, or arbitrary radius value inside a component. If a value doesn't exist as a token yet, add it to `globals.css` + the matching file in `tokens/` first.
2. **One component per folder.** `ComponentName/ComponentName.tsx` + `ComponentName/index.ts`. Keeps room for colocated tests/sub-parts later.
3. **Typed props.** Every component exports an `XxxProps` interface.
4. **`className` passthrough.** Every component accepts and merges `className` via `cn()` (`src/lib/utils/cn.ts`) so consumers can extend, never override via inline style.
5. **Primitives stay generic.** `components/` must never reference booking/admin/partner domain concepts — that belongs in `marine/` or `dashboard/`.
6. **Motion stays restrained.** Fade, slide, hover-lift — nothing else, per Brand Philosophy above.
7. **No new pages.** This design system is foundation-only; wiring it into `src/app/**` routes is a separate, deliberate step.
