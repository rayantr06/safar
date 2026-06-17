import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-surface-variant bg-surface/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold font-mono text-primary tracking-tighter">
              Safar<span className="text-tertiary-fixed-dim">DZ</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="text-on-surface hover:text-primary transition-colors">
              Découvrir
            </Link>
            <Link href="/experiences" className="text-on-surface hover:text-primary transition-colors">
              Expériences
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <Button asChild variant="outline">
                <Link href="/partner">Mon Dashboard</Link>
              </Button>
            ) : (
              <Button asChild variant="ghost">
                <Link href="/login">Accès Partenaire</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-variant bg-surface-container-low py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-mono text-primary">
              Safar<span className="text-tertiary-fixed-dim">DZ</span>
            </h3>
            <p className="text-sm text-on-surface-variant">
              Votre portail de réservation d'expériences nautiques à Béjaïa.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-on-surface">Découvrir</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><Link href="/experiences?type=private" className="hover:text-primary">Bateaux Privés</Link></li>
              <li><Link href="/experiences?type=shared" className="hover:text-primary">Sorties Partagées</Link></li>
              <li><Link href="/experiences?type=jetski" className="hover:text-primary">Jet Ski (Bientôt)</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-on-surface">Partenaires</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><Link href="/login" className="hover:text-primary">Espace Propriétaire</Link></li>
              <li><Link href="/login" className="hover:text-primary">Devenir Partenaire</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-on-surface">Contact</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li>Support WhatsApp</li>
              <li>+213 (0) 500 00 00 00</li>
              <li>contact@safardz.com</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-surface-variant text-center text-sm text-on-surface-variant">
          © {new Date().getFullYear()} Safar DZ. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
