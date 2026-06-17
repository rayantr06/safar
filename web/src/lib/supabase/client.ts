import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../types/database";

// Create a single supabase client for interacting with your database
// on the client side
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
