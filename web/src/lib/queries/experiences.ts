import { ExperienceSummary } from "@/components/experiences/experience-card";
import { IMAGES } from "@/lib/constants";
import { getPersistedMockData } from "@/lib/actions/experiences";

export async function getFeaturedExperiences(): Promise<ExperienceSummary[]> {
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
  const exps = await getAllExperiences();
  
  if (isPlaceholder) {
    try {
      const db = await getPersistedMockData();
      if (db.cms && db.cms.featured_experiences_ids) {
        const featuredIds = db.cms.featured_experiences_ids;
        const featured = exps.filter((e) => featuredIds.includes(e.id));
        featured.sort((a, b) => featuredIds.indexOf(a.id) - featuredIds.indexOf(b.id));
        if (featured.length > 0) return featured;
      }
    } catch (err) {
      console.error("Failed to load featured experiences from CMS:", err);
    }
  }
  
  return exps.slice(0, 3);
}

export async function getAllExperiences(): Promise<any[]> {
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
  
  if (isPlaceholder) {
    try {
      const db = await getPersistedMockData();
      
      let list: any[] = [];

      // Load experiences from mock DB
      if (db.experiences) {
        for (const [id, exp] of Object.entries(db.experiences)) {
          const e = exp as any;
          if (e.is_published !== false) {
            list.push({
              id,
              title: e.title || "",
              slug: e.slug || `exp-${id}`,
              type: e.type || "private",
              category: e.category || (e.type === "private" ? "Bateau privé" : "Bateau par place"),
              price_total: e.price_total || null,
              price_per_seat: e.price_per_seat || null,
              duration_minutes: e.duration_minutes || 120,
              max_guests: e.max_guests || 6,
              badge: e.badge || null,
              destination_name: e.destinationName || e.destination || "Béjaïa",
              main_image_url: e.main_image_url || IMAGES.PLACEHOLDER,
              rating: e.rating || 5.0,
              is_published: true,
              description: e.description || "",
              images: e.images || [e.main_image_url || IMAGES.PLACEHOLDER],
              included_services: e.included_services || "",
              requirements: e.requirements || "",
              departure_location: e.departure_location || "",
              route_description: e.route_description || "",
            });
          }
        }
      }

      if (db.createdExperiences) {
        const createdMapped = db.createdExperiences.map((c: any) => ({
          id: c.id,
          title: c.title,
          slug: c.slug || `exp-${c.id}`,
          type: c.type || "shared",
          category: c.category || (c.type === "private" ? "Bateau privé" : "Bateau par place"),
          price_total: c.price_total || null,
          price_per_seat: c.price_per_seat || null,
          duration_minutes: c.duration_minutes || 120,
          max_guests: c.max_guests || 6,
          badge: c.badge || null,
          destination_name: c.destinationName || c.destination || "Béjaïa",
          main_image_url: c.main_image_url || IMAGES.PLACEHOLDER,
          rating: c.rating || 5.0,
          is_published: c.is_published !== undefined ? c.is_published : true,
          description: c.description || "",
          images: c.images || [c.main_image_url || IMAGES.PLACEHOLDER],
          included_services: c.included_services || "",
          requirements: c.requirements || "",
          departure_location: c.departure_location || "",
          route_description: c.route_description || "",
        }));
        list = [...list, ...createdMapped];
      }

      return list.filter((exp: any) => exp.is_published !== false);
    } catch (err) {
      console.error("Failed to load mock experiences:", err);
    }
  }

  return [];
}

export async function getDestinations() {
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");
  
  if (isPlaceholder) {
    try {
      const db = await getPersistedMockData();
      let list: any[] = [];

      // Load destinations from mock DB
      if (db.destinations) {
        for (const [id, dest] of Object.entries(db.destinations)) {
          const d = dest as any;
          if (d.is_active !== false) {
            list.push({
              id,
              name: d.name || "",
              slug: d.slug || "",
              description: d.description || "",
              photo_url: d.photo_url || IMAGES.PLACEHOLDER,
              hero_image_url: d.hero_image_url || d.photo_url || IMAGES.PLACEHOLDER,
              gallery: d.gallery || [],
              experience_count: d.experience_count || 0,
              is_active: true,
              is_featured: d.is_featured || false,
              location: d.location || "Béjaïa, Algérie",
              lat: d.lat || null,
              lng: d.lng || null,
            });
          }
        }
      }

      if (db.createdDestinations) {
        list = [...list, ...db.createdDestinations.filter((d: any) => d.is_active !== false)];
      }

      return list;
    } catch (err) {
      console.error("Error loading destinations:", err);
    }
  }

  return [];
}
