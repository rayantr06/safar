"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { IMAGES } from "@/lib/constants";
import {
  User,
  Phone,
  MapPin,
  LogOut,
  HelpCircle,
  Info,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getPartnerSettings,
  updatePartnerSettings,
} from "@/lib/actions/partner-settings";

export default function PartnerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [portLocation, setPortLocation] = useState("");
  const [bio, setBio] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [boatName, setBoatName] = useState("");
  const [providerCreatedAt, setProviderCreatedAt] = useState<string | null>(
    null
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getPartnerSettings();
    if (result.success && result.data) {
      const d = result.data;
      setName(d.full_name);
      setPhone(d.phone);
      setCompanyName(d.company_name);
      setPortLocation(d.port_location);
      setBio(d.bio);
      setWhatsapp(d.whatsapp);
      setAddress(d.address);
      setAvatarUrl(d.avatar_url);
      setBoatName(d.boat_name);
      setProviderCreatedAt(d.provider_created_at);
    } else {
      setError(result.error || "Erreur de chargement");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await updatePartnerSettings({
      full_name: name,
      phone: phone,
      company_name: companyName,
      port_location: portLocation,
      bio: bio,
      whatsapp: whatsapp,
      address: address,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Erreur de sauvegarde");
    }
    setSaving(false);
  };

  const formatMemberSince = (dateStr: string | null) => {
    if (!dateStr) return "Partenaire";
    try {
      const date = new Date(dateStr);
      const month = date.toLocaleDateString("fr-FR", { month: "long" });
      const year = date.getFullYear();
      return `Partenaire depuis ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
    } catch {
      return "Partenaire";
    }
  };

  if (loading) {
    return (
      <div className="max-w-container-max mx-auto px-4 md:px-10 py-6 space-y-10 animate-fade-in">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary mb-1">
            Paramètres
          </h1>
          <p className="text-body-lg text-on-surface-variant">
            Gérez votre profil public et vos informations de contact.
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error && !name && !companyName) {
    return (
      <div className="max-w-container-max mx-auto px-4 md:px-10 py-6 space-y-10 animate-fade-in">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary mb-1">
            Paramètres
          </h1>
        </div>
        <div className="bg-error/10 border border-error/30 rounded-2xl p-8 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-error mx-auto" />
          <p className="text-on-surface font-bold">{error}</p>
          <Button
            onClick={fetchData}
            shape="pill"
            className="bg-primary text-white"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-6 space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display-lg text-display-lg text-primary mb-1">
          Paramètres
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Gérez votre profil public et vos informations de contact.
        </p>
      </div>

      {/* Success Toast */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-green-800 font-bold text-sm">
            Paramètres enregistrés avec succès !
          </p>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <p className="text-error font-bold text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Forms Section */}
        <section className="lg:col-span-8 space-y-8">
          {/* Profile Information */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-[2rem] border border-outline-variant shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/35 pb-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <User className="h-5 w-5" /> Informations de profil
              </h2>
              <Button
                onClick={handleSave}
                disabled={saving}
                shape="pill"
                className="bg-primary text-white font-bold px-6"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant px-1">
                  Nom du Partenaire / Capitaine
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-xl px-4 py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant px-1">
                  Numéro de téléphone
                </label>
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
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant px-1">
                  Nom de l&apos;entreprise
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/75" />
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-xl pl-10 py-3"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant px-1">
                  Port d&apos;attache
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/75" />
                  <Input
                    value={portLocation}
                    onChange={(e) => setPortLocation(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-xl pl-10 py-3"
                  />
                </div>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-on-surface-variant px-1">
                  Description / Bio
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant/75" />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full bg-white border border-outline-variant rounded-xl pl-10 py-3 px-4 text-sm resize-none"
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant text-right">
                  {bio.length}/500
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-[2rem] border border-outline-variant shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2 border-b border-outline-variant/35 pb-4">
              <MessageSquare className="h-5 w-5" /> Informations de contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant px-1">
                  WhatsApp
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/75" />
                  <Input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Numéro WhatsApp"
                    className="w-full bg-white border border-outline-variant rounded-xl pl-10 py-3"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant px-1">
                  Adresse
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/75" />
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Adresse du bureau"
                    className="w-full bg-white border border-outline-variant rounded-xl pl-10 py-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar Info Section */}
        <section className="lg:col-span-4 space-y-8">
          {/* Profile Card */}
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant shadow-sm text-center space-y-6">
            <div className="relative h-24 w-24 mx-auto">
              <div className="h-full w-full rounded-full border-4 border-surface-container-high overflow-hidden relative">
                <Image
                  src={avatarUrl || IMAGES.GUIDE_IMAGE}
                  alt="Partner Avatar"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <p className="font-bold text-on-surface text-sm">
                {name || "Partenaire"}
              </p>
              <p className="text-[10px] text-on-surface-variant font-bold">
                {formatMemberSince(providerCreatedAt)}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant/30">
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
              <h3 className="font-headline-sm text-sm font-bold text-white">
                Besoin d&apos;aide ?
              </h3>
              <p className="text-xs opacity-95 text-white leading-relaxed">
                Notre équipe de support partenaires est disponible pour
                répondre à vos questions techniques ou de paiement.
              </p>
              <Link
                className="text-white text-xs font-bold underline flex items-center gap-1 cursor-pointer"
                href="/contact"
              >
                Contacter le support →
              </Link>
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
