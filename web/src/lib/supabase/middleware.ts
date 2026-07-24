import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "../types/database";

export async function updateSession(request: NextRequest) {
  // Next.js prefetches every visible <Link> in the background (e.g. all admin
  // sidebar items at once). Each prefetch re-enters this middleware and calls
  // getUser(), which can trigger a session refresh. Supabase refresh tokens
  // are single-use, so several concurrent prefetches racing to refresh the
  // same token invalidate each other, and the very next real navigation then
  // looks logged-out. Prefetches don't need auth enforcement (the real
  // navigation still runs full middleware), so skip them entirely.
  if (request.headers.get("next-router-prefetch") === "1" || request.headers.get("purpose") === "prefetch") {
    return NextResponse.next({ request });
  }

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

  // Route guard: check if user is authenticated
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

  // A NextResponse.redirect() is a brand-new response object, so it doesn't
  // carry the refreshed session cookies written above onto supabaseResponse.
  // Without copying them over, a token refresh that happens right before a
  // redirect gets silently dropped, leaving the browser holding an
  // already-rotated (invalid) refresh token on its next request.
  const redirectWithSession = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  };

  // ROUTE GUARDS
  // Protect admin and partner routes
  const path = request.nextUrl.pathname;
  // "/partner" is the provider portal; "/partners" is the public marketing
  // page and must not be swept up by startsWith("/partner").
  const isPartnerPortal = path === "/partner" || path.startsWith("/partner/");

  if (!user && (path.startsWith("/admin") || isPartnerPortal || path.startsWith("/client"))) {
    // redirect to login if accessing protected route without being logged in
    const url = request.nextUrl.clone();
    if (path.startsWith("/admin") || isPartnerPortal) {
      url.pathname = "/portal-login";
    } else {
      url.pathname = "/login";
    }
    return redirectWithSession(url);
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
        return redirectWithSession(url);
      }
    }

    if (isPartnerPortal) {
      if (role !== "provider") {
        const url = request.nextUrl.clone();
        if (role === "admin") {
          url.pathname = "/admin";
        } else if (role === "client") {
          url.pathname = "/client";
        } else {
          url.pathname = "/";
        }
        return redirectWithSession(url);
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
        return redirectWithSession(url);
      }
    }
  }

  return supabaseResponse;
}
