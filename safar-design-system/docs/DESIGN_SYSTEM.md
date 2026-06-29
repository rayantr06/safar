# Safar DZ — Design System

Source of truth for all UI built across the three Safar DZ surfaces: the public client website, the partner dashboard, and the admin dashboard.

Stack: React + TypeScript + Tailwind CSS v4. Framework-portable (built for Next.js — uses `next/image` and `next/link` — but the tokens/CSS layer works anywhere).

## Brand Philosophy

Safar DZ is a **Mediterranean adventure** brand: marine, premium travel, nature exploration. Every interface should feel like:

- **Marine** — ocean blues, sun-drenched golds, the calm of open water.
- **Premium** — soft shadows, generous rounding, no clutter, no aggressive motion.
- **Adventurous but trustworthy** — bold enough to sell an experience, grounded enough to sell a booking.

Warm cream backgrounds and sand tones instead of stark white/gray, ocean blue as the dominant accent, sun gold reserved for highlights and calls to action, sunset tones used sparingly for energy. Motion is always smooth — fade, slide, hover-lift — never bouncy or jarring.

## Colors

| Token | Hex | Name | Usage |
|---|---|---|---|
| `--color-ocean-blue` | `#1E4DB6` | Ocean Blue | Primary — primary buttons, links, active states |
| `--color-sun-gold` | `#F9BB1A` | Sun Gold | Secondary — accents, secondary buttons, ratings/highlights |
| `--color-soft-ocean` | `#8195CD` | Soft Ocean | Accent — icons, borders, muted UI details |
| `--color-ink` | `#2E2E2E` | Dark | Body text on light surfaces |
| `--color-cream` | `#FFF8EC` | Cream | Default background |
| `--color-sand` | `#E8D9BE` | Sand | Secondary surfaces, dividers |
| `--color-sunset` | `#FF7A59` | Sunset | Sparingly — energetic accents, promo badges |

Defined in `tokens.css` and mirrored in TS at `tokens/colors.ts`. Tailwind utilities are auto-generated: `bg-ocean-blue`, `text-sun-gold`, `border-soft-ocean`, etc.

## Typography

| Font | Role | Status |
|---|---|---|
| **Cascadia Mono** | Primary UI — body, buttons, captions, controls | Substituted with **JetBrains Mono** (free Google Font, loaded via `tokens.css`) — Cascadia Mono itself wasn't found installed anywhere and has no confirmed redistributable license. |
| **Pristine Script** | Brand headings | Self-hosted — `assets/fonts/PristineScript.ttf` |
| **Kumquat** | Special adventure / experience titles | Self-hosted — `assets/fonts/Kumquat.otf` |

> **License note:** Pristine Script and Kumquat were sourced from the project owner's locally-installed font collection. **Before pushing this repo publicly, confirm the license for both files permits redistribution** — most commercial/marketplace fonts only license usage in finished designs, not redistribution of the font file itself. If the license doesn't allow it, remove the `.ttf`/`.otf` files from version control (keep them `.gitignore`'d) and distribute them separately, or swap to a properly licensed alternative.

Reusable utility classes (in `tokens.css`, mirrored in `tokens/typography.ts`):

- **Heading**: `text-safar-heading-xl` / `-lg` / `-md` / `-sm`, plus `text-safar-heading-adventure` for Kumquat titles.
- **Body**: `text-safar-body-lg` / `-md` / `-sm`.
- **Button**: `text-safar-button-lg` / `-md` / `-sm`.
- **Caption**: `text-safar-caption-md` / `-sm`.

Colors are never baked into a typography class — apply a color utility (`text-ink`, `text-ocean-blue`, etc.) separately.

## Spacing & Radius

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

Allowed: **fade**, **slide**, **hover-lift**. Nothing aggressive (no bounce, no spin-in, no large-scale pop). Easing is always `var(--ease-safar)` (`cubic-bezier(0.16, 1, 0.3, 1)`).

- `animate-safar-fade` — opacity fade in
- `animate-safar-slide-up` — fade + translate-up (drawers, panels)
- Hover-lift — composed inline: `transition-all duration-300 ease-safar hover:-translate-y-1 hover:shadow-safar-md`

## Components

```
components/   Brand-agnostic primitives: Button, Card, Badge, Input, Navbar, Modal, Avatar
marine/       Booking-domain components: ExperienceCard, BoatCard, ActivityCard
dashboard/    Dashboard-domain components: StatCard, DataTable, Notification
```

Implemented:

- **`SafarButton`** — variants `primary` / `secondary` / `outline`; sizes `small` / `medium` / `large`; states `default`, `hover`, `isLoading`, `disabled`. Tokens only, no hardcoded colors.
- **`SafarNavbar`** — `mode="marketing"` (transparent-over-hero, solidifies on scroll, mobile drawer) or `mode="dashboard"` (sidebar). Logo always rendered.
- **`ExperienceCard`** — image, title, location, duration, price, rating, CTA. Airbnb-inspired.
- **`BoatCard`** — image, boat name, capacity, captain, equipment list, price. Luxury marine styling.
- **`ActivityCard`** — image, icon, title, description, price for jetski/kayak/paddle-type activities.

Everything else (`Card`, `Badge`, `Input`, `Modal`, `Avatar`, `StatCard`, `DataTable`, `Notification`) is an empty scaffold pending implementation.

## Usage Rules

1. **Tokens only** — never a raw hex code, arbitrary shadow, or arbitrary radius value inside a component.
2. **One component per folder** — `ComponentName/ComponentName.tsx` + `ComponentName/index.ts`.
3. **Typed props** — every component exports an `XxxProps` interface.
4. **`className` passthrough** — every component accepts and merges `className` via `cn()` (`utils/cn.ts`).
5. **Primitives stay generic** — `components/` never references booking/admin/partner domain concepts; that belongs in `marine/` or `dashboard/`.
6. **Motion stays restrained** — fade, slide, hover-lift only.

## Installing into a project

```bash
npm install class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot
```

In your global CSS:

```css
@import "tailwindcss";
@import "../safar-design-system/tokens.css";
```

Then import components directly from the folder, e.g. `import { SafarButton } from "../safar-design-system/components/Button"`.
