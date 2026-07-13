// Run this script on the machine that has the real Supabase credentials.
//
// Usage:
//   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=eyJ...  \
//   ADMIN_EMAIL=admin@safardz.com \
//   NEW_PASSWORD=yourNewPassword123 \
//   node change-admin-password.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@safardz.com";
const NEW_PASSWORD = process.env.NEW_PASSWORD;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !NEW_PASSWORD) {
  console.error(
    "Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEW_PASSWORD"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Find the user by email
const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error("Failed to list users:", listError.message);
  process.exit(1);
}

const user = users.find((u) => u.email === ADMIN_EMAIL);
if (!user) {
  console.error(`No user found with email: ${ADMIN_EMAIL}`);
  process.exit(1);
}

// 2. Update the password
const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
  password: NEW_PASSWORD,
});

if (updateError) {
  console.error("Failed to update password:", updateError.message);
  process.exit(1);
}

console.log(`Password updated successfully for ${ADMIN_EMAIL} (id: ${user.id})`);
