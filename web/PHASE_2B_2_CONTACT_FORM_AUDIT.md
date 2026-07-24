# Phase 2B.2 — Contact Form Functionality Audit

**Date:** 2026-07-24
**Status:** READ-ONLY AUDIT — NO CODE MODIFIED
**Project:** `C:\Users\msdnl\safar dz 2.0\web`

---

## 1. Executive Summary

The Contact Form (`/contact`) is a **non-functional UI shell**. It renders a styled form with 5 fields, but on submit it only shows a browser `alert()` and discards all data. There is no server action, no API route, no database table, no email service, and no admin page for viewing submissions. The form is purely cosmetic.

---

## 2. File Inventory

| File | Role | Relevant Functions |
|------|------|--------------------|
| `src/app/(public)/contact/page.tsx` | **Page** — the contact form (252 lines) | `onSubmit` → `alert()` only |
| `src/app/(public)/contact-us/page.tsx` | **Alias** — re-exports contact page | `export default ContactPage` |
| `src/app/(public)/layout.tsx` | **Footer** — displays CMS contact info | Reads `site_content` for phone/email/address |
| `src/lib/actions/website-cms.ts` | **CMS** — `contact_info` defaults | Admin-editable site contact details |
| `src/components/admin/website-cms-admin.tsx` | **Admin** — "Contact & Sociaux" tab | Edits site contact info (not submissions) |

### Files that DO NOT exist

- No contact form component in `src/components/`
- No server action for contact submissions in `src/lib/actions/`
- No API routes in `src/app/api/`
- No admin page for viewing contact messages
- No email sending service (nodemailer, resend, sendgrid — none found)
- No `contact_messages` table in database schema

---

## 3. Current Submission Flow

```
Visitor navigates to /contact or /contact-us
    │
    ▼
[contact/page.tsx] ── Client Component ("use client")
    │
    ├── Form with 5 fields:
    │   ├── Nom Complet (full name) — text, required
    │   ├── Adresse Email — email, required
    │   ├── Numero de Telephone — tel, required
    │   ├── Sujet (subject) — select, NOT required
    │   └── Message — textarea, required
    │
    ├── Contact info sidebar (hardcoded):
    │   ├── WhatsApp: +213 556 48 36 34
    │   ├── Phone: 0556 48 36 34
    │   └── Email: contact@safardz.com
    │
    └── Social links (hardcoded)
    │
    ▼
Visitor fills form, clicks "Envoyer le message"
    │
    ▼
onSubmit → e.preventDefault()
    │
    ▼
alert("Message envoyé ! Notre équipe vous contactera rapidement.")
    │
    ▼
NOTHING ELSE HAPPENS.
    │
    ├── No server action called
    │
    ├── No fetch() request
    │
    ├── No database write
    │
    ├── No email sent
    │
    ├── No notification created
    │
    ├── Form fields NOT reset (data remains visible)
    │
    └── Data is permanently lost when user navigates away
```

---

## 4. Form Fields

| Field | HTML Type | Required | Label | Validation |
|-------|-----------|----------|-------|------------|
| Full Name | `text` | Yes (HTML5) | Nom Complet | None beyond required |
| Email | `email` | Yes (HTML5) | Adresse Email | Browser email format check |
| Phone | `tel` | Yes (HTML5) | Numero de Telephone | None beyond required |
| Subject | `select` | **No** | Sujet de votre demande | None — 4 options: booking, partnership, custom, other |
| Message | `textarea` | Yes (HTML5) | Message | None beyond required |

---

## 5. Contact Info Source

The contact page sidebar displays hardcoded contact information:

| Info | Value | Source |
|------|-------|--------|
| WhatsApp | `+213 556 48 36 34` | Hardcoded in page |
| Phone | `0556 48 36 34` | Hardcoded in page |
| Email | `contact@safardz.com` | Hardcoded in page |

The CMS system (`site_content` table, section `contact_info`) stores editable contact info, but the contact page does NOT read from it. The footer in `layout.tsx` does read from CMS.

---

## 6. Database Schema

**No table exists for contact submissions.** The 15 defined tables are:

`profiles`, `providers`, `boats`, `destinations`, `experiences`, `experience_images`, `time_slots`, `bookings`, `booking_status_history`, `provider_payouts`, `site_content`, `accommodations`, `notifications`, `notification_settings`, `boat_availability`

---

## 7. Email / Notification Infrastructure

| Service | Status |
|---------|--------|
| Nodemailer | Not installed |
| Resend | Not installed |
| SendGrid | Not installed |
| Any SMTP config | Not found |
| Webhook service | Not found |
| Push notification | Not found |

The existing notification system (`notifications` table) only handles 5 booking/partner event types. There is no `contact_message` notification type.

---

## 8. Admin View

**No admin page exists for viewing contact submissions.** The 10 admin pages are:

`dashboard`, `bookings`, `partners`, `experiences`, `accommodations`, `availability`, `finance`, `destinations`, `notifications`, `website`

The admin "Contact & Sociaux" tab in `website-cms-admin.tsx` edits the site's own contact details (displayed to visitors), NOT incoming messages.

---

## 9. Validation Assessment

| Layer | Status | Detail |
|-------|--------|--------|
| HTML5 `required` | Partial | 4/5 fields have `required`. Subject dropdown does NOT. |
| HTML5 `type="email"` | Yes | Browser-level email format check |
| HTML5 `type="tel"` | Yes | No format/pattern validation |
| Client-side JS | **No** | No custom validation |
| Server-side | **No** | No server action exists |
| Input sanitization | **No** | No trimming, no XSS protection, no length checks |

---

## 10. End-to-End Functionality Score

| Layer | Status |
|-------|--------|
| Page loads | PASS |
| Form renders | PASS |
| Fields collect input | PASS |
| Validation | PARTIAL (HTML5 only) |
| Submit handler | **FAIL** — alert() only |
| Server Action | **FAIL** — does not exist |
| Database write | **FAIL** — no table, no write |
| Email/notification | **FAIL** — no service configured |
| Admin view | **FAIL** — no admin page |
| Data persists | **FAIL** — nothing persists |

**Overall Score: 2/10 layers functional**

---

## 11. Root Cause

The Contact Form was designed as a visual placeholder. The UI was built but no backend was ever connected. There is:

1. **No database table** for storing submissions
2. **No server action** for processing the form
3. **No admin page** for viewing messages
4. **No email service** for notifications
5. **No validation** beyond HTML5 browser defaults

---

## 12. Recommended Implementation Plan

### Minimum viable repair — 4 changes:

**Change 1: Create migration — `contact_messages` table**

```sql
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access contact_messages"
  ON contact_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

**Change 2: Create server action — `src/lib/actions/contact.ts`**

```ts
"use server";

export async function submitContactMessage(data: {
  full_name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  // Validate required fields
  // Trim and sanitize inputs
  // Insert into contact_messages table
  // Return { success: true }
}
```

**Change 3: Modify contact page — wire form to server action**

- Import `submitContactMessage`
- Replace `alert()` with server action call
- Add loading/success/error states
- Reset form on success

**Change 4: Create admin page — `src/app/admin/messages/page.tsx`**

- List contact messages (newest first)
- Show status (new/read/replied/archived)
- Allow marking as read/replied

### Alternative: Email-only approach

If database storage is not desired, an alternative is to send the form data as an email using a service like Resend or SendGrid. This requires:
- An email service API key
- A server action that sends an email
- No database table needed

### Recommendation

The database approach is preferred because:
- No external service dependency
- Admin can view/manage messages in-app
- Messages persist even if email delivery fails
- Supports status tracking (new → read → replied)
- Matches the existing architecture (Supabase + server actions)

---

## 13. Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/010_create_contact_messages.sql` | New table for contact submissions |
| `src/lib/actions/contact.ts` | Server action for form submission |
| `src/app/admin/messages/page.tsx` | Admin page for viewing messages |
| `src/components/admin/messages-list-admin.tsx` | Admin component for message list |

## 14. Files to Modify

| File | Change |
|------|--------|
| `src/app/(public)/contact/page.tsx` | Wire form to server action, add loading/error states, reset on success |

## 15. Database Changes Required

**Yes — migration required.** New `contact_messages` table with RLS.

## 16. Verification Plan

After implementation:

1. `npx tsc --noEmit` — 0 errors
2. Jest — all tests pass
3. Production build — successful
4. Submit contact form → verify data appears in admin messages page
5. Verify form resets after successful submission
6. Verify error handling for invalid data
7. Verify admin can view and manage messages

---

**PHASE 2B.2 AUDIT COMPLETE**

**READY FOR IMPLEMENTATION**
