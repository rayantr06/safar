"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "../../utils/cn";

export interface SafarNavLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface SafarNavbarProps {
  mode?: "marketing" | "dashboard";
  logo: React.ReactNode;
  links: SafarNavLink[];
  actions?: React.ReactNode;
  className?: string;
}

export function SafarNavbar({ mode = "marketing", logo, links, actions, className }: SafarNavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    if (mode !== "marketing") return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode]);

  if (mode === "dashboard") {
    return (
      <aside className={cn("flex h-full w-64 flex-col bg-cream border-r border-soft-ocean/20", className)}>
        <div className="flex items-center px-6 py-6">{logo}</div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-safar-sm px-4 py-3 text-safar-body-sm font-medium transition-colors duration-200",
                link.active ? "bg-ocean-blue text-white" : "text-ink/70 hover:bg-soft-ocean/10"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {actions && <div className="border-t border-soft-ocean/20 px-6 py-4">{actions}</div>}
      </aside>
    );
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-safar",
        scrolled ? "bg-cream/95 shadow-safar-sm backdrop-blur-md" : "bg-transparent",
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="shrink-0">{logo}</div>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-safar-button-md transition-colors duration-200",
                scrolled ? "text-ink" : "text-white",
                link.active && "text-sun-gold"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">{actions}</div>

        <button
          onClick={() => setIsOpen(true)}
          className={cn("md:hidden", scrolled ? "text-ink" : "text-white")}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-ink/50 md:hidden" onClick={() => setIsOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 animate-safar-slide-up bg-cream p-6 shadow-safar-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-6">
              {logo}
              <button onClick={() => setIsOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6 text-ink" />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-safar-sm px-3 py-3 text-safar-body-md text-ink hover:bg-soft-ocean/10"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            {actions && <div className="mt-6 border-t border-soft-ocean/20 pt-4">{actions}</div>}
          </div>
        </div>
      )}
    </header>
  );
}
