require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data, error } = await supabase
      .from("experiences")
      .select("boats(provider_id)")
      .eq("id", "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d")
      .single();

  console.log("Data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

test();
