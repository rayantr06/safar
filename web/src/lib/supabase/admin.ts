import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database";
import { IMAGES } from "@/lib/constants";


export const createAdminClient = () => {
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
  if (isPlaceholder) {
    // Return a mocked Supabase client for local development
    const mockClient: any = {
      from(table: string) {
        if (table === "experiences") {
          return {
            select(columns: string) {
              return {
                eq(column: string, value: any) {
                  return {
                    async single() {
                      // Return a mock experience that points to a mock boat and provider
                      return {
                        data: {
                          boat_id: "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a",
                          boats: {
                            provider_id: "mock-partner-id"
                          }
                        },
                        error: null
                      };
                    }
                  };
                }
              };
            }
          };
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
            async single() {
              const db = getMockDb();
              const list = db.bookings || [];
              let result = list;
              if (chain.filterCol && chain.filterVal) {
                result = list.filter((b: any) => {
                  const targetVal = String(chain.filterVal).toLowerCase().trim();
                  const currentVal = String(b[chain.filterCol]).toLowerCase().trim();
                  return currentVal === targetVal;
                });
              }
              const item = result[0];
              if (!item) return { data: null, error: { message: "Not found" } };
              return {
                data: {
                  ...item,
                  experiences: {
                    title: item.experience_id === "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e" || item.experience_id === "2"
                      ? "Sortie Pêche & Baignade - Les Falaises"
                      : item.experience_id === "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f"
                      ? "Tour Partagé - Île des Pisans (Boulimate)"
                      : "Balade privée Cap Carbon & Aiguades",
                    main_image_url: item.experience_id === "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e" || item.experience_id === "2"
                      ? IMAGES.EXPERIENCE_FALAISES
                      : item.experience_id === "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f"
                      ? IMAGES.EXPERIENCE_PISANS
                      : IMAGES.EXPERIENCE_CAP_CARBON,
                    duration_minutes: item.duration_minutes || 120,
                    max_guests: 6
                  }
                },
                error: null
              };
            },
            insert(newRow: any) {
              const db = getMockDb();
              if (!db.bookings) db.bookings = [];
              
              const ref = newRow.booking_ref;
              const exists = ref ? db.bookings.find((b: any) => b.booking_ref === ref) : null;
              const created = exists || {
                id: `b-auto-${Date.now()}`,
                created_at: new Date().toISOString(),
                ...newRow
              };
              if (!exists) {
                db.bookings.push(created);
                saveMockDb(db);
              }

              return {
                select() {
                  return {
                    async single() {
                      return { data: created, error: null };
                    }
                  };
                }
              };
            }
          };
          return chain;
        }

        if (table === "providers") {
          const { getMockDb } = require("./mock-db-helper");
          const chain: any = {
            select: () => chain,
            eq(col: string, val: any) {
              chain.filterCol = col;
              chain.filterVal = val;
              return chain;
            },
            async single() {
              const db = getMockDb();
              const partners = db.partners || {};
              const partner = partners[chain.filterVal] || partners["mock-partner-id"];
              return { data: partner || null, error: null };
            }
          };
          return chain;
        }

        if (table === "time_slots") {
          return {
            select(columns: string) {
              return {
                eq(col: string, val: any) {
                  return {
                    async single() {
                      return {
                        data: {
                          booked_seats: 0,
                          total_seats: 10
                        },
                        error: null
                      };
                    }
                  };
                }
              };
            },
            update(updates: any) {
              return {
                eq(col: string, val: any) {
                  return Promise.resolve({ data: null, error: null });
                }
              };
            }
          };
        }

        if (table === "booking_status_history") {
          return {
            insert(newRow: any) {
              return Promise.resolve({ data: null, error: null });
            }
          };
        }

        // Default empty chain
        const defaultChain: any = {
          select: () => defaultChain,
          eq: () => defaultChain,
          single: () => Promise.resolve({ data: null, error: null }),
          insert: () => defaultChain,
          update: () => defaultChain
        };
        return defaultChain;
      }
    };
    return mockClient;
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
