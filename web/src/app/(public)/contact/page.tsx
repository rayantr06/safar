"use client";

import { Mail, Phone, MessageCircle, MapPin, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

// Custom SVG Icons to avoid lucide-react version compatibility issues
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export default function ContactPage() {
  return (
    <div className="flex flex-col w-full pb-24">
      {/* Title Header */}
      <section className="relative pt-20 pb-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low/40 overflow-hidden">
        <div className="max-w-container-max mx-auto text-center relative z-10">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-secondary-fixed/30 px-3 py-1 rounded-full mb-4 inline-block">
            Support Client
          </span>
          <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg leading-tight text-primary mb-6">
            Contactez Safar DZ
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Une question sur une réservation, un itinéraire ou envie de devenir partenaire ? Notre équipe locale est à votre écoute.
          </p>
        </div>
      </section>

      {/* Contact Form & details */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact info list */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary mb-4">
              Nos coordonnées
            </h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              N&apos;hésitez pas à nous écrire directement ou à nous appeler. Pour une réponse rapide, privilégiez WhatsApp ou nos réseaux sociaux.
            </p>
          </div>

          <div className="space-y-6">
            {/* WhatsApp */}
            <a
              href="https://wa.me/213556483634"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 rounded-2xl bg-[#25D366]/5 hover:bg-[#25D366]/10 border border-[#25D366]/15 transition-all cursor-pointer group"
            >
              <div className="p-3 bg-[#25D366] text-white rounded-xl">
                <MessageCircle className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#128C7E]">WhatsApp</h4>
                <p className="text-xs text-on-surface-variant font-mono mt-1">+213 (0) 556 48 36 34</p>
                <p className="text-[10px] text-[#128C7E] underline font-bold mt-1 group-hover:opacity-80">Démarrer la discussion →</p>
              </div>
            </a>

            {/* Direct Phone */}
            <a
              href="tel:0556483634"
              className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all cursor-pointer group"
            >
              <div className="p-3 bg-primary text-white rounded-xl">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-primary">Téléphone</h4>
                <p className="text-xs text-on-surface-variant font-mono mt-1">0556 48 36 34</p>
                <p className="text-[10px] text-primary underline font-bold mt-1 group-hover:opacity-80">Appeler directement →</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:contact@safardz.com"
              className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container border border-outline-variant/35 hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="p-3 bg-secondary text-white rounded-xl">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Email</h4>
                <p className="text-xs text-on-surface-variant font-mono mt-1">contact@safardz.com</p>
              </div>
            </a>

            {/* Local Office */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
              <div className="p-3 bg-secondary text-white rounded-xl">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Bureau Local</h4>
                <p className="text-xs text-on-surface-variant mt-1">Béjaïa, Algérie</p>
              </div>
            </div>
          </div>

          {/* Social Networks Section */}
          <div className="pt-4">
            <h3 className="font-bold text-sm text-primary mb-4 uppercase tracking-wider">
              Suivez-nous sur les réseaux
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/safar_dz/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-outline-variant/20 bg-surface hover:bg-surface-container transition-all group text-center"
              >
                <InstagramIcon className="h-5 w-5 text-on-surface-variant group-hover:text-[#E1306C] transition-colors" />
                <span className="text-[10px] font-bold mt-2 text-on-surface-variant">Instagram</span>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61590829494331"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-outline-variant/20 bg-surface hover:bg-surface-container transition-all group text-center"
              >
                <FacebookIcon className="h-5 w-5 text-on-surface-variant group-hover:text-[#1877F2] transition-colors" />
                <span className="text-[10px] font-bold mt-2 text-on-surface-variant">Facebook</span>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@safar.dz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-outline-variant/20 bg-surface hover:bg-surface-container transition-all group text-center"
              >
                <TiktokIcon className="h-5 w-5 text-on-surface-variant group-hover:text-black dark:group-hover:text-white transition-colors" />
                <span className="text-[10px] font-bold mt-2 text-on-surface-variant">TikTok</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form input */}
        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-outline-variant/35 shadow-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-6">
            Envoyer un message
          </h2>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Message envoyé ! Notre équipe vous contactera rapidement."); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Nom Complet</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Amine B."
                  className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Adresse Email</label>
                <input
                  required
                  type="email"
                  placeholder="Ex: amine@exemple.com"
                  className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Numéro de Téléphone</label>
              <input
                required
                type="tel"
                placeholder="Ex: 0556 48 36 34"
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Sujet de votre demande</label>
              <select className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer">
                <option value="booking">Question sur une Réservation</option>
                <option value="partnership">Devenir Capitaine Partenaire</option>
                <option value="custom">Demande sur mesure / Événement</option>
                <option value="other">Autre demande</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Message</label>
              <textarea
                required
                rows={5}
                placeholder="Décrivez votre demande en détail..."
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:opacity-90 active:scale-95 shadow-md shadow-primary/10 transition-all text-sm uppercase tracking-wider"
            >
              Envoyer le message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
