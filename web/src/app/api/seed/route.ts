import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const adminPassword = searchParams.get("adminPassword");
  const partnerPassword = searchParams.get("partnerPassword");

  // Security check to prevent unauthorized seeding
  if (key !== "safar-seed-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminPassword || !partnerPassword) {
    return NextResponse.json(
      { error: "Missing query parameters: adminPassword and partnerPassword are required" },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Missing environment variables NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY on the server" },
      { status: 500 }
    );
  }

  // Create client with service role key (bypasses RLS to manage users and profiles)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const adminEmail = "admin@safardz.com";
    
    // Fetch current user list
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      throw listError;
    }

    // 1. Create/Update Admin User
    const existingAdmin = usersData.users.find(u => u.email === adminEmail);
    let userId = existingAdmin?.id;

    if (!existingAdmin) {
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: "Admin Safar" }
      });

      if (createError) {
        throw createError;
      }
      userId = userData.user.id;
    } else {
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId!, {
        password: adminPassword
      });
      if (updateError) {
        throw updateError;
      }
    }

    // Create Admin Profile
    if (userId) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          role: "admin",
          full_name: "Admin Safar"
        });

      if (profileError) {
        throw profileError;
      }
    }

    // 2. Create/Update Default Partner
    const partnerEmail = "partner@safardz.com";
    const existingPartner = usersData.users.find(u => u.email === partnerEmail);
    let partnerId = existingPartner?.id;

    if (!existingPartner) {
      const { data: partData, error: partCreateError } = await supabase.auth.admin.createUser({
        email: partnerEmail,
        password: partnerPassword,
        email_confirm: true,
        user_metadata: { full_name: "Partenaire Safar" }
      });
      if (partCreateError) {
        throw partCreateError;
      }
      partnerId = partData.user.id;
    } else {
      const { error: updateError } = await supabase.auth.admin.updateUserById(partnerId!, {
        password: partnerPassword
      });
      if (updateError) {
        throw updateError;
      }
    }

    // Create Partner Profile and Provider Record
    if (partnerId) {
      const { error: partProfileError } = await supabase
        .from("profiles")
        .upsert({
          id: partnerId,
          role: "provider",
          full_name: "Partenaire Safar"
        });
      if (partProfileError) {
        throw partProfileError;
      }

      const { error: providerError } = await supabase
        .from("providers")
        .upsert({
          id: partnerId,
          company_name: "Safar Partners",
          port_location: "Port de Béjaïa",
          bio: "Partenaire par défaut de la plateforme Safar DZ",
          is_active: true
        });
      if (providerError) {
        throw providerError;
      }
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}
