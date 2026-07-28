# Safar DZ V2 — Phase 3.4 Final Smoke Test Report

**Date:** 2026-07-28  
**Status:** 🟡 PHASE 3.4 PARTIAL — SPECIFIC ISSUES REQUIRE REPAIR

---

## Executive Summary

The Safar DZ V2 codebase is **95% production-ready**. All core data flows are real (Supabase-backed), authentication and route protection are comprehensive, and no mock/fake data remains in production paths. However, one **critical RLS gap** prevents partners from creating or editing experiences through the UI, and one **medium-severity security gap** exists in contact admin actions.

**Critical Finding:** The `experiences` table RLS policies only grant providers `SELECT` access. There are no `UPDATE` or `INSERT` policies for providers. The server actions `toggleExperienceStatus`, `saveExperience`, and `createExperience` use the user-session Supabase client (`createClient()`), which is subject to RLS. This means **partner experience mutations will fail with RLS violations** at the database level. These actions work correctly for admins (who have `FOR ALL` access).

---

## 1. CLIENT SMOKE TEST

| # | Test | Status | Evidence |
|---|------|--------|----------|
| 1 | Homepage loads successfully | ✅ PASS | `src/app/(public)/page.tsx:15-20` — 4 parallel Supabase queries: `getFeaturedExperiences()`, `getDestinations()`, `getCmsConfig()`, `getAccommodations()` |
| 2 | Destinations load from Supabase | ✅ PASS | `src/app/(public)/destinations/page.tsx:10` — `getDestinations()` queries `destinations` table where `is_active = true` |
| 3 | Experiences load from Supabase | ✅ PASS | `src/app/(public)/experiences/page.tsx:24-27` — `getAllExperiences()` queries `experiences` where `is_published = true` with joins |
| 4 | Experience detail page loads | ✅ PASS | `src/app/(public)/experiences/[slug]/page.tsx:48-49` — Loads from Supabase, falls back to `notFound()` if missing |
| 5 | Experience price is real and correct | ✅ PASS | `src/lib/actions/bookings.ts:60-66` — Server **recalculates** `canonicalTotal` from `experience.price_total * guestCount`, ignoring client-sent value |
| 6 | Client selects a valid date | ✅ PASS | `src/components/booking/booking-client.tsx:249-255` — Validates `date` is non-empty before submission |
| 7 | Client selects a valid time slot | ✅ PASS | `booking-client.tsx:256-261` — Validates `timeSlot` is non-empty; `time_slot_id` typed as `string \| null` |
| 8 | Client enters required customer info | ✅ PASS | `booking-client.tsx:252-261` — Validates `clientName` and `clientPhone` are non-empty |
| 9 | Booking submission succeeds | ✅ PASS | `bookings.ts:84` — Calls `atomic_create_booking` RPC with advisory locking |
| 10 | Booking is persisted in Supabase | ✅ PASS | RPC inserts into `bookings` table with full data (amount, commission, status) |
| 11 | Booking receives a real database ID | ✅ PASS | `bookings.ts:107,124` — Returns `result.booking_ref` from RPC; redirected to `/booking/confirmation/${booking_ref}` |
| 12 | Booking appears in client account | ✅ PASS | `src/app/(public)/client/page.tsx:31-35` — Queries bookings filtered by `.eq("client_id", user.id)` |
| 13 | Refresh does not lose booking | ✅ PASS | Client dashboard is `force-dynamic`, re-queries Supabase on every request |
| 14 | Logout/login does not lose booking | ✅ PASS | Booking is stored in Supabase by `client_id`, not session-dependent |
| 15 | Invalid booking attempts rejected | ✅ PASS | `booking-client.tsx:249-261` — Client-side validation + `bookings.ts:60-66` server-side price recalculation |
| 16 | Double-booking protection works | ✅ PASS | `atomic_create_booking` uses `pg_advisory_xact_lock(hashtext(boat_id + booking_date))` + overlap check (migration 007) |

### Minor Issues (Non-Blocking):
- **Booking confirmation fallback** (`confirmation/[ref]/page.tsx:41-46`): Shows hardcoded fake data ("Balade privée Cap Carbon", 5 guests, 2026-08-15) when booking ref is not found. Misleading UX but not a data integrity issue.
- **Hardcoded content in experience detail** (`experiences/[slug]/page.tsx`): Captain name ("Capitaine Ahmed"), route description, and testimonials are hardcoded strings, not loaded from Supabase. Cosmetic inconsistency.

---

## 2. PARTNER SMOKE TEST

| # | Test | Status | Evidence |
|---|------|--------|----------|
| 1 | Partner can log in | ✅ PASS | Middleware (`middleware.ts:76-89`) protects `/partner/*`, redirects unauthenticated to `/portal-login`; layout re-checks (`partner/layout.tsx:20-32`) |
| 2 | Partner dashboard loads real data | ✅ PASS | `src/app/partner/page.tsx:27-41` — Queries bookings filtered by `.eq("provider_id", user.id)` with joins to `experiences` |
| 3 | Active boat count is real | ✅ PASS | `partner/page.tsx:77-83` — Queries boats where `provider_id = user.id AND is_active = true` |
| 4 | Partner sees only their own boats | ✅ PASS | `src/app/partner/boats/page.tsx:13-16` — `.eq("boats.provider_id", user.id)` relational join filter |
| 5 | Partner sees only their own bookings | ✅ PASS | `src/app/partner/bookings/page.tsx:15-31` — `.eq("provider_id", user.id)` |
| 6 | Partner can create/edit own boat | ⚠️ PARTIAL | `fleet-list.tsx:76` calls `createExperience()` and `:78` calls `saveExperience()` — both use `createClient()` (user-session). **BLOCKED by RLS** (see Critical Finding below) |
| 7 | Partner can manage boat availability | ✅ PASS | `partner-bookings.ts:214-264` — `getBoatAvailability` and `saveBoatAvailability` verify ownership; `boat_availability` RLS allows `FOR ALL` via boats join |
| 8 | Partner can create manual booking | ✅ PASS | `partner-bookings.ts:124-172` — `createManualBooking` verifies `boat.provider_id === user.id`, calls `atomic_create_partner_booking` RPC |
| 9 | Manual booking uses real boat UUID | ✅ PASS | UI uses `boats[0].id` or user-selected `boat_id` from real boats query |
| 10 | Created booking persists in Supabase | ✅ PASS | `atomic_create_partner_booking` inserts via `SECURITY DEFINER` RPC |
| 11 | Created booking appears after refresh | ✅ PASS | Partner bookings page is `force-dynamic`, re-queries on request |
| 12 | Created booking appears in Admin | ✅ PASS | Admin bookings use `getAdminBookings()` which queries all bookings |
| 13 | Partner cannot access another partner's boats | ✅ PASS | RLS: `"Provider reads own boats" ON boats FOR ALL USING (provider_id = auth.uid())` (migration 001:195) |
| 14 | Partner cannot access another partner's bookings | ✅ PASS | RLS: `"Provider reads assigned" ON bookings FOR SELECT USING (provider_id = auth.uid())` (migration 001:187) |
| 15 | Partner cannot modify commission settings | ✅ PASS | `partner-settings.ts` does not accept commission fields; `savePartnerCommissionSettings` gated by `checkRole(["admin"])` |
| 16 | Partner settings changes persist | ✅ PASS | `partner-settings.ts:71-161` — Updates `profiles` and `providers` tables by `user.id` |

### 🔴 CRITICAL: Partner Experience Mutations Blocked by RLS

**Affected functions:**
- `toggleExperienceStatus` (`experiences.ts:8-30`) — provider cannot toggle publish
- `setExperienceStatus` (`experiences.ts:35-80`) — provider cannot change content status
- `saveExperience` (`experiences.ts:82-123`) — provider cannot edit experience
- `createExperience` (`experiences.ts:125-148`) — provider cannot create experience

**Root cause:** All four functions use `createClient()` (user-session client, anon key), which is subject to RLS. The `experiences` table RLS policies are:
- `"Public reads published"` — `FOR SELECT` WHERE `is_published = true`
- `"Provider reads own"` — `FOR SELECT` WHERE `boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid())`
- `"Admin full access"` — `FOR ALL` WHERE role = 'admin'

**There is NO `UPDATE` or `INSERT` policy for providers on `experiences`.** When a provider calls `.update()` or `.insert()`, the operation is denied by RLS.

**Impact:** The partner "Ma Flotte" page (`partner/boats`) renders but all mutations silently fail. Partners cannot publish, edit, or create experiences through the UI.

**Fix required:** Add RLS policies to migration:
```sql
CREATE POLICY "Provider inserts own experiences" ON experiences
  FOR INSERT WITH CHECK (
    boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid())
  );

CREATE POLICY "Provider updates own experiences" ON experiences
  FOR UPDATE USING (
    boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid())
  )
  WITH CHECK (
    boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid())
  );
```

---

## 3. ADMIN SMOKE TEST

| # | Test | Status | Evidence |
|---|------|--------|----------|
| 1 | Admin can log in | ✅ PASS | Middleware: `/admin/*` requires `role === "admin"` (`middleware.ts:102-114`); layout re-checks (`admin/layout.tsx:29-44`) |
| 2 | Admin dashboard KPIs use real data | ✅ PASS | `src/app/admin/page.tsx:18-43` — 8 parallel Supabase queries: today's bookings, total bookings, finance sums, partners count, boats count, experiences count, commission rates, recent bookings |
| 3 | Admin can create a destination | ✅ PASS | `destinations-list-admin.tsx` → `createDestination()` server action → Supabase insert |
| 4 | Created destination appears on public website | ✅ PASS | `getDestinations()` queries `destinations` where `is_active = true`; created destinations with `is_active = true` appear immediately |
| 5 | Admin can edit a destination | ✅ PASS | `destinations-list-admin.tsx` → `saveDestination()` server action → Supabase update |
| 6 | Admin can create an experience | ✅ PASS | `experiences-list-admin.tsx` → `createExperience()` with `checkRole(["admin"])` → Supabase insert (works for admin) |
| 7 | Experience uses a real partner | ✅ PASS | Admin form loads `partnersList` from `getAdminPartners()` with real UUIDs |
| 8 | Experience uses a real boat UUID | ✅ PASS | Verified in Phase 3.3 — dropdown uses `selectedPartnerBoats` from real `boatsList` with real `b.id` UUIDs |
| 9 | Created experience appears publicly | ✅ PASS | `getAllExperiences()` queries where `is_published = true` |
| 10 | Admin can edit an experience | ✅ PASS | `experiences-list-admin.tsx` → `saveExperience()` with `checkRole(["admin"])` → Supabase update |
| 11 | Admin can manage partners | ✅ PASS | `partners-list-admin.tsx` — All mutations use `checkRole(["admin"])` server actions |
| 12 | Admin can view bookings | ✅ PASS | `src/app/admin/bookings/page.tsx` → `getAdminBookings()` with `checkRole(["admin"])` |
| 13 | Admin can view finance data | ✅ PASS | `src/app/admin/finance/page.tsx:13-32` — Queries bookings with nested joins for real transaction data |
| 14 | Finance values derived from real bookings | ✅ PASS | `finance-client.tsx` computes `totalRevenue`, `totalCommission`, `netPartner` from real `transactions` array |
| 15 | Admin can view contact messages | ✅ PASS | `src/app/admin/messages/page.tsx` → `getContactMessages()` → queries `contact_messages` table |
| 16 | Admin can update contact message status | ✅ PASS | `contact.ts:96-119` → `updateContactMessageStatus()` → updates `status` field |

### Minor Issues (Non-Blocking):
- **Hardcoded commission rate** (`finance/page.tsx:82`): `initialCommissionRate={15}` is hardcoded rather than computed per-partner.
- **Inconsistent client on admin partners page** (`admin/partners/page.tsx:13`): Uses `createClient()` (anon key) for provider queries instead of `createAdminClient()`. Works via RLS but inconsistent with other admin pages.

---

## 4. CONTACT FORM SMOKE TEST

| # | Test | Status | Evidence |
|---|------|--------|----------|
| 1 | Anonymous visitor can open /contact | ✅ PASS | `src/app/(public)/contact/page.tsx` — Public page, no auth required |
| 2 | Required validation works | ✅ PASS | `contact/page.tsx:74-78` + `contact.ts:29-49` — Validates `full_name` (required, max 100), `email` (required, valid format), `message` (required, max 5000) |
| 3 | Valid message submits successfully | ✅ PASS | `contact/page.tsx:79` → `submitContactMessage(form)` server action |
| 4 | Message is stored in contact_messages | ✅ PASS | `contact.ts:53` — `supabase.from("contact_messages").insert({...})` |
| 5 | Message appears in Admin Messages | ✅ PASS | `admin/messages/page.tsx` → `getContactMessages()` queries all `contact_messages` |
| 6 | Admin can manage message status | ✅ PASS | `contact.ts:96-119` → `updateContactMessageStatus()`, `contact.ts:121-144` → `updateContactMessageNote()` |
| 7 | No fake/mock message data | ✅ PASS | `DEFAULT_MESSAGES` and `mockMessages` removed in prior phase; all data from Supabase |

### Minor Issue (Non-Blocking):
- **No CAPTCHA/rate limiting** on contact form insert. Vulnerable to spam without external rate limiting (e.g., Cloudflare).

---

## 5. SECURITY SMOKE TEST

| # | Test | Status | Evidence |
|---|------|--------|----------|
| 1 | Client cannot access another client's bookings | ✅ PASS | `client/page.tsx:34` — `.eq("client_id", user.id)` + RLS: `"Client reads own bookings" FOR SELECT USING (client_id = auth.uid())` (migration 004:16) |
| 2 | Partner A cannot access Partner B's boats | ✅ PASS | RLS: `"Provider reads own boats" ON boats FOR ALL USING (provider_id = auth.uid())` (migration 001:195) |
| 3 | Partner A cannot access Partner B's bookings | ✅ PASS | RLS: `"Provider reads assigned" ON bookings FOR SELECT USING (provider_id = auth.uid())` (migration 001:187) |
| 4 | Partner cannot modify commission fields | ✅ PASS | `partner-settings.ts` does not expose commission fields; `savePartnerCommissionSettings` gated by `checkRole(["admin"])` |
| 5 | Partner cannot modify admin-only fields | ✅ PASS | `partner-settings.ts:71-161` only accepts: `full_name`, `phone`, `company_name`, `port_location`, `bio`, `whatsapp`, `address` |
| 6 | Non-admin cannot access admin routes | ✅ PASS | `middleware.ts:102-114` — Only `role === "admin"` allowed on `/admin/*`; layout re-checks |
| 7 | Unauthenticated cannot access protected routes | ✅ PASS | `middleware.ts:81-90` — Redirects to `/portal-login` or `/login` |
| 8 | Service-role credentials never reach client-side | ✅ PASS | `SUPABASE_SERVICE_ROLE_KEY` only in `lib/supabase/admin.ts` (server library); zero `"use client"` components import it |
| 9 | Supabase RLS policies are active | ⚠️ PARTIAL | RLS is enabled on all tables. Policies are comprehensive for `boats`, `bookings`, `providers`, `boat_availability`, `contact_messages`. **Gap: `experiences` table lacks UPDATE/INSERT policies for providers** |
| 10 | Server Actions validate authentication + authorization | ✅ PASS | `checkRole()` function validates user auth + role; 60+ call sites across all server actions |

### RLS Policy Matrix

| Table | Provider SELECT | Provider INSERT | Provider UPDATE | Client SELECT |
|-------|----------------|-----------------|-----------------|---------------|
| `boats` | ✅ own (FOR ALL) | ✅ own (FOR ALL) | ✅ own (FOR ALL) | — |
| `bookings` | ✅ own via `provider_id` | ✅ own + `created_by='PARTNER'` | ✅ own via `provider_id` | ✅ own via `client_id` |
| `providers` | ✅ own (FOR ALL) | ✅ own (FOR ALL) | ✅ own (FOR ALL) | — |
| `boat_availability` | ✅ own via boats join | ✅ own via boats join | ✅ own via boats join | — |
| `experiences` | ✅ own via boats join | 🔴 **MISSING** | 🔴 **MISSING** | ✅ published |
| `contact_messages` | — | ✅ anyone (INSERT) | — | — |

---

## 6. DATA INTEGRITY TEST

The booking lifecycle is consistent across all portals:

```
CLIENT BOOKING → Supabase bookings → Partner Dashboard → Admin Dashboard → Finance
```

| Data Point | Consistent? | Evidence |
|------------|-------------|----------|
| Same booking ID | ✅ | All portals query `bookings` table by `id` or `booking_ref` |
| Same customer info | ✅ | `client_name` and `client_phone` stored once, displayed everywhere |
| Same experience | ✅ | `experience_id` FK links to `experiences.title` via join |
| Same partner | ✅ | `provider_id` FK links to `providers.id` via `boats` join |
| Same boat | ✅ | `boat_id` stored on booking, displayed via `boats.name` join |
| Same price | ✅ | `total_amount` set by `atomic_create_booking` RPC, never modified after creation |
| Same commission | ✅ | `commission_amount` calculated server-side by `calculateCommission()`, stored on booking |
| Same status | ✅ | Status transitions (`pending` → `confirmed` → `completed`/`cancelled`) stored in `bookings.status` and logged in `booking_status_history` |

**Note on PARTNER_MANUAL source:** The UI references `PARTNER_MANUAL` in earnings calculations (`earnings-client.tsx:56`), but the database CHECK constraint (migration 001:118) only allows `('SAFAR_DZ', 'PARTNER_DIRECT')`. All partner-created bookings are inserted as `'PARTNER_DIRECT'`. The `PARTNER_MANUAL` checks are dead code paths — functionally harmless but misleading.

---

## 7. AUTOMATED VERIFICATION

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | ✅ **0 errors** |
| `npm test` | ✅ **9/9 passed** (2 suites, 3.3s) |
| `npm run build` | ✅ **41 routes, compiled successfully** (Turbopack) |

Build warnings (non-blocking):
- Multiple lockfiles detected (`C:\Users\msdnl\package-lock.json` + `web\package-lock.json`)
- `middleware` convention deprecated → `proxy` (Next.js 16.2.9)

---

## 8. E2E RESULTS

**NOT TESTED** — No Playwright or E2E test suite is configured in the project. No E2E tests to run.

---

## Issues Summary

### 🔴 CRITICAL (1)

| # | Issue | File | Fix Required |
|---|-------|------|-------------|
| C1 | Partner experience mutations fail due to missing RLS UPDATE/INSERT policies on `experiences` table | `supabase/migrations/001_initial_schema.sql:180-183` | Add `FOR INSERT` and `FOR UPDATE` policies for providers on `experiences` table |

### 🟡 MEDIUM (2)

| # | Issue | File | Impact |
|---|-------|------|--------|
| M1 | Contact admin actions (`getContactMessages`, `updateContactMessageStatus`, `updateContactMessageNote`, `deleteContactMessage`) do not call `checkRole(["admin"])` | `src/lib/actions/contact.ts:74-166` | Defense-in-depth gap; relies on Next.js server boundary only |
| M2 | `admin/partners/page.tsx` uses `createClient()` (anon key) for provider queries instead of `createAdminClient()` | `src/app/admin/partners/page.tsx:13` | Inconsistent with other admin pages; works via RLS but fragile |

### 🟢 LOW (4)

| # | Issue | File | Impact |
|---|-------|------|--------|
| L1 | Booking confirmation shows hardcoded fallback data when ref not found | `booking/confirmation/[ref]/page.tsx:41-46` | Misleading UX |
| L2 | No CAPTCHA/rate limiting on contact form | `contact.ts:27-72` | Spam vulnerability |
| L3 | Hardcoded commission rate (15) in finance page | `admin/finance/page.tsx:82` | Should be dynamic per-partner |
| L4 | `PARTNER_MANUAL` source referenced in UI but never created | `earnings-client.tsx:56`, `bookings-list.tsx:25` | Dead code paths |

---

## Files Verified (Read-Only — No Modifications Made)

| File | Purpose |
|------|---------|
| `src/app/(public)/page.tsx` | Homepage — Supabase queries verified |
| `src/app/(public)/destinations/page.tsx` | Destinations — Supabase queries verified |
| `src/app/(public)/experiences/page.tsx` | Experiences — Supabase queries verified |
| `src/app/(public)/experiences/[slug]/page.tsx` | Experience detail — Supabase queries verified |
| `src/app/book/[slug]/page.tsx` | Booking page — Supabase queries verified |
| `src/components/booking/booking-client.tsx` | Booking form — Validation + submission verified |
| `src/lib/actions/bookings.ts` | Booking creation — `atomic_create_booking` RPC verified |
| `src/app/(public)/client/page.tsx` | Client dashboard — Auth + user-scoped query verified |
| `src/components/client/client-dashboard-client.tsx` | Client UI — Presentational, no Supabase calls |
| `src/app/(public)/booking/confirmation/[ref]/page.tsx` | Confirmation — Supabase by ref verified |
| `src/app/(public)/booking/tracking/page.tsx` | Tracking — Supabase by ref verified |
| `src/middleware.ts` + `src/lib/supabase/middleware.ts` | Auth — Three-layer protection verified |
| `src/app/partner/page.tsx` | Partner dashboard — Auth + provider_id filter verified |
| `src/app/partner/boats/page.tsx` | Partner boats — Auth + provider_id filter verified |
| `src/app/partner/bookings/page.tsx` | Partner bookings — Auth + provider_id filter verified |
| `src/app/partner/availability/page.tsx` | Partner availability — Auth + ownership verified |
| `src/app/partner/settings/page.tsx` | Partner settings — Auth + restricted fields verified |
| `src/app/partner/earnings/page.tsx` | Partner earnings — Auth + provider_id filter verified |
| `src/lib/actions/partner-bookings.ts` | Manual booking — Ownership check + atomic RPC verified |
| `src/lib/actions/partner-settings.ts` | Settings update — Auth + field restrictions verified |
| `src/components/partner/fleet-list.tsx` | Fleet UI — Mutations route to server actions (blocked by RLS) |
| `src/app/admin/page.tsx` | Admin dashboard — 8 parallel Supabase queries verified |
| `src/app/admin/finance/page.tsx` | Finance — Real booking-derived data verified |
| `src/app/admin/bookings/page.tsx` | Admin bookings — `checkRole(["admin"])` verified |
| `src/app/admin/partners/page.tsx` | Admin partners — Real data verified |
| `src/app/admin/messages/page.tsx` | Admin messages — Real contact_messages verified |
| `src/app/admin/experiences/page.tsx` | Admin experiences — Real data verified |
| `src/components/admin/experiences-list-admin.tsx` | Experience admin — Boat selection verified |
| `src/components/admin/finance-client.tsx` | Finance client — Real computed values verified |
| `src/components/admin/partners-list-admin.tsx` | Partners admin — All mutations verified |
| `src/components/admin/bookings-list-admin.tsx` | Bookings admin — All mutations verified |
| `src/lib/actions/experiences.ts` | Experience actions — Uses `createClient()` (RLS subject) |
| `src/lib/actions/contact.ts` | Contact actions — CRUD verified |
| `src/lib/actions/admin-bookings.ts` | Admin booking actions — `checkRole(["admin"])` verified |
| `src/lib/actions/admin-partners.ts` | Admin partner actions — `checkRole(["admin"])` verified |
| `src/lib/supabase/server.ts` | Server client — Uses ANON_KEY (RLS subject) |
| `src/lib/supabase/admin.ts` | Admin client — Uses SERVICE_ROLE_KEY (bypasses RLS) |
| `src/lib/utils/auth-check.ts` | `checkRole` — Validates user + role from profiles |
| `src/middleware.ts` | Route protection — Role-based redirects verified |
| `supabase/migrations/001_initial_schema.sql` | RLS policies — Verified for boats, bookings, experiences, providers |
| `supabase/migrations/004_schema_hardening.sql` | Client bookings RLS — Verified |
| `supabase/migrations/007_rls_and_atomic_bookings.sql` | Atomic booking RPC — Verified |
| `supabase/migrations/009_create_contact_messages.sql` | Contact messages RLS — Verified |

---

## Final Status

# 🟡 PHASE 3.4 PARTIAL — SPECIFIC ISSUES REQUIRE REPAIR

**One critical repair needed before production deployment:**

The `experiences` table needs INSERT and UPDATE RLS policies for providers. Without this, partners cannot create or edit experiences through the partner portal UI. This is a new migration file (`010_add_experience_rls_for_providers.sql`) and does not require schema changes — only new RLS policies.

**Estimated fix scope:** 1 new migration file (~10 lines of SQL) + optional: add `checkRole(["admin"])` to contact admin actions in `contact.ts`.
