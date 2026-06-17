import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-surface-container-lowest md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-outline-variant bg-surface md:flex">
        <div className="flex h-16 items-center border-b border-outline-variant px-6">
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="text-xl font-bold font-mono text-primary tracking-tighter">
              Safar<span className="text-tertiary-fixed-dim">DZ</span>
            </span>
            <span className="rounded bg-error-container px-1.5 py-0.5 text-[10px] font-bold text-on-error-container uppercase">
              Admin
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4 px-2">
            Administration
          </div>
          <Link href="/admin" className="flex items-center space-x-3 rounded-lg bg-secondary-container px-3 py-2 text-on-secondary-container transition-all">
            <span className="font-medium">Vue Globale</span>
          </Link>
          <Link href="/admin/bookings" className="flex items-center space-x-3 rounded-lg px-3 py-2 text-on-surface hover:bg-surface-variant transition-all">
            <span className="font-medium">Réservations</span>
          </Link>
          <Link href="/admin/partners" className="flex items-center space-x-3 rounded-lg px-3 py-2 text-on-surface hover:bg-surface-variant transition-all">
            <span className="font-medium">Partenaires</span>
          </Link>
          <Link href="/admin/experiences" className="flex items-center space-x-3 rounded-lg px-3 py-2 text-on-surface hover:bg-surface-variant transition-all">
            <span className="font-medium">Expériences</span>
          </Link>
          <Link href="/admin/finance" className="flex items-center space-x-3 rounded-lg px-3 py-2 text-on-surface hover:bg-surface-variant transition-all">
            <span className="font-medium">Finance & Commissions</span>
          </Link>
          <Link href="/admin/destinations" className="flex items-center space-x-3 rounded-lg px-3 py-2 text-on-surface hover:bg-surface-variant transition-all">
            <span className="font-medium">Destinations</span>
          </Link>
        </nav>
        <div className="border-t border-outline-variant p-4">
          <form action="/auth/signout" method="POST">
            <Button variant="ghost" className="w-full justify-start text-error hover:bg-error-container hover:text-on-error-container">
              Déconnexion
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center border-b border-outline-variant bg-surface px-4 md:hidden">
          <Link href="/admin" className="flex items-center space-x-2 font-bold font-mono text-primary">
            SafarDZ Admin
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
