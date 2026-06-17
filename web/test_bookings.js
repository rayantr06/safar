require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

  console.log("Bookings:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

test();
