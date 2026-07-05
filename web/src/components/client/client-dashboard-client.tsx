"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calendar, Clock, Users, Mail, Phone, MessageCircle, MapPin, 
  HelpCircle, User, Key, ShieldCheck, Check, Edit2, AlertCircle, Compass 
} from "lucide-react";
import { updateClientProfile } from "@/lib/actions/client-profile";
import { formatPriceDA } from "@/lib/utils/format";

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

interface ClientDashboardClientProps {
  initialClient: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
  initialBookings: any[];
}

export function ClientDashboardClient({ initialClient, initialBookings }: ClientDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"bookings" | "profile" | "support">("bookings");
  const [client, setClient] = useState(initialClient);
  const [bookings, setBookings] = useState(initialBookings);
  
  // Profile editing form state
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      const res = await updateClientProfile(client.email, { name, phone });
      if (res.success) {
        setClient(prev => ({ ...prev, name, phone }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.error || "Une erreur est survenue.");
      }
    } catch (err: any) {
      setSaveError(err.message || "Une erreur est survenue.");
    } finally {
      setSaveLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-800 rounded-full uppercase tracking-wide">Confirmé</span>;
      case "completed":
        return <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-800 rounded-full uppercase tracking-wide">Terminé</span>;
      case "cancelled":
        return <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-800 rounded-full uppercase tracking-wide">Annulé</span>;
      default:
        return <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full uppercase tracking-wide">En attente</span>;
    }
  };

  return (
    <div className="min-h-screen py-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full space-y-10">
      {/* Welcome Banner */}
      <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Portail Client</span>
          <h1 className="font-display-lg text-display-lg text-primary mt-1 mb-2">
            Bonjour, {client.name || "Client Safar"} ⚓
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-xl">
            Bienvenue dans votre espace personnel. Suivez l&apos;état de vos réservations et gérez vos informations.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/experiences"
            className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:opacity-95 text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <Compass className="h-4.5 w-4.5" /> Explorer des sorties
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="px-6 py-3 border border-outline-variant text-on-surface-variant font-bold rounded-xl hover:bg-surface-container transition-all text-xs uppercase tracking-wider active:scale-95"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-outline-variant/30 overflow-x-auto gap-8 text-sm font-bold">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-4 border-b-2 transition-all ${
            activeTab === "bookings"
              ? "border-primary text-primary font-extrabold"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          🚢 Mes Réservations ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-4 border-b-2 transition-all ${
            activeTab === "profile"
              ? "border-primary text-primary font-extrabold"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          ⚙️ Informations Personnelles
        </button>
        <button
          onClick={() => setActiveTab("support")}
          className={`pb-4 border-b-2 transition-all ${
            activeTab === "support"
              ? "border-primary text-primary font-extrabold"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          💬 Aide &amp; Support client
        </button>
      </div>

      {/* Tab Contents */}
      <div className="w-full">
        {/* 1. BOOKINGS LIST */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-outline-variant/30 max-w-lg mx-auto p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto text-on-surface-variant text-xl">
                  📭
                </div>
                <h3 className="font-bold text-lg text-on-surface">Aucune réservation trouvée</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Nous n&apos;avons pas trouvé de réservations associées à votre nom ou numéro de téléphone. Assurez-vous d&apos;ajouter votre numéro de téléphone dans l&apos;onglet <strong>Informations Personnelles</strong> pour synchroniser vos sorties en mer.
                </p>
                <Link
                  href="/experiences"
                  className="inline-block bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:opacity-95 text-xs uppercase tracking-wider transition-all"
                >
                  Faire une réservation
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map((b) => {
                  const durationHrs = b.duration_minutes ? b.duration_minutes / 60 : 2;
                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col justify-between"
                    >
                      {/* Booking Header */}
                      <div className="bg-primary/[0.02] p-6 border-b border-outline-variant/15 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Référence</span>
                          <h4 className="font-mono text-sm font-bold text-primary">{b.booking_ref}</h4>
                        </div>
                        {getStatusBadge(b.status)}
                      </div>

                      {/* Booking Details */}
                      <div className="p-6 space-y-4 flex-1">
                        <div>
                          <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Expérience</span>
                          <h3 className="font-bold text-base text-on-surface leading-snug mt-0.5">
                            {b.experiences?.title || "Balade en Mer"}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/10">
                            <span className="text-[9px] font-bold text-outline uppercase tracking-wider block mb-1">Date &amp; Heure</span>
                            <span className="font-mono text-xs font-bold text-on-surface flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-primary" /> {b.booking_date}
                            </span>
                            <span className="font-mono text-[10px] text-on-surface-variant block mt-1">
                              Départ : {b.booking_time || b.start_time || "—"}
                            </span>
                          </div>
                          
                          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/10">
                            <span className="text-[9px] font-bold text-outline uppercase tracking-wider block mb-1">Voyageurs</span>
                            <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-secondary" /> {b.guest_count} Personnes
                            </span>
                            <span className="text-[10px] text-on-surface-variant block mt-1">
                              Durée : {durationHrs}h
                            </span>
                          </div>
                        </div>

                        {b.client_notes && (
                          <div className="p-3 bg-surface-container-low/60 rounded-xl border border-outline-variant/10">
                            <span className="text-[9px] font-bold text-outline uppercase tracking-wider block mb-1">Vos Notes</span>
                            <p className="text-xs text-on-surface-variant italic">{b.client_notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Booking Footer */}
                      <div className="p-6 border-t border-outline-variant/15 flex justify-between items-center bg-surface-container-lowest">
                        <span className="text-xs text-on-surface-variant font-bold">Prix à régler sur place</span>
                        <span className="font-mono font-bold text-md text-primary">
                          {formatPriceDA(b.total_amount || b.provider_amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. PROFILE EDITING FORM */}
        {activeTab === "profile" && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/35 shadow-sm max-w-2xl mx-auto">
            <h2 className="font-headline-sm text-headline-sm text-primary mb-2">Informations Personnelles</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              Mettez à jour vos informations. Votre numéro de téléphone est crucial : il sert à lier vos réservations passées et futures à votre tableau de bord.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {saveSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl flex items-center gap-2 text-xs font-bold">
                  <Check className="h-4 w-4" /> Vos informations ont été mises à jour avec succès. Vos réservations se synchroniseront automatiquement.
                </div>
              )}
              {saveError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-2 text-xs font-bold">
                  <AlertCircle className="h-4 w-4" /> {saveError}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Nom Complet</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Amine B."
                  className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Adresse Email (Non modifiable)</label>
                <input
                  disabled
                  type="email"
                  value={client.email}
                  className="bg-surface-container border border-outline-variant/20 rounded-xl p-3 text-body-md text-on-surface-variant cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Numéro de Téléphone</label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 0556 48 36 34"
                  className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono"
                />
                <span className="text-[10px] text-on-surface-variant ml-1 leading-normal block">
                  Format local recommandé: 0556 48 36 34. Assurez-vous d&apos;utiliser le même numéro que celui de vos réservations.
                </span>
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:opacity-90 active:scale-95 shadow-md shadow-primary/10 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {saveLoading ? "Sauvegarde en cours..." : "Sauvegarder les modifications"}
              </button>
            </form>
          </div>
        )}

        {/* 3. SUPPORT CONTACTS */}
        {activeTab === "support" && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/35 shadow-sm max-w-2xl mx-auto space-y-8">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary mb-2">Support client Safar DZ</h2>
              <p className="text-body-md text-on-surface-variant">
                Vous avez besoin de modifier une réservation en attente ? Vous avez une question sur les conditions météo ? Notre support client est à votre disposition.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://wa.me/213556483634"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#25D366]/5 hover:bg-[#25D366]/10 border border-[#25D366]/15 transition-all group"
              >
                <div className="p-3 bg-[#25D366] text-white rounded-xl">
                  <MessageCircle className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#128C7E]">WhatsApp</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">+213 556 48 36 34</p>
                </div>
              </a>

              <a
                href="tel:0556483634"
                className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all group"
              >
                <div className="p-3 bg-primary text-white rounded-xl">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-primary">Téléphone direct</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">0556 48 36 34</p>
                </div>
              </a>

              <a
                href="mailto:contact@safardz.com"
                className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container border border-outline-variant/35 hover:border-primary/30 transition-all group"
              >
                <div className="p-3 bg-secondary text-white rounded-xl">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors">Email direct</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono">contact@safardz.com</p>
                </div>
              </a>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
                <div className="p-3 bg-secondary text-white rounded-xl">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-on-surface">Bureau Local</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Béjaïa, Algérie</p>
                </div>
              </div>
            </div>

            {/* Social Grid */}
            <div className="pt-4 border-t border-outline-variant/20">
              <h4 className="font-bold text-xs text-outline uppercase tracking-wider mb-4">Rejoignez-nous sur les réseaux</h4>
              <div className="grid grid-cols-3 gap-3">
                <a
                  href="https://www.instagram.com/safar_dz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-outline-variant/20 bg-surface hover:bg-surface-container transition-all group"
                >
                  <InstagramIcon className="h-5 w-5 text-on-surface-variant group-hover:text-[#E1306C] transition-colors" />
                  <span className="text-[10px] font-bold mt-2 text-on-surface-variant">Instagram</span>
                </a>

                <a
                  href="https://www.facebook.com/profile.php?id=61590829494331"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-outline-variant/20 bg-surface hover:bg-surface-container transition-all group"
                >
                  <FacebookIcon className="h-5 w-5 text-on-surface-variant group-hover:text-[#1877F2] transition-colors" />
                  <span className="text-[10px] font-bold mt-2 text-on-surface-variant">Facebook</span>
                </a>

                <a
                  href="https://www.tiktok.com/@safar.dz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-outline-variant/20 bg-surface hover:bg-surface-container transition-all group"
                >
                  <TiktokIcon className="h-5 w-5 text-on-surface-variant group-hover:text-black dark:group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-bold mt-2 text-on-surface-variant">TikTok</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
