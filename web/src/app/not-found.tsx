import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <span className="text-secondary font-mono text-xs uppercase tracking-widest bg-secondary-fixed/30 px-3 py-1 rounded-full inline-block">
          Erreur 404
        </span>

        <h1 className="text-display-md font-display-md text-primary leading-tight">
          Page Introuvable
        </h1>

        <p className="text-body-md text-on-surface-variant leading-relaxed">
          Désolé, la destination ou la page que vous recherchez semble s&apos;être éloignée des côtes.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full text-xs hover:opacity-95 shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/experiences"
            className="inline-flex items-center justify-center gap-2 bg-surface text-on-surface border border-outline-variant font-bold px-6 py-3 rounded-full text-xs hover:bg-surface-container transition-all"
          >
            <Search className="w-4 h-4" />
            Explorer les expériences
          </Link>
        </div>
      </div>
    </div>
  );
}
