"use server";

import { revalidatePath } from "next/cache";
import * as fs from "fs";
import * as path from "path";
import { checkRole } from "@/lib/utils/auth-check";
import { IMAGES } from "@/lib/constants";

const MOCK_DB_FILE = path.join(process.cwd(), ".safar-mock-db.json");

function getMockDb() {
  if (!fs.existsSync(MOCK_DB_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveMockDb(data: any) {
  try {
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write mock db", err);
  }
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
      og_image: IMAGES.HERO_BANNER
    },
    experiences: {
      title: "Activités nautiques & Sorties en mer - Safar DZ",
      description: "Découvrez toutes nos aventures de navigation en Méditerranée à Béjaïa.",
      keywords: "bateau privé, jet ski, kayak, paddle, bejaia",
      og_image: IMAGES.CAT_PRIVATE_BOATS
    },
    destinations: {
      title: "Destinations de rêve à Béjaïa - Safar DZ",
      description: "Cap Carbon, Île des Pisans, Gouraya, les falaises sauvages accessibles en bateau.",
      keywords: "cap carbon, pisans, boulimate, gouraya, bejaia",
      og_image: IMAGES.DESTINATION_CAP_CARBON
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

export async function getCmsConfig() {
  const db = getMockDb();
  let updated = false;
  if (!db.cms) {
    db.cms = { ...DEFAULT_CMS };
    updated = true;
  }
  if (!db.cms.categories) {
    db.cms.categories = [...DEFAULT_CMS.categories];
    updated = true;
  }
  if (!db.cms.accommodations || (db.cms.accommodations.length > 0 && !db.cms.accommodations[0].type)) {
    db.cms.accommodations = [
      {
        id: "acc-1",
        title: "Villa Vue sur Mer - Boulimate",
        type: "villa",
        wilaya: "Béjaïa",
        city: "Boulimate",
        address: "Route Nationale 24, Boulimate Plage",
        short_description: "Superbe villa face à la mer avec piscine et terrasse panoramique.",
        description: "Superbe villa avec accès direct à la plage, piscine privative et terrasse panoramique. Idéal pour les familles ou groupes d'amis.",
        location: "Boulimate, Béjaïa",
        price: 25000,
        promo_price: 22000,
        currency: "DA",
        pricing_type: "night",
        availability: "Disponible",
        image_url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"
        ],
        is_active: true,
        contact_phone: "+213 550 12 34 56",
        max_guests: 8,
        rooms_count: 4,
        beds_count: 6,
        bathrooms_count: 3,
        amenities: ["Wi-Fi", "Climatisation", "Piscine", "Parking gratuit", "Cuisine équipée", "Vue sur mer", "Terrasse / Balcon"],
        custom_amenities: ["Barbecue extérieur", "Transats"],
        booking_type: "whatsapp",
        whatsapp_phone: "+213 556 48 36 34",
        min_stay_nights: 2,
        blocked_dates: []
      },
      {
        id: "acc-2",
        title: "Appartement Cosy - Centre-ville",
        type: "appartement",
        wilaya: "Béjaïa",
        city: "Centre-ville",
        address: "12 Boulevard de la Liberté, Béjaïa",
        short_description: "Appartement moderne et climatisé tout équipé en plein centre-ville.",
        description: "Appartement tout équipé et climatisé au centre de Béjaïa, proche de toutes commodités et du port de plaisance.",
        location: "Centre-ville, Béjaïa",
        price: 8000,
        currency: "DA",
        pricing_type: "night",
        availability: "Disponible",
        image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80"
        ],
        is_active: true,
        contact_phone: "+213 550 12 34 56",
        max_guests: 4,
        rooms_count: 2,
        beds_count: 3,
        bathrooms_count: 1,
        amenities: ["Wi-Fi", "Climatisation", "Cuisine équipée"],
        custom_amenities: ["Machine à café Nespresso"],
        booking_type: "whatsapp",
        whatsapp_phone: "+213 556 48 36 34",
        min_stay_nights: 1,
        blocked_dates: []
      },
      {
        id: "acc-3",
        title: "Cabane Nature - Aokas",
        type: "studio",
        wilaya: "Béjaïa",
        city: "Aokas",
        address: "Forêt des Oliviers, Aokas Plage",
        short_description: "Logement insolite en pleine nature entre mer et montagne.",
        description: "Logement insolite niché entre mer et forêt à Aokas. Parfait pour les amoureux de la nature en quête de calme.",
        location: "Aokas, Béjaïa",
        price: 12000,
        currency: "DA",
        pricing_type: "night",
        availability: "Disponible",
        image_url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80"
        ],
        is_active: true,
        contact_phone: "+213 550 12 34 56",
        max_guests: 2,
        rooms_count: 1,
        beds_count: 1,
        bathrooms_count: 1,
        amenities: ["Vue sur montagne", "Terrasse / Balcon", "Parking gratuit"],
        custom_amenities: ["Hamac", "Feu de camp"],
        booking_type: "whatsapp",
        whatsapp_phone: "+213 556 48 36 34",
        min_stay_nights: 2,
        blocked_dates: []
      }
    ];
    updated = true;
  }
  if (updated) {
    saveMockDb(db);
  }
  return db.cms;
}

export async function saveCmsSection(sectionKey: string, data: any) {
  await checkRole(["admin"]);
  const db = getMockDb();
  
  if (!db.cms) {
    db.cms = { ...DEFAULT_CMS };
  }
  
  db.cms[sectionKey] = data;
  saveMockDb(db);
  
  // Revalidate public routes to make edits appear instantly
  revalidatePath("/");
  revalidatePath("/experiences");
  revalidatePath("/destinations");
  revalidatePath("/about");
  revalidatePath("/contact");
  
  return { success: true, cms: db.cms };
}

export async function getMediaLibrary() {
  const db = getMockDb();
  if (!db.cms || !db.cms.media_library) {
    const cms = db.cms || { ...DEFAULT_CMS };
    cms.media_library = DEFAULT_CMS.media_library;
    db.cms = cms;
    saveMockDb(db);
  }
  return db.cms.media_library;
}

export async function addMediaAsset(asset: { name: string; url: string; folder: string; size: string; type: string }) {
  await checkRole(["admin"]);
  const db = getMockDb();
  if (!db.cms) {
    db.cms = { ...DEFAULT_CMS };
  }
  if (!db.cms.media_library) {
    db.cms.media_library = [...DEFAULT_CMS.media_library];
  }
  
  const newAsset = {
    id: `m-${Date.now()}`,
    ...asset
  };
  
  db.cms.media_library.push(newAsset);
  saveMockDb(db);
  return { success: true, asset: newAsset };
}

export async function deleteMediaAsset(id: string) {
  await checkRole(["admin"]);
  const db = getMockDb();
  if (!db.cms || !db.cms.media_library) return { success: false };
  
  db.cms.media_library = db.cms.media_library.filter((m: any) => m.id !== id);
  saveMockDb(db);
  return { success: true };
}

export async function getAccommodations() {
  const db = getMockDb();
  if (!db.cms || !db.cms.accommodations) {
    // initialize if missing
    await getCmsConfig();
    return getMockDb().cms.accommodations || [];
  }
  return db.cms.accommodations;
}

export async function saveAccommodation(id: string | null, data: any) {
  await checkRole(["admin"]);
  const db = getMockDb();
  if (!db.cms) {
    db.cms = { ...DEFAULT_CMS };
  }
  if (!db.cms.accommodations) {
    db.cms.accommodations = [];
  }
  
  if (id) {
    const idx = db.cms.accommodations.findIndex((a: any) => a.id === id);
    if (idx !== -1) {
      db.cms.accommodations[idx] = { ...db.cms.accommodations[idx], ...data };
    } else {
      db.cms.accommodations.push({ id, ...data });
    }
  } else {
    const newId = `acc-${Date.now()}`;
    db.cms.accommodations.push({ id: newId, ...data });
  }
  
  saveMockDb(db);
  revalidatePath("/");
  return { success: true, accommodations: db.cms.accommodations };
}

export async function deleteAccommodation(id: string) {
  await checkRole(["admin"]);
  const db = getMockDb();
  if (!db.cms || !db.cms.accommodations) return { success: false };
  
  db.cms.accommodations = db.cms.accommodations.filter((a: any) => a.id !== id);
  saveMockDb(db);
  revalidatePath("/");
  return { success: true, accommodations: db.cms.accommodations };
}
