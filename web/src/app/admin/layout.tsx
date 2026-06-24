import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Ship,
  DollarSign,
  MapPin,
  LogOut,
  Shield,
  Calendar,
  Globe,
  Home,
  Bell,
} from "lucide-react";
import { getUnreadCount } from "@/lib/actions/notifications";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const unreadCount = await getUnreadCount().catch(() => 0);

  return (
    <div className="flex min-h-screen bg-background">
      {/* ===== Desktop Sidebar ===== */}
      <aside className="hidden md:flex flex-col h-screen border-r border-outline-variant bg-surface-container w-64 fixed left-0 top-0 z-50">
        <div className="p-6">
          {/* Logo + Admin Badge */}
          <Link href="/admin" className="flex items-center gap-2 mb-8">
            <Image
              src="/logo.png"
              alt="Safar DZ Logo"
              width={110}
              height={44}
              className="h-9 w-auto object-contain"
              priority
            />
            <span className="bg-error text-on-error text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full">
              Admin
            </span>
          </Link>

          {/* Nav Items */}
          <AdminSidebarNav />
        </div>

        {/* Bottom */}
        <div className="mt-auto p-4 border-t border-outline-variant">
          <div className="flex items-center gap-3 px-2 py-4">
            <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center overflow-hidden border-2 border-error text-on-error-container font-bold text-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-label-md font-label-md text-on-surface">Admin</p>
              <p className="text-xs text-on-surface-variant">
                {user.email?.split("@")[0] || "admin"}
              </p>
            </div>
          </div>
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
          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="font-headline-sm text-headline-sm text-primary">
                Centre de Commande
              </h1>
              <span className="bg-error/10 text-error text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border border-error/20">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/notifications"
                className="relative p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-error text-white text-[8px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-success-light rounded-full border border-green-200">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-label-sm font-label-sm text-green-700">
                  Système opérationnel
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-8 md:py-12 flex-1 w-full">
          {children}
        </div>
      </main>

      {/* ===== Mobile Bottom Nav ===== */}
      <AdminBottomNav />
    </div>
  );
}

// Admin sidebar nav component (server component, no "use client")
function AdminSidebarNav() {
  const items = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "Réservations", icon: CalendarDays },
    { href: "/admin/partners", label: "Partenaires", icon: Users },
    { href: "/admin/experiences", label: "Expériences", icon: Ship },
    { href: "/admin/accommodations", label: "Hébergements", icon: Home },
    { href: "/admin/availability", label: "Planning", icon: Calendar },
    { href: "/admin/finance", label: "Finance", icon: DollarSign },
    { href: "/admin/destinations", label: "Destinations", icon: MapPin },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/website", label: "Gestion du site", icon: Globe },
  ];

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-variant rounded-lg px-4 py-3 transition-all duration-300 ease-in-out"
          >
            <Icon className="h-5 w-5" />
            <span className="text-label-md font-label-md">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
