"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Anchor, Star, ToggleRight, ToggleLeft, Shield, MapPin, Users, Activity, Settings, HelpCircle, LogOut, X, Save, Trash, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPriceDA } from "@/lib/utils/format";
import { toggleExperienceStatus, saveExperience, createExperience } from "@/lib/actions/experiences";

interface FleetListProps {
  initialExperiences: any[];
}

export function FleetList({ initialExperiences }: FleetListProps) {
  const [experiences, setExperiences] = useState(initialExperiences);
  const [selectedExp, setSelectedExp] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Stats
  const totalFleet = experiences.length;
  const activeToday = experiences.filter((e) => e.is_published).length;
  const underMaintenance = experiences.filter((e) => !e.is_published).length; // Map unpublished/draft to maintenance/offline for display
  const totalCapacity = experiences.reduce((sum, e) => sum + (e.max_guests || 0), 0);

  const handleTogglePublished = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const exp = experiences.find((item) => item.id === id);
    if (!exp) return;
    const newStatus = !exp.is_published;
    
    // Optimistic UI update
    setExperiences((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_published: newStatus } : item
      )
    );

    try {
      await toggleExperienceStatus(id, newStatus);
    } catch (err) {
      console.error("Failed to toggle experience status:", err);
      // Revert on error
      setExperiences((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_published: !newStatus } : item
        )
      );
    }
  };

  const handleEditClick = (exp: any) => {
    setSelectedExp({ ...exp });
    setIsDrawerOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedExp) return;

    const isNew = selectedExp.id.startsWith("new-");
    
    // Optimistic update
    setExperiences((prev) => {
      if (isNew) {
        return [...prev, selectedExp];
      } else {
        return prev.map((item) => (item.id === selectedExp.id ? selectedExp : item));
      }
    });

    try {
      if (isNew) {
        await createExperience(selectedExp);
      } else {
        await saveExperience(selectedExp.id, selectedExp);
      }
    } catch (err) {
      console.error("Failed to save changes:", err);
      // Revert or refresh page
    }

    setIsDrawerOpen(false);
    setSelectedExp(null);
  };

  const filteredExps = experiences.filter((exp) => {
    const query = searchQuery.toLowerCase();
    return (
      exp.title?.toLowerCase().includes(query) ||
      exp.boatName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary mb-1">Ma Flotte</h1>
          <p className="text-body-lg text-on-surface-variant">Contrôlez les tarifs, la disponibilité et les profils de vos navires.</p>
        </div>
        <Button 
          className="bg-primary text-white" 
          shape="pill"
          onClick={() => {
            setSelectedExp({
              id: `new-${Date.now()}`,
              title: "Nouveau bateau",
              boatName: "Sirène de Béjaïa",
              type: "private",
              price_total: 1500000, // 15,000 DA
              price_per_seat: 250000, // 2,500 DA
              duration_minutes: 120,
              max_guests: 6,
              is_published: false,
              main_image_url: "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
            });
            setIsDrawerOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Ajouter un bateau
        </Button>
      </div>

      {/* Overview Cards Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Fleet */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 group hover:border-primary transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-container/10 rounded-lg text-primary">
              <span className="text-2xl">⛵</span>
            </div>
            <span className="text-label-sm text-on-surface-variant font-medium">Flotte Totale</span>
          </div>
          <div className="font-headline-md text-headline-md font-bold font-mono text-on-surface">
            {String(totalFleet).padStart(2, "0")}
          </div>
          <div className="mt-2 text-xs text-on-surface-variant">Bateaux enregistrés</div>
        </div>

        {/* Active Today */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 group hover:border-primary transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-success/10 rounded-lg text-success">
              <span className="text-2xl">🟢</span>
            </div>
            <span className="text-label-sm text-on-surface-variant font-medium">Actifs en Ligne</span>
          </div>
          <div className="font-headline-md text-headline-md font-bold font-mono text-on-surface">
            {String(activeToday).padStart(2, "0")}
          </div>
          <div className="mt-2 text-xs text-on-surface-variant">Visibles pour réservation</div>
        </div>

        {/* Under Maintenance */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 group hover:border-primary transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-error/10 rounded-lg text-error">
              <span className="text-2xl">🔧</span>
            </div>
            <span className="text-label-sm text-on-surface-variant font-medium">Brouillon / Hors-ligne</span>
          </div>
          <div className="font-headline-md text-headline-md font-bold font-mono text-on-surface">
            {String(underMaintenance).padStart(2, "0")}
          </div>
          <div className="mt-2 text-xs text-error">Nécessite activation</div>
        </div>

        {/* Total Capacity */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 group hover:border-primary transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-secondary-container/10 rounded-lg text-secondary">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-label-sm text-on-surface-variant font-medium">Capacité Totale</span>
          </div>
          <div className="font-headline-md text-headline-md font-bold font-mono text-on-surface">
            {String(totalCapacity).padStart(2, "0")}
          </div>
          <div className="mt-2 text-xs text-on-surface-variant font-medium">Passagers simultanés max</div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container p-4 rounded-2xl flex flex-wrap gap-4 items-center border border-outline-variant/50">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <Input
            placeholder="Rechercher un bateau ou une expérience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-outline-variant bg-surface-container-lowest"
          />
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExps.map((exp) => (
          <div
            key={exp.id}
            onClick={() => handleEditClick(exp)}
            className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant/30 hover:border-primary hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={exp.main_image_url}
                  alt={exp.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-md">
                  <Star className="h-3 w-3 fill-current text-tertiary-fixed-dim" />
                  <span>4.9</span>
                </div>
                <div className="absolute bottom-4 left-4">
                  {exp.is_published ? (
                    <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                      Actif
                    </span>
                  ) : (
                    <span className="bg-outline text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                      Draft / Inactif
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-sm text-on-surface text-lg font-bold group-hover:text-primary transition-colors">
                    {exp.title}
                  </h3>
                </div>
                <div className="flex items-center text-xs text-on-surface-variant mb-4 gap-1">
                  <Anchor className="h-3.5 w-3.5" />
                  <span className="font-semibold">{exp.boatName}</span>
                </div>

                <div className="flex items-center gap-4 border-t border-outline-variant/30 pt-3 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>{exp.max_guests} Places</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>Béjaïa</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={exp.type === "private" ? "secondary" : "default"} className="text-[10px] px-1.5 py-0.5">
                      {exp.type === "private" ? "Privé" : "Partagé"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-2 border-t border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest" onClick={(e) => e.stopPropagation()}>
              <div className="font-mono font-bold text-primary text-sm">
                {exp.type === "private"
                  ? `${(exp.price_total ?? 0) / 100} DA`
                  : `${(exp.price_per_seat ?? 0) / 100} DA/pers`}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(exp)}
                  className="h-8 text-xs font-bold"
                >
                  <Edit2 className="h-3 w-3 mr-1" /> Modifier
                </Button>
                <button
                  onClick={(e) => handleTogglePublished(exp.id, e)}
                  className="p-1 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant"
                >
                  {exp.is_published ? (
                    <ToggleRight className="h-6 w-6 text-success" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-on-surface-variant" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How to publish notice */}
      <div className="bg-primary-container/30 border border-primary/20 rounded-2xl p-6 flex items-start gap-4">
        <Star className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-on-surface mb-1">Comment publier une nouvelle expérience ?</h4>
          <p className="text-sm text-on-surface-variant">
            Pour garantir la qualité de la plateforme, chaque nouvelle expérience doit être approuvée par l&apos;équipe Safar DZ avant d&apos;être visible par les clients. Contactez-nous sur WhatsApp après avoir créé votre fiche.
          </p>
        </div>
      </div>

      {/* Detail & Pricing Editor Drawer */}
      {selectedExp && isDrawerOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
            onClick={() => {
              setIsDrawerOpen(false);
              setSelectedExp(null);
            }}
          />

          {/* Editor Drawer */}
          <aside className="fixed top-0 right-0 h-screen w-full md:w-[500px] bg-surface-container-lowest z-[70] shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="relative h-60 flex-shrink-0">
              <Image
                src={selectedExp.main_image_url}
                alt={selectedExp.title}
                fill
                className="object-cover"
              />
              <button
                className="absolute top-4 left-4 bg-white/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/50 transition-all"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setSelectedExp(null);
                }}
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/85 to-transparent text-white">
                <span className="bg-white/95 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-2">
                  Statut Bateau: Vérifié
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-xl">{selectedExp.title}</h3>
                <p className="text-xs flex items-center gap-1 opacity-90 mt-1 font-semibold">
                  <Anchor className="h-3 w-3" /> Owner: {selectedExp.boatName}
                </p>
              </div>
            </div>

            {/* Scrolled Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Form specs */}
              <section className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Titre de l&apos;expérience</label>
                  <Input
                    type="text"
                    value={selectedExp.title || ""}
                    onChange={(e) => setSelectedExp({ ...selectedExp, title: e.target.value })}
                    className="w-full bg-surface-container-low border-outline-variant rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Nom du bateau</label>
                  <Input
                    type="text"
                    value={selectedExp.boatName || ""}
                    onChange={(e) => setSelectedExp({ ...selectedExp, boatName: e.target.value })}
                    className="w-full bg-surface-container-low border-outline-variant rounded-xl"
                  />
                </div>
              </section>

              {/* Status toggles */}
              <section className="bg-primary-container/10 border border-primary-container/30 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Statut du Navire</h4>
                
                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50">
                  <div>
                    <span className="font-label-md text-sm block font-bold">Réservations en ligne</span>
                    <span className="text-xs text-on-surface-variant">Actif pour les réservations</span>
                  </div>
                  <button
                    onClick={() => setSelectedExp({ ...selectedExp, is_published: !selectedExp.is_published })}
                    className="p-1 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant"
                  >
                    {selectedExp.is_published ? (
                      <ToggleRight className="h-8 w-8 text-success" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-on-surface-variant" />
                    )}
                  </button>
                </div>
              </section>

              {/* Specs Grid */}
              <section className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Capacité Max</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <input
                      type="number"
                      value={selectedExp.max_guests || 0}
                      onChange={(e) => setSelectedExp({ ...selectedExp, max_guests: Number(e.target.value) })}
                      className="w-full bg-transparent font-mono font-bold text-lg border-none focus:ring-0 p-0 text-on-surface"
                    />
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Type de bateau</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">⛵</span>
                    <select
                      value={selectedExp.type}
                      onChange={(e) => setSelectedExp({ ...selectedExp, type: e.target.value })}
                      className="w-full bg-transparent font-bold text-sm uppercase border-none focus:ring-0 p-0 text-on-surface cursor-pointer"
                    >
                      <option value="private">Privé</option>
                      <option value="shared">Partagé</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Pricing breakdown */}
              <section className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/60 space-y-4">
                <h4 className="font-bold text-on-surface text-sm uppercase tracking-wider">Stratégie de Prix</h4>
                <p className="text-xs text-on-surface-variant">Définissez vos tarifs pour les sorties privées ou partagées.</p>

                {selectedExp.type === "private" ? (
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-2">Tarif Sortie Privée (DZD)</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={selectedExp.price_total ? selectedExp.price_total / 100 : 0}
                        onChange={(e) => setSelectedExp({ ...selectedExp, price_total: Number(e.target.value) * 100 })}
                        className="w-full bg-surface-container-lowest border-outline-variant rounded-xl py-5 pl-4 pr-12 font-mono font-bold text-lg text-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-bold">DA</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-2">Tarif par Place (DZD)</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={selectedExp.price_per_seat ? selectedExp.price_per_seat / 100 : 0}
                        onChange={(e) => setSelectedExp({ ...selectedExp, price_per_seat: Number(e.target.value) * 100 })}
                        className="w-full bg-surface-container-lowest border-outline-variant rounded-xl py-5 pl-4 pr-12 font-mono font-bold text-lg text-secondary focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-bold">DA</span>
                    </div>
                  </div>
                )}
              </section>

              {/* Duration Options */}
              <section className="space-y-3">
                <span className="text-xs font-bold text-on-surface block uppercase tracking-wider">Options de Durée</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    shape="pill"
                    variant={selectedExp.duration_minutes === 120 ? "default" : "outline"}
                    className="h-9 text-xs font-bold"
                    onClick={() => setSelectedExp({ ...selectedExp, duration_minutes: 120 })}
                  >
                    2 Heures
                  </Button>
                  <Button
                    shape="pill"
                    variant={selectedExp.duration_minutes === 240 ? "default" : "outline"}
                    className="h-9 text-xs font-bold"
                    onClick={() => setSelectedExp({ ...selectedExp, duration_minutes: 240 })}
                  >
                    4 Heures
                  </Button>
                  <Button
                    shape="pill"
                    variant={selectedExp.duration_minutes === 480 ? "default" : "outline"}
                    className="h-9 text-xs font-bold"
                    onClick={() => setSelectedExp({ ...selectedExp, duration_minutes: 480 })}
                  >
                    Journée entière
                  </Button>
                </div>
              </section>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 bg-surface-container border-t border-outline-variant/30 grid grid-cols-2 gap-3 flex-shrink-0">
              <Button
                variant="outline"
                shape="pill"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setSelectedExp(null);
                }}
                className="w-full font-bold"
              >
                Annuler
              </Button>
              <Button
                shape="pill"
                onClick={handleSaveChanges}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" /> Sauvegarder
              </Button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
