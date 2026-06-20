import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../types/database";

// Create a single supabase client for interacting with your database
// on the client side
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}

function setCookie(name: string, value: string, days?: number) {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days !== undefined) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function createClient() {
  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
  if (isPlaceholder) {
    const mockAuth = {
      ...client.auth,
      async signInWithPassword({ email, password }: any) {
        if (email === "admin@safardz.com") {
          setCookie("safar_role", "admin", 7);
          return { data: { user: { id: "mock-admin-id", email, user_metadata: { full_name: "Admin Safar" } } }, error: null };
        } else if (email === "partner@safardz.com") {
          setCookie("safar_role", "provider", 7);
          setCookie("safar_user_id", "mock-partner-id", 7);
          return { data: { user: { id: "mock-partner-id", email, user_metadata: { full_name: "Partenaire Safar" } } }, error: null };
        }
        
        // Default client role mapping
        setCookie("safar_role", "client", 7);
        setCookie("safar_user_id", email, 7);
        return { data: { user: { id: `c-${email}`, email, user_metadata: { full_name: email.split("@")[0] } } }, error: null };
      },
      async getUser() {
        const role = getCookie("safar_role");
        const userId = getCookie("safar_user_id");
        if (role === "admin") {
          return { data: { user: { id: "mock-admin-id", email: "admin@safardz.com", user_metadata: { full_name: "Admin Safar" } } }, error: null };
        } else if (role === "provider") {
          return { data: { user: { id: userId || "mock-partner-id", email: "partner@safardz.com", user_metadata: { full_name: "Partenaire Safar" } } }, error: null };
        } else if (role === "client") {
          return { data: { user: { id: `c-${userId}`, email: userId || "client@example.com", user_metadata: { full_name: userId?.split("@")[0] || "Client Safar" } } }, error: null };
        }
        return { data: { user: null }, error: null };
      },
      async signOut() {
        setCookie("safar_role", "", -1);
        setCookie("safar_user_id", "", -1);
        return { error: null };
      }
    };

    const originalFrom = client.from.bind(client);
    client.from = (table: string) => {
      if (table === "profiles") {
        return {
          select(columns: string) {
            return {
              eq(column: string, value: any) {
                return {
                  async single() {
                    const role = getCookie("safar_role");
                    return {
                      data: { role: role === "admin" ? "admin" : (role === "provider" ? "provider" : "client") },
                      error: null
                    };
                  }
                };
              }
            };
          }
        } as any;
      }
      return originalFrom(table);
    };

    Object.defineProperty(client, "auth", {
      get() {
        return mockAuth;
      }
    });
  }

  return client;
}

