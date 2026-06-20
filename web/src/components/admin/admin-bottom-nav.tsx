"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, DollarSign } from "lucide-react";

export function AdminBottomNav() {
  const pathname = usePathname();

  const isDashboardActive = pathname === "/admin";
  const isBookingsActive = pathname.startsWith("/admin/bookings");
  const isPartnersActive = pathname.startsWith("/admin/partners");
  const isFinanceActive = pathname.startsWith("/admin/finance") || pathname.startsWith("/admin/availability") || pathname.startsWith("/admin/destinations") || pathname.startsWith("/admin/experiences");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-50 px-4 py-3 flex justify-around items-center shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-6">
      <Link
        href="/admin"
        className={`flex flex-col items-center gap-1 transition-colors active:scale-95 duration-200 ${
          isDashboardActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <LayoutDashboard className={`h-5 w-5 ${isDashboardActive ? "stroke-[2.5]" : ""}`} />
        <span className="text-[10px] font-bold">Dashboard</span>
      </Link>
      
      <Link
        href="/admin/bookings"
        className={`flex flex-col items-center gap-1 transition-colors active:scale-95 duration-200 ${
          isBookingsActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <CalendarDays className={`h-5 w-5 ${isBookingsActive ? "stroke-[2.5]" : ""}`} />
        <span className="text-[10px] font-bold">Réservations</span>
      </Link>
      
      <Link
        href="/admin/partners"
        className={`flex flex-col items-center gap-1 transition-colors active:scale-95 duration-200 ${
          isPartnersActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <Users className={`h-5 w-5 ${isPartnersActive ? "stroke-[2.5]" : ""}`} />
        <span className="text-[10px] font-bold">Partenaires</span>
      </Link>
      
      <Link
        href="/admin/finance"
        className={`flex flex-col items-center gap-1 transition-colors active:scale-95 duration-200 ${
          isFinanceActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <DollarSign className={`h-5 w-5 ${isFinanceActive ? "stroke-[2.5]" : ""}`} />
        <span className="text-[10px] font-bold">Finance</span>
      </Link>
    </nav>
  );
}
