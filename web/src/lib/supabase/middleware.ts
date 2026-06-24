import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "../types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as CookieOptions)
          );
        },
      },
    }
  );

  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
  if (isPlaceholder) {
    const mockAuth = {
      ...supabase.auth,
      async getUser() {
        const role = request.cookies.get("safar_role")?.value;
        const userId = request.cookies.get("safar_user_id")?.value;
        if (role === "admin") {
          return { data: { user: { id: "mock-admin-id", email: "admin@safardz.com", user_metadata: { full_name: "Admin Safar" } } }, error: null };
        } else if (role === "provider") {
          return {
            data: {
              user: {
                id: userId || "mock-partner-id",
                email: "partner@safar.dz",
                user_metadata: { full_name: "Partenaire Safar" }
              }
            },
            error: null
          };
        }
        return { data: { user: null }, error: null };
      }
    };

    const originalFrom = supabase.from.bind(supabase);
    supabase.from = (table: string) => {
      if (table === "profiles") {
        return {
          select(columns: string) {
            return {
              eq(column: string, value: any) {
                return {
                  async single() {
                    const role = request.cookies.get("safar_role")?.value;
                    return {
                      data: { role: role === "admin" ? "admin" : "provider" },
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

    Object.defineProperty(supabase, "auth", {
      get() {
        return mockAuth;
      }
    });
  }


  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ROUTE GUARDS
  // Protect admin and partner routes
  const path = request.nextUrl.pathname;

  if (!user && (path.startsWith("/admin") || path.startsWith("/partner") || path.startsWith("/client"))) {
    // redirect to login if accessing protected route without being logged in
    const url = request.nextUrl.clone();
    if (path.startsWith("/admin") || path.startsWith("/partner")) {
      url.pathname = "/portal-login";
    } else {
      url.pathname = "/login";
    }
    return NextResponse.redirect(url);
  }

  if (user) {
    // Fetch profile role
    const { data: profile } = (await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()) as any;
      
    const role = profile?.role || "client";

    if (path.startsWith("/admin")) {
      if (role !== "admin") {
        const url = request.nextUrl.clone();
        if (role === "provider") {
          url.pathname = "/partner";
        } else if (role === "client") {
          url.pathname = "/client";
        } else {
          url.pathname = "/";
        }
        return NextResponse.redirect(url);
      }
    }

    if (path.startsWith("/partner")) {
      if (role !== "provider") {
        const url = request.nextUrl.clone();
        if (role === "admin") {
          url.pathname = "/admin";
        } else if (role === "client") {
          url.pathname = "/client";
        } else {
          url.pathname = "/";
        }
        return NextResponse.redirect(url);
      }
    }

    if (path.startsWith("/client")) {
      if (role !== "client") {
        const url = request.nextUrl.clone();
        if (role === "admin") {
          url.pathname = "/admin";
        } else if (role === "provider") {
          url.pathname = "/partner";
        } else {
          url.pathname = "/";
        }
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
