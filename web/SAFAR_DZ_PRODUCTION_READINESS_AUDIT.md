# SAFAR DZ V2 — Production Readiness Audit (Phase 3.1 + 3.2)

> **Date:** 2026-07-27
> **Status:** READ-ONLY audit — no code changes made

---

## 1. Environment Variables

| Variable | Present | Value Source | Status |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | `.env.local` → `hhcqmgqaezmnufqyrbso.supabase.co` | READY |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | `.env.local` (anon JWT) | READY |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | `.env.local` (service-role JWT) | READY |
| `NEXT_PUBLIC_SITE_URL` | ❌ | Only in `.env.example` as `https://safardz.com` | NEEDS CONFIGURATION |
| `DATABASE_URL` | ✅ | `.env.local` → localhost (unused in app code) | NOT APPLICABLE |

**Assessment:** Core environment variables are set. `NEXT_PUBLIC_SITE_URL` is not set in `.env.local` but the app hardcodes `https://safardz.com` in sitemap and metadata. Add `NEXT_PUBLIC_SITE_URL=https://safardz.com` to `.env.local` for completeness.

---

## 2. Supabase Production Configuration

| Item | Status |
|---|---|
| Connected to real Supabase project | ✅ READY |
| Project URL: `hhcqmgqaezmnufqyrbso.supabase.co` | ✅ READY |
| 9 sequential migrations | ✅ READY |
| RLS enabled on all tables | ✅ READY |
| Atomic booking functions with advisory locking | ✅ READY |
| Storage bucket `media` (public) | ✅ READY |
| SECURITY DEFINER functions (is_admin, atomic_create_booking, atomic_create_partner_booking) | ✅ READY |

**Assessment:** Supabase project is properly configured with production schema, RLS, and atomic functions.

---

## 3. Supabase Auth Configuration

| Item | Status |
|---|---|
| Email/password authentication | ✅ READY |
| Login page (`/login`) | ✅ READY |
| Portal login page (`/portal-login`) for admin/partner | ✅ READY |
| Role-based redirect after login | ✅ READY |
| Sign-out route (`/auth/signout`) | ✅ READY |
| Session refresh in middleware | ✅ READY |
| Prefetch skip to prevent refresh token race | ✅ READY |
| `safar_role` cookie cleared on signout | ✅ READY |

**Assessment:** Authentication flow is complete and production-ready.

---

## 4. Database Migrations

| Migration | Purpose | Status |
|---|---|---|
| 001_initial_schema.sql | Core tables: profiles, providers, boats, destinations, experiences, bookings, etc. + RLS | ✅ APPLIED |
| 002_platform_enhancements.sql | Accommodations, notifications, experience extensions | ✅ APPLIED |
| 003_admin_partner_persistence.sql | Provider columns, RLS on providers/site_content | ✅ APPLIED |
| 004_schema_hardening.sql | Client-booking link, role widening, content status, indexes | ✅ APPLIED |
| 005_storage_bucket.sql | Media storage bucket with RLS | ✅ APPLIED |
| 006_fix_profiles_rls_recursion.sql | SECURITY DEFINER is_admin() to fix infinite recursion | ✅ APPLIED |
| 007_rls_and_atomic_bookings.sql | Atomic booking functions with pg_advisory_xact_lock | ✅ APPLIED |
| 008_fix_partner_booking_experience_id.sql | Fix hardcoded experience_id='1' in partner booking fn | ✅ APPLIED |
| 009_create_contact_messages.sql | Contact messages table with public insert policy | ✅ APPLIED |

**Assessment:** All 9 migrations are sequential, well-documented, and applied. UUID primary keys, proper foreign keys, appropriate constraints. No migration modifications needed.

---

## 5. RLS Policies Matrix

### profiles
| Operation | Policy | Status |
|---|---|---|
| SELECT (own) | `id = auth.uid()` | ✅ |
| SELECT (admin) | `is_admin()` SECURITY DEFINER | ✅ |
| INSERT | No explicit policy → only service-role inserts (admin creates users) | ⚠️ Acceptable |
| UPDATE | No explicit policy → service-role only | ⚠️ Acceptable |

### providers
| Operation | Policy | Status |
|---|---|---|
| ALL (own) | `id = auth.uid()` | ✅ |
| ALL (admin) | `role = 'admin'` check | ✅ |

### boats
| Operation | Policy | Status |
|---|---|---|
| ALL (own) | `provider_id = auth.uid()` | ✅ |
| ALL (admin) | `role = 'admin'` check | ✅ |

### experiences
| Operation | Policy | Status |
|---|---|---|
| SELECT (public) | `is_published = true` (synced from `status` column via trigger) | ✅ |
| SELECT (provider own) | Via boat ownership | ✅ |
| ALL (admin) | `role = 'admin'` check | ✅ |

### bookings
| Operation | Policy | Status |
|---|---|---|
| ALL (admin) | `role = 'admin'` check | ✅ |
| SELECT (provider) | `provider_id = auth.uid()` | ✅ |
| INSERT (provider) | `provider_id = auth.uid() AND created_by = 'PARTNER'` | ✅ |
| UPDATE (provider) | `provider_id = auth.uid()` | ✅ |
| SELECT (client) | `client_id = auth.uid()` | ✅ |

### destinations
| Operation | Policy | Status |
|---|---|---|
| SELECT (public) | `true` (all) | ✅ |
| ALL (admin) | `role = 'admin'` check | ✅ |

### contact_messages
| Operation | Policy | Status |
|---|---|---|
| INSERT (public) | `true` (anyone can submit contact form) | ✅ |
| ALL (admin) | `role = 'admin'` check | ✅ |

### accommodations
| Operation | Policy | Status |
|---|---|---|
| SELECT (public) | `is_active = true` | ✅ |
| ALL (admin) | `role = 'admin'` check | ✅ |

### notifications
| Operation | Policy | Status |
|---|---|---|
| SELECT (own) | `user_id = auth.uid()` | ✅ |
| ALL (admin) | `role = 'admin'` check | ✅ |

### boat_availability
| Operation | Policy | Status |
|---|---|---|
| SELECT (public) | `true` | ✅ |
| ALL (provider own) | Via boat ownership | ✅ |
| ALL (admin) | `role = 'admin'` check | ✅ |

### experience_images
| Operation | Policy | Status |
|---|---|---|
| SELECT (public) | `true` | ✅ |
| ALL (admin) | `role = 'admin'` check | ✅ |

### booking_status_history
| Operation | Policy | Status |
|---|---|---|
| ALL (admin) | `role = 'admin'` check | ✅ |
| SELECT (provider) | Via booking ownership | ✅ |

### provider_payouts
| Operation | Policy | Status |
|---|---|---|
| ALL (admin) | `role = 'admin'` check | ✅ |
| SELECT (provider own) | `provider_id = auth.uid()` | ✅ |

### site_content
| Operation | Policy | Status |
|---|---|---|
| SELECT (public) | `true` | ✅ |
| ALL (admin) | `role = 'admin'` check | ✅ |

### notification_settings
| Operation | Policy | Status |
|---|---|---|
| SELECT (public) | `true` | ✅ |
| ALL (admin) | `role = 'admin'` check | ✅ |

**Assessment:** All 16 tables have RLS enabled. Policies correctly enforce role-based access. Provider A cannot access Provider B's data. Clients can only read their own bookings. Partners cannot modify commission settings (admin-only). Public can only read published content.

---

## 6. Server-Only Secrets

| Item | Status |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` usage | `src/lib/supabase/admin.ts` (server-side only) + `setup-admin.mjs` (standalone script) |
| Client-side leakage | None found — `createAdminClient()` is never imported in `"use client"` components |
| `as any` cast on admin client calls | Extensive (~57 instances) — functional but undermines type safety |

**Assessment:** No secrets exposed to client. `as any` casts are a code quality concern, not a security issue.

---

## 7. Client-Side Environment Variables

| Variable | Exposed to client | Safe? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | ✅ Yes — this is the public project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | ✅ Yes — anon key is designed for client use |

**Assessment:** Only safe `NEXT_PUBLIC_` variables are exposed.

---

## 8. Next.js Production Configuration

| Item | Status |
|---|---|
| `next.config.ts` present | ✅ READY |
| Security headers (HSTS, X-Frame-Options DENY, nosniff, etc.) | ✅ READY |
| Image optimization (remotePatterns) | ⚠️ `hostname: "**"` allows all domains — consider restricting |
| `output` mode | Not set (default) | ✅ OK for Vercel |
| `eslint` config | Uses `eslint-config-next/core-web-vitals + typescript` | ✅ READY |
| `turbopack.root` warning | Build warns about multiple lockfiles | ⚠️ NEEDS FIX (cosmetic) |
| Middleware deprecation warning | Next.js 16 warns middleware is deprecated → use `proxy` | ⚠️ NEEDS ATTENTION (not blocking) |

---

## 9. Image Optimization

| Item | Status |
|---|---|
| `remotePatterns` configured | ✅ |
| `hostname: "**"` allows all domains | ⚠️ Should restrict to Supabase storage + Unsplash for production |
| `next/image` used in layouts | ✅ |
| Logo served from `/public/logo.png` | ✅ |

---

## 10. Domain Configuration

| Item | Status |
|---|---|
| `metadataBase` in root layout | `https://safardz.com` | ✅ |
| `sitemap.ts` base URL | `https://safardz.com` | ✅ |
| `robots.ts` sitemap URL | `https://safardz.com/sitemap.xml` | ✅ |
| Canonical URL | `/` | ✅ |
| `NEXT_PUBLIC_SITE_URL` env var | Not in `.env.local` | ⚠️ NEEDS CONFIGURATION |

---

## 11. Middleware

| Item | Status |
|---|---|
| Middleware file | `src/middleware.ts` → delegates to `src/lib/supabase/middleware.ts` |
| Prefetch skip | Prevents refresh token race conditions | ✅ |
| Auth check | `supabase.auth.getUser()` | ✅ |
| Route protection | Admin, partner, client routes | ✅ |
| Role-based redirects | Correct for admin/provider/client | ✅ |
| Session cookie propagation | Properly handled with `redirectWithSession` helper | ✅ |

---

## 12. Authentication Redirects

| Route | Unauthenticated | Wrong Role |
|---|---|---|
| `/admin/*` | → `/portal-login` | Provider → `/partner`, Client → `/client` |
| `/partner/*` | → `/portal-login` | Admin → `/admin`, Client → `/client` |
| `/client/*` | → `/login` | Admin → `/admin`, Provider → `/partner` |
| `/login` | Accessible | N/A |
| `/portal-login` | Accessible | N/A |

**Assessment:** All redirects are correct and bidirectional.

---

## 13. Error Handling

| Item | Status |
|---|---|
| Root `error.tsx` | ✅ Present with retry/home actions |
| `not-found.tsx` | ✅ Present with home/explorations CTAs |
| Server action error handling | ✅ All return `{ success, error }` structure |
| `console.error` in server actions | ✅ Appropriate for server-side logging |
| `console.error` in client components | ⚠️ ~15 instances should use toast instead |
| `alert()` calls | ⚠️ **43 instances** across admin/partner/booking components |

---

## 14. Production Logging

| Item | Status |
|---|---|
| `console.error` in server actions | ✅ Appropriate |
| `console.error` in client components | ⚠️ Should use toast/notification |
| `console.log` | ✅ None found |
| Structured logging | ❌ Not implemented — uses raw `console.error` |

---

## 15. Security Headers

| Header | Value | Status |
|---|---|---|
| `X-DNS-Prefetch-Control` | `on` | ✅ |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | ✅ |
| `X-Frame-Options` | `DENY` | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `Referrer-Policy` | `origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | ✅ |

---

## 16. CORS

| Item | Status |
|---|---|
| Default Next.js CORS | ✅ Same-origin only |
| Supabase CORS | Managed in Supabase dashboard |
| No custom CORS configuration needed | ✅ |

---

## 17. Rate Limiting

| Endpoint | Rate Limited | Status |
|---|---|---|
| Contact form (`/contact`) | ❌ No | ⚠️ NEEDS IMPLEMENTATION |
| Booking submission | Atomic RPC prevents double-booking but no rate limiting | ⚠️ NEEDS IMPLEMENTATION |
| Login attempts | Supabase handles brute-force protection | ✅ |
| Admin/partner actions | Middleware + role checks | ✅ |

---

## 18. Contact Form Protection

| Item | Status |
|---|---|
| Server-side validation | ✅ Full validation in `contact.ts` |
| RLS: public insert only | ✅ |
| No CAPTCHA/reCAPTCHA | ⚠️ Missing |
| No rate limiting | ⚠️ Missing |
| Database persistence | ✅ Real Supabase insert |
| Admin can view/manage | ✅ Via `getContactMessages()` |

---

## 19. Booking Protection

| Item | Status |
|---|---|
| Atomic RPC with advisory locking | ✅ Prevents double-booking |
| Experience/boat validation server-side | ✅ |
| Capacity checking (shared bookings) | ✅ |
| Client can only see own bookings | ✅ RLS policy |
| Partner can only see own bookings | ✅ RLS policy + server action auth check |
| No fake data in booking creation | ⚠️ See "Hardcoded Fallbacks" section below |

---

## 20. Database Backup Strategy

| Item | Status |
|---|---|
| Supabase automatic backups | Depends on Supabase plan (Free: 7-day, Pro: 30-day PITR) |
| Manual backup option | Available via Supabase dashboard |
| Migration-based schema | ✅ Version controlled in `supabase/migrations/` |

---

## 21. SEO

| Item | Status |
|---|---|
| Root metadata (title, description, keywords) | ✅ Comprehensive |
| Open Graph metadata | ✅ Full OG config with images |
| Twitter Card metadata | ✅ summary_large_image |
| Canonical URL | ✅ |
| `robots.ts` | ✅ Disallows admin/partner/client/auth |
| `sitemap.ts` | ⚠️ Static only — does not fetch dynamic slugs |
| Page-level metadata | Needs verification per page |
| `lang="fr"` | ✅ |

---

## 22. Sitemap

| Item | Status |
|---|---|
| Static routes | ✅ Lists 8 primary pages |
| Dynamic experience slugs | ❌ Not fetched from database |
| Dynamic destination slugs | ❌ Not fetched from database |
| Dynamic accommodation slugs | ❌ Not fetched from database |
| Sitemap URL in robots.txt | ✅ `https://safardz.com/sitemap.xml` |

---

## 23. Favicon and Site Icons

| Item | Status |
|---|---|
| `favicon.ico` | ✅ At `src/app/favicon.ico` |
| Apple touch icon | ❌ Not found |
| `manifest.json` / `site.webmanifest` | ❌ Not found |
| Multiple icon sizes | ❌ Not found |

---

## 24. 404 Page

| Item | Status |
|---|---|
| Custom `not-found.tsx` | ✅ Present with branded design |
| Home link | ✅ |
| Experiences link | ✅ |

---

## 25. Error Page

| Item | Status |
|---|---|
| Custom `error.tsx` | ✅ Present with retry/home |
| `console.error` logging | ✅ |
| Client component | ✅ `"use client"` |

---

## 26. Loading States

| Item | Status |
|---|---|
| Route-level `loading.tsx` | ❌ Not found |
| Component-level spinners | ✅ Present in booking flow, forms |
| Skeleton states | ❌ Not implemented |

---

## 27. Empty States

| Item | Status |
|---|---|
| Booking list empty state | ✅ "Aucune réservation trouvée" |
| Generic empty state component | ✅ `src/components/ui/empty-state.tsx` |

---

## 28. Mobile Responsiveness

| Item | Status |
|---|---|
| Tailwind responsive utilities | ✅ Used throughout |
| Mobile bottom navigation | ✅ Admin + Partner + Public |
| Mobile-first grid layouts | ✅ |
| Touch-friendly tap targets | ✅ |

---

## 29. Accessibility

| Item | Status |
|---|---|
| `lang="fr"` on `<html>` | ✅ |
| Semantic HTML | Partial — some interactive elements lack ARIA |
| Keyboard navigation | Partial |
| Color contrast | Uses Material Design 3 tokens | ✅ |
| Screen reader support | Minimal |

---

## 30. Analytics

| Item | Status |
|---|---|
| Google Analytics | ❌ Not configured |
| Vercel Analytics | ❌ Not configured |
| Plausible/Umami | ❌ Not configured |

---

## 31. Hardcoded Fake Data / Placeholders Found

### HIGH PRIORITY

| File | Line | Issue |
|---|---|---|
| `components/booking/booking-client.tsx` | 254 | Fallback UUID `"d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9b"` sent as `time_slot_id` when none selected |
| `components/partner/bookings-list.tsx` | 475 | Hardcoded `<option value="1">` and `<option value="2">` boat IDs |
| `components/partner/bookings-list.tsx` | 79-100 | `mockNew` object inserted optimistically with fake IDs after manual booking |
| `components/admin/finance-client.tsx` | 130-134 | Hardcoded `mockRevenue: 125000000`, `mockCommission: 18750000`, etc. |
| `components/admin/experiences-list-admin.tsx` | 904 | Hardcoded `<option value="1">Salim Boat (Yacht)</option>` |

### MEDIUM PRIORITY

| File | Line | Issue |
|---|---|---|
| `components/partner/bookings-list.tsx` | 36, 110 | Mock booking objects with `boat_id: "1"` in initial data |
| `components/admin/finance-client.tsx` | 57 | Hardcoded `id: "1"` fallback |
| `components/partner/availability-scheduler.tsx` | 75 | `useState<string>(boats[0]?.id \|\| "1")` fallback |

---

## 32. UX Quality Issues

| Issue | Count | Files |
|---|---|---|
| Raw `alert()` calls | **43** | partners-list-admin (20), experiences-list-admin (5), bookings-list-admin (4), destinations-list-admin (3), website-cms-admin (4), partner/bookings-list (1), partner/availability-scheduler (1), booking-client (2) |
| `console.error` in client components | ~15 | Various admin/partner components |

---

## SUMMARY OF FINDINGS

### READY Items (22)
1. ✅ Core environment variables
2. ✅ Supabase production project connection
3. ✅ Supabase Auth configuration
4. ✅ All 9 database migrations
5. ✅ RLS policies on all 16 tables
6. ✅ Server-only secret handling
7. ✅ Client-side env vars safety
8. ✅ Security headers
9. ✅ Middleware route protection
10. ✅ Role-based redirects
11. ✅ Error pages (404, error boundary)
12. ✅ Booking atomic functions with advisory locking
13. ✅ Contact form database persistence
14. ✅ Partner settings persistence
15. ✅ Dynamic boat count
16. ✅ OG/Twitter metadata
17. ✅ robots.txt
18. ✅ Mobile responsive layouts
19. ✅ Empty states
20. ✅ Logout flow
21. ✅ Session cookie management
22. ✅ TypeScript compilation, tests, and production build

### NEEDS CONFIGURATION (3)
1. ⚠️ `NEXT_PUBLIC_SITE_URL` not in `.env.local`
2. ⚠️ Image `remotePatterns` allows all domains
3. ⚠️ `turbopack.root` warning (cosmetic)

### NEEDS FIX (6)
1. ⚠️ 43 `alert()` calls → replace with toast system
2. ⚠️ Hardcoded fake UUID fallback in `booking-client.tsx:254`
3. ⚠️ Hardcoded boat IDs in partner manual booking form
4. ⚠️ Mock financial data in `finance-client.tsx`
5. ⚠️ Optimistic mock object in partner bookings after creation
6. ⚠️ Sitemap only static — should fetch dynamic slugs

### NOT BLOCKING (informational)
1. `as any` type casts throughout server actions
2. No CAPTCHA on contact form
3. No rate limiting on public endpoints
4. No loading.tsx route-level states
5. No analytics configured
6. No apple-touch-icon or web manifest
7. Next.js 16 middleware deprecation warning
8. Booking ref uses Math.random() (not crypto-secure)
9. Limited test coverage (2 test suites, 9 tests)
10. No skeleton loading states
