import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "../types/database";

// Create a single supabase client for interacting with your database
// on the server side (Server Components, Server Actions, Route Handlers)
export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as CookieOptions)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
  if (isPlaceholder) {
    const mockAuth = {
      ...client.auth,
      async signInWithPassword({ email, password }: any) {
        if (email === "admin@safardz.com") {
          try {
            cookieStore.set("safar_role", "admin", { path: "/" });
          } catch {}
          return { data: { user: { id: "mock-admin-id", email, user_metadata: { full_name: "Admin Safar" } } }, error: null };
        } else if (email === "partner@safardz.com") {
          try {
            cookieStore.set("safar_role", "provider", { path: "/" });
            cookieStore.set("safar_user_id", "mock-partner-id", { path: "/" });
          } catch {}
          return { data: { user: { id: "mock-partner-id", email, user_metadata: { full_name: "Partenaire Safar" } } }, error: null };
        }
        
        // Check dynamic partners list
        try {
          const { getMockDb, saveMockDb } = require("./mock-db-helper");
          const db = getMockDb();
          
          // 1. Check partner
          const partners = db.partners || {};
          const matchedPartner = Object.values(partners).find(
            (p: any) => p.email?.toLowerCase() === email?.toLowerCase()
          ) as any;

          if (matchedPartner) {
            if (matchedPartner.is_disabled || matchedPartner.status === "disabled") {
              return { data: { user: null }, error: { message: "Ce compte a été désactivé par l'administrateur." } };
            }
            if (matchedPartner.password === password) {
              try {
                cookieStore.set("safar_role", "provider", { path: "/" });
                cookieStore.set("safar_user_id", matchedPartner.id, { path: "/" });
              } catch {}
              return {
                data: {
                  user: {
                    id: matchedPartner.id,
                    email: matchedPartner.email,
                    user_metadata: { full_name: matchedPartner.name }
                  }
                },
                error: null
              };
            }
          }

          // 2. Check client dynamic registration/login
          if (!db.clients) db.clients = {};
          let matchedClient = db.clients[email.toLowerCase()];
          if (!matchedClient) {
            // Auto-register client on first login
            matchedClient = {
              id: `c-${Date.now()}`,
              email: email.toLowerCase(),
              password: password,
              name: email.split("@")[0],
              phone: "",
              created_at: new Date().toISOString()
            };
            db.clients[email.toLowerCase()] = matchedClient;
            saveMockDb(db);
          }

          if (matchedClient.password === password) {
            try {
              cookieStore.set("safar_role", "client", { path: "/" });
              cookieStore.set("safar_user_id", matchedClient.email, { path: "/" });
            } catch {}
            return {
              data: {
                user: {
                  id: matchedClient.id,
                  email: matchedClient.email,
                  user_metadata: { full_name: matchedClient.name, phone: matchedClient.phone }
                }
              },
              error: null
            };
          }
        } catch (err) {
          console.error("Sign in mock error:", err);
        }
        return { data: { user: null }, error: { message: "Email ou mot de passe incorrect." } };
      },
      async getUser() {
        const role = cookieStore.get("safar_role")?.value;
        const userId = cookieStore.get("safar_user_id")?.value;
        if (role === "admin") {
          return { data: { user: { id: "mock-admin-id", email: "admin@safardz.com", user_metadata: { full_name: "Admin Safar" } } }, error: null };
        } else if (role === "provider") {
          try {
            const { getMockDb } = require("./mock-db-helper");
            const db = getMockDb();
            const partner = db.partners?.[userId || ""] || db.partners?.["mock-partner-id"];
            return {
              data: {
                user: {
                  id: partner?.id || "mock-partner-id",
                  email: partner?.email || "partner@safardz.com",
                  user_metadata: { full_name: partner?.name || "Partenaire Safar" }
                }
              },
              error: null
            };
          } catch {
            return { data: { user: { id: "mock-partner-id", email: "partner@safardz.com", user_metadata: { full_name: "Partenaire Safar" } } }, error: null };
          }
        } else if (role === "client") {
          try {
            const { getMockDb } = require("./mock-db-helper");
            const db = getMockDb();
            const client = db.clients?.[(userId || "").toLowerCase()];
            return {
              data: {
                user: {
                  id: client?.id || `c-${userId}`,
                  email: client?.email || userId || "client@example.com",
                  user_metadata: {
                    full_name: client?.name || userId?.split("@")[0] || "Client Safar",
                    phone: client?.phone || ""
                  }
                }
              },
              error: null
            };
          } catch {
            return { data: { user: { id: `c-${userId}`, email: userId || "client@example.com", user_metadata: { full_name: "Client Safar", phone: "" } } }, error: null };
          }
        }
        return { data: { user: null }, error: null };
      },
      async signOut() {
        try {
          cookieStore.set("safar_role", "", { path: "/", expires: new Date(0) });
          cookieStore.set("safar_user_id", "", { path: "/", expires: new Date(0) });
        } catch {}
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
                    const role = cookieStore.get("safar_role")?.value;
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

      if (table === "bookings") {
        const { getMockDb, saveMockDb } = require("./mock-db-helper");
        const chain: any = {
          select: () => chain,
          eq(col: string, val: any) {
            chain.filterCol = col;
            chain.filterVal = val;
            return chain;
          },
          order: () => chain,
          single() {
            const db = getMockDb();
            const list = db.bookings || [];
            let result = list;
            if (chain.filterCol && chain.filterVal) {
              result = list.filter((b: any) => b[chain.filterCol] === chain.filterVal);
            }
            const item = result[0];
            if (!item) return Promise.resolve({ data: null, error: { message: "Not found" } });
            return Promise.resolve({
              data: {
                ...item,
                experiences: {
                  title: item.experience_id === "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e" || item.experience_id === "2"
                    ? "Sortie Pêche & Baignade - Les Falaises"
                    : item.experience_id === "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f"
                    ? "Tour Partagé - Île des Pisans (Boulimate)"
                    : "Balade privée Cap Carbon & Aiguades",
                  main_image_url: item.experience_id === "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e" || item.experience_id === "2"
                    ? "https://lh3.googleusercontent.com/p/AF1QipP_n0cM3r_G9pE3D_nF8wWvTf2FhQ4-1B1H4o0R=s1360-w1360-h1020"
                    : item.experience_id === "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f"
                    ? "https://lh3.googleusercontent.com/p/AF1QipNjQZ5hNfWw9O9n5zXgZ4E9FkO6W4W3oR2Z8x9C=s1360-w1360-h1020"
                    : "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
                  duration_minutes: item.duration_minutes || 120,
                  max_guests: 6
                }
              },
              error: null
            });
          },
          update(updates: any) {
            chain.updates = updates;
            return chain;
          },
          insert(newRows: any) {
            const db = getMockDb();
            if (!db.bookings) db.bookings = [];
            const rows = Array.isArray(newRows) ? newRows : [newRows];
            const created: any[] = [];
            
            for (const r of rows) {
              const ref = r.booking_ref;
              const exists = ref ? db.bookings.find((b: any) => b.booking_ref === ref) : null;
              if (exists) {
                created.push(exists);
              } else {
                const newRow = {
                  id: r.id || `b-${Date.now()}`,
                  booking_ref: ref || `#SF-M${Math.floor(1000 + Math.random() * 9000)}`,
                  created_at: new Date().toISOString(),
                  ...r
                };
                db.bookings.push(newRow);
                created.push(newRow);
              }
            }
            saveMockDb(db);
            
            const returnData = Array.isArray(newRows) ? created : created[0];
            return {
              select: () => ({
                single: () => Promise.resolve({ data: returnData, error: null }),
                then: (resolve: any) => resolve({ data: returnData, error: null })
              }),
              then: (resolve: any) => resolve({ data: returnData, error: null })
            };
          },
          then(resolve: any) {
            const db = getMockDb();
            let list = db.bookings || [];

            if (chain.updates && chain.filterCol && chain.filterVal) {
              list = list.map((b: any) => {
                if (b[chain.filterCol] === chain.filterVal) {
                  return { ...b, ...chain.updates };
                }
                return b;
              });
              db.bookings = list;
              saveMockDb(db);
              resolve({ data: { success: true }, error: null });
              return;
            }

            if (chain.filterCol && chain.filterVal) {
              list = list.filter((b: any) => b[chain.filterCol] === chain.filterVal);
            }

            const formatted = list.map((b: any) => ({
              ...b,
              experiences: {
                title: b.experience_id === "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e" || b.experience_id === "2"
                  ? "Sortie Pêche & Baignade - Les Falaises"
                  : b.experience_id === "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f"
                  ? "Tour Partagé - Île des Pisans (Boulimate)"
                  : "Balade privée Cap Carbon & Aiguades",
                main_image_url: b.experience_id === "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e" || b.experience_id === "2"
                  ? "https://lh3.googleusercontent.com/p/AF1QipP_n0cM3r_G9pE3D_nF8wWvTf2FhQ4-1B1H4o0R=s1360-w1360-h1020"
                  : b.experience_id === "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f"
                  ? "https://lh3.googleusercontent.com/p/AF1QipNjQZ5hNfWw9O9n5zXgZ4E9FkO6W4W3oR2Z8x9C=s1360-w1360-h1020"
                  : "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
                duration_minutes: b.duration_minutes || 120,
                max_guests: 6
              }
            }));
            resolve({ data: formatted, error: null });
          }
        };
        return chain;
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

