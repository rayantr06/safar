import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env.local from web/ directory
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, "web", ".env.local");
const envVars = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter(l => l && !l.startsWith("#") && l.includes("="))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = "admin@safardz.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Could not read credentials from web/.env.local");
  process.exit(1);
}

if (!ADMIN_PASSWORD) {
  console.error("Missing required env var: ADMIN_PASSWORD");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log("Connecting to Supabase...");

// 1. List existing users
const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
if (listError) { console.error("listUsers failed:", listError.message); process.exit(1); }

const existing = users.find(u => u.email === ADMIN_EMAIL);
let userId;

if (existing) {
  console.log(`User ${ADMIN_EMAIL} exists, updating password...`);
  const { error } = await supabase.auth.admin.updateUserById(existing.id, { password: ADMIN_PASSWORD });
  if (error) { console.error("updateUserById failed:", error.message); process.exit(1); }
  userId = existing.id;
} else {
  console.log(`Creating user ${ADMIN_EMAIL}...`);
  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Admin Safar" },
  });
  if (error) { console.error("createUser failed:", error.message); process.exit(1); }
  userId = data.user.id;
}

// 2. Upsert profile with admin role
console.log("Setting admin role in profiles table...");
const { error: profileError } = await supabase.from("profiles").upsert({
  id: userId,
  role: "admin",
  full_name: "Admin Safar",
});

if (profileError) {
  console.warn("profiles upsert failed (table may not exist yet):", profileError.message);
  console.log("\nRun the SQL migrations first, then re-run this script.");
  process.exit(1);
}

console.log(`\n✓ Admin account ready!`);
console.log(`  Email:    ${ADMIN_EMAIL}`);
console.log(`  Password: ${ADMIN_PASSWORD}`);
console.log(`  User ID:  ${userId}`);
console.log(`\nLog in at: /portal-login`);
