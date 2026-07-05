import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  const response = NextResponse.redirect(new URL("/login", request.url), {
    status: 302,
  });
  response.cookies.set("safar_role", "", { expires: new Date(0) });
  return response;
}

