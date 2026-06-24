"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Compass, MapPin, Calendar, User, LogOut, Phone, HelpCircle, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderClientProps {
  user: any;
  userRole: string | null;
  logoText?: string;
  isHomePage?: boolean;
  navTexts?: {
    nav_experiences?: string;
    nav_accommodations?: string;
    nav_destinations?: string;
    nav_about?: string;
    nav_contact?: string;
  };
}

export function HeaderClient({ user, userRole, logoText = "SafarDZ", isHomePage = false, navTexts }: HeaderClientProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const experiencesLabel = navTexts?.nav_experiences || "Expériences";
  const accommodationsLabel = navTexts?.nav_accommodations || "Hébergements";
  const destinationsLabel = navTexts?.nav_destinations || "Destinations";
  const aboutLabel = navTexts?.nav_about || "À propos";
  const contactLabel = navTexts?.nav_contact || "Contact";

  // Paths based on user role
  const isPartner = userRole === "provider";
  const isAdmin = userRole === "admin";
  const isClient = userRole === "client";
  
  const dashboardPath = isAdmin ? "/admin" : (isPartner ? "/partner" : "/client");
  const sortiesPath = user ? (isAdmin ? "/admin/bookings" : (isPartner ? "/partner/bookings" : "/client")) : "/booking/tracking";
  const profilePath = user ? (isAdmin ? "/admin" : (isPartner ? "/partner/settings" : "/client")) : "/login";

  // Check active states
  const isHomeActive = pathname === "/";
  const isExperiencesActive = pathname.startsWith("/experiences");
  const isAccommodationsActive = pathname.startsWith("/accommodations");
  const isDestinationsActive = pathname.startsWith("/destinations");
  const isSortiesActive = pathname === sortiesPath || pathname.startsWith("/partner/bookings") || pathname.startsWith("/admin/bookings") || pathname.startsWith("/booking/tracking") || (isClient && pathname === "/client");
  const isProfileActive = pathname === profilePath || pathname.startsWith("/partner/settings") || pathname.startsWith("/login") || (user && pathname.startsWith("/partner") && !isSortiesActive) || (isClient && pathname === "/client");

  const formattedLogo = (text: string) => {
    if (text.length <= 5) return <span className="text-primary">{text}</span>;
    return (
      <>
        {text.substring(0, 5)}
        <span className="text-tertiary-fixed-dim">{text.substring(5)}</span>
      </>
    );
  };

  return (
    <>
      {/* ===== Navigation Top Bar ===== */}
      <header className={`sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/15 shadow-xs ${isHomeActive ? 'md:hidden' : ''}`}>
        <nav className="flex justify-between items-center w-full px-6 md:px-margin-desktop py-4 max-w-container-max mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center active:scale-95 transition-transform">
            <Image
              src="/logo.png"
              alt="Safar DZ Logo"
              width={120}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/experiences"
              className={`transition-colors text-label-md font-bold ${
                isExperiencesActive ? "text-primary font-extrabold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {experiencesLabel}
            </Link>
            <Link
              href="/accommodations"
              className={`transition-colors text-label-md font-bold ${
                isAccommodationsActive ? "text-primary font-extrabold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {accommodationsLabel}
            </Link>
            <Link
              href="/destinations"
              className={`transition-colors text-label-md font-bold ${
                isDestinationsActive ? "text-primary font-extrabold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {destinationsLabel}
            </Link>
            <Link
              href="/about"
              className={`transition-colors text-label-md font-bold ${
                pathname === "/about" ? "text-primary font-extrabold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {aboutLabel}
            </Link>
            <Link
              href="/contact"
              className={`transition-colors text-label-md font-bold ${
                pathname === "/contact" ? "text-primary font-extrabold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {contactLabel}
            </Link>
          </div>
 
          {/* Right Actions / Hamburger trigger */}
          <div className="flex items-center gap-4">
            <Link
              href="/experiences"
              className="hidden md:inline-flex bg-primary text-on-primary text-label-md font-bold px-6 py-2.5 rounded-full hover:opacity-95 transition-all active:scale-95"
            >
              Réserver
            </Link>
 
            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-surface-container rounded-full md:hidden text-on-surface-variant transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>
 
      {/* ===== Mobile Hamburger Drawer Menu ===== */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/55 backdrop-blur-xs z-[100] transition-opacity duration-300 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
 
          {/* Drawer Panel */}
          <aside className="fixed top-0 right-0 h-screen w-[290px] sm:w-[330px] bg-surface-container-lowest z-[110] shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300 md:hidden border-l border-outline-variant/30">
            {/* Drawer Header */}
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-6">
              <Link href="/" className="flex items-center active:scale-95 transition-transform" onClick={() => setIsMenuOpen(false)}>
                <Image
                  src="/logo.png"
                  alt="Safar DZ Logo"
                  width={110}
                  height={44}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
 
            {/* Drawer Links */}
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isHomeActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <Home className="h-4.5 w-4.5" />
                <span>Accueil</span>
              </Link>
 
              <Link
                href="/experiences"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isExperiencesActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <Compass className="h-4.5 w-4.5" />
                <span>{experiencesLabel}</span>
              </Link>

              <Link
                href="/accommodations"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isAccommodationsActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <Bed className="h-4.5 w-4.5" />
                <span>{accommodationsLabel}</span>
              </Link>
  
              <Link
                href="/destinations"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isDestinationsActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <MapPin className="h-4.5 w-4.5" />
                <span>{destinationsLabel}</span>
              </Link>
 
              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  pathname === "/about"
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <HelpCircle className="h-4.5 w-4.5" />
                <span>{aboutLabel}</span>
              </Link>
 
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  pathname === "/contact"
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <Phone className="h-4.5 w-4.5" />
                <span>{contactLabel}</span>
              </Link>
            </div>
 
            {/* Drawer Footer / Account Actions */}
            <div className="border-t border-outline-variant/20 pt-4 mt-6">
              <Link
                href="/experiences"
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full items-center justify-center bg-primary text-on-primary text-xs font-bold py-3 rounded-xl shadow-xs active:scale-95 transition-all"
              >
                Réserver
              </Link>
            </div>
          </aside>
        </>
      )}
 
      {/* ===== Consistent Mobile Bottom Navigation ===== */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-low/90 backdrop-blur-lg md:hidden border-t border-outline-variant/20 flex justify-around items-center px-4 pb-6 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        {/* Accueil */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 duration-200 ${
            isHomeActive
              ? "text-primary"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <Home className={`h-5 w-5 ${isHomeActive ? "stroke-[2.5]" : ""}`} />
          <span className="text-[10px] font-bold">Accueil</span>
        </Link>
 
        {/* Expériences */}
        <Link
          href="/experiences"
          className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 duration-200 ${
            isExperiencesActive
              ? "text-primary"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <Compass className={`h-5 w-5 ${isExperiencesActive ? "stroke-[2.5]" : ""}`} />
          <span className="text-[10px] font-bold">{experiencesLabel}</span>
        </Link>
 
        {/* Destinations */}
        <Link
          href="/destinations"
          className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 duration-200 ${
            isDestinationsActive
              ? "text-primary"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <MapPin className={`h-5 w-5 ${isDestinationsActive ? "stroke-[2.5]" : ""}`} />
          <span className="text-[10px] font-bold">{destinationsLabel}</span>
        </Link>
 
        {/* À propos */}
        <Link
          href="/about"
          className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 duration-200 ${
            pathname === "/about"
              ? "text-primary"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <HelpCircle className={`h-5 w-5 ${pathname === "/about" ? "stroke-[2.5]" : ""}`} />
          <span className="text-[10px] font-bold">À propos</span>
        </Link>
 
        {/* Contact */}
        <Link
          href="/contact"
          className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 duration-200 ${
            pathname === "/contact"
              ? "text-primary"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <Phone className={`h-5 w-5 ${pathname === "/contact" ? "stroke-[2.5]" : ""}`} />
          <span className="text-[10px] font-bold">Contact</span>
        </Link>
      </nav>
    </>
  );
}
