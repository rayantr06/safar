import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { SidebarNav } from "@/components/partner/sidebar-nav";
import { PartnerBottomNav } from "@/components/partner/partner-bottom-nav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  LogOut,
} from "lucide-react";

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      {/* ===== Desktop Sidebar ===== */}
      <aside className="hidden md:flex flex-col h-screen border-r border-outline-variant bg-surface-container w-64 fixed left-0 top-0 z-50">
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="block mb-8">
            <Image
              src="/logo.png"
              alt="Safar DZ Logo"
              width={110}
              height={44}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <SidebarNav />
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-outline-variant">
          <Link
            href="/auth/signout"
            className="flex items-center gap-3 text-error hover:bg-error-container rounded-lg px-4 py-3 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-label-sm font-label-sm">Se déconnecter</span>
          </Link>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="md:ml-64 flex-1 min-h-screen flex flex-col pb-24 md:pb-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md shadow-sm">
          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline-sm text-headline-sm text-primary">
                  {user.user_metadata?.full_name || "Capitaine"}
                </h1>
                <span className="bg-primary/10 text-primary text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border border-primary/20">
                  Pro Partner
                </span>
              </div>
              <p className="text-on-surface-variant">Port de Béjaïa</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-full border border-outline-variant">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-label-md font-label-md text-on-surface">Disponible</span>
              </div>
              <Link
                href="/partner/availability"
                className="bg-primary text-on-primary text-label-md font-label-md px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all"
              >
                Gérer disponibilité
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-8 md:py-12 flex-1 w-full">
          {children}
        </div>

        {/* Footer */}
        <footer className="w-full border-t border-outline-variant bg-surface-dim mt-16">
          <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop py-8 max-w-container-max mx-auto">
            <div className="mb-4 md:mb-0">
              <p className="font-headline-sm text-headline-sm text-on-surface">Safar DZ</p>
              <p className="text-label-sm font-label-sm text-on-surface-variant">
                © {new Date().getFullYear()} Safar DZ. Partner Operations.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="#" className="text-on-surface-variant hover:text-primary underline transition-all">
                Conditions
              </Link>
              <Link href="#" className="text-on-surface-variant hover:text-primary underline transition-all">
                Confidentialité
              </Link>
              <Link href="#" className="text-on-surface-variant hover:text-primary underline transition-all">
                Support
              </Link>
            </div>
          </div>
        </footer>
      </main>

      {/* ===== Mobile Bottom Nav ===== */}
      <PartnerBottomNav />
    </div>
  );
}
