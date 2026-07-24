# Phase 2B.1 — Partner Settings Functionality Audit

**Date:** 2026-07-24
**Status:** READ-ONLY AUDIT — NO CODE MODIFIED
**Project:** `C:\Users\msdnl\safar dz 2.0\web`

---

## 1. Executive Summary

The Partner Settings page (`/partner/settings`) is a **non-functional UI shell**. It contains zero database reads and zero database writes. All six form fields are initialized with hardcoded `useState` values. The Save button calls `alert()` and persists nothing. No partner-facing server action exists anywhere in the codebase.

The page was clearly designed as a placeholder — the layout performs real auth checks, but the child page ignores them entirely. The existing `updatePartner` server action (in `admin-partners.ts`) already supports the exact fields needed and even calls `revalidatePath("/partner/settings")`, but it is gated behind `checkRole(["admin"])` and never imported by the settings page.

**Root cause:** The page has no data fetching, no server action, and no way to identify the current partner. Three compounding gaps must be addressed simultaneously.

---

## 2. Files Discovered

| File | Role | Relevant Functions |
|------|------|--------------------|
| `src/app/partner/settings/page.tsx` | **Page** — the settings form (239 lines) | `handleSave()` (fake — `alert()` only) |
| `src/app/partner/layout.tsx` | **Layout** — auth gate + sidebar shell | `supabase.auth.getUser()`, role check |
| `src/components/partner/sidebar-nav.tsx` | **Nav** — sidebar link to `/partner/settings` | Static link |
| `src/components/partner/partner-bottom-nav.tsx` | **Nav** — mobile bottom nav | Static link |
| `src/lib/actions/admin-partners.ts` | **Server Action** — admin-only partner CRUD | `updatePartner()` at line 75 |
| `src/lib/actions/client-profile.ts` | **Server Action** — client profile update | `updateClientProfile()` (client-role only) |
| `src/lib/actions/experiences.ts` | **Server Action** — commission settings | `savePartnerCommissionSettings()` (admin-only) |
| `src/lib/types/database.ts` | **Types** — Provider, Profile, Boat types | Type definitions |
| `src/lib/actions/media.ts` | **Server Action** — image upload | `uploadImage()` (admin/provider role) |
| `src/lib/supabase/admin.ts` | **Client** — service-role Supabase client | `createAdminClient()` |

---

## 3. Current UI Flow

```
Partner clicks "Parametres" in sidebar or "Profil" in bottom nav
    │
    ▼
[partner/layout.tsx] ── Server Component
    ├── supabase.auth.getUser() → if no user, redirect /portal-login
    ├── profiles.role check → if not "provider", redirect /
    ├── Renders sidebar, top bar (name from user_metadata)
    └── Injects {children} → settings page
    │
    ▼
[partner/settings/page.tsx] ── Client Component ("use client")
    │
    ├── useState("Ahmed Mansouri")           ← HARDCODED
    ├── useState("+213 550 12 34 56")        ← HARDCODED
    ├── useState("The Mediterranean Pearl")  ← HARDCODED
    ├── useState("bank")                     ← HARDCODED
    ├── useState("007 99999 000000000000 00") ← HARDCODED
    ├── useState("fr")                       ← HARDCODED
    │
    ├── NO useEffect, NO data fetching, NO Supabase client call
    │
    ├── Renders editable form fields (all work via local state only)
    ├── Avatar: static image from IMAGES.GUIDE_IMAGE
    ├── "Partenaire depuis Mars 2026" ← HARDCODED
    ├── "Changer le mot de passe" button → NO onClick (dead)
    ├── "Se deconnecter" button → window.location.href = "/"
    │
    ▼
User clicks "Enregistrer" (Save)
    │
    ▼
handleSave() → alert("Paramètres enregistrés avec succès !")
    │
    ▼
NOTHING HAPPENS. No data persists. State resets on navigation/reload.
```

**Where the flow stops:** At `handleSave()` — line 19-21. The function body is a single `alert()` call. No server action, no fetch, no Supabase write.

---

## 4. Partner Settings Fields

| Field | UI Label | Editable? | DB Table | DB Column | Current Value Source | Save Implemented? |
|-------|----------|-----------|----------|-----------|---------------------|-------------------|
| `name` | Nom du Partenaire / Capitaine | Yes (Input) | `profiles` + `providers` | `profiles.full_name` + `providers.company_name` | Hardcoded `"Ahmed Mansouri"` | **NO** |
| `phone` | Numéro de téléphone | Yes (Input type=tel) | `profiles` | `profiles.phone` | Hardcoded `"+213 550 12 34 56"` | **NO** |
| `boatName` | Nom de votre bateau principal | Yes (Input) | `boats` | `boats.name` | Hardcoded `"The Mediterranean Pearl"` | **NO** |
| `payoutMethod` | Méthode de paiement préférée | Yes (card toggle) | **NO COLUMN** | — | Hardcoded `"bank"` | **NO** |
| `ribNumber` | Numéro de RIB | Yes (Input, conditional) | **NO COLUMN** | — | Hardcoded `"007 99999 000000000000 00"` | **NO** |
| `lang` | Sélection de la Langue | Yes (radio cards) | **NO COLUMN** | — | Hardcoded `"fr"` | **NO** |

**Additional dead UI elements:**

| Element | Location | Behavior |
|---------|----------|----------|
| "Changer le mot de passe" button | Line 199-205 | **No onClick handler** — does nothing |
| Profile photo edit icon | Line 189 | **No onClick handler** — does nothing |
| "Partenaire depuis Mars 2026" | Line 195 | Hardcoded static text |
| Avatar image | Line 182-187 | Static `IMAGES.GUIDE_IMAGE` |
| "Contacter le support" link | Line 227-228 | `href="#"` — dead link |

---

## 5. Profile vs Provider Data Ownership

### `profiles` table

| Column | Type | Default | Owner |
|--------|------|---------|-------|
| `id` | UUID PK → auth.users(id) | — | Auth system |
| `role` | TEXT NOT NULL | `'provider'` | Admin-only |
| `full_name` | TEXT NOT NULL | — | **Partner-editable** |
| `phone` | TEXT | — | **Partner-editable** |
| `avatar_url` | TEXT | — | **Partner-editable** (needs upload) |
| `created_at` | TIMESTAMPTZ | `now()` | Immutable |
| `updated_at` | TIMESTAMPTZ | `now()` | Auto-managed |

### `providers` table

| Column | Type | Default | Partner-editable? | Admin-only? |
|--------|------|---------|-------------------|-------------|
| `id` | UUID PK → profiles(id) | — | No | No |
| `company_name` | TEXT NOT NULL | — | **Yes** | No |
| `port_location` | TEXT | `'Port de Béjaïa'` | **Yes** | No |
| `bio` | TEXT | — | **Yes** | No |
| `is_active` | BOOLEAN | `true` | No | **Yes** |
| `rating` | NUMERIC(2,1) | `0` | No | System-computed |
| `total_trips` | INTEGER | `0` | No | System-computed |
| `total_revenue` | BIGINT | `0` | No | System-computed |
| `commission_rate` | NUMERIC(4,2) | `15.00` | No | **Yes** |
| `commission_effective_date` | DATE | `now()` | No | **Yes** |
| `commission_status` | TEXT | `'active'` | No | **Yes** |
| `commission_last_modified` | TIMESTAMPTZ | `now()` | No | System-managed |
| `created_at` | TIMESTAMPTZ | `now()` | No | Immutable |
| `whatsapp` | TEXT | — | **Yes** | No |
| `address` | TEXT | — | **Yes** | No |
| `notes` | TEXT | — | **Yes** | No |
| `commission_type` | TEXT | `'percentage'` | No | **Yes** |
| `is_disabled` | BOOLEAN | `false` | No | **Yes** |

### `boats` table (if boat name editing is in scope)

| Column | Type | Partner-editable? |
|--------|------|-------------------|
| `name` | TEXT NOT NULL | **Yes** (own boats only) |

### Missing columns (form fields with no DB backing)

| Form Field | Needs Column? | Suggested Table | Suggested Column |
|------------|--------------|-----------------|-----------------|
| `payoutMethod` | **YES** | `providers` | `payout_method TEXT DEFAULT 'bank'` |
| `ribNumber` | **YES** | `providers` | `rib_number TEXT` |
| `lang` | **YES** | `profiles` | `preferred_language TEXT DEFAULT 'fr'` |

---

## 6. Authenticated Partner Identification

### Current flow

```
Supabase Auth session
    ↓
user.id (UUID from auth.users)
    ↓
profiles.id = user.id (1:1 relationship)
    ↓
providers.id = user.id (1:1 relationship, cascade from profiles)
```

### How the layout identifies the partner

**File:** `src/app/partner/layout.tsx`, lines 17-32

```ts
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/portal-login");

const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();
if (profile?.role !== "provider") redirect("/");
```

The layout correctly identifies the logged-in user via `supabase.auth.getUser()` and verifies the `provider` role. The `user.id` is the same UUID used as `providers.id`.

### How the settings page identifies the partner

**It doesn't.** The page is a pure client component with no Supabase client, no auth check, no user ID. All data is hardcoded.

### Risk of updating wrong partner

**Currently: N/A** — no updates happen. In the repair, the server action must use `supabase.auth.getUser()` to get `user.id` and update `providers.id = user.id` and `profiles.id = user.id`. This is self-referential and cannot accidentally update another partner.

---

## 7. Existing Server Actions

### `updatePartner` — admin-partners.ts:75

| Aspect | Detail |
|--------|--------|
| **Signature** | `updatePartner(partnerId: string, partnerData: { name, company_name?, phone, whatsapp?, email, address?, location?, notes?, commission_type, commission_value, status? })` |
| **Role** | `checkRole(["admin"])` |
| **Client** | `createAdminClient()` (service-role) |
| **Updates `profiles`** | Yes: `full_name`, `phone` |
| **Updates `providers`** | Yes: `company_name`, `port_location`, `whatsapp`, `address`, `notes`, `commission_type`, `commission_rate`, `commission_last_modified`, `is_disabled`, `is_active` |
| **Revalidation** | `/admin/partners`, `/partner/settings` |
| **Used by settings page** | **NO** — admin-gated, never imported |

**Key insight:** This action already does exactly what the settings page needs — it updates both `profiles` and `providers` in a single call, and it already revalidates `/partner/settings`. However, it also updates admin-only fields (commission, is_disabled, is_active) which a partner should NOT be able to set.

### `updateClientProfile` — client-profile.ts:7

| Aspect | Detail |
|--------|--------|
| **Signature** | `updateClientProfile(email: string, updates: { name: string; phone: string })` |
| **Role** | Any authenticated user (self-only) |
| **Client** | `createAdminClient()` (service-role — bypasses RLS) |
| **Updates `profiles`** | Yes: `full_name`, `phone` |
| **Revalidation** | `/client` |
| **Used by settings page** | **NO** — wrong role |

**Key insight:** This action uses `createAdminClient()` to bypass RLS on `profiles` because there is no UPDATE policy. This is the pattern we must follow for the partner settings action.

### `savePartnerCommissionSettings` — experiences.ts:283

| Aspect | Detail |
|--------|--------|
| **Signature** | `savePartnerCommissionSettings(partnerId: string, settings: { commission_rate, effective_date, is_active })` |
| **Role** | `checkRole(["admin"])` |
| **Updates `providers`** | Yes: `commission_rate`, `commission_effective_date`, `commission_status`, `commission_last_modified`, `is_active` |
| **Used by settings page** | **NO** — admin-only |

### No provider-role self-update action exists

There is no `"use server"` function anywhere in the codebase that a provider can call to update their own profile or provider information. All existing update actions are gated behind `checkRole(["admin"])`.

---

## 8. Authorization Audit

| Check | Status | Detail |
|-------|--------|--------|
| Authentication | **EXISTS** in layout | `supabase.auth.getUser()` in `partner/layout.tsx:17-22` |
| Role check | **EXISTS** in layout | `profiles.role === "provider"` check in `partner/layout.tsx:27-32` |
| Provider ownership | **MISSING** in page | Page has no user ID, no Supabase client |
| Server-side ownership | **MISSING** | No server action exists for partner self-update |
| RLS on `profiles` | **BLOCKING** | No UPDATE policy — provider cannot update own profile via PostgREST |
| RLS on `providers` | **PERMISSIVE** | `FOR ALL USING (id = auth.uid())` — provider can update own row |

### Security gap: providers table

The `FOR ALL USING (id = auth.uid())` policy on `providers` has no column-level restrictions. A provider could theoretically update their own `commission_rate`, `is_active`, `is_disabled`, `rating`, `total_trips`, or `total_revenue` via a direct PostgREST call. The settings page must NOT expose these fields in the form.

### Service-role bypass pattern

Both `updatePartner` (admin) and `updateClientProfile` (client) use `createAdminClient()` to bypass RLS on `profiles`. This is the established pattern. The partner settings action should follow the same pattern: authenticate via `createClient()` → `getUser()`, then use `createAdminClient()` for the actual database writes.

---

## 9. RLS Audit

### `profiles` table

| Policy | Operation | Condition | Status |
|--------|-----------|-----------|--------|
| `"Users read own profile"` | SELECT | `id = auth.uid()` | PASS |
| `"Admin reads all profiles"` | SELECT | `public.is_admin()` | PASS |
| (none) | UPDATE | — | **FAIL — no UPDATE policy exists** |
| (none) | INSERT | — | FAIL (handled by triggers/service-role) |
| (none) | DELETE | — | FAIL (not needed) |

**Verdict: PARTIAL** — Providers can read their own profile but cannot update it through PostgREST. The original `"Public read profiles"` was dropped in migration 004 to fix a PII leak. The replacement policies are SELECT-only.

### `providers` table

| Policy | Operation | Condition | Status |
|--------|-----------|-----------|--------|
| `"Provider reads/updates own row"` | ALL | `id = auth.uid()` | PASS (but over-permissive) |
| `"Admin full access providers"` | ALL | admin check | PASS |

**Verdict: PASS** — Providers can update their own row. However, the `FOR ALL` grant is over-permissive — it allows updating admin-only columns like `commission_rate`. This is a design limitation of PostgreSQL RLS (no column-level restrictions).

### `boats` table

| Policy | Operation | Condition | Status |
|--------|-----------|-----------|--------|
| `"Provider reads own boats"` | ALL | `provider_id = auth.uid()` | PASS |
| `"Admin full boats"` | ALL | admin check | PASS |

**Verdict: PASS** — Providers can update their own boats.

---

## 10. Validation Audit

### Current validation

| Field | Client Validation | Server Validation | DB Constraint |
|-------|-------------------|-------------------|---------------|
| `name` | None | None | `NOT NULL` on `profiles.full_name` |
| `phone` | None | None | None |
| `boatName` | None | None | `NOT NULL` on `boats.name` |
| `payoutMethod` | None | None | **No column exists** |
| `ribNumber` | None | None | **No column exists** |
| `lang` | None | None | **No column exists** |

### Required validations (based on existing patterns)

| Field | Validation | Source |
|-------|-----------|--------|
| `name` | Required, non-empty | `profiles.full_name TEXT NOT NULL` |
| `phone` | Optional, string | `profiles.phone TEXT` (nullable) |
| `boatName` | Required if boat exists | `boats.name TEXT NOT NULL` |
| `payoutMethod` | Must be `"bank"` or `"cach"` | New column — CHECK constraint |
| `ribNumber` | Required if `payoutMethod === "bank"` | New column |
| `lang` | Must be `"fr"`, `"ar"`, or `"en"` | New column — CHECK constraint |

---

## 11. Commission Settings Separation

### What Partner Settings currently exposes related to commission

**Nothing.** The settings page has no commission-related fields. It does not display or edit commission rate, commission type, commission status, or effective date.

### What should be exposed to the partner

Based on the existing application model:

| Field | Partner-editable? | Reason |
|-------|-------------------|--------|
| `commission_rate` | **NO** | Admin-controlled commercial term |
| `commission_type` | **NO** | Admin-controlled |
| `commission_status` | **NO** | Admin-controlled |
| `commission_effective_date` | **NO** | Admin-controlled |
| `is_active` | **NO** | Admin-controlled |
| `is_disabled` | **NO** | Admin-controlled |

**These fields must NOT be added to the partner settings form.** They are managed exclusively by admins via the admin partners panel.

### What the partner SHOULD see

The partner may want to view their current commission rate (read-only) for transparency, but should not be able to edit it. This is a UI decision for a later phase.

---

## 12. Media / Storage Audit

### Existing infrastructure

**File:** `src/lib/actions/media.ts`

- **Bucket:** `media` (public, created in migration 005)
- **Path convention:** `{entity}/{entity_id}/{uuid}.{ext}`
- **Supported entities:** `experiences`, `destinations`, `accommodations`, `cms`
- **Role:** `checkRole(["admin", "provider"])` — providers CAN upload
- **Client:** `createAdminClient()` (service-role — bypasses storage RLS)

### Can the media infrastructure be reused for partner avatar?

**Partially.** The `uploadImage` function accepts an `UploadableEntity` type which is `"experiences" | "destinations" | "accommodations" | "cms"`. It does not include `"profiles"` or `"avatars"`. To support avatar uploads, the entity type would need to be extended.

**However:** Avatar upload is out of scope for the minimum viable repair. The profile photo edit button (line 189) has no onClick handler and should remain dead until a separate media upload feature is implemented.

### Storage RLS policies (migration 005)

| Policy | Operation | Condition |
|--------|-----------|-----------|
| `"Public reads media"` | SELECT | `bucket_id = 'media'` |
| `"Admin/provider uploads media"` | INSERT | `bucket_id = 'media' AND role IN ('admin', 'provider')` |
| `"Admin/provider deletes media"` | DELETE | `bucket_id = 'media' AND role IN ('admin', 'provider')` |

Providers can upload and delete media files. The infrastructure is ready for avatar uploads if the entity type is extended.

---

## 13. Revalidation Audit

### Which routes depend on partner settings data?

| Route | Depends on | Revalidate? |
|-------|-----------|-------------|
| `/partner/settings` | `profiles.full_name`, `providers.company_name` | **YES** |
| `/partner` | Layout reads `user.user_metadata` | No (auth metadata, not DB) |
| `/partner/bookings` | `providers.company_name` (for display) | **YES** |
| `/partner/availability` | No partner profile data | No |
| `/partner/boats` | `boats.name` (if boat editing is in scope) | **YES** |
| `/partner/earnings` | No partner profile data | No |
| `/admin/partners` | `profiles.full_name`, `providers.*` | **YES** |

### Existing revalidation patterns

- `updatePartner` (admin): `revalidatePath("/admin/partners")`, `revalidatePath("/partner/settings")`
- `updateClientProfile`: `revalidatePath("/client")`
- All server actions use `revalidatePath()` — no `revalidateTag()` usage found

### Recommended revalidation paths for partner settings repair

```ts
revalidatePath("/partner/settings");
revalidatePath("/partner/bookings");
revalidatePath("/partner/boats");
revalidatePath("/admin/partners");
```

---

## 14. Error Handling Audit

### Current behavior

| Scenario | Current Behavior | Expected Behavior |
|----------|-----------------|-------------------|
| Partner unauthenticated | Layout redirects to `/portal-login` | ✅ CORRECT |
| Partner has no provider record | Layout redirects to `/` | ✅ CORRECT |
| Database update fails | **N/A** — no update happens | Show error message |
| Validation fails | **N/A** — no validation exists | Show field errors |
| RLS blocks update | **N/A** — no update happens | Show error message |
| Network request fails | **N/A** — no request happens | Show error message |
| Save succeeds | `alert("Paramètres enregistrés avec succès !")` | Show success toast, refresh data |
| Save button clicked repeatedly | Multiple alerts | Debounce / disable during save |

### Error handling in existing server actions

- `updatePartner`: Returns `{ success: false, error: message }` — caught by admin UI
- `updateClientProfile`: Returns `{ success: false, error: message }` — caught by client UI
- Both use try/catch with `console.error` and return structured error objects

---

## 15. End-to-End Functionality Score

| Layer | Status | Detail |
|-------|--------|--------|
| Page loads | **PASS** | Layout renders, auth gate works |
| Current data loads | **FAIL** | Zero Supabase queries — all hardcoded |
| Correct partner identified | **FAIL** | No user ID, no Supabase client |
| Form fields connected | **FAIL** | All useState hardcoded |
| Validation | **FAIL** | No validation of any kind |
| Server Action | **FAIL** | No server action exists for partner self-update |
| Database update | **FAIL** | No database writes |
| Authorization | **PARTIAL** | Layout checks role; page has no ownership logic |
| RLS | **PARTIAL** | `providers` allows self-update; `profiles` blocks it |
| Revalidation | **FAIL** | No revalidation (no updates happen) |
| Success feedback | **FAIL** | `alert()` only — no real success |
| Error handling | **FAIL** | No error handling — no operations to fail |
| Data persists after reload | **FAIL** | Nothing persists |

**Overall Score: 0/13 layers functional**

**Rating: FAIL — Complete stub, zero backend integration**

---

## 16. Root Cause

The Partner Settings page fails because of **three compounding gaps**:

1. **No data fetching** — The page is a pure client component with hardcoded `useState` initializers. It never queries `profiles`, `providers`, or `boats` for the current user's data.

2. **No server action** — The `handleSave()` function calls `alert()`. There is no `"use server"` function that a provider can call to update their own profile. The existing `updatePartner` action is admin-gated.

3. **No UPDATE policy on `profiles`** — Even if a server action existed, it cannot update `profiles.full_name` or `profiles.phone` through PostgREST because there is no UPDATE RLS policy. The action must use the service-role admin client (matching the pattern in `client-profile.ts`).

---

## 17. Implementation Plan

### A. Files to modify

| File | Change |
|------|--------|
| `src/app/partner/settings/page.tsx` | Add `useEffect` to fetch data, replace hardcoded `useState`, wire save to server action, add loading/error states |

### B. Files to create

| File | Purpose |
|------|---------|
| `src/lib/actions/partner-settings.ts` | New provider-role server action for self-update |
| `supabase/migrations/009_add_partner_settings_columns.sql` | Add `payout_method`, `rib_number` to `providers`; `preferred_language` to `profiles` |

### C. Database changes

**Migration 009 required:**

```sql
-- Add partner settings columns
ALTER TABLE providers ADD COLUMN IF NOT EXISTS payout_method TEXT DEFAULT 'bank'
  CHECK (payout_method IN ('bank', 'cash'));
ALTER TABLE providers ADD COLUMN IF NOT EXISTS rib_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'fr'
  CHECK (preferred_language IN ('fr', 'ar', 'en'));
```

**No RLS changes needed** — the service-role client bypasses RLS (matching `client-profile.ts` pattern).

### D. Server Actions

**Create new action:** `updatePartnerSettings` in `src/lib/actions/partner-settings.ts`

```ts
"use server";

export async function updatePartnerSettings(settings: {
  full_name?: string;
  phone?: string;
  company_name?: string;
  port_location?: string;
  bio?: string;
  whatsapp?: string;
  address?: string;
  payout_method?: "bank" | "cash";
  rib_number?: string;
  preferred_language?: "fr" | "ar" | "en";
}) {
  // 1. Authenticate: createClient() → getUser()
  // 2. Validate: required fields, format checks
  // 3. Update profiles: createAdminClient() → .from("profiles").update({ full_name, phone, preferred_language })
  // 4. Update providers: createAdminClient() → .from("providers").update({ company_name, port_location, bio, whatsapp, address, payout_method, rib_number })
  // 5. Revalidate: /partner/settings, /partner/bookings, /partner/boats, /admin/partners
  // 6. Return { success: true }
}
```

**Why create new instead of reusing `updatePartner`:**
- `updatePartner` is admin-gated (`checkRole(["admin"])`)
- `updatePartner` updates admin-only fields (commission, is_active, is_disabled)
- A partner should only update their own profile/provider fields
- A separate action enforces the correct authorization boundary

**Why use `createAdminClient()` for writes:**
- `profiles` has no UPDATE RLS policy — PostgREST will reject provider writes
- `client-profile.ts` already uses this pattern (line 16)
- The action authenticates via `createClient()` → `getUser()` first, so service-role usage is safe

### E. Data ownership

| Field | Table | Column |
|-------|-------|--------|
| `full_name` | `profiles` | `full_name` |
| `phone` | `profiles` | `phone` |
| `preferred_language` | `profiles` | `preferred_language` (new) |
| `company_name` | `providers` | `company_name` |
| `port_location` | `providers` | `port_location` |
| `bio` | `providers` | `bio` |
| `whatsapp` | `providers` | `whatsapp` |
| `address` | `providers` | `address` |
| `payout_method` | `providers` | `payout_method` (new) |
| `rib_number` | `providers` | `rib_number` (new) |
| `boatName` | `boats` | `name` (optional — separate action) |

### F. Authorization

```
Partner Settings Page
    ↓
Supabase Auth session → user.id
    ↓
Server action: createClient() → getUser() → verify user exists
    ↓
Update profiles WHERE id = user.id (service-role client)
    ↓
Update providers WHERE id = user.id (service-role client)
```

The `user.id` from `supabase.auth.getUser()` is the same UUID used as `profiles.id` and `providers.id`. This guarantees the partner can only update their own records.

### G. Validation

| Field | Validation |
|-------|-----------|
| `full_name` | Required, string, max 100 chars |
| `phone` | Optional, string, max 20 chars |
| `company_name` | Required, string, max 100 chars |
| `payout_method` | Must be `"bank"` or `"cash"` |
| `rib_number` | Required if `payout_method === "bank"` |
| `preferred_language` | Must be `"fr"`, `"ar"`, or `"en"` |

### H. Revalidation

```ts
revalidatePath("/partner/settings");
revalidatePath("/partner/bookings");
revalidatePath("/partner/boats");
revalidatePath("/admin/partners");
```

### I. UI changes

Minimal — only what's necessary to connect the existing form:

1. Add `useEffect` to fetch `profiles` + `providers` + primary `boat` on mount
2. Replace hardcoded `useState` initializers with DB values (or empty string while loading)
3. Add loading state (disable form while fetching)
4. Replace `alert()` with server action call
5. Add success/error feedback (toast or inline message)
6. Add `disabled` state on Save button during submission

**Do NOT redesign the page.** Keep the existing layout, styling, and component structure.

---

## 18. Files to Modify

| File | Lines | Change |
|------|-------|--------|
| `src/app/partner/settings/page.tsx` | 1-239 | Add data fetching, wire save action, add loading/error states |

## 19. Files to Create

| File | Purpose |
|------|---------|
| `src/lib/actions/partner-settings.ts` | Provider self-update server action |
| `supabase/migrations/009_add_partner_settings_columns.sql` | Add payout_method, rib_number, preferred_language columns |

## 20. Database Changes Required

**Yes — migration required.** Three new columns:

```sql
ALTER TABLE providers ADD COLUMN IF NOT EXISTS payout_method TEXT DEFAULT 'bank'
  CHECK (payout_method IN ('bank', 'cash'));
ALTER TABLE providers ADD COLUMN IF NOT EXISTS rib_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'fr'
  CHECK (preferred_language IN ('fr', 'ar', 'en'));
```

**No RLS changes needed.** The service-role client bypasses RLS.

---

## 21. Verification Plan

After implementation:

1. **`npx tsc --noEmit`** — expect 0 errors
2. **Jest** — expect all tests pass
3. **Production build** — expect successful compilation
4. **Manual test — data loading:**
   - Log in as a provider
   - Navigate to `/partner/settings`
   - Verify form fields show real data (not hardcoded placeholders)
5. **Manual test — save:**
   - Edit name, phone, company_name
   - Click Save
   - Verify success feedback (not alert())
   - Reload page
   - Verify changes persist
6. **Manual test — authorization:**
   - Verify partner cannot set commission_rate via form
   - Verify partner cannot set is_active/is_disabled via form
7. **Manual test — error handling:**
   - Test with empty required fields
   - Test with invalid data
   - Verify error messages appear

---

**PHASE 2B.1 AUDIT COMPLETE**

**READY FOR IMPLEMENTATION**
