"use server";

import { revalidatePath } from "next/cache";
import { checkRole } from "@/lib/utils/auth-check";
import { createAdminClient } from "@/lib/supabase/admin";

async function getSiteContentSection(sectionKey: string) {
  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from("site_content")
    .select("content_fr")
    .eq("section", sectionKey)
    .single();
  if (error || !data) return null;
  try {
    return JSON.parse(data.content_fr);
  } catch {
    return null;
  }
}

async function saveSiteContentSection(sectionKey: string, data: any) {
  const admin = createAdminClient() as any;
  const { error } = await admin
    .from("site_content")
    .upsert(
      { section: sectionKey, content_fr: JSON.stringify(data), updated_at: new Date().toISOString() },
      { onConflict: "section" }
    );
  if (error) throw new Error(error.message);
}

const ACCOMMODATION_COLUMNS = [
  "title", "slug", "type", "wilaya", "city", "address", "description", "short_description",
  "location", "price", "promo_price", "currency", "pricing_type", "image_url", "images",
  "is_active", "contact_phone", "whatsapp_phone", "max_guests", "rooms_count", "beds_count",
  "bathrooms_count", "amenities", "custom_amenities", "booking_type", "min_stay_nights",
  "blocked_dates", "lat", "lng",
] as const;

function mapAccommodationFields(data: any) {
  const mapped: any = {};
  for (const key of ACCOMMODATION_COLUMNS) {
    if (data[key] !== undefined) mapped[key] = data[key];
  }
  return mapped;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getCmsConfig() {
  const admin = createAdminClient() as any;
  const { data: rows } = await admin.from("site_content").select("section, content_fr");
  const cms: any = { ...DEFAULT_CMS };
  for (const row of rows || []) {
    if (row.section === "media_library") continue;
    try {
      cms[row.section] = JSON.parse(row.content_fr);
    } catch {
      // keep default for this section if stored JSON is malformed
    }
  }
  return cms;
}

export async function saveCmsSection(sectionKey: string, data: any) {
  await checkRole(["admin"]);

  await saveSiteContentSection(sectionKey, data);
  revalidatePath("/");
  revalidatePath("/experiences");
  revalidatePath("/destinations");
  revalidatePath("/about");
  revalidatePath("/contact");
  const cms = await getCmsConfig();
  return { success: true, cms };
}

export async function getMediaLibrary() {
  const stored = await getSiteContentSection("media_library");
  return stored || [];
}

export async function addMediaAsset(asset: { name: string; url: string; folder: string; size: string; type: string }) {
  await checkRole(["admin"]);

  const library = (await getSiteContentSection("media_library")) || [];
  const newAsset = { id: `m-${Date.now()}`, ...asset };
  library.push(newAsset);
  await saveSiteContentSection("media_library", library);
  return { success: true, asset: newAsset };
}

export async function deleteMediaAsset(id: string) {
  await checkRole(["admin"]);

  const library = (await getSiteContentSection("media_library")) || [];
  await saveSiteContentSection("media_library", library.filter((m: any) => m.id !== id));
  return { success: true };
}

export async function getAccommodations() {
  const admin = createAdminClient() as any;
  const { data, error } = await admin.from("accommodations").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("getAccommodations failed:", error.message);
    return [];
  }
  return data || [];
}

export async function saveAccommodation(id: string | null, data: any) {
  await checkRole(["admin"]);

  const admin = createAdminClient() as any;
  const mapped = mapAccommodationFields(data);

  if (id) {
    const { error } = await admin.from("accommodations").update(mapped).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    if (!mapped.slug) {
      mapped.slug = `${slugify(mapped.title || "logement")}-${Date.now()}`;
    }
    const { error } = await admin.from("accommodations").insert(mapped);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/accommodations");
  const accommodations = await getAccommodations();
  return { success: true, accommodations };
}

export async function deleteAccommodation(id: string) {
  await checkRole(["admin"]);

  const admin = createAdminClient() as any;
  const { error } = await admin.from("accommodations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/accommodations");
  const accommodations = await getAccommodations();
  return { success: true, accommodations };
}

const DEFAULT_CMS = {
  hero: {
    title: "Choisissez votre prochaine aventure",
    subtitle: "Des sorties en mer, des découvertes et des moments inoubliables au cœur de la Méditerranée.",
    media_url: "",
    media_type: "image",
    cta_text: "Réserver",
    cta_link: "/experiences"
  },
  featured_experiences_ids: [],
  about: {
    text: "Explorez les trésors cachés de la côte algérienne avec Safar DZ. Nous proposons des sorties en bateau privées et partagées, guidées par des professionnels passionnés de la mer.",
    images: []
  },
  testimonials: [],
  partners_logos: [],
  banners: [],
  media_library: [],
  website_texts: {
    hero_title: "Choisissez votre prochaine aventure",
    hero_subtitle: "Des sorties en mer, des découvertes et des moments inoubliables au cœur de la Méditerranée.",
    footer_desc: "Explorez les trésors de la côte algérienne.",
    btn_reserve: "Réserver",
    nav_experiences: "Expériences",
    nav_destinations: "Destinations",
    nav_about: "À propos",
    nav_contact: "Contact"
  },
  seo: {
    home: {
      title: "Safar DZ - Sorties en mer & Activités nautiques à Béjaïa",
      description: "Réservez vos sorties en bateau privé ou collectif, jet-ski et kayak à Béjaïa avec Safar DZ.",
      keywords: "bateau, bejaia, mediterranee, algerie, jet ski, kayak, cap carbon",
      og_image: ""
    },
    experiences: {
      title: "Activités nautiques & Sorties en mer - Safar DZ",
      description: "Découvrez toutes nos aventures de navigation en Méditerranée à Béjaïa.",
      keywords: "bateau privé, jet ski, kayak, paddle, bejaia",
      og_image: ""
    },
    destinations: {
      title: "Destinations de rêve à Béjaïa - Safar DZ",
      description: "Cap Carbon, Île des Pisans, Gouraya, les falaises sauvages accessibles en bateau.",
      keywords: "cap carbon, pisans, boulimate, gouraya, bejaia",
      og_image: ""
    }
  },
  contact_info: {
    phone: "0556 48 36 34",
    whatsapp: "+213 556 48 36 34",
    email: "safardz@gmail.com",
    address: "Béjaïa, Algérie",
    socials: {
      facebook: "https://www.facebook.com/profile.php?id=61590829494331",
      instagram: "https://www.instagram.com/safar_dz/",
      tiktok: "https://www.tiktok.com/@safar.dz"
    }
  },
  settings: {
    logo_text: "SafarDZ",
    logo_image_url: "",
    favicon_url: "/favicon.ico",
    brand_color_primary: "#0ea5e9",
    brand_color_secondary: "#0284c7",
    brand_color_dark: "#0f172a",
    booking_settings: {
      allow_instant_booking: true,
      require_phone_verification: false
    },
    general_info: {
      site_name: "Safar DZ",
      site_slogan: "La perle de la Méditerranée"
    }
  },
  categories: [
    { id: "cat-1", name: "Bateau privé", is_active: true, icon: "🚤", description: "Bateaux privés avec skipper pour des sorties sur mesure en famille ou entre amis." },
    { id: "cat-2", name: "Bateau par place", is_active: true, icon: "⛵", description: "Réservez une ou plusieurs places sur un bateau partagé et rencontrez d'autres passionnés." },
    { id: "cat-3", name: "Kayak", is_active: true, icon: "🛶", description: "Explorez les criques inaccessibles et longez les falaises à votre rythme." },
    { id: "cat-4", name: "Paddle", is_active: true, icon: "🏄", description: "Glissez sur l'eau cristalline et profitez d'une activité relaxante et sportive." },
    { id: "cat-5", name: "Jet Ski", is_active: true, icon: "⚡", description: "Faites le plein de sensations fortes avec nos sessions guidées ou en autonomie." },
    { id: "cat-6", name: "Quads", is_active: true, icon: "🏎️", description: "Partez à l'aventure sur les pistes de terre longeant la côte et les montagnes." }
  ]
};
