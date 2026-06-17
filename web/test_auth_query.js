require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // Login as partner
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'partner@safardz.com',
    password: 'password123'
  });

  if (authError) {
    console.error("Login failed", authError);
    return;
  }

  const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        experiences ( title )
      `)
      .eq("provider_id", authData.user.id)
      .order("created_at", { ascending: false });

  console.log("Partner Bookings:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

test();
