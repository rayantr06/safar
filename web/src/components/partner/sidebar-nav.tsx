"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/partner", label: "Dashboard" },
    { href: "/partner/bookings", label: "Réservations" },
    { href: "/partner/boats", label: "Ma Flotte" },
    { href: "/partner/availability", label: "Disponibilités" },
    { href: "/partner/earnings", label: "Revenus" },
  ];

  return (
    <nav className="flex-1 space-y-1 p-4">
      <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4 px-2">
        Espace Partenaire
      </div>
      {navLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/partner" && pathname.startsWith(link.href));
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-all ${
              isActive 
                ? "bg-secondary-container text-on-secondary-container" 
                : "text-on-surface hover:bg-surface-variant"
            }`}
          >
            <span className="font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
