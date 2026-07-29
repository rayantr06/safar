# Safar DZ — DATABASE_URL Usage Audit

**Date**: 2026-07-28
**Scope**: Full repository scan (source code, config, scripts, dependencies)

---

## Result

**A. DATABASE_URL NOT USED BY APPLICATION — SAFE TO REMOVE FROM PRODUCTION ENVIRONMENT**

---

## Evidence

### 1. Where DATABASE_URL is defined

**Single location**: `web/.env.local:10`

```env
# Database Connection (Optional if using Supabase client directly)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/safar_dz?schema=public
```

The comment itself says **"Optional if using Supabase client directly"** — confirming it is unused.

### 2. Where DATABASE_URL is referenced in runtime code

**Nowhere.** Zero occurrences of:
- `process.env.DATABASE_URL`
- `DATABASE_URL` in any `.ts`, `.tsx`, `.js`, `.mjs`, `.json`, `.yml`, `.yaml`, `.sh`, `.bat`, `.ps1`, `.toml`, `.cfg`, or `.ini` file
- `postgresql://` or `postgres://` in any source or config file

The only files containing the string `DATABASE_URL` are:
- `web/.env.local` — the definition itself
- `web/SAFAR_DZ_PHASE_3_6_DATABASE_SECURITY_SYNC_REPORT.md` — documentation
- `web/SAFAR_DZ_PRODUCTION_READINESS_AUDIT.md` — documentation

### 3. Dependencies that could use DATABASE_URL

| Library | In package.json? | Used in source? |
|---------|-----------------|-----------------|
| `@supabase/supabase-js` | ✅ | ✅ (server, client, middleware, admin) |
| `@supabase/ssr` | ✅ | ✅ (server, middleware) |
| `pg` (node-postgres) | ❌ | ❌ |
| `@prisma/client` / `prisma` | ❌ | ❌ |
| `drizzle-orm` / `drizzle-kit` | ❌ | ❌ |
| `postgres` | ❌ | ❌ |

The application connects to PostgreSQL **exclusively through Supabase clients**:
- **`createClient()`** (`src/lib/supabase/server.ts`) — anon key, respects RLS
- **`createAdminClient()`** (`src/lib/supabase/admin.ts`) — service role key, bypasses RLS
- **`createBrowserClient()`** (`src/lib/supabase/client.ts`) — browser-side anon key client

All three use `NEXT_PUBLIC_SUPABASE_URL` and their respective keys — **never** `DATABASE_URL`.

### 4. What DATABASE_URL would be used for (if it were used)

- Direct PostgreSQL client connections (raw SQL via `pg`, Prisma, Drizzle, etc.)
- Database migration tools run outside the app
- Admin/analytics queries run manually

None of these patterns exist in the Safar DZ codebase. All database operations go through Supabase's HTTP API (REST + RPC), never through a direct PostgreSQL connection.

### 5. Production environment recommendation

`DATABASE_URL` can be **safely omitted** from the production environment. The production deployment only needs:

| Variable | Required? |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Required |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Required |
| `NEXT_PUBLIC_SITE_URL` | ✅ Required |
| `DATABASE_URL` | ❌ Not required |

---

## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | ✅ PASS — 0 errors |
| `npm test` | ✅ PASS — 9/9 tests |
| `npm run build` | ✅ PASS — 41 routes, 0 errors |

The `.env.local` changes (safardz.com → safardz.net) did not affect any build or test output.
