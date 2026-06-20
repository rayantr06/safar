"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Phone, MapPin, Shield, Mail, Key, LogOut, HelpCircle, Info, Landmark, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PartnerSettingsPage() {
  const [name, setName] = useState("Ahmed Mansouri");
  const [phone, setPhone] = useState("+213 550 12 34 56");
  const [boatName, setBoatName] = useState("The Mediterranean Pearl");
  const [payoutMethod, setPayoutMethod] = useState<"bank" | "cash">("bank");
  const [ribNumber, setRibNumber] = useState("007 99999 000000000000 00");
  const [lang, setLang] = useState<"fr" | "ar" | "en">("fr");

  const handleSave = () => {
    alert("Paramètres enregistrés avec succès !");
  };

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6 space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display-lg text-display-lg text-primary mb-1">Paramètres</h1>
        <p className="text-body-lg text-on-surface-variant">
          Gérez votre profil public, vos méthodes de paiement et vos préférences système.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Forms Section */}
        <section className="lg:col-span-8 space-y-8">
          {/* Profile Information */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-[2rem] border border-outline-variant shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/35 pb-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <User className="h-5 w-5" /> Informations de profil
              </h2>
              <Button onClick={handleSave} shape="pill" className="bg-primary text-white font-bold px-6">
                Enregistrer
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant px-1">Nom du Partenaire / Capitaine</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-xl px-4 py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant px-1">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/75" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-xl pl-10 py-3"
                  />
                </div>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-on-surface-variant px-1">Nom de votre bateau principal</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">⛵</span>
                  <Input
                    value={boatName}
                    onChange={(e) => setBoatName(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-xl pl-10 py-3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Setup */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-[2rem] border border-outline-variant shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2 border-b border-outline-variant/35 pb-4">
              💰 Mode de versement
            </h2>

            <div className="space-y-4">
              <label className="text-xs font-bold text-on-surface-variant px-1">Méthode de paiement préférée</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bank Transfer */}
                <div
                  onClick={() => setPayoutMethod("bank")}
                  className={`border-2 rounded-2xl p-4 cursor-pointer flex items-center gap-4 transition-all duration-200 ${
                    payoutMethod === "bank"
                      ? "border-primary bg-primary/[0.03]"
                      : "border-outline-variant bg-white hover:border-primary/50"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${payoutMethod === "bank" ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"}`}>
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-on-surface">Virement Bancaire (RIB)</div>
                    <div className="text-[10px] text-on-surface-variant">Directement sur votre compte algérien</div>
                  </div>
                  {payoutMethod === "bank" && <span className="text-primary font-bold">✓</span>}
                </div>

                {/* Cash */}
                <div
                  onClick={() => setPayoutMethod("cash")}
                  className={`border-2 rounded-2xl p-4 cursor-pointer flex items-center gap-4 transition-all duration-200 ${
                    payoutMethod === "cash"
                      ? "border-primary bg-primary/[0.03]"
                      : "border-outline-variant bg-white hover:border-primary/50"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${payoutMethod === "cash" ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"}`}>
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-on-surface">Retrait en Espèces</div>
                    <div className="text-[10px] text-on-surface-variant">Récupération à nos bureaux à Béjaïa</div>
                  </div>
                  {payoutMethod === "cash" && <span className="text-primary font-bold">✓</span>}
                </div>
              </div>

              {payoutMethod === "bank" && (
                <div className="space-y-2 pt-4 border-t border-outline-variant/30 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-on-surface-variant px-1">Numéro de RIB</label>
                  <Input
                    value={ribNumber}
                    onChange={(e) => setRibNumber(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-xl px-4 py-3 font-mono text-sm tracking-wider"
                    placeholder="007 99999 000000000000 00"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sidebar Info Section */}
        <section className="lg:col-span-4 space-y-8">
          {/* Language Selection */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Sélection de la Langue</h3>
            <div className="space-y-3">
              {(["fr", "ar", "en"] as const).map((langCode) => {
                const labels = { fr: "Français", ar: "العربية", en: "English" };
                const flags = { fr: "🇫🇷", ar: "🇩🇿", en: "🇬🇧" };
                const isSelected = lang === langCode;
                return (
                  <div
                    key={langCode}
                    onClick={() => setLang(langCode)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-surface-container-high border-primary/50 text-primary font-bold"
                        : "border-outline-variant/60 hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <span>{flags[langCode]}</span>
                      <span>{labels[langCode]}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-primary text-primary" : "border-outline-variant"}`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile Card & Password */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant shadow-sm text-center space-y-6">
            <div className="relative h-24 w-24 mx-auto">
              <div className="h-full w-full rounded-full border-4 border-surface-container-high overflow-hidden relative">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRsL82i3BUX5tGUsWmJapsuZsIH2pjhWG8--_hvFijU7rySGcaFy1e82OoqRQeEzw9Docz1kl2rGhRxKLPQdUeugkbFhkPkDaZgOrXEaRsnKFqeEnYnM0BuLOxkxjWxHZTn9oxkHYuLifytKH9If1P8wNRLKmMuajEcqicn4JFkoTAF1g233vFJw_0ff9vOWp60meDItxmAD2ctkpFFVe2mxTe8qxBb1Eu-oBUcQe0AdhUsuBN3h5F6WbQyTTv2MaSGHys5yyv6sU"
                  alt="Partner Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform text-xs">
                ✏️
              </button>
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm">{name}</p>
              <p className="text-[10px] text-on-surface-variant font-bold">Partenaire depuis Mars 2026</p>
            </div>

            <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant/30">
              <Button
                variant="outline"
                shape="pill"
                className="w-full flex items-center justify-center gap-2 border-outline-variant font-bold text-xs"
              >
                <Key className="h-3.5 w-3.5" /> Changer le mot de passe
              </Button>
              <Button
                variant="outline"
                shape="pill"
                className="w-full bg-error/10 text-error hover:bg-error/20 border-transparent font-bold text-xs flex items-center justify-center gap-2"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                <LogOut className="h-3.5 w-3.5" /> Se déconnecter
              </Button>
            </div>
          </div>

          {/* Support Helper Card */}
          <div className="bg-tertiary-container text-on-tertiary-container p-6 rounded-[2rem] relative overflow-hidden shadow-sm">
            <div className="relative z-10 space-y-4">
              <Info className="h-7 w-7 text-tertiary-fixed-dim" />
              <h3 className="font-headline-sm text-sm font-bold text-white">Besoin d&apos;aide ?</h3>
              <p className="text-xs opacity-95 text-white leading-relaxed">
                Notre équipe de support partenaires est disponible pour répondre à vos questions techniques ou de paiement.
              </p>
              <a className="text-white text-xs font-bold underline flex items-center gap-1 cursor-pointer" href="#">
                Contacter le support →
              </a>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 text-[100px] select-none">
              📞
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
