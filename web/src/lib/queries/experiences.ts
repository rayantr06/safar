import { ExperienceSummary } from "@/components/experiences/experience-card";
import { IMAGES } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

function mapExperienceRow(e: any): any {
  const images = (e.experience_images || [])
    .slice()
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((img: any) => img.image_url);

  return {
    id: e.id,
    title: e.title || "",
    slug: e.slug,
    type: e.type || "private",
    category: e.category || (e.type === "private" ? "Bateau privé" : "Bateau par place"),
    price_total: e.price_total ?? null,
    price_per_seat: e.price_per_seat ?? null,
    duration_minutes: e.duration_minutes || 120,
    max_guests: e.max_guests || 6,
    badge: e.badge || null,
    destination_name: e.destinations?.name || "Béjaïa",
    destination_id: e.destination_id || null,
    main_image_url: e.main_image_url || images[0] || IMAGES.PLACEHOLDER,
    rating: e.rating || 5.0,
    is_published: e.is_published,
    description: e.description || "",
    images: images.length > 0 ? images : [e.main_image_url || IMAGES.PLACEHOLDER],
    included_services: e.included_services || "",
    requirements: e.requirements || "",
    departure_location: e.departure_location || "",
    route_description: e.route_description || "",
  };
}

export async function getFeaturedExperiences(): Promise<ExperienceSummary[]> {
  const exps = await getAllExperiences();
  return exps.slice(0, 3);
}

export async function getExperienceBySlugForPreview(slug: string): Promise<any | null> {
  try {
    const admin = createAdminClient() as any;
    const { data, error } = await admin
      .from("experiences")
      .select("*, destinations(name), experience_images(image_url, display_order)")
      .eq("slug", slug)
      .single();
    if (error || !data) return null;
    return mapExperienceRow(data);
  } catch (err) {
    console.error("getExperienceBySlugForPreview failed:", err);
    return null;
  }
}

export async function getAllExperiences(): Promise<any[]> {
  try {
    const admin = createAdminClient() as any;
    const { data, error } = await admin
      .from("experiences")
      .select("*, destinations(name), experience_images(image_url, display_order)")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("getAllExperiences failed:", error.message);
      return [];
    }
    return (data || []).map(mapExperienceRow);
  } catch (err) {
    console.error("getAllExperiences failed:", err);
    return [];
  }
}

export async function getDestinations(): Promise<any[]> {
  try {
    const admin = createAdminClient() as any;
    const { data, error } = await admin
      .from("destinations")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });
    if (error) {
      console.error("getDestinations failed:", error.message);
      return [];
    }
    return (data || []).map((d: any) => ({
      id: d.id,
      name: d.name || "",
      slug: d.slug || "",
      description: d.description || "",
      photo_url: d.photo_url || IMAGES.PLACEHOLDER,
      hero_image_url: d.hero_image_url || d.photo_url || IMAGES.PLACEHOLDER,
      gallery: d.gallery || [],
      experience_count: 0,
      is_active: d.is_active,
      is_featured: d.is_featured || false,
      location: d.location || "Béjaïa, Algérie",
      lat: d.lat ?? null,
      lng: d.lng ?? null,
    }));
  } catch (err) {
    console.error("getDestinations failed:", err);
    return [];
  }
}
