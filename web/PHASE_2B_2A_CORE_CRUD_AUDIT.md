# Phase 2B.2A — Core CRUD & Data Synchronization Audit

**Date:** 2026-07-24
**Status:** READ-ONLY AUDIT — NO CODE MODIFIED
**Project:** `C:\Users\msdnl\safar dz 2.0\web`

---

## Executive Summary

Three critical bugs cause items created in the Admin panel to disappear on refresh:

1. **Destination creation sends an invalid UUID** (`"new-1234567890"`) to a UUID column — the INSERT always fails at the database level, but the UI shows the item optimistically before the failure, and the error is silently swallowed.

2. **Experience creation sends `status: "pending_approval"`** which violates the CHECK constraint `IN ('draft','published','hidden','archived')` — the INSERT always fails, but the error is silently swallowed.

3. **Destination optimistic state update happens BEFORE the server action** — the item appears in the UI immediately, the server action fails silently (`console.error` only), and on refresh the item is gone.

Partner creation works correctly because it uses proper error handling with `alert()` and only updates local state AFTER server success confirmation.

---

# PART 1 — DATA ARCHITECTURE MAP

| Feature | Database Table(s) | Create Action | Read Query | Admin Page | Public/Client Page |
|---------|-------------------|---------------|------------|------------|-------------------|
| Partner | `profiles` + `providers` | `createPartner()` in `admin-partners.ts` | `providers` JOIN `profiles` + `boats` | `/admin/partners` | `/partner/settings` |
| Destination | `destinations` | `createDestination()` in `experiences.ts` | `destinations.*` | `/admin/destinations` | `/destinations`, `/destinations/[slug]`, `/` |
| Experience | `experiences` | `createExperience()` in `experiences.ts` | `experiences` JOIN `destinations` + `experience_images` | `/admin/experiences` | `/experiences`, `/experiences/[slug]`, `/` |

### Table Column Summary

**`profiles`** (migration 001:5-13, 004:22-23):
`id` UUID PK, `role` TEXT NOT NULL DEFAULT 'provider', `full_name` TEXT NOT NULL, `phone` TEXT, `avatar_url` TEXT, `created_at` TIMESTAMPTZ, `updated_at` TIMESTAMPTZ

**`providers`** (migration 001:16-30, 003:7-11):
`id` UUID PK FK→profiles, `company_name` TEXT NOT NULL, `port_location` TEXT DEFAULT 'Port de Bejaia', `bio` TEXT, `is_active` BOOLEAN DEFAULT true, `rating` NUMERIC(2,1) DEFAULT 0, `total_trips` INTEGER DEFAULT 0, `total_revenue` BIGINT DEFAULT 0, `commission_rate` NUMERIC(4,2) DEFAULT 15.00, `commission_effective_date` DATE, `commission_status` TEXT DEFAULT 'active', `commission_last_modified` TIMESTAMPTZ, `created_at` TIMESTAMPTZ, `whatsapp` TEXT, `address` TEXT, `notes` TEXT, `commission_type` TEXT DEFAULT 'percentage', `is_disabled` BOOLEAN DEFAULT false

**`destinations`** (migration 001:46-53, 002:30-35, 004:87-88):
`id` UUID PK DEFAULT gen_random_uuid(), `name` TEXT NOT NULL, `slug` TEXT UNIQUE NOT NULL, `description` TEXT, `photo_url` TEXT, `is_active` BOOLEAN DEFAULT true, `gallery` JSONB DEFAULT '[]', `location` TEXT, `hero_image_url` TEXT, `is_featured` BOOLEAN DEFAULT false, `lat` DOUBLE PRECISION, `lng` DOUBLE PRECISION, `status` TEXT NOT NULL DEFAULT 'draft' CHECK IN ('draft','published','hidden','archived')

**`experiences`** (migration 001:56-72, 002:8-19, 004:83-84):
`id` UUID PK DEFAULT gen_random_uuid(), `boat_id` UUID NOT NULL FK→boats, `destination_id` UUID FK→destinations, `title` TEXT NOT NULL, `slug` TEXT UNIQUE NOT NULL, `description` TEXT, `type` TEXT NOT NULL, `price_total` BIGINT, `price_per_seat` BIGINT, `duration_minutes` INTEGER NOT NULL DEFAULT 120, `max_guests` INTEGER NOT NULL, `is_published` BOOLEAN DEFAULT false, `badge` TEXT, `created_at` TIMESTAMPTZ, `updated_at` TIMESTAMPTZ, `included_services` TEXT, `requirements` TEXT, `departure_location` TEXT, `route_description` TEXT, `category` TEXT, `main_image_url` TEXT, `rating` NUMERIC(2,1) DEFAULT 0, `status` TEXT NOT NULL DEFAULT 'draft' CHECK IN ('draft','published','hidden','archived')

---

# PART 2 — PARTNER CREATION AUDIT

### Flow Trace

```
Admin clicks "Ajouter un partenaire"
  → partners-list-admin.tsx:522-538 (resets form, opens modal)
  → Form rendered at lines 1019-1165
  → User fills form, clicks submit
  → handleSavePartner() at line 100
  → e.preventDefault() at line 101
  → setSaveLoading(true) at line 102
  → isEditingPartner is false → CREATE branch at line 142
  → createPartner(partnerForm) at line 143
  ↓
  admin-partners.ts:createPartner() (line 7-73)
  → checkRole(["admin"]) at line 21
  → createAdminClient() at line 23 (bypasses RLS)
  → admin.auth.admin.createUser() at lines 25-30
  → Checks duplicate email at lines 32-37
  → admin.from("profiles").insert() at lines 41-46
  → admin.from("providers").insert() at lines 49-62
  → revalidatePath("/admin/partners") at line 65
  → revalidatePath("/partner/settings") at line 66
  → Returns { success: true, partnerId } at line 68
  ↓
  Back in handleSavePartner:
  → Checks res.success && res.partnerId at line 144
  → Builds newPartner object at lines 145-165
  → setPartners() appends at line 167
  → alert("Success") at line 170
```

### Issues Found

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| P-1 | **No transaction** — 3 separate DB writes (auth user, profile, provider). Partial failure leaves orphaned records. | P2 | `admin-partners.ts:25-62` |
| P-2 | **`checkRole` may fail silently** — if admin session is expired, the function may not throw clearly. | P3 | `admin-partners.ts:21` |

### Partner Creation Verdict: **FUNCTIONAL**

The partner creation flow works correctly:
- Uses `createAdminClient()` (bypasses RLS) for all writes
- Checks errors at each step
- Returns proper success/failure to client
- Client only updates local state AFTER success confirmation
- Shows `alert()` for both success and error
- Calls `revalidatePath("/admin/partners")`

---

# PART 3 — PARTNER PERSISTENCE TEST

**PASS.** The `createPartner` function:
1. Creates auth user via `admin.auth.admin.createUser()` — admin client, no RLS
2. Inserts profile via `admin.from("profiles").insert()` — admin client, no RLS
3. Inserts provider via `admin.from("providers").insert()` — admin client, no RLS

All three operations use `createAdminClient()` which uses the service-role key and bypasses RLS entirely. Errors are checked at each step (`createUserError`, `profileError`, `providerError`).

**Risk:** If step 2 fails after step 1 succeeds, an orphaned auth user is created with no profile or provider record. This is a data integrity issue but not a visibility issue.

---

# PART 4 — PARTNER ADMIN READ AUDIT

**File:** `app/admin/partners/page.tsx`

| Question | Answer | Evidence |
|----------|--------|----------|
| Which table? | `providers` JOIN `profiles` + `boats` | Lines 13-34 |
| Supabase client? | `createClient()` (SSR cookie, anon key) | Line 8 |
| RLS applies? | **Yes** — subject to provider + admin policies | — |
| Filters? | None on providers (fetches all) | Line 13-15 |
| `is_active` filter? | **No** — fetches all providers regardless | — |
| `is_disabled` filter? | **No** — fetches all providers regardless | — |
| Profile join? | Yes — `.select("*, profiles!inner(full_name, phone, avatar_url)")` | Line 14 |
| New records excluded? | **No** — all providers are returned | — |

**RLS verification:** The `providers` table has:
- "Provider reads/updates own row" ALL: `id = auth.uid()`
- "Admin full access providers" ALL: `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')`

The admin user's profile must have `role = 'admin'` for the admin policy to pass. The `is_admin()` SECURITY DEFINER function (migration 006) is used for the profiles SELECT policy, which allows admins to read all profiles.

**Verdict:** The admin page SHOULD display newly created partners after `revalidatePath` triggers a re-render.

---

# PART 5 — DESTINATION CREATION AUDIT

### Flow Trace

```
Admin clicks "Nouvelle Destination"
  → destinations-list-admin.tsx:120-138 (handleAddClick)
  → Creates temp object with id: "new-${Date.now()}" (line 122)
  → is_active: false (line 132)
  → Opens edit drawer
  → User fills form, clicks Save
  → handleSaveEdit() at line 159
  → isNew = editForm.id.startsWith("new-") at line 161
  ↓
  ⚠️ OPTIMISTIC STATE UPDATE (lines 168-174):
  → setDestinations() adds savedDest to local state IMMEDIATELY
  → This happens BEFORE the server action is called
  ↓
  → createDestination(savedDest) at line 178
  ↓
  experiences.ts:createDestination() (line 249-263)
  → checkRole(["admin"]) at line 250
  → createClient() at line 251 (SSR cookie, anon key, RLS applies)
  → .from("destinations").insert(destination) at lines 253-257
  → if (error) throw new Error(error.message) at line 258
  → revalidatePath calls at lines 259-261
  → Returns { success: true, data } at line 262
  ↓
  Back in handleSaveEdit:
  → catch block at lines 182-184: console.error only — NO alert
  → setIsEditing(false) at line 186
  → setSelectedDest(null) at line 187
```

### Issues Found — CRITICAL

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| D-1 | **CRITICAL: Invalid UUID temp ID** — `"new-${Date.now()}"` is not a valid UUID. The `destinations.id` column is `UUID PRIMARY KEY DEFAULT gen_random_uuid()`. PostgreSQL REJECTS this INSERT. | **P0** | `destinations-list-admin.tsx:122` → `experiences.ts:255` |
| D-2 | **CRITICAL: Optimistic update BEFORE server action** — `setDestinations()` at line 168-174 adds the item to local state BEFORE the DB write. If the write fails, the item appears in the UI but doesn't persist. | **P0** | `destinations-list-admin.tsx:168-174` |
| D-3 | **CRITICAL: Silent error swallowing** — The catch block at lines 182-184 only does `console.error`. No `alert()`, no state rollback. User has no idea the save failed. | **P0** | `destinations-list-admin.tsx:182-184` |
| D-4 | **No `status` field in create payload** — `handleAddClick` never sets `status`. DB default `'draft'` applies. DB trigger sets `is_active = (status = 'published')` → `is_active = false`. | P1 | `destinations-list-admin.tsx:120-134` |
| D-5 | **`is_active: false` in UI is redundant** — The DB trigger `trg_sync_destination_status` overwrites `is_active` based on `status`. Setting `is_active: false` in the insert payload has no effect because the trigger fires AFTER the insert. | P2 | `destinations-list-admin.tsx:132` |

### Root Cause of "Destination disappears on refresh"

```
1. Admin clicks Save
2. UI adds destination to local state (optimistic) — ITEM VISIBLE
3. Server action sends INSERT with id="new-1234567890"
4. PostgreSQL rejects: invalid UUID format — INSERT FAILS
5. Server action throws error
6. Catch block logs to console — NO USER FEEDBACK
7. Modal closes, item remains in local state — STILL VISIBLE
8. User refreshes page
9. Server re-fetches from Supabase — DESTINATION DOES NOT EXIST
10. Item disappears
```

---

# PART 6 — DESTINATION PUBLIC / CLIENT PORTAL AUDIT

### Public Query

**File:** `lib/queries/experiences.ts:76-106`

```ts
const admin = createAdminClient() as any;  // service-role, bypasses RLS
const { data, error } = await admin
  .from("destinations")
  .select("*")
  .eq("is_active", true)      // ← THE FILTER
  .order("name", { ascending: true });
```

### Visibility Rules

| Condition | Admin | Public |
|-----------|-------|--------|
| `status = 'draft'` | Visible (no filter) | NOT visible (`is_active = false` via trigger) |
| `status = 'published'` | Visible | Visible (`is_active = true` via trigger) |
| `status = 'hidden'` | Visible | NOT visible (`is_active = false` via trigger) |
| `status = 'archived'` | Visible | NOT visible (`is_active = false` via trigger) |

### DB Trigger (migration 004:107-117)

```sql
CREATE FUNCTION sync_destination_status_bool() RETURNS trigger AS $$
BEGIN
  NEW.is_active := (NEW.status = 'published');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_destination_status
  BEFORE INSERT OR UPDATE OF status ON destinations
  FOR EACH ROW EXECUTE FUNCTION sync_destination_status_bool();
```

**Key detail:** The trigger fires `BEFORE INSERT OR UPDATE OF status`. This means:
- INSERT with `status = 'draft'` → trigger sets `is_active = false` ✓
- UPDATE `status` to `'published'` → trigger sets `is_active = true` ✓
- UPDATE `is_active` directly (not via `status`) → trigger does NOT fire → `status` and `is_active` can diverge ⚠️

### Will a newly created destination appear publicly?

**NO.** Even if the INSERT succeeded (which it doesn't due to the UUID bug), the destination would have `status = 'draft'` and `is_active = false`. The public query filters on `is_active = true`.

---

# PART 7 — EXPERIENCE CREATION AUDIT

### Flow Trace

```
Admin clicks "Nouvelle Experience"
  → experiences-list-admin.tsx:144-173 (handleAddExperience)
  → Creates object with id: "" (creation marker), status: "pending_approval"
  → Opens modal form
  → User fills form, clicks Save
  → handleSaveExp() at line 175
  → isNew = selectedExp.id === "" at line 177
  → isApproved = selectedExp.status === "approved" at line 178 (FALSE — status is "pending_approval")
  → Builds payload at lines 180-201:
    → is_published: isApproved → FALSE (line 188)
    → status: selectedExp.status → "pending_approval" (line 189)
  ↓
  → createExperience(payload) at line 205
  ↓
  experiences.ts:createExperience() (line 125-147)
  → checkRole(["provider", "admin"]) at line 126
  → createClient() at line 127 (SSR cookie, anon key, RLS applies)
  → .from("experiences").insert(experience) at lines 137-141
  → if (error) throw new Error(error.message) at line 142
  → revalidatePath calls at lines 143-145 (MISSING: "/")
  → Returns { success: true, data } at line 146
  ↓
  Back in handleSaveExp:
  → if (res.success && res.data) at line 206
  → Optimistically adds to local state at lines 207-212
  → catch block at line 226-228: console.error only — NO alert
```

### Issues Found — CRITICAL

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| E-1 | **CRITICAL: Invalid `status` value** — Default `status: "pending_approval"` violates CHECK constraint `IN ('draft','published','hidden','archived')`. PostgreSQL REJECTS this INSERT. | **P0** | `experiences-list-admin.tsx:156` → `experiences.ts:139` |
| E-2 | **CRITICAL: Silent error swallowing** — The catch block at lines 226-228 only does `console.error`. No `alert()`. User has no idea the save failed. | **P0** | `experiences-list-admin.tsx:226-228` |
| E-3 | **Missing `revalidatePath("/")`** — `createExperience` does NOT revalidate the homepage. All other mutation functions (`toggleExperienceStatus`, `setExperienceStatus`, `deleteExperience`, `saveExperience`) DO revalidate `/`. | P1 | `experiences.ts:143-145` |
| E-4 | **`is_published` defaults to `false`** — Public queries filter on `.eq("is_published", true)`. Newly created experiences are invisible publicly even if the INSERT succeeded. | P1 | `experiences-list-admin.tsx:188` |
| E-5 | **`destination_id` fallback is invalid** — Defaults to `destinations[0]?.id || "d1"`. The string `"d1"` is not a valid UUID and would cause a FK violation if no destinations exist. | P2 | `experiences-list-admin.tsx:157` |
| E-6 | **`boat_id` hardcoded to `"1"`** — Not a valid UUID format. Would cause FK violation if boat with ID "1" doesn't exist. | P2 | `experiences-list-admin.tsx:159` |

### Root Cause of "Experience disappears on refresh"

```
1. Admin clicks Save
2. Server action sends INSERT with status="pending_approval"
3. PostgreSQL CHECK constraint rejects: invalid status value — INSERT FAILS
4. Server action throws error
5. Catch block logs to console — NO USER FEEDBACK
6. UI does NOT add to local state (correct — checks res.success first)
7. But user sees no error message — appears to have done nothing
8. On refresh, experience doesn't exist
```

---

# PART 8 — STATUS AND PUBLISHING MODEL

### Content Visibility Rules

| Content | Admin Visibility | Public Visibility | Status Field | Default | Sync Mechanism |
|---------|-----------------|-------------------|--------------|---------|----------------|
| Destination | All (no filter) | `is_active = true` | `status` TEXT | `'draft'` | DB trigger: `is_active := (status = 'published')` |
| Experience | All (no filter) | `is_published = true` | `status` TEXT + `is_published` BOOLEAN | `'draft'` / `false` | DB trigger: `is_published := (status = 'published')` |
| Partner/Provider | All (no filter) | N/A (not public) | `is_active` BOOLEAN | `true` | No sync with `is_disabled` |
| Boat | All (no filter) | N/A (not public) | `is_active` BOOLEAN | `true` | None |

### Inconsistencies Found

| # | Inconsistency | Impact |
|---|--------------|--------|
| 1 | **Destinations** use `is_active` for public visibility. **Experiences** use `is_published`. Different columns, different semantics. | Maintenance confusion |
| 2 | **`providers.is_active`** and **`providers.is_disabled`** are not synced by any trigger. They can drift independently. | Logic confusion |
| 3 | **Experience `status: "pending_approval"`** is used in the UI but is NOT in the DB CHECK constraint. Only `draft`, `published`, `hidden`, `archived` are valid. | INSERT always fails |
| 4 | **Experience `is_published`** can be directly updated, bypassing the trigger (which only fires on `UPDATE OF status`). This creates a divergence between `is_published` and `status`. | Data inconsistency |

---

# PART 9 — CACHE AND REVALIDATION AUDIT

### Revalidation Matrix

| Operation | `revalidatePath` Calls | Missing? |
|-----------|----------------------|----------|
| `createPartner` | `/admin/partners`, `/partner/settings` | — |
| `updatePartner` | `/admin/partners`, `/partner/settings` | — |
| `createDestination` | `/admin/destinations`, `/destinations`, `/` | — |
| `saveDestination` | `/admin/destinations`, `/destinations`, `/` | — |
| `deleteDestination` | `/admin/destinations`, `/destinations`, `/` | — |
| `toggleDestinationStatus` | `/admin/destinations`, `/destinations`, `/` | — |
| `setDestinationStatus` | `/admin/destinations`, `/destinations`, `/` | — |
| `createExperience` | `/partner/boats`, `/admin/experiences`, `/experiences` | **`/` (homepage)** |
| `saveExperience` | `/partner/boats`, `/admin/experiences`, `/experiences`, `/` | — |
| `deleteExperience` | `/admin/experiences`, `/experiences`, `/` | — |
| `toggleExperienceStatus` | `/partner/boats`, `/admin/experiences`, `/experiences`, `/` | — |
| `setExperienceStatus` | `/partner/boats`, `/admin/experiences`, `/experiences`, `/` | — |

### Issue

**`createExperience` does NOT revalidate `/` (homepage).** All other mutation functions revalidate the homepage. This means newly created (and later approved) experiences will NOT appear on the homepage until some other revalidation event occurs.

---

# PART 10 — SUPABASE CLIENT AUDIT

| Operation | Client | Expected | RLS? | Issue? |
|-----------|--------|----------|------|--------|
| Admin creates partner | `createAdminClient()` | ✓ Service-role for auth user creation | No | — |
| Admin reads partners | `createClient()` (SSR) | ✓ Cookie-based for RLS | Yes | — |
| Admin creates destination | `createClient()` (SSR) | ⚠️ Should use admin client | Yes | RLS INSERT policy requires admin role check |
| Admin reads destinations | `createClient()` (SSR) | ✓ | Yes | — |
| Admin creates experience | `createClient()` (SSR) | ⚠️ Should use admin client | Yes | RLS INSERT policy requires admin role check |
| Admin reads experiences | `createClient()` (SSR) | ✓ | Yes | — |
| Public reads destinations | `createAdminClient()` | ✓ Service-role | No | — |
| Public reads experiences | `createAdminClient()` | ✓ Service-role | No | — |

### Issue

**Admin create operations for destinations and experiences use `createClient()` (SSR cookie client) which IS subject to RLS.** The RLS INSERT policies for these tables require admin role. If the admin session is valid, this works. But if there's any session issue, the INSERT fails silently.

**In contrast, partner creation uses `createAdminClient()` which bypasses RLS entirely.** This is more reliable for admin operations.

---

# PART 11 — RLS AUDIT

### Policy Matrix (final effective state)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | Own row + Admin | **NONE** | **NONE** | **NONE** |
| `providers` | Own + Admin | Own + Admin | Own + Admin | Own + Admin |
| `boats` | Own + Admin | Own + Admin | Own + Admin | Own + Admin |
| `destinations` | Public (true) + Admin | Admin | Admin | Admin |
| `experiences` | Published + Own + Admin | Admin | Admin | Admin |
| `experience_images` | Public (true) | Admin | Admin | Admin |
| `time_slots` | Public (true) | Own via experience | Own via experience | Own via experience |

### Critical RLS Gaps

| # | Gap | Impact |
|---|-----|--------|
| 1 | **`profiles` has NO INSERT/UPDATE/DELETE policies** | No user can create or modify profiles via RLS. All profile mutations must use `service_role` or SECURITY DEFINER functions. |
| 2 | **`time_slots` has NO admin policy** | Admins cannot manage time slots via the Supabase client. Only providers linked through experience→boat can. |
| 3 | **`experience_images` has NO provider policy** | Providers cannot manage images for their own experiences. Only admins can. |

### RLS and Destination/Experience Creation

The `destinations` INSERT policy:
```sql
"Admin manages destinations" FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
```

The `experiences` INSERT policy:
```sql
"Admin full access" FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
```

Both require the authenticated user to have `role = 'admin'` in the `profiles` table. The `createClient()` (SSR cookie) uses the logged-in user's JWT. If the admin's session is valid and their profile has `role = 'admin'`, RLS passes.

**However:** The `createPartner` function uses `createAdminClient()` (bypasses RLS) while `createDestination` and `createExperience` use `createClient()` (subject to RLS). This inconsistency means destination/experience creation is more fragile.

---

# PART 12 — DATABASE SCHEMA VS TYPESCRIPT TYPES

### Drift Summary

**No missing columns or type mismatches.** All columns from migrations are present in `database.ts`.

**Nullable mismatches (systematic pattern):**

| Table | Columns typed non-nullable in TS but nullable in DB |
|-------|------------------------------------------------------|
| `providers` (12) | `port_location`, `is_active`, `rating`, `total_trips`, `total_revenue`, `commission_rate`, `commission_effective_date`, `commission_status`, `commission_last_modified`, `created_at`, `commission_type`, `is_disabled` |
| `boats` (2) | `is_active`, `created_at` |
| `destinations` (2) | `is_active`, `is_featured` |
| `experiences` (2) | `is_published`, `rating` |
| `experience_images` (1) | `display_order` |

**Risk:** LOW in practice (DEFAULT values prevent NULL on INSERT), but an explicit `UPDATE SET col = NULL` would succeed at DB level and cause TS runtime errors.

---

# PART 13 — ERROR HANDLING AUDIT

### Create Flow Error Handling

| Flow | Error Checked? | UI Feedback | Optimistic Update | Issue |
|------|---------------|-------------|-------------------|-------|
| Partner CREATE | ✓ `createUserError`, `profileError`, `providerError` | ✓ `alert("Erreur: " + res.error)` | AFTER success (correct) | — |
| Destination CREATE | ✓ `if (error) throw` | ✗ `console.error` only | **BEFORE server action (BUG)** | Silent failure + false optimistic state |
| Experience CREATE | ✓ `if (error) throw` | ✗ `console.error` only | AFTER success (correct) | Silent failure — user gets no feedback |

### Fake Success Patterns

**D-2/D-3: Destination creation has a fake success pattern.** The UI adds the destination to local state BEFORE the server action is called (line 168-174). If the server action fails, the item remains in local state. The user sees it in the list. On refresh, it's gone.

**E-2: Experience creation silently fails.** The catch block only does `console.error`. No `alert()`, no visual feedback. The user clicks Save, the modal closes, and nothing appears to happen.

---

# PART 14 — CRUD COMPLETENESS

| Feature | CREATE | READ ADMIN | READ PUBLIC | UPDATE | DELETE |
|---------|--------|------------|-------------|--------|--------|
| Partners | ✓ PASS | ✓ PASS | N/A | ✓ PASS | ✓ PASS |
| Destinations | ✗ **FAIL** (invalid UUID) | ✓ PASS | ✓ PASS (if published) | ✓ PASS | ✓ PASS |
| Experiences | ✗ **FAIL** (invalid status) | ✓ PASS | ✓ PASS (if published) | ✓ PASS | ✓ PASS |

---

# PART 15 — END-TO-END DATA FLOW MATRIX

| Flow | Create | DB Persist | Admin Refresh | Public/Client Visibility | Status |
|------|--------|------------|---------------|--------------------------|--------|
| Partner | ✓ Server action succeeds | ✓ Records persist | ✓ `revalidatePath` triggers re-fetch | N/A (not public) | **PASS** |
| Destination | ✗ UUID constraint violation | ✗ INSERT rejected | ✗ Item not in DB | ✗ `is_active = false` | **FAIL — 3 root causes** |
| Experience | ✗ CHECK constraint violation | ✗ INSERT rejected | ✗ Item not in DB | ✗ `is_published = false` | **FAIL — 2 root causes** |

---

# PART 16 — ROOT CAUSE CLASSIFICATION

### P0 — Critical (Prevents core business functionality)

**ID: D-1 — Invalid UUID in destination creation**
- Priority: **P0**
- Location: `destinations-list-admin.tsx:122` → `experiences.ts:255`
- The `handleAddClick` function creates a temp ID `"new-${Date.now()}"` which is not a valid UUID. The `createDestination` server action passes this directly to `.insert()`. PostgreSQL rejects the INSERT because `destinations.id` is `UUID PRIMARY KEY`.
- Fix: Strip the `id` field from the insert payload, or let the DB generate it via `gen_random_uuid()`.

**ID: D-2 — Optimistic state update before server action**
- Priority: **P0**
- Location: `destinations-list-admin.tsx:168-174`
- The `handleSaveEdit` function calls `setDestinations()` to add the new item to local state BEFORE calling `createDestination()`. If the server action fails, the item appears in the UI but doesn't persist.
- Fix: Move the `setDestinations()` call INSIDE the `if (res?.success)` block, or restructure to only update state after server confirmation.

**ID: D-3 — Silent error swallowing in destination creation**
- Priority: **P0**
- Location: `destinations-list-admin.tsx:182-184`
- The catch block only does `console.error("Failed to save destination:", err)`. No `alert()`, no user feedback. The user has no idea the save failed.
- Fix: Add `alert("Erreur: " + err.message)` and rollback the optimistic state update.

**ID: E-1 — Invalid status value in experience creation**
- Priority: **P0**
- Location: `experiences-list-admin.tsx:156` → `experiences.ts:139`
- The `handleAddExperience` function sets `status: "pending_approval"` which is NOT in the DB CHECK constraint `IN ('draft','published','hidden','archived')`. PostgreSQL rejects the INSERT.
- Fix: Change default status to `"draft"` (which IS in the CHECK constraint).

**ID: E-2 — Silent error swallowing in experience creation**
- Priority: **P0**
- Location: `experiences-list-admin.tsx:226-228`
- The catch block only does `console.error("Failed to save experience:", err)`. No `alert()`, no user feedback.
- Fix: Add `alert("Erreur: " + err.message)`.

### P1 — Major (Serious operational problems)

**ID: D-4 — No status field in destination create payload**
- Priority: **P1**
- Location: `destinations-list-admin.tsx:120-134`
- The `handleAddClick` function never sets `status`. The DB default `'draft'` applies. The DB trigger sets `is_active = false`. Newly created destinations are invisible publicly.
- Fix: Either set `status: "draft"` explicitly in the create payload, or document that admin must manually publish after creation.

**ID: E-3 — Missing `revalidatePath("/")` in `createExperience`**
- Priority: **P1**
- Location: `experiences.ts:143-145`
- All other mutation functions revalidate `/` (homepage). `createExperience` does not. Newly created experiences won't appear on the homepage until another revalidation event.
- Fix: Add `revalidatePath("/")` to the `createExperience` function.

**ID: E-4 — `is_published` defaults to `false` for experiences**
- Priority: **P1**
- Location: `experiences-list-admin.tsx:188`
- Public queries filter on `.eq("is_published", true)`. Newly created experiences are invisible publicly even if the INSERT succeeds.
- Fix: Either default to `true` for admin-created experiences, or document the publish workflow.

### P2 — Important (Incorrect behavior, not blocking)

**ID: P-1 — No transaction in partner creation**
- Priority: **P2**
- Location: `admin-partners.ts:25-62`
- Three separate DB writes (auth user, profile, provider) without a transaction. Partial failure leaves orphaned records.
- Fix: Consider using a Supabase database function with a transaction, or add cleanup logic for partial failures.

**ID: E-5 — Invalid `destination_id` fallback**
- Priority: **P2**
- Location: `experiences-list-admin.tsx:157`
- Defaults to `destinations[0]?.id || "d1"`. The string `"d1"` is not a valid UUID and would cause a FK violation.
- Fix: Remove the fallback or use a valid UUID.

**ID: E-6 — Invalid `boat_id` hardcoded value**
- Priority: **P2**
- Location: `experiences-list-admin.tsx:159`
- Hardcoded to `"1"` which may not be a valid UUID or may not exist.
- Fix: Use a dynamic default from the boats list.

**ID: D-5 — `is_active: false` redundant in destination create**
- Priority: **P2**
- Location: `destinations-list-admin.tsx:132`
- The DB trigger overwrites `is_active` based on `status`. Setting it in the insert payload has no effect.
- Fix: Remove the redundant field.

### P3 — Minor (UX or maintainability)

**ID: P-2 — `checkRole` clarity**
- Priority: **P3**
- Location: `admin-partners.ts:21`
- If the admin session is expired, the error message may be unclear.
- Fix: Improve error messaging in `checkRole`.

---

## REPAIR PLAN SUMMARY

### Phase 2B.2B — Implementation Changes Required

| File | Change | Bug IDs |
|------|--------|---------|
| `src/components/admin/destinations-list-admin.tsx` | 1. Remove `id` from insert payload (let DB generate UUID) | D-1 |
| | 2. Move `setDestinations()` inside success block | D-2 |
| | 3. Add `alert()` in catch block + rollback state | D-3 |
| | 4. Remove redundant `is_active: false` | D-5 |
| `src/components/admin/experiences-list-admin.tsx` | 1. Change default `status` from `"pending_approval"` to `"draft"` | E-1 |
| | 2. Add `alert()` in catch block | E-2 |
| | 3. Fix `destination_id` fallback | E-5 |
| | 4. Fix `boat_id` hardcoded value | E-6 |
| `src/lib/actions/experiences.ts` | 1. Add `revalidatePath("/")` to `createExperience` | E-3 |
| | 2. Strip `id` field from destination insert payload (defense in depth) | D-1 |

### No database migrations required.

All fixes are in the application layer. The DB schema, RLS policies, and triggers are correct as designed.

---

**PHASE 2B.2A AUDIT COMPLETE**

**READY FOR IMPLEMENTATION**
