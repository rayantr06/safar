import { ExperienceSummary } from "@/components/experiences/experience-card";

// Mock data until DB is fully connected
export const MOCK_EXPERIENCES: ExperienceSummary[] = [
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    title: "Balade privée Cap Carbon & Aiguades",
    slug: "balade-privee-cap-carbon",
    type: "private",
    price_total: 2000000, // 20,000 DA in centimes
    price_per_seat: null,
    duration_minutes: 120,
    max_guests: 6,
    badge: "Bestseller",
    destination_name: "Cap Carbon",
    main_image_url: "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
    rating: 4.8,
  },
  {
    id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    title: "Sortie Pêche & Baignade - Les Falaises",
    slug: "sortie-peche-falaises",
    type: "private",
    price_total: 2500000, // 25,000 DA
    price_per_seat: null,
    duration_minutes: 180,
    max_guests: 8,
    badge: "Idéal Famille",
    destination_name: "Les Falaises",
    main_image_url: "https://lh3.googleusercontent.com/p/AF1QipP_n0cM3r_G9pE3D_nF8wWvTf2FhQ4-1B1H4o0R=s1360-w1360-h1020",
    rating: 4.9,
  },
  {
    id: "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
    title: "Tour Partagé - Île des Pisans (Boulimate)",
    slug: "tour-partage-ile-pisans",
    type: "shared",
    price_total: null,
    price_per_seat: 350000, // 3,500 DA
    duration_minutes: 150,
    max_guests: 10,
    badge: "Populaire",
    destination_name: "Île des Pisans",
    main_image_url: "https://lh3.googleusercontent.com/p/AF1QipNjQZ5hNfWw9O9n5zXgZ4E9FkO6W4W3oR2Z8x9C=s1360-w1360-h1020",
    rating: 4.5,
  },
];

import { getPersistedMockData } from "@/lib/actions/experiences";

export async function getFeaturedExperiences(): Promise<ExperienceSummary[]> {
  const exps = await getAllExperiences();
  return exps.slice(0, 3);
}

export async function getAllExperiences(): Promise<any[]> {
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
  
  if (isPlaceholder) {
    try {
      const db = await getPersistedMockData();
      
      let list = MOCK_EXPERIENCES.map((exp) => {
        const updates = db.experiences?.[exp.id];
        if (updates) {
          const isPublished = updates.is_published !== undefined 
            ? updates.is_published 
            : (updates.status === "approved" || (exp as any).is_published !== false);
          return {
            ...exp,
            ...updates,
            is_published: isPublished
          } as any;
        }
        return { ...exp, is_published: true } as any;
      });

      if (db.createdExperiences) {
        const createdMapped = db.createdExperiences.map((c: any) => ({
          id: c.id,
          title: c.title,
          slug: c.slug || `exp-${c.id}`,
          type: c.type,
          price_total: c.price_total || null,
          price_per_seat: c.price_per_seat || null,
          duration_minutes: c.duration_minutes || 120,
          max_guests: c.max_guests || 6,
          badge: c.badge || null,
          destination_name: c.destinationName || c.destination || "Béjaïa",
          main_image_url: c.main_image_url || "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
          rating: c.rating || 5.0,
          is_published: c.is_published !== undefined ? c.is_published : (c.status === "approved" || true),
          description: c.description || "",
          images: c.images || [c.main_image_url || "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020"]
        }));
        list = [...list, ...createdMapped];
      }

      return list.filter((exp: any) => exp.is_published !== false);
    } catch (err) {
      console.error("Failed to load mock experiences:", err);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_EXPERIENCES;
}

export async function getDestinations() {
  return [
    {
      id: "d1",
      name: "Cap Carbon",
      slug: "cap-carbon",
      description: "L'un des plus hauts phares naturels au monde.",
      photo_url: "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
      experience_count: 5,
    },
    {
      id: "d2",
      name: "Île des Pisans",
      slug: "ile-des-pisans",
      description: "Magnifique île sauvage accessible uniquement par bateau.",
      photo_url: "https://lh3.googleusercontent.com/p/AF1QipNjQZ5hNfWw9O9n5zXgZ4E9FkO6W4W3oR2Z8x9C=s1360-w1360-h1020",
      experience_count: 3,
    },
    {
      id: "d3",
      name: "Gouraya",
      slug: "gouraya",
      description: "Parc national avec vue imprenable sur la baie.",
      photo_url: "https://lh3.googleusercontent.com/p/AF1QipO9oV9R-lO7T3p5E6qR2t9U8W1O-vP3Z2J6c3O1=s1360-w1360-h1020",
      experience_count: 4,
    },
  ];
}
