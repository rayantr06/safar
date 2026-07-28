"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled client error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 text-red-600">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <span className="text-red-700 font-mono text-xs uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-200 inline-block">
          Une erreur s&apos;est produite
        </span>

        <h1 className="text-display-md font-display-md text-primary leading-tight">
          Oups ! Quelque chose a mal tourné.
        </h1>

        <p className="text-body-md text-on-surface-variant leading-relaxed">
          Une erreur inattendue est survenue lors du chargement de cette page. Veuillez réessayer ou contacter notre support.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full text-xs hover:opacity-95 shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-surface text-on-surface border border-outline-variant font-bold px-6 py-3 rounded-full text-xs hover:bg-surface-container transition-all"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
