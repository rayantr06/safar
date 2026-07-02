import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { HeaderClient } from "@/components/ui/header-client";
import { getCmsConfig } from "@/lib/actions/website-cms";
import { IMAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole: string | null = null;
  if (user) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      userRole = (profile as any)?.role || "provider";
    } catch {}
  }

  // Fetch CMS config
  const cms = await getCmsConfig();
  
  const primaryColor = cms?.settings?.brand_color_primary || "#003693";
  const secondaryColor = cms?.settings?.brand_color_secondary || "#4e5d8a";
  const darkColor = cms?.settings?.brand_color_dark || "#0f172a";
  
  const customStyles = {
    "--color-primary": primaryColor,
    "--color-secondary": secondaryColor,
    "--color-dark": darkColor,
  } as React.CSSProperties;

  const contact = cms?.contact_info || {
    phone: "0556 48 36 34",
    whatsapp: "+213 556 48 36 34",
    email: "safardz@gmail.com",
    address: "Béjaïa, Algérie",
    socials: {
      facebook: "https://www.facebook.com/profile.php?id=61590829494331",
      instagram: "https://www.instagram.com/safar_dz/",
      tiktok: "https://www.tiktok.com/@safar.dz"
    }
  };

  const texts = cms?.website_texts || {
    footer_desc: "Explorez les trésors de la côte algérienne.",
    nav_experiences: "Expériences",
    nav_accommodations: "Hébergements",
    nav_destinations: "Destinations",
    nav_about: "À propos",
    nav_contact: "Contact"
  };

  const logoText = cms?.settings?.logo_text || "SafarDZ";

  return (
    <div className="flex flex-col min-h-screen bg-surface" style={customStyles}>
      {/* Dynamic unified header (Top Nav, Mobile Side Drawer, and Bottom Nav) */}
      <HeaderClient user={user} userRole={userRole} logoText={logoText} navTexts={texts} />

      {/* ===== Main Content with mobile bottom nav spacing offset ===== */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* ===== Footer ===== */}
      <footer className="w-full bg-surface-container-highest rounded-t-[32px] mt-16 px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center active:scale-95 transition-transform">
              <Image
                src="/logo.png"
                alt="Safar DZ Logo"
                width={120}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-body-md text-on-surface-variant max-w-xs">
              {texts.footer_desc}
            </p>
            {contact.phone && (
              <p className="text-xs text-on-surface-variant">
                Tél : <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="hover:text-primary transition-all">{contact.phone}</a>
              </p>
            )}
            {contact.email && (
              <p className="text-xs text-on-surface-variant">
                Email : <a href={`mailto:${contact.email}`} className="hover:text-primary transition-all">{contact.email}</a>
              </p>
            )}
            {contact.address && (
              <p className="text-xs text-on-surface-variant">
                Adresse : {contact.address}
              </p>
            )}
          </div>
          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-4">
            <Link href="/experiences" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
              {texts.nav_experiences || "Expériences"}
            </Link>
            <Link href="/partners" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
              Devenir Partenaire
            </Link>
            <Link href="/contact" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
              {texts.nav_contact || "Contact"}
            </Link>
            {contact.socials?.instagram && (
              <Link href={contact.socials.instagram} target="_blank" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
                Instagram
              </Link>
            )}
            {contact.socials?.facebook && (
              <Link href={contact.socials.facebook} target="_blank" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
                Facebook
              </Link>
            )}
            {contact.socials?.tiktok && (
              <Link href={contact.socials.tiktok} target="_blank" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
                TikTok
              </Link>
            )}
            {contact.whatsapp && (
              <Link href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
                WhatsApp
              </Link>
            )}
          </div>
        </div>
        <div className="pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-label-sm text-on-surface-variant">
            © {new Date().getFullYear()} {cms?.settings?.general_info?.site_name || "Safar DZ"}.
          </div>
          <div className="flex gap-8">
            <Link href="/portal-login" className="text-label-sm text-on-surface-variant hover:text-primary underline">
              Espace professionnel
            </Link>
            <Link href="/terms" className="text-label-sm text-on-surface-variant hover:text-primary underline">
              Mentions légales
            </Link>
            <Link href="/privacy" className="text-label-sm text-on-surface-variant hover:text-primary underline">
              Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
