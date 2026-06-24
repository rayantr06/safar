"use client";

import * as React from "react";
import { useState } from "react";
import {
  Search,
  MapPin,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  SlidersHorizontal,
  ArrowUpDown,
  Anchor,
  Compass,
  CheckCircle,
  Star,
  X,
  ChevronRight,
  Map,
  Save,
} from "lucide-react";
import { toggleDestinationStatus, saveDestination, createDestination } from "@/lib/actions/experiences";

type Destination = {
  id: string;
  name: string;
  slug: string;
  description: string;
  photo_url: string;
  experience_count: number;
  is_active: boolean;
  is_featured: boolean;
  location: string;
  bookings_count: number;
  revenue_dzd: string;
  rating: number;
  hero_image_url?: string;
  gallery?: string[];
  lat?: number;
  lng?: number;
};

export function DestinationsListAdmin({ initialDestinations }: { initialDestinations: Destination[] }) {
  // States
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expSort, setExpSort] = useState("Default");
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Destination>>({});
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // Stats
  const totalDestinations = destinations.length;
  const activeDestinations = destinations.filter((d) => d.is_active).length;
  const totalExperiences = destinations.reduce((acc, d) => acc + d.experience_count, 0);
  const featuredDestinations = destinations.filter((d) => d.is_featured).length;

  // Toggle active status
  const handleToggleActive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening drawer
    const dest = destinations.find((d) => d.id === id);
    if (!dest) return;
    const newStatus = !dest.is_active;

    setDestinations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_active: newStatus } : d))
    );
    if (selectedDest && selectedDest.id === id) {
      setSelectedDest((prev) => (prev ? { ...prev, is_active: newStatus } : null));
    }

    try {
      await toggleDestinationStatus(id, newStatus);
    } catch (err) {
      console.error("Failed to toggle destination status:", err);
    }
  };

  const handleEditClick = (dest: Destination) => {
    setSelectedDest(dest);
    setEditForm({ ...dest });
    setIsEditing(true);
  };

  const handleAddClick = () => {
    const newDest: Partial<Destination> = {
      id: `new-${Date.now()}`,
      name: "Nouvelle Destination",
      slug: "nouvelle-destination",
      description: "Description de la destination...",
      photo_url: "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
      location: "Béjaïa, Algérie",
      experience_count: 0,
      bookings_count: 0,
      revenue_dzd: "0",
      rating: 4.8,
      is_active: false,
      is_featured: false,
    };
    setSelectedDest(newDest as Destination);
    setEditForm(newDest);
    setIsEditing(true);
  };

  const addGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    const currentGallery = editForm.gallery || [];
    if (currentGallery.includes(newGalleryUrl.trim())) return;
    setEditForm({
      ...editForm,
      gallery: [...currentGallery, newGalleryUrl.trim()]
    });
    setNewGalleryUrl("");
  };

  const removeGalleryImage = (idx: number) => {
    const currentGallery = editForm.gallery || [];
    setEditForm({
      ...editForm,
      gallery: currentGallery.filter((_, i) => i !== idx)
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedDest || !editForm.id) return;
    const isNew = editForm.id.startsWith("new-");

    const savedDest = {
      ...selectedDest,
      ...editForm,
    } as Destination;

    setDestinations((prev) => {
      if (isNew) {
        return [...prev, savedDest];
      } else {
        return prev.map((d) => (d.id === editForm.id ? savedDest : d));
      }
    });

    try {
      if (isNew) {
        await createDestination(savedDest);
      } else {
        await saveDestination(editForm.id, editForm);
      }
    } catch (err) {
      console.error("Failed to save destination:", err);
    }

    setIsEditing(false);
    setSelectedDest(null);
  };

  // Filter & Sort
  const filteredDestinations = destinations
    .filter((d) => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Published"
          ? d.is_active
          : !d.is_active;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (expSort === "HighToLow") return b.experience_count - a.experience_count;
      if (expSort === "LowToHigh") return a.experience_count - b.experience_count;
      return 0; // Default order
    });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary">Destinations</h1>
          <p className="text-on-surface-variant font-body-lg text-body-lg mt-1">
            Gérez les zones géographiques et les destinations de navigation sur Safar DZ.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleAddClick}
            className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <MapPin className="h-5 w-5" /> + Ajouter une destination
          </button>
        </div>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center mb-4">
            <Compass className="h-5 w-5" />
          </div>
          <p className="text-on-surface-variant text-label-sm uppercase tracking-wider">
            Total Destinations
          </p>
          <h3 className="text-[32px] font-bold text-on-surface mt-1">
            {totalDestinations}
          </h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-tertiary-container text-on-tertiary-container rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="h-5 w-5" />
          </div>
          <p className="text-on-surface-variant text-label-sm uppercase tracking-wider">
            Destinations Actives
          </p>
          <h3 className="text-[32px] font-bold text-on-surface mt-1">
            {activeDestinations}{" "}
            <span className="text-label-md text-outline font-normal">publiées</span>
          </h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center mb-4">
            <Anchor className="h-5 w-5" />
          </div>
          <p className="text-on-surface-variant text-label-sm uppercase tracking-wider">
            Expériences Liées
          </p>
          <h3 className="text-[32px] font-bold text-on-surface mt-1">
            {totalExperiences}
          </h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-on-tertiary-container/10 text-tertiary-container rounded-lg flex items-center justify-center mb-4">
            <Star className="h-5 w-5" />
          </div>
          <p className="text-on-surface-variant text-label-sm uppercase tracking-wider">
            Mises en avant
          </p>
          <h3 className="text-[32px] font-bold text-on-surface mt-1">
            {featuredDestinations}{" "}
            <span className="text-label-md text-outline font-normal">vedettes</span>
          </h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/20">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary cursor-pointer font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Tous les statuts</option>
            <option value="Published">Publiées (Actives)</option>
            <option value="Draft">Brouillons (Inactives)</option>
          </select>
          <select
            className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary cursor-pointer font-medium"
            value={expSort}
            onChange={(e) => setExpSort(e.target.value)}
          >
            <option value="Default">Trier par Expériences</option>
            <option value="HighToLow">Du plus au moins</option>
            <option value="LowToHigh">Du moins au plus</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl border border-outline-variant/35 bg-surface hover:bg-surface-container-high transition-colors">
            <SlidersHorizontal className="h-5 w-5 text-on-surface-variant" />
          </button>
          <button className="p-2.5 rounded-xl border border-outline-variant/35 bg-surface hover:bg-surface-container-high transition-colors">
            <ArrowUpDown className="h-5 w-5 text-on-surface-variant" />
          </button>
        </div>
      </div>

      {/* Destinations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDestinations.map((dest) => (
          <div
            key={dest.id}
            onClick={() => handleEditClick(dest)}
            className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/20 flex flex-col"
          >
            {/* Image banner */}
            <div className="h-56 relative overflow-hidden">
              <img
                src={dest.photo_url}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {dest.is_featured && (
                <div className="absolute top-4 left-4 bg-primary/95 backdrop-blur-md text-on-primary text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-widest border border-primary/20">
                  <Star className="h-3.5 w-3.5 fill-current" /> En Vedette
                </div>
              )}
              <div
                className={`absolute top-4 right-4 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                  dest.is_active
                    ? "bg-tertiary-container text-on-tertiary-container"
                    : "bg-outline-variant/80 backdrop-blur-md text-on-surface-variant"
                }`}
              >
                {dest.is_active ? "Publié" : "Brouillon"}
              </div>
            </div>

            {/* Description detail */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                  {dest.name}
                </h4>
                <div className="flex items-center text-primary font-bold">
                  <Anchor className="mr-1 h-4 w-4" />
                  <span className="text-xs">{dest.experience_count} exp.</span>
                </div>
              </div>
              <p className="text-on-surface-variant font-body-md text-sm line-clamp-2 mb-6">
                {dest.description}
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-outline-variant/20 pt-4">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(dest);
                    }}
                    className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-colors"
                  >
                    <Edit2 className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDest(dest);
                      setIsEditing(false);
                    }}
                    className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container transition-colors"
                  >
                    <Eye className="h-4.5 w-4.5" />
                  </button>
                </div>
                <button
                  onClick={(e) => handleToggleActive(dest.id, e)}
                  className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                    dest.is_active
                      ? "text-error hover:text-error/80"
                      : "text-green-700 hover:text-green-800"
                  }`}
                >
                  {dest.is_active ? (
                    <>
                      <EyeOff className="h-4.5 w-4.5" /> Masquer
                    </>
                  ) : (
                    <>
                      <Eye className="h-4.5 w-4.5" /> Afficher
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Side Detail Panel (Overlay Drawer) */}
      {selectedDest && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Backdrop blur click action */}
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setSelectedDest(null);
              setIsEditing(false);
            }}
          ></div>

          {/* Drawer Body content */}
          <div className="relative h-full w-full max-w-2xl bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-400 ease-out border-l border-outline-variant/35">
            {/* Header Banner image */}
            <div className="relative h-72 w-full">
              <img
                className="w-full h-full object-cover"
                src={editForm.photo_url || selectedDest.photo_url}
                alt={editForm.name || selectedDest.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <button
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
                onClick={() => {
                  setSelectedDest(null);
                  setIsEditing(false);
                }}
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-6 left-10 text-white right-6">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="bg-white/10 border border-white/20 text-white font-headline-md text-headline-md px-3 py-1.5 rounded-xl w-full focus:ring-2 focus:ring-primary focus:bg-white/20"
                    placeholder="Nom de la destination"
                  />
                ) : (
                  <>
                    <h2 className="font-headline-md text-headline-md">
                      {selectedDest.name}
                    </h2>
                    <p className="flex items-center gap-2 opacity-90 text-sm mt-1">
                      <MapPin className="h-4 w-4" />
                      {selectedDest.location}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Scrollable specs */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">
                      Localisation
                    </label>
                    <input
                      type="text"
                      value={editForm.location || ""}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                      placeholder="Ex: Béjaïa, Algérie"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">
                      URL de la Photo Principale
                    </label>
                    <input
                      type="text"
                      value={editForm.photo_url || ""}
                      onChange={(e) => setEditForm({ ...editForm, photo_url: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">
                      URL de la Photo Hero (Grande Bannière)
                    </label>
                    <input
                      type="text"
                      value={editForm.hero_image_url || ""}
                      onChange={(e) => setEditForm({ ...editForm, hero_image_url: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={editForm.lat || ""}
                        onChange={(e) => setEditForm({ ...editForm, lat: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                        placeholder="Ex: 36.7510"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={editForm.lng || ""}
                        onChange={(e) => setEditForm({ ...editForm, lng: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                        placeholder="Ex: 5.0642"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">
                      Galerie d&apos;Images ({editForm.gallery?.length || 0})
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={addGalleryImage}
                        className="px-4 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/95 transition-all"
                      >
                        Ajouter
                      </button>
                    </div>
                    {editForm.gallery && editForm.gallery.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 bg-surface-container/30 p-2.5 rounded-2xl border border-outline-variant/10">
                        {editForm.gallery.map((url, i) => (
                          <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden group bg-surface-container shadow-xs">
                            <img src={url} alt="" className="object-cover w-full h-full" />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(i)}
                              className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3.5 w-3.5 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md min-h-[120px]"
                      placeholder="Décrivez les atouts de cette destination..."
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-primary-container/10 border border-primary-container/20 rounded-2xl">
                    <div>
                      <span className="font-bold text-sm block">Mettre en Vedette</span>
                      <span className="text-xs text-on-surface-variant">Afficher en haut de la page d&apos;accueil</span>
                    </div>
                    <button
                      onClick={() => setEditForm({ ...editForm, is_featured: !editForm.is_featured })}
                      className="p-1 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant"
                    >
                      {editForm.is_featured ? (
                        <span className="text-2xl">⭐</span>
                      ) : (
                        <span className="text-2xl opacity-30">⭐</span>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* About description */}
                  <div>
                    <h5 className="text-label-sm font-bold uppercase tracking-widest text-outline mb-3">
                      À propos de la destination
                    </h5>
                    <p className="text-on-surface-variant font-body-md leading-relaxed">
                      {selectedDest.description}
                    </p>
                  </div>

                  {/* Stats / Performance */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-surface-container-low p-4 rounded-2xl text-center border border-outline-variant/10">
                      <p className="text-[10px] uppercase font-bold text-outline">
                        Réservations
                      </p>
                      <p className="text-xl font-bold text-primary mt-1">
                        {selectedDest.bookings_count}
                      </p>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-2xl text-center border border-outline-variant/10">
                      <p className="text-[10px] uppercase font-bold text-outline">
                        Volume
                      </p>
                      <p className="text-xl font-bold text-primary mt-1">
                        {selectedDest.revenue_dzd} DA
                      </p>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-2xl text-center border border-outline-variant/10">
                      <p className="text-[10px] uppercase font-bold text-outline">Note</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="text-xl font-bold text-primary">
                          {selectedDest.rating}
                        </span>
                        <Star className="h-4.5 w-4.5 fill-tertiary-container text-tertiary-container" />
                      </div>
                    </div>
                  </div>

                  {/* Connected Experiences */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-label-sm font-bold uppercase tracking-widest text-outline">
                        Expériences associées
                      </h5>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/20 hover:border-primary transition-colors cursor-pointer group bg-surface">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 overflow-hidden shrink-0 border border-outline-variant/10">
                          <img
                            className="w-full h-full object-cover"
                            src={selectedDest.photo_url}
                            alt="Exp"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">
                            Balade Privée - Découverte Cap Carbon
                          </p>
                          <p className="text-xs text-outline">
                            4 heures • À partir de 12 000 DA
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-outline group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Form actions at drawer bottom */}
            <div className="p-10 border-t border-outline-variant/30 flex gap-4 bg-surface-container-lowest">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSaveEdit}
                    className="flex-1 py-4 bg-primary text-on-primary font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="h-5 w-5" /> Enregistrer les modifications
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-4 bg-surface-container-high text-on-surface-variant font-bold rounded-2xl hover:bg-surface-container-highest transition-colors active:scale-[0.98] transition-all"
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleEditClick(selectedDest)}
                    className="flex-1 py-4 bg-primary text-on-primary font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    Modifier la Destination
                  </button>
                  <button
                    onClick={(e) => {
                      handleToggleActive(selectedDest.id, e);
                    }}
                    className="px-6 py-4 bg-surface-container-high text-on-surface-variant font-bold rounded-2xl hover:bg-surface-container-highest transition-colors active:scale-[0.98] transition-all"
                  >
                    {selectedDest.is_active ? "Archiver" : "Restaurer"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
