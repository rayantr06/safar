# Phase 3.6 — Database Migration & Security Synchronization Audit

**Date**: 2026-07-28
**Audit Type**: Read-only code-level verification
**Live DB Access**: ❌ Not available (no Supabase CLI, no direct DB client)

---

## Final Status

**🟡 PHASE 3.6 PARTIAL — CODE READY, LIVE DATABASE VERIFICATION REQUIRED**

All code-level audits pass. The repository migrations, RLS policies, server action guards, and application code are internally consistent and correctly structured. However, the actual Supabase database could not be inspected to confirm migration 010 was applied and all policies are active.

---

## 1. Migration 010 Verification

**Status**: ✅ PASS (code-level)

**File**: `supabase/migrations/010_add_rls_experiences_provider.sql`

**What it creates**:

| Policy | Type | Expression | Secure? |
|--------|------|------------|---------|
| `"Provider inserts own experiences"` | FOR INSERT WITH CHECK | `boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid())` | ✅ |
| `"Provider updates own experiences"` | FOR UPDATE (USING + WITH CHECK) | `boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid())` | ✅ |

**Analysis**:
- Experiences table has no `provider_id` column — ownership is indirect via `experience.boat_id → boats.id → boats.provider_id`. The subquery correctly resolves this chain.
- INSERT: A provider can only create experiences linked to boats they own. ✅
- UPDATE USING: A provider can only modify experiences that already belong to their boats. ✅
- UPDATE WITH CHECK: A provider cannot change `boat_id` to another provider's boat. ✅
- Admin full access is covered by the existing `"Admin full access"` policy from migration 001 (which uses `FOR ALL` and bypasses these provider-specific policies). ✅
- No DELETE policy for providers — intentional (admin-only operation). ✅
- No naming conflicts with existing policies from migration 001 (`"Public reads published"`, `"Provider reads own"`, `"Admin full access"`). ✅
- RLS was already enabled on `experiences` in migration 001 (line 180). Migration 010 correctly only adds policies. ✅

**⚠ Correction to Phase 3.5 report**: The Phase 3.5 report documented policy names as `"Providers can insert own experiences"` and `"Providers can update own experiences"`. The actual migration uses `"Provider inserts own experiences"` and `"Provider updates own experiences"`. These are functionally identical — the Phase 3.5 documentation had minor naming errors. No code issue.

---

## 2. Live Database Verification

**Status**: 🔴 BLOCKED

Direct database inspection was **not possible**:
- No Supabase CLI installed locally
- No direct database connection configured
- No Supabase Management API token available for remote inspection

**Manual verification steps required** (via Supabase Dashboard → SQL Editor):

```sql
-- 1. Confirm RLS is enabled on experiences
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'experiences';

-- 2. List all policies on experiences
SELECT policyname, permissive, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'experiences'
ORDER BY policyname;

-- 3. Verify each policy expression is correct
-- Expected: 5 policies
--   "Admin full access"          — FOR ALL  — USING (EXISTS SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
--   "Provider inserts own experiences" — FOR INSERT — WITH CHECK (boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid()))
--   "Provider reads own"         — FOR SELECT — USING (boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid()))
--   "Provider updates own experiences" — FOR UPDATE — USING (...) WITH CHECK (...)
--   "Public reads published"     — FOR SELECT — USING (is_published = true)

-- 4. Test RLS as various roles (optional but recommended)
-- Create test users with different roles and verify access
```

---

## 3. Migration State Consistency

**Status**: ✅ PASS

All 10 migrations are present and consistent:

| # | File | Purpose | Dependencies |
|---|------|---------|-------------|
| 001 | `initial_schema.sql` | Core schema (10 tables), base RLS policies | None |
| 002 | `platform_enhancements.sql` | Extends experiences, accommodations, notifications | 001 |
| 003 | `admin_partner_persistence.sql` | Provider columns, RLS on providers/site_content | 001 |
| 004 | `schema_hardening.sql` | Client linkage, role model, profiles leak fix, indexes, content status | 001, 002 |
| 005 | `storage_bucket.sql` | Media storage bucket | 001 |
| 006 | `fix_profiles_rls_recursion.sql` | SECURITY DEFINER for profiles admin check | 004 |
| 007 | `rls_and_atomic_bookings.sql` | RLS on remaining tables, atomic booking functions | 001, 004 |
| 008 | `fix_partner_booking_experience_id.sql` | Fix atomic_create_partner_booking | 007 |
| 009 | `create_contact_messages.sql` | Contact messages table with RLS | 001 |
| 010 | `add_rls_experiences_provider.sql` | Provider INSERT/UPDATE policies on experiences | 001 |

**Findings**:
- Sequential numbering: ✅ 001–010, no gaps, no duplicates
- Internal consistency: ✅ Each migration correctly references tables/columns created by predecessors
- No duplicate migrations or conflicting DDL: ✅ Policy names are unique across all files
- No orphan dependencies: ✅
- Migration 010 correctly depends on 001 (which created the experiences table and enabled RLS) ✅
- No evidence of out-of-band migrations applied but missing from repository ✅

---

## 4. RLS Security Audit — Experiences

**Status**: ✅ PASS (code-level)

### Complete Policy Matrix

| Policy | Type | Expression | Anonymous | Client | Provider | Admin |
|--------|------|-----------|-----------|--------|----------|-------|
| `"Public reads published"` (001) | SELECT | `is_published = true` | ✅ read published | ✅ read published | ✅ read published | ✅ full access |
| `"Provider reads own"` (001) | SELECT | `boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid())` | ❌ | ❌ | ✅ read all own | ✅ full access |
| `"Admin full access"` (001) | ALL | `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` | ❌ | ❌ | ❌ | ✅ |
| `"Provider inserts own experiences"` (010) | INSERT | `boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid())` | ❌ | ❌ | ✅ insert own boats | ✅ |
| `"Provider updates own experiences"` (010) | UPDATE | `boat_id IN (SELECT id FROM boats WHERE provider_id = auth.uid())` | ❌ | ❌ | ✅ update own boats | ✅ |
| (none) | DELETE | — | ❌ | ❌ | ❌ | ✅ (via admin policy) |

### Security Analysis

**Anonymous/Public**:
- Can SELECT only published experiences ✅
- Cannot INSERT, UPDATE, or DELETE ✅

**Client**:
- Same as public — no provider role means no special access ✅
- Cannot modify experiences ✅

**Provider**:
- Can INSERT experiences only with `boat_id` owned by them ✅
- Can UPDATE only experiences linked to their own boats ✅
- Cannot UPDATE `boat_id` to another provider's boat (WITH CHECK) ✅
- Cannot UPDATE another provider's experience (USING) ✅
- Cannot DELETE (admin-only) ✅
- Note: Policy does not restrict which columns a provider can modify (title, price, status, etc.) — this is intentional because the app UI exposes these fields to providers

**Admin**:
- Full access via `FOR ALL` policy ✅
- Admin policy uses subquery on `profiles` — no infinite recursion risk (migration 006 fixed this by adding `public.is_admin()` SECURITY DEFINER function, though the experiences policy itself still uses the direct subquery pattern, which works because profiles' own RLS allows the user to read their own row)

### Cross-Table Security

The experiences RLS correctly integrates with related tables:
- `boats` has its own RLS: providers can only manage their own boats ✅
- `time_slots` RLS: providers can only manage slots linked to their own experiences ✅
- `bookings` RLS: providers see only their assigned bookings ✅

---

## 5. Contact Admin Security

**Status**: ✅ PASS

### Server Actions in `src/lib/actions/contact.ts`

| Function | `checkRole` guard | Uses `createAdminClient` | Public? |
|----------|-------------------|--------------------------|---------|
| `submitContactMessage` | ❌ (intentional — public form) | ❌ (uses `createClient`) | ✅ |
| `getContactMessages` | ✅ `["admin"]` | ✅ | ❌ |
| `updateContactMessageStatus` | ✅ `["admin"]` | ✅ | ❌ |
| `updateContactMessageNote` | ✅ `["admin"]` | ✅ | ❌ |
| `deleteContactMessage` | ✅ `["admin"]` | ✅ | ❌ |

**Findings**:
- All 4 admin-only actions have `checkRole(["admin"])` as the first statement inside the try block ✅
- If the check fails, an error is thrown and caught, returning `{ success: false, error: "..." }` — the callee handles it gracefully ✅
- The public `submitContactMessage` correctly has no guard ✅
- RLS on `contact_messages` provides defense-in-depth: "Admin full access" + "Anyone can insert" ✅
- No alternative Server Action or route handler exposes contact messages to non-admin users ✅

---

## 6. Admin Partners Security

**Status**: ✅ PASS

**File**: `src/app/admin/partners/page.tsx`

**Change verified**: `createClient()` → `createAdminClient()`

**Analysis**:
- The page is under `/admin/` route, protected by 2 layers:
  1. **Middleware** (`src/lib/supabase/middleware.ts`): Checks `user` and `profiles.role` on every request; redirects non-admins away from `/admin/*` ✅
  2. **Admin Layout** (`src/app/admin/layout.tsx`): Re-checks role as defense-in-depth, even if middleware matcher is misconfigured ✅
- `createAdminClient()` (service-role) is used only in the server component ✅
- Service-role credentials never reach the client — only plain data objects are passed as props to `PartnersListAdmin` ✅
- Non-admin users cannot access the page (they are redirected by middleware or layout) ✅
- The change does not expose partner data publicly — the page is admin-only ✅
- Minor issue: Line 38-44 calls `createAdminClient() as any` again inside the component to fetch user emails — this is redundant but not harmful (same service-role client already exists as `supabase` on line 7)

---

## 7. Commission Logic Review

**Status**: ✅ PASS — No change needed

### Current Implementation

In `src/app/admin/finance/page.tsx`:
```typescript
let defaultCommissionRate = 15;
// Query all providers' commission_rates
const { data: providers } = await supabase
  .from("providers")
  .select("commission_rate")
  .not("commission_rate", "is", null);
if (providers && providers.length > 0) {
  const totalRate = providers.reduce((sum, p) => sum + Number(p.commission_rate || 0), 0);
  defaultCommissionRate = Math.round(totalRate / providers.length);
}
```

### Assessment

| Question | Answer |
|----------|--------|
| What does the finance dashboard display? | Per-booking financial data from the `bookings` table (total_amount, commission_amount, provider_amount). The `initialCommissionRate` prop is only a UI default for the "set global rate" form field. |
| Is an average semantically correct? | Yes, for a **display default**. It shows the admin the typical commission rate across all partners. |
| Is there a single global commission rate? | **No** — each provider has their own `commission_rate`. There is no global rate. |
| Is commission partner-specific? | **Yes** — `providers.commission_rate` is per-partner, and each booking stores its own `commission_rate` at creation time. |
| Do finance calculations use the booking rate or dashboard default? | **Booking rate** — the transaction list uses per-booking `commission_amount` and `commission_rate` stored at creation time. The `initialCommissionRate` only affects the "apply to all" form in FinanceClient. |

**Conclusion**: The average commission rate is a reasonable UI default. It does not affect actual financial reporting. The fallback to 15% is appropriate (it matches the default in `providers.commission_rate DEFAULT 15.00`). **No business logic issue.**

---

## 8. Production Environment Readiness

**Status**: ⚠️ PARTIALLY VERIFIED

| Setting | Status | Details |
|---------|--------|---------|
| `NEXT_PUBLIC_SITE_URL` | ✅ CONFIGURED | `https://safardz.com` in `.env.local` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ CONFIGURED | `https://hhcqmgqaezmnufqyrbso.supabase.co` in `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ CONFIGURED | Present in `.env.local` (value hidden) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ CONFIGURED | Present in `.env.local` (value hidden) |
| Auth redirect URLs | ❌ UNKNOWN | Must be configured in Supabase Dashboard → Authentication → URL Configuration |
| Storage bucket configuration | ❌ UNKNOWN | Migration 005 creates the `media` bucket and sets policies; must verify bucket exists and is public |
| Production image domains | ✅ CONFIGURED | 4 domains in `next.config.ts` `images.remotePatterns` |
| `DATABASE_URL` | ⚠️ USES LOCALHOST | `postgresql://postgres:postgres@localhost:5432/safar_dz` — this is a local dev override; production deployment should use the Supabase connection string or omit it entirely |
| Security headers | ✅ CONFIGURED | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy in `next.config.ts` |

**Note**: `.env.local` should NOT be committed to the repository — it contains secrets. The production environment should use platform environment variables (Vercel, Docker, etc.).

---

## 9. Automated Verification

All checks run with **no code changes** — verification-only:

| Check | Result | Details |
|-------|--------|---------|
| **TypeScript** (`npx tsc --noEmit`) | ✅ PASS | 0 errors |
| **Jest** (`npm test`) | ✅ PASS | 2 test suites, 9 tests — all passed |
| **Build** (`npm run build`) | ✅ PASS | 41 routes, 0 compilation errors |

---

## Summary Table

| Section | Status | Notes |
|---------|--------|-------|
| 1. Migration 010 Audit | ✅ PASS | Correctly scoped and secure |
| 2. Live Database Verification | 🔴 BLOCKED | No Supabase CLI or direct DB access available |
| 3. Migration Consistency | ✅ PASS | 001–010 complete, sequential, internally consistent |
| 4. Experiences RLS Audit | ✅ PASS | 5 policies cover all access patterns; admin has full access; providers scoped to own boats |
| 5. Contact Admin Security | ✅ PASS | All 4 admin actions guarded by `checkRole` |
| 6. Admin Partners Security | ✅ PASS | `createAdminClient`, middleware + layout protection confirmed |
| 7. Commission Logic | ✅ PASS | Average is reasonable UI default; actual reporting uses per-booking rates |
| 8. Production Readiness | ⚠️ PARTIAL | 5/8 items configured; auth redirects and storage bucket need manual check |
| 9a. TypeScript | ✅ PASS | 0 errors |
| 9b. Jest | ✅ PASS | 9/9 tests pass |
| 9c. Build | ✅ PASS | 41 routes, 0 errors |

---

## Required Manual Actions

1. **Apply migration 010** (if not already done): Open Supabase Dashboard → SQL Editor → paste `supabase/migrations/010_add_rls_experiences_provider.sql` → Run
2. **Verify RLS policies** (SQL queries listed in Section 2 above)
3. **Configure Auth redirect URLs** in Supabase Dashboard: Authentication → URL Configuration → add production site URL
4. **Verify storage bucket** `media` exists and policies are correct
5. **Review `.env.local`** — this file must not be committed to the repository; use platform env vars in production
6. **Remove or update `DATABASE_URL`** — currently points to `localhost`, which is incorrect for production
7. **Consider dropping lockfile warnings** by configuring `turbopack.root` in `next.config.ts`
