const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log("Reading environment variables...");
  const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  let supabaseUrl = '';
  let supabaseServiceKey = '';

  envContent.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseServiceKey = line.split('=')[1].trim();
  });

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in .env.local");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log("Connected to Supabase Admin Client!");

  try {
    // 1. Create an auth user for the partner
    console.log("Creating partner auth user...");
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'partner@safardz.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: 'Partenaire Test' }
    });

    if (authError && !authError.message.includes('already registered')) {
      throw authError;
    }
    
    let partnerId;
    if (authError && authError.message.includes('already registered')) {
      const { data: users } = await supabase.auth.admin.listUsers();
      partnerId = users.users.find(u => u.email === 'partner@safardz.com').id;
    } else {
      partnerId = authData.user.id;
    }
    
    console.log("Partner Auth ID:", partnerId);

    // 2. Insert Profile
    console.log("Inserting Profile...");
    await supabase.from('profiles').upsert({
      id: partnerId,
      role: 'provider',
      full_name: 'Partenaire Test',
      phone: '0555000000'
    });

    // 3. Insert Provider
    console.log("Inserting Provider...");
    await supabase.from('providers').upsert({
      id: partnerId,
      company_name: 'Safar Test Boats',
      port_location: 'Port de Béjaïa',
      bio: 'Test provider for SafarDZ'
    });

    // 4. Insert Boat
    console.log("Inserting Boat...");
    const boatId = 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a';
    await supabase.from('boats').upsert({
      id: boatId,
      provider_id: partnerId,
      name: 'Bateau Test 1',
      type: 'private',
      capacity: 10,
      description: 'Bateau de test pour les expériences'
    });

    // 5. Insert Destinations
    console.log("Inserting Destination...");
    const destId = 'e5f6a7b8-c90d-1e2f-3a4b-5c6d7e8f9a0b';
    await supabase.from('destinations').upsert({
      id: destId,
      name: 'Cap Carbon',
      slug: 'cap-carbon',
      description: 'Test destination'
    });

    // 6. Insert Experiences exactly matching MOCK_EXPERIENCES
    console.log("Inserting Experiences...");
    const experiences = [
      {
        id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        boat_id: boatId,
        destination_id: destId,
        title: "Balade privée Cap Carbon & Aiguades",
        slug: "balade-privee-cap-carbon",
        type: "private",
        price_total: 2000000,
        price_per_seat: null,
        duration_minutes: 120,
        max_guests: 6,
        is_published: true,
        badge: "Bestseller"
      },
      {
        id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
        boat_id: boatId,
        destination_id: destId,
        title: "Sortie Pêche & Baignade - Les Falaises",
        slug: "sortie-peche-falaises",
        type: "private",
        price_total: 2500000,
        price_per_seat: null,
        duration_minutes: 180,
        max_guests: 8,
        is_published: true,
        badge: "Idéal Famille"
      },
      {
        id: "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
        boat_id: boatId,
        destination_id: destId,
        title: "Tour Partagé - Île des Pisans (Boulimate)",
        slug: "tour-partage-ile-pisans",
        type: "shared",
        price_total: null,
        price_per_seat: 350000,
        duration_minutes: 150,
        max_guests: 10,
        is_published: true,
        badge: "Populaire"
      }
    ];
    
    for (const exp of experiences) {
      const { error } = await supabase.from('experiences').upsert(exp);
      if (error) console.error("Error inserting experience:", error);
    }
    
    // 7. Insert a time slot for the first experience so shared bookings can work
    console.log("Inserting Time Slot...");
    await supabase.from('time_slots').upsert({
      id: "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9b", 
      experience_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      date: "2026-07-20",
      start_time: "09:00:00",
      end_time: "11:00:00",
      total_seats: 6,
      booked_seats: 0,
      is_blocked: false
    });

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

seed();
