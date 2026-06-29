# Safar DZ — Design System

Tokens, components, and brand assets for Safar DZ: the public client website, the partner dashboard, and the admin dashboard. Mediterranean adventure / marine / premium travel.

React + TypeScript + Tailwind CSS v4.

## What's in here

```
safar-design-system/
  tokens.css        Portable CSS — colors, radius, shadows, fonts, motion (import this)
  tokens/            TS mirror of the above, for use outside CSS (charts, etc.)
  utils/cn.ts        clsx + tailwind-merge helper used by every component
  components/        Button, Card, Badge, Input, Navbar, Modal, Avatar
  marine/            ExperienceCard, BoatCard, ActivityCard
  dashboard/         StatCard, DataTable, Notification
  assets/
    logo/            logo.png
    fonts/           PristineScript.ttf, Kumquat.otf
  docs/
    DESIGN_SYSTEM.md Full reference: brand philosophy, tokens, components, usage rules
  index.ts           Single barrel import
```

## Status

Implemented and working today: **`SafarButton`**, **`SafarNavbar`**, **`ExperienceCard`**, **`BoatCard`**, **`ActivityCard`**, plus the full token set. Everything else under `components/` and `dashboard/` is an empty, typed scaffold ready to be filled in.

## Quick start

```bash
npm install class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot
```

```css
/* your global.css */
@import "tailwindcss";
@import "../safar-design-system/tokens.css";
```

```tsx
import { SafarButton } from "../safar-design-system/components/Button";

<SafarButton variant="primary" size="medium">Réserver</SafarButton>
```

See [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) for the full brand and usage reference.

## ⚠️ Before making this repo public

This folder bundles two font files in `assets/fonts/` (`PristineScript.ttf`, `Kumquat.otf`) sourced from a locally-installed font collection. **Verify you have a license that permits redistributing these files** before pushing publicly — most commercial/marketplace script and display fonts license *usage* in finished designs but explicitly forbid redistributing the font file itself. If your license doesn't cover redistribution:

- Remove the two files from git tracking (add them to `.gitignore`), and
- Document in your README where teammates should source/purchase them instead.

`logo.png` is your own brand asset and isn't affected by this.
