"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Wallet, User } from "lucide-react";

export function PartnerBottomNav() {
  const pathname = usePathname();

  const isDashboardActive = pathname === "/partner";
  const isBookingsActive = pathname.startsWith("/partner/bookings");
  const isEarningsActive = pathname.startsWith("/partner/earnings");
  const isSettingsActive = pathname.startsWith("/partner/settings") || pathname.startsWith("/partner/availability") || pathname.startsWith("/partner/boats");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-50 px-4 py-3 flex justify-around items-center shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-6">
      <Link
        href="/partner"
        className={`flex flex-col items-center gap-1 transition-colors active:scale-95 duration-200 ${
          isDashboardActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <LayoutDashboard className={`h-5 w-5 ${isDashboardActive ? "stroke-[2.5]" : ""}`} />
        <span className="text-[10px] font-bold">Dashboard</span>
      </Link>
      
      <Link
        href="/partner/bookings"
        className={`flex flex-col items-center gap-1 transition-colors active:scale-95 duration-200 ${
          isBookingsActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <CalendarDays className={`h-5 w-5 ${isBookingsActive ? "stroke-[2.5]" : ""}`} />
        <span className="text-[10px] font-bold">Réservations</span>
      </Link>
      
      <Link
        href="/partner/earnings"
        className={`flex flex-col items-center gap-1 transition-colors active:scale-95 duration-200 ${
          isEarningsActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <Wallet className={`h-5 w-5 ${isEarningsActive ? "stroke-[2.5]" : ""}`} />
        <span className="text-[10px] font-bold">Revenus</span>
      </Link>
      
      <Link
        href="/partner/settings"
        className={`flex flex-col items-center gap-1 transition-colors active:scale-95 duration-200 ${
          isSettingsActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <User className={`h-5 w-5 ${isSettingsActive ? "stroke-[2.5]" : ""}`} />
        <span className="text-[10px] font-bold">Profil</span>
      </Link>
    </nav>
  );
}
