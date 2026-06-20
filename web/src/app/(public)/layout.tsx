import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeaderClient } from "@/components/ui/header-client";

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

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Dynamic unified header (Top Nav, Mobile Side Drawer, and Bottom Nav) */}
      <HeaderClient user={user} userRole={userRole} />

      {/* ===== Main Content with mobile bottom nav spacing offset ===== */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* ===== Footer ===== */}
      <footer className="w-full bg-surface-container-highest rounded-t-[32px] mt-16 px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <span className="text-2xl font-bold font-mono text-primary tracking-tighter">
              Safar<span className="text-tertiary-fixed-dim">DZ</span>
            </span>
            <p className="text-body-md text-on-surface-variant max-w-xs">
              Explorez les trésors de la côte algérienne.
            </p>
          </div>
          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-4">
            <Link href="/experiences" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
              Expériences
            </Link>
            <Link href="/partners" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
              Devenir Partenaire
            </Link>
            <Link href="/contact" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
              Contact
            </Link>
            <Link href="https://www.instagram.com/safar_dz/" target="_blank" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
              Instagram
            </Link>
            <Link href="https://www.facebook.com/profile.php?id=61590829494331" target="_blank" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
              Facebook
            </Link>
            <Link href="https://www.tiktok.com/@safar.dz" target="_blank" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
              TikTok
            </Link>
            <Link href="https://wa.me/213556483634" target="_blank" className="text-on-surface-variant hover:text-primary transition-all text-label-md">
              WhatsApp
            </Link>
          </div>
        </div>
        <div className="pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-label-sm text-on-surface-variant">
            © {new Date().getFullYear()} Safar DZ.
          </div>
          <div className="flex gap-8">
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
