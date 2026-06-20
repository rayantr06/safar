"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Compass, MapPin, Calendar, User, LogOut, Phone, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderClientProps {
  user: any;
  userRole: string | null;
}

export function HeaderClient({ user, userRole }: HeaderClientProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
  const isDestinationsActive = pathname.startsWith("/destinations");
  const isSortiesActive = pathname === sortiesPath || pathname.startsWith("/partner/bookings") || pathname.startsWith("/admin/bookings") || pathname.startsWith("/booking/tracking") || (isClient && pathname === "/client");
  const isProfileActive = pathname === profilePath || pathname.startsWith("/partner/settings") || pathname.startsWith("/login") || (user && pathname.startsWith("/partner") && !isSortiesActive) || (isClient && pathname === "/client");

  return (
    <>
      {/* ===== Navigation Top Bar ===== */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/15 shadow-xs">
        <nav className="flex justify-between items-center w-full px-6 md:px-margin-desktop py-4 max-w-container-max mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center active:scale-95 transition-transform">
            <span className="text-2xl font-bold font-mono text-primary tracking-tighter">
              Safar<span className="text-tertiary-fixed-dim">DZ</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/experiences"
              className={`transition-colors text-label-md font-bold ${
                isExperiencesActive ? "text-primary font-extrabold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Expériences
            </Link>
            <Link
              href="/destinations"
              className={`transition-colors text-label-md font-bold ${
                isDestinationsActive ? "text-primary font-extrabold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Destinations
            </Link>
            <Link
              href="/about"
              className={`transition-colors text-label-md font-bold ${
                pathname === "/about" ? "text-primary font-extrabold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              À propos
            </Link>
          </div>

          {/* Right Actions / Hamburger trigger */}
          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className="hidden lg:block text-on-surface-variant hover:text-primary text-label-md font-bold px-4 py-2 rounded-lg transition-all"
            >
              Contact
            </Link>
            
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href={dashboardPath}
                  className="bg-primary text-on-primary text-label-md font-bold px-6 py-2.5 rounded-full hover:opacity-95 transition-all active:scale-95"
                >
                  {isAdmin ? "Dashboard Admin" : (isPartner ? "Mon Dashboard" : "Mon Espace")}
                </Link>
                <Link
                  href="/auth/signout"
                  className="text-on-surface-variant hover:text-error text-label-md font-bold transition-all"
                >
                  Déconnexion
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex bg-primary text-on-primary text-label-md font-bold px-6 py-2.5 rounded-full hover:opacity-95 transition-all active:scale-95"
              >
                Réserver
              </Link>
            )}

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
              <span className="text-2xl font-bold font-mono text-primary tracking-tighter">
                Safar<span className="text-tertiary-fixed-dim">DZ</span>
              </span>
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
                <span>Expériences</span>
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
                <span>Destinations</span>
              </Link>

              <Link
                href="/partners"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  pathname === "/partners"
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span>🤝</span>
                <span>Devenir Partenaire</span>
              </Link>

              <Link
                href={sortiesPath}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isSortiesActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <Calendar className="h-4.5 w-4.5" />
                <span>Mes Réservations</span>
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
                <span>À propos</span>
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
                <span>Contact</span>
              </Link>
            </div>

            {/* Drawer Footer / Account Actions */}
            <div className="border-t border-outline-variant/20 pt-4 mt-6">
              {user ? (
                <div className="space-y-3">
                  <div className="px-4 py-2 rounded-xl bg-surface-container-high/40 border border-outline-variant/10">
                    <p className="text-[10px] font-bold text-outline uppercase">Espace connecté</p>
                    <p className="text-xs font-bold text-on-surface truncate mt-0.5">{user.email}</p>
                  </div>
                  <Link
                    href={dashboardPath}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center justify-center bg-primary text-on-primary text-xs font-bold py-3 rounded-xl shadow-xs active:scale-95 transition-all"
                  >
                    {isAdmin ? "Dashboard Admin" : (isPartner ? "Accéder au Dashboard" : "Mon Espace Client")}
                  </Link>
                  <Link
                    href="/auth/signout"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 text-error hover:bg-error-container/20 text-xs font-bold py-3 rounded-xl transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center justify-center bg-primary text-on-primary text-xs font-bold py-3 rounded-xl shadow-xs active:scale-95 transition-all"
                >
                  Se connecter / S&apos;inscrire
                </Link>
              )}
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
          <span className="text-[10px] font-bold">Expériences</span>
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
          <span className="text-[10px] font-bold">Destinations</span>
        </Link>

        {/* Réservations */}
        <Link
          href={sortiesPath}
          className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 duration-200 ${
            isSortiesActive
              ? "text-primary"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <Calendar className={`h-5 w-5 ${isSortiesActive ? "stroke-[2.5]" : ""}`} />
          <span className="text-[10px] font-bold">Réservations</span>
        </Link>

        {/* Compte */}
        <Link
          href={profilePath}
          className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 duration-200 ${
            isProfileActive
              ? "text-primary"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <User className={`h-5 w-5 ${isProfileActive ? "stroke-[2.5]" : ""}`} />
          <span className="text-[10px] font-bold">Compte</span>
        </Link>
      </nav>
    </>
  );
}
