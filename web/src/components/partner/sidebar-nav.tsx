"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Ship,
  Wallet,
  Star,
  HelpCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/partner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partner/bookings", label: "Réservations", icon: CalendarDays },
  { href: "/partner/boats", label: "Ma Flotte", icon: Ship },
  { href: "/partner/availability", label: "Calendrier", icon: CalendarDays },
  { href: "/partner/earnings", label: "Revenus", icon: Wallet },
  { href: "/partner/settings", label: "Paramètres", icon: Star },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 flex flex-col">
      <div className="p-6 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/partner" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300 ease-in-out ${
                isActive
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-label-md font-label-md">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="mt-auto border-t border-outline-variant">
        {/* Partner profile */}
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border-2 border-primary text-on-secondary-container font-bold text-sm">
            CP
          </div>
          <div>
            <p className="text-label-md font-label-md text-on-surface">Capitaine</p>
            <p className="text-xs text-on-surface-variant">Port de Béjaïa</p>
          </div>
        </div>

        {/* Help */}
        <Link
          href="#"
          className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-variant rounded-lg px-6 py-3 transition-all mx-2"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="text-label-sm font-label-sm">Centre d&apos;aide</span>
        </Link>
      </div>
    </nav>
  );
}
