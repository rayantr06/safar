"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Search, 
  MapPin, 
  Clock, 
  Edit2, 
  Play, 
  Pause, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Star, 
  Calendar, 
  ShieldAlert 
} from "lucide-react";
import { validatePartner, toggleExperienceStatus, saveExperience, createExperience } from "@/lib/actions/experiences";
import { getExperienceAvailability } from "@/lib/actions/bookings";
import { formatPriceDA } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ExperiencesListAdminProps {
  initialExperiences: any[];
  partners: any[];
  destinations: any[];
}

export function ExperiencesListAdmin({ initialExperiences, partners, destinations }: ExperiencesListAdminProps) {
  const [experiences, setExperiences] = useState(initialExperiences);
  const [selectedExp, setSelectedExp] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  
  // Tab within the editor modal
  const [modalTab, setModalTab] = useState<"general" | "pricing" | "gallery" | "partner">("general");
  
  // State for new image URL input
  const [newImageUrl, setNewImageUrl] = useState("");
  
  // State for new maintenance date input
  const [newMaintDate, setNewMaintDate] = useState("");

  const handleToggleStatus = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const exp = experiences.find((item) => item.id === id);
    if (!exp) return;
    const newStatus = exp.status === "approved" ? "rejected" : "approved";
    const newIsPublished = newStatus === "approved";

    // Optimistic update
    setExperiences((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, status: newStatus };
        }
        return item;
      })
    );

    try {
      await toggleExperienceStatus(id, newIsPublished);
    } catch (err) {
      console.error("Failed to toggle experience status:", err);
      // Revert status
      setExperiences((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return { ...item, status: exp.status };
          }
          return item;
        })
      );
    }
  };

  const handleEditExperience = async (exp: any) => {
    let availSettings = exp.availabilitySettings;
    
    // Attempt to fetch actual availability settings for the boat if they are missing
    if (!availSettings && exp.boat_id) {
      try {
        const res = await getExperienceAvailability(exp.id, "2026-08-15");
        if (res.success && res.availabilitySettings) {
          availSettings = res.availabilitySettings;
        }
      } catch (err) {
        console.error("Failed to fetch boat availability settings:", err);
      }
    }

    setSelectedExp({
      ...exp,
      category: exp.category || "Bateau privé",
      departure_location: exp.departure_location || "Port de Plaisance de Béjaïa",
      route_description: exp.route_description || "",
      images: exp.images || [exp.main_image_url || "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020"],
      availabilitySettings: availSettings || {
        workingHours: { start: "08:00", end: "20:00" },
        breakTime: { start: "13:00", end: "14:00" },
        unavailableDays: [],
        maintenanceDates: []
      }
    });
    setModalTab("general");
  };

  const handleAddExperience = () => {
    setSelectedExp({
      id: "", // Creation mode marker
      title: "",
      type: "private",
      category: "Bateau privé",
      departure_location: "Port de Plaisance de Béjaïa",
      route_description: "",
      price_total: 1500000, // 15,000 DA in cents
      price_per_seat: null,
      duration_minutes: 120,
      max_guests: 6,
      status: "pending_approval",
      destination_id: destinations[0]?.id || "d1",
      provider_id: partners[0]?.id || "mock-partner-id",
      boat_id: "1",
      description: "",
      main_image_url: "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
      images: ["https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020"],
      included_services: "Gilets de sauvetage, Eau minérale, Capitaine certifié",
      requirements: "Carte d'identité requise, Venir 15 min avant l'embarquement",
      availabilitySettings: {
        workingHours: { start: "08:00", end: "20:00" },
        breakTime: { start: "13:00", end: "14:00" },
        unavailableDays: [],
        maintenanceDates: []
      }
    });
    setModalTab("general");
  };

  const handleSaveExp = async () => {
    if (!selectedExp) return;
    const isNew = selectedExp.id === "";
    const isApproved = selectedExp.status === "approved";

    const payload = {
      title: selectedExp.title,
      type: selectedExp.type,
      category: selectedExp.category,
      price_total: selectedExp.type === "shared" ? null : selectedExp.price_total,
      price_per_seat: selectedExp.type === "shared" ? selectedExp.price_per_seat : null,
      duration_minutes: selectedExp.duration_minutes,
      max_guests: selectedExp.max_guests,
      is_published: isApproved,
      status: selectedExp.status,
      description: selectedExp.description,
      destination_id: selectedExp.destination_id,
      provider_id: selectedExp.provider_id,
      boat_id: selectedExp.boat_id,
      main_image_url: selectedExp.main_image_url,
      images: selectedExp.images,
      included_services: selectedExp.included_services,
      requirements: selectedExp.requirements,
      departure_location: selectedExp.departure_location,
      route_description: selectedExp.route_description,
      availabilitySettings: selectedExp.availabilitySettings
    };

    try {
      if (isNew) {
        const res = await createExperience(payload);
        if (res.success && res.data) {
          setExperiences((prev) => [...prev, {
            ...res.data,
            partner: partners.find(p => p.id === res.data.provider_id)?.name || "Partenaire",
            destination: destinations.find(d => d.id === res.data.destination_id)?.name || "Béjaïa",
            status: res.data.is_published ? "approved" : "rejected"
          }]);
        }
      } else {
        const res = await saveExperience(selectedExp.id, payload);
        if (res.success) {
          setExperiences((prev) => prev.map((e) => e.id === selectedExp.id ? {
            ...selectedExp,
            partner: partners.find(p => p.id === selectedExp.provider_id)?.name || selectedExp.partner,
            destination: destinations.find(d => d.id === selectedExp.destination_id)?.name || selectedExp.destination,
            status: isApproved ? "approved" : (selectedExp.status === "pending_approval" ? "pending_approval" : "rejected")
          } : e));
        }
      }
      setSelectedExp(null);
    } catch (err) {
      console.error("Failed to save experience:", err);
    }
  };

  // Image actions inside Gallery tab
  const addImageToGallery = () => {
    if (!newImageUrl) return;
    setSelectedExp((prev: any) => {
      const currentImages = prev.images || [];
      if (currentImages.includes(newImageUrl)) return prev;
      return {
        ...prev,
        images: [...currentImages, newImageUrl]
      };
    });
    setNewImageUrl("");
  };

  const removeImageFromGallery = (imgUrl: string) => {
    setSelectedExp((prev: any) => {
      const currentImages = prev.images || [];
      const updated = currentImages.filter((url: string) => url !== imgUrl);
      let newCover = prev.main_image_url;
      if (prev.main_image_url === imgUrl) {
        newCover = updated[0] || "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020";
      }
      return {
        ...prev,
        images: updated,
        main_image_url: newCover
      };
    });
  };

  const setAsCoverImage = (imgUrl: string) => {
    setSelectedExp((prev: any) => ({
      ...prev,
      main_image_url: imgUrl
    }));
  };

  const reorderImage = (index: number, direction: "up" | "down") => {
    setSelectedExp((prev: any) => {
      const images = [...(prev.images || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= images.length) return prev;
      
      const temp = images[index];
      images[index] = images[targetIndex];
      images[targetIndex] = temp;
      
      return {
        ...prev,
        images
      };
    });
  };

  // Availability action helpers
  const toggleUnavailableDay = (dayName: string) => {
    setSelectedExp((prev: any) => {
      const currentDays = prev.availabilitySettings?.unavailableDays || [];
      const updated = currentDays.includes(dayName)
        ? currentDays.filter((d: string) => d !== dayName)
        : [...currentDays, dayName];
      return {
        ...prev,
        availabilitySettings: {
          ...prev.availabilitySettings,
          unavailableDays: updated
        }
      };
    });
  };

  const addMaintDate = () => {
    if (!newMaintDate) return;
    setSelectedExp((prev: any) => {
      const currentDates = prev.availabilitySettings?.maintenanceDates || [];
      if (currentDates.includes(newMaintDate)) return prev;
      return {
        ...prev,
        availabilitySettings: {
          ...prev.availabilitySettings,
          maintenanceDates: [...currentDates, newMaintDate].sort()
        }
      };
    });
    setNewMaintDate("");
  };

  const removeMaintDate = (dateStr: string) => {
    setSelectedExp((prev: any) => ({
      ...prev,
      availabilitySettings: {
        ...prev.availabilitySettings,
        maintenanceDates: (prev.availabilitySettings?.maintenanceDates || []).filter((d: string) => d !== dateStr)
      }
    }));
  };

  // Active boats list filtered by selected partner
  const selectedPartnerBoats = selectedExp
    ? partners.find(p => p.id === selectedExp.provider_id)?.boatsList || []
    : [];

  const filteredExps = experiences.filter((exp) => {
    const matchesSearch =
      exp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.partner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.destination?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && exp.status === "approved") ||
      (statusFilter === "Paused" && exp.status === "rejected") ||
      (statusFilter === "Pending" && exp.status === "pending_approval");

    const matchesCategory =
      catFilter === "All" ||
      (catFilter === "Private" && exp.type === "private") ||
      (catFilter === "Shared" && exp.type === "shared") ||
      (catFilter === "Jetski" && exp.type === "jetski") ||
      (catFilter === "Kayak" && exp.type === "kayak") ||
      (catFilter === "Paddle" && exp.type === "paddle");

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalActive = experiences.filter((e) => e.status === "approved").length;
  const totalPending = experiences.filter((e) => e.status === "pending_approval").length;
  const pausedTrips = experiences.filter((e) => e.status === "rejected").length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-md font-display-md text-primary">Gestion des Expériences</h1>
          <p className="text-body-md text-on-surface-variant">Créez et modérez le catalogue d'activités nautiques de Safar DZ.</p>
        </div>
        <Button 
          shape="pill" 
          onClick={handleAddExperience}
          className="bg-primary hover:bg-primary/95 text-white font-bold text-xs flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Nouvelle Expérience
        </Button>
      </div>

      {/* Overview Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-container-low p-6 rounded-2xl border border-white flex flex-col gap-2 shadow-sm">
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Actives &amp; En ligne</p>
          <p className="font-mono font-bold text-2xl text-primary">{totalActive}</p>
          <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="bg-primary h-full" style={{ width: `${(totalActive / (experiences.length || 1)) * 100}%` }} />
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl border border-white flex flex-col gap-2 shadow-sm">
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">En attente de modération</p>
          <p className="font-mono font-bold text-2xl text-secondary">{totalPending}</p>
          <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="bg-secondary h-full" style={{ width: `${(totalPending / (experiences.length || 1)) * 100}%` }} />
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl border border-white flex flex-col gap-2 shadow-sm">
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Hors-ligne / Rejetées</p>
          <p className="font-mono font-bold text-2xl text-error">{pausedTrips}</p>
          <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="bg-error h-full" style={{ width: `${(pausedTrips / (experiences.length || 1)) * 100}%` }} />
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer par nom, lieu ou capitaine..."
            className="pl-10 h-10 border-none bg-surface-container-low rounded-xl text-xs"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="rounded-xl border-outline-variant bg-surface-bright px-3 py-2.5 text-xs font-bold focus:ring-primary focus:outline-none"
        >
          <option value="All">Toutes catégories</option>
          <option value="Private">Bateau privé</option>
          <option value="Shared">Place partagée</option>
          <option value="Jetski">Jet Ski</option>
          <option value="Kayak">Kayak</option>
          <option value="Paddle">Paddle</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border-outline-variant bg-surface-bright px-3 py-2.5 text-xs font-bold focus:ring-primary focus:outline-none"
        >
          <option value="All">Tous statuts</option>
          <option value="Active">Actif</option>
          <option value="Paused">Hors-ligne</option>
          <option value="Pending">En attente</option>
        </select>
      </section>

      {/* Experience Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredExps.map((exp) => {
          const isActive = exp.status === "approved";
          const isPending = exp.status === "pending_approval";
          
          let catLabel = exp.type;
          if (exp.type === "private") catLabel = "Bateau Privé";
          else if (exp.type === "shared") catLabel = "Place Partagée";
          else if (exp.type === "jetski") catLabel = "Jet Ski";
          else if (exp.type === "kayak") catLabel = "Kayak";
          else if (exp.type === "paddle") catLabel = "Paddle";

          return (
            <div
              key={exp.id}
              onClick={() => handleEditExperience(exp)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-outline-variant/30 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={exp.main_image_url || "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020"}
                    alt={exp.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    {isActive && <Badge variant="success">Actif</Badge>}
                    {isPending && <Badge variant="warning">Modération</Badge>}
                    {exp.status === "rejected" && <Badge variant="danger">Hors-ligne</Badge>}
                  </div>
                  <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEditExperience(exp)}
                      className="bg-white/90 p-2 rounded-full shadow-sm hover:bg-white transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-primary" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <p className="text-tertiary text-[10px] font-bold uppercase tracking-wider">
                    {catLabel}
                  </p>
                  <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors leading-tight line-clamp-1">
                    {exp.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {exp.destination}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" /> {exp.duration_minutes || 120} min
                    </span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-2 font-bold">Partenaire: {exp.partner}</p>
                </div>
              </div>

              <div className="p-6 pt-2 border-t border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest" onClick={(e) => e.stopPropagation()}>
                <span className="font-mono font-bold text-primary text-sm">
                  {exp.type === "shared"
                    ? `${exp.price_per_seat ? exp.price_per_seat / 100 : 0} DA/p`
                    : `${exp.price_total ? exp.price_total / 100 : 0} DA`}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-bold"
                    onClick={(e) => handleToggleStatus(exp.id, e)}
                  >
                    {isActive ? (
                      <>
                        <Pause className="h-3 w-3 mr-1 text-error" /> Suspendre
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1 text-success" /> Activer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Editor Modal */}
      {selectedExp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h2 className="font-bold text-lg text-primary">
                  {selectedExp.id === "" ? "Créer une Nouvelle Activité" : "Détails & Modération de l'Activité"}
                </h2>
                <span className="text-[10px] font-mono text-on-surface-variant font-bold">
                  {selectedExp.id === "" ? "Nouveau Brouillon" : `ID: ${selectedExp.id}`}
                </span>
              </div>
              <button
                className="p-1.5 hover:bg-surface-container-highest rounded-full transition-colors"
                onClick={() => setSelectedExp(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex bg-surface-container border-b border-outline-variant/30 px-6 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setModalTab("general")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                  modalTab === "general" ? "border-primary text-primary" : "border-transparent text-on-surface-variant"
                }`}
              >
                1. Informations Générales
              </button>
              <button
                onClick={() => setModalTab("pricing")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                  modalTab === "pricing" ? "border-primary text-primary" : "border-transparent text-on-surface-variant"
                }`}
              >
                2. Tarification &amp; Capacité
              </button>
              <button
                onClick={() => setModalTab("gallery")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                  modalTab === "gallery" ? "border-primary text-primary" : "border-transparent text-on-surface-variant"
                }`}
              >
                3. Galerie d&apos;Images
              </button>
              <button
                onClick={() => setModalTab("partner")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                  modalTab === "partner" ? "border-primary text-primary" : "border-transparent text-on-surface-variant"
                }`}
              >
                4. Partenaire &amp; Disponibilité
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left tab form contents (8 cols) */}
                <div className="md:col-span-8 space-y-6">
                  {modalTab === "general" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase">Titre de l&apos;Expérience</label>
                        <Input
                          value={selectedExp.title}
                          onChange={(e) => setSelectedExp({ ...selectedExp, title: e.target.value })}
                          className="w-full bg-white border-outline-variant rounded-xl text-xs py-2"
                          placeholder="Ex: Randonnée en Paddle sauvage"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Catégorie d&apos;Activité</label>
                          <select
                            value={selectedExp.type}
                            onChange={(e) => setSelectedExp({ ...selectedExp, type: e.target.value })}
                            className="w-full bg-white border border-outline-variant rounded-xl text-xs p-2.5 font-bold"
                          >
                            <option value="private">Bateau Privé</option>
                            <option value="shared">Place Partagée</option>
                            <option value="jetski">Jet Ski</option>
                            <option value="kayak">Kayak</option>
                            <option value="paddle">Paddle</option>
                            <option value="other">Autre Activité</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Destination / Lieu</label>
                          <select
                            value={selectedExp.destination_id || ""}
                            onChange={(e) => setSelectedExp({ ...selectedExp, destination_id: e.target.value })}
                            className="w-full bg-white border border-outline-variant rounded-xl text-xs p-2.5 font-bold"
                          >
                            {destinations.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Label / Thème (ex: Sunset Cruise)</label>
                          <Input
                            value={selectedExp.category || ""}
                            onChange={(e) => setSelectedExp({ ...selectedExp, category: e.target.value })}
                            className="w-full bg-white border-outline-variant rounded-xl text-xs py-2"
                            placeholder="Ex: Sunset Cruise, Randonnée Jet Ski"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Lieu de départ (Embarquement)</label>
                          <Input
                            value={selectedExp.departure_location || ""}
                            onChange={(e) => setSelectedExp({ ...selectedExp, departure_location: e.target.value })}
                            className="w-full bg-white border-outline-variant rounded-xl text-xs py-2"
                            placeholder="Ex: Port de Plaisance de Béjaïa"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase">Itinéraire / Description de la route</label>
                        <Input
                          value={selectedExp.route_description || ""}
                          onChange={(e) => setSelectedExp({ ...selectedExp, route_description: e.target.value })}
                          className="w-full bg-white border-outline-variant rounded-xl text-xs py-2"
                          placeholder="Ex: Port -> Aiguades -> Cap Carbon -> Retour"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase">Description</label>
                        <textarea
                          value={selectedExp.description || ""}
                          onChange={(e) => setSelectedExp({ ...selectedExp, description: e.target.value })}
                          className="w-full bg-white border border-outline-variant/40 rounded-xl p-3 text-xs focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                          placeholder="Décrivez l'activité, l'itinéraire, les activités prévues..."
                          rows={6}
                        />
                      </div>
                    </div>
                  )}

                  {modalTab === "pricing" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase">
                            {selectedExp.type === "shared" ? "Tarif par Place (DA)" : "Tarif Global Base (DA)"}
                          </label>
                          <Input
                            type="number"
                            value={selectedExp.type === "shared" 
                              ? (selectedExp.price_per_seat ? selectedExp.price_per_seat / 100 : 0)
                              : (selectedExp.price_total ? selectedExp.price_total / 100 : 0)
                            }
                            onChange={(e) => {
                              const val = Number(e.target.value) * 100;
                              if (selectedExp.type === "shared") {
                                setSelectedExp({ ...selectedExp, price_per_seat: val });
                              } else {
                                setSelectedExp({ ...selectedExp, price_total: val });
                              }
                            }}
                            className="w-full bg-white border-outline-variant rounded-xl text-xs py-2 font-mono font-bold text-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Durée standard (Minutes)</label>
                          <Input
                            type="number"
                            value={selectedExp.duration_minutes || 120}
                            onChange={(e) => setSelectedExp({ ...selectedExp, duration_minutes: Number(e.target.value) })}
                            className="w-full bg-white border-outline-variant rounded-xl text-xs py-2 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Capacité Maximale (Passagers)</label>
                          <Input
                            type="number"
                            value={selectedExp.max_guests || 6}
                            onChange={(e) => setSelectedExp({ ...selectedExp, max_guests: Number(e.target.value) })}
                            className="w-full bg-white border-outline-variant rounded-xl text-xs py-2 font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Badge Promo / Info</label>
                          <Input
                            value={selectedExp.badge || ""}
                            onChange={(e) => setSelectedExp({ ...selectedExp, badge: e.target.value || null })}
                            placeholder="Ex: Populaire, Bestseller"
                            className="w-full bg-white border-outline-variant rounded-xl text-xs py-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase">Services Inclus (Séparés par des virgules)</label>
                        <Input
                          value={selectedExp.included_services || ""}
                          onChange={(e) => setSelectedExp({ ...selectedExp, included_services: e.target.value })}
                          placeholder="Gilets de sauvetage, Eau minérale, Guide local"
                          className="w-full bg-white border-outline-variant rounded-xl text-xs py-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase">Conditions &amp; Exigences (Séparées par des virgules)</label>
                        <Input
                          value={selectedExp.requirements || ""}
                          onChange={(e) => setSelectedExp({ ...selectedExp, requirements: e.target.value })}
                          placeholder="Savoir nager, Crème solaire, Carte d'identité"
                          className="w-full bg-white border-outline-variant rounded-xl text-xs py-2"
                        />
                      </div>
                    </div>
                  )}

                  {modalTab === "gallery" && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Add Image URL */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase">Ajouter une Image (URL)</label>
                        <div className="flex gap-2">
                          <Input
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Entrez l'URL d'une photo côtière..."
                            className="flex-1 bg-white border-outline-variant rounded-xl text-xs py-2"
                          />
                          <Button 
                            onClick={addImageToGallery}
                            className="bg-secondary text-white font-bold text-xs"
                          >
                            Ajouter
                          </Button>
                        </div>
                        
                        {/* Quick Presets for Demo */}
                        <div className="pt-2">
                          <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Preset d&apos;Images Safar:</span>
                          <div className="flex gap-2 flex-wrap">
                            {[
                              { label: "Bateau", url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80" },
                              { label: "Jet Ski", url: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=800&q=80" },
                              { label: "Kayak", url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80" },
                              { label: "Paddle", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80" },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                onClick={() => setNewImageUrl(preset.url)}
                                className="text-[9px] bg-surface-container hover:bg-surface-container-high px-2 py-1 rounded font-bold border text-on-surface-variant transition-colors"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Image List Gallery Grid */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase">Galerie Photo ({selectedExp.images?.length || 0} images)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {(selectedExp.images || []).map((imgUrl: string, idx: number) => {
                            const isCover = selectedExp.main_image_url === imgUrl;
                            return (
                              <div key={idx} className="relative group border border-outline-variant/30 rounded-2xl overflow-hidden shadow-xs bg-surface-container">
                                <div className="relative aspect-video">
                                  <img src={imgUrl} alt="Visual" className="w-full h-full object-cover" />
                                  
                                  {isCover && (
                                    <div className="absolute top-2 left-2 bg-success text-white p-1 rounded-full shadow">
                                      <Star className="h-3 w-3 fill-current" />
                                    </div>
                                  )}
                                  
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-all">
                                    <button 
                                      onClick={() => setAsCoverImage(imgUrl)}
                                      className="p-1.5 bg-white text-primary rounded-full hover:scale-105 active:scale-95 transition-all"
                                      title="Définir couverture"
                                    >
                                      <Star className={`h-3 w-3 ${isCover ? "fill-primary" : ""}`} />
                                    </button>
                                    <button 
                                      onClick={() => removeImageFromGallery(imgUrl)}
                                      className="p-1.5 bg-white text-error rounded-full hover:scale-105 active:scale-95 transition-all"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                                <div className="p-2 flex justify-between items-center text-[9px] font-bold text-on-surface-variant bg-white">
                                  <span>Photo {idx + 1}</span>
                                  <div className="flex gap-1">
                                    <button 
                                      disabled={idx === 0} 
                                      onClick={() => reorderImage(idx, "up")}
                                      className="hover:text-primary disabled:opacity-30"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </button>
                                    <button 
                                      disabled={idx === (selectedExp.images?.length || 1) - 1} 
                                      onClick={() => reorderImage(idx, "down")}
                                      className="hover:text-primary disabled:opacity-30"
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {modalTab === "partner" && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Assignment */}
                      <div className="space-y-4 p-5 bg-surface-container rounded-2xl border border-outline-variant/20">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-widest border-b pb-1">Assignation du Partenaire</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase">Fournisseur / Capitaine</label>
                            <select
                              value={selectedExp.provider_id || ""}
                              onChange={(e) => {
                                const provId = e.target.value;
                                const firstBoat = partners.find(p => p.id === provId)?.boatsList?.[0]?.id || "1";
                                setSelectedExp({ ...selectedExp, provider_id: provId, boat_id: firstBoat });
                              }}
                              className="w-full bg-white border border-outline-variant rounded-xl text-xs p-2.5 font-bold"
                            >
                              {partners.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase">Navire / Équipement</label>
                            <select
                              value={selectedExp.boat_id || ""}
                              onChange={(e) => setSelectedExp({ ...selectedExp, boat_id: e.target.value })}
                              className="w-full bg-white border border-outline-variant rounded-xl text-xs p-2.5 font-bold"
                            >
                              {selectedPartnerBoats.map((b: any) => (
                                <option key={b.id} value={b.id}>⛵ {b.name} ({b.type})</option>
                              ))}
                              {selectedPartnerBoats.length === 0 && (
                                <option value="1">Salim Boat (Yacht)</option>
                              )}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Equipment availability settings */}
                      {selectedExp.availabilitySettings && (
                        <div className="space-y-4 p-5 bg-white rounded-2xl border border-outline-variant/30">
                          <h4 className="text-xs font-bold text-primary uppercase tracking-widest border-b pb-1 flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Disponibilité de l&apos;équipement
                          </h4>
                          
                          {/* Working & Break hours */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <span className="block text-[9px] font-bold text-on-surface-variant uppercase">Heures de service</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={selectedExp.availabilitySettings.workingHours?.start || "08:00"}
                                  onChange={(e) => setSelectedExp({
                                    ...selectedExp,
                                    availabilitySettings: {
                                      ...selectedExp.availabilitySettings,
                                      workingHours: { ...selectedExp.availabilitySettings.workingHours, start: e.target.value }
                                    }
                                  })}
                                  className="bg-surface-container rounded-lg p-2 text-xs font-mono font-bold"
                                />
                                <span className="text-xs">à</span>
                                <input
                                  type="time"
                                  value={selectedExp.availabilitySettings.workingHours?.end || "20:00"}
                                  onChange={(e) => setSelectedExp({
                                    ...selectedExp,
                                    availabilitySettings: {
                                      ...selectedExp.availabilitySettings,
                                      workingHours: { ...selectedExp.availabilitySettings.workingHours, end: e.target.value }
                                    }
                                  })}
                                  className="bg-surface-container rounded-lg p-2 text-xs font-mono font-bold"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <span className="block text-[9px] font-bold text-on-surface-variant uppercase">Pause Déjeuner</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={selectedExp.availabilitySettings.breakTime?.start || "13:00"}
                                  onChange={(e) => setSelectedExp({
                                    ...selectedExp,
                                    availabilitySettings: {
                                      ...selectedExp.availabilitySettings,
                                      breakTime: { ...selectedExp.availabilitySettings.breakTime, start: e.target.value }
                                    }
                                  })}
                                  className="bg-surface-container rounded-lg p-2 text-xs font-mono font-bold"
                                />
                                <span className="text-xs">à</span>
                                <input
                                  type="time"
                                  value={selectedExp.availabilitySettings.breakTime?.end || "14:00"}
                                  onChange={(e) => setSelectedExp({
                                    ...selectedExp,
                                    availabilitySettings: {
                                      ...selectedExp.availabilitySettings,
                                      breakTime: { ...selectedExp.availabilitySettings.breakTime, end: e.target.value }
                                    }
                                  })}
                                  className="bg-surface-container rounded-lg p-2 text-xs font-mono font-bold"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Off days */}
                          <div className="space-y-2">
                            <span className="block text-[9px] font-bold text-on-surface-variant uppercase">Jours de repos (Off-days)</span>
                            <div className="flex gap-2 flex-wrap">
                              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                                const isSelected = selectedExp.availabilitySettings.unavailableDays?.includes(day);
                                const frDays: Record<string, string> = {
                                  Monday: "Lundi", Tuesday: "Mardi", Wednesday: "Mercredi", Thursday: "Jeudi",
                                  Friday: "Vendredi", Saturday: "Samedi", Sunday: "Dimanche"
                                };
                                return (
                                  <button
                                    key={day}
                                    onClick={() => toggleUnavailableDay(day)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                      isSelected
                                        ? "bg-error text-white border-error"
                                        : "bg-surface-container hover:bg-surface-container-high border-outline-variant/20 text-on-surface-variant"
                                    }`}
                                  >
                                    {frDays[day]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Maintenance dates */}
                          <div className="space-y-2 pt-2 border-t">
                            <span className="block text-[9px] font-bold text-on-surface-variant uppercase">Maintenance planifiée (Hors-service)</span>
                            <div className="flex gap-2">
                              <input
                                type="date"
                                value={newMaintDate}
                                onChange={(e) => setNewMaintDate(e.target.value)}
                                className="bg-surface-container rounded-lg p-2 text-xs font-mono font-bold outline-none"
                              />
                              <Button 
                                size="sm" 
                                onClick={addMaintDate}
                                className="bg-primary text-white font-bold text-xs"
                              >
                                Bloquer Date
                              </Button>
                            </div>
                            
                            <div className="flex gap-2 flex-wrap mt-2">
                              {(selectedExp.availabilitySettings.maintenanceDates || []).map((mDate: string) => (
                                <span 
                                  key={mDate} 
                                  className="inline-flex items-center gap-1 bg-error/10 text-error font-mono text-[10px] font-bold px-2 py-1 rounded-lg border border-error/25"
                                >
                                  {mDate}
                                  <button onClick={() => removeMaintDate(mDate)} className="hover:text-error/80">
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                              {(selectedExp.availabilitySettings.maintenanceDates || []).length === 0 && (
                                <p className="text-[10px] text-on-surface-variant/65">Aucune date de maintenance planifiée.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right panel moderation / actions (4 cols) */}
                <div className="md:col-span-4 space-y-6">
                  <h3 className="font-bold text-xs uppercase text-primary tracking-widest border-b border-outline-variant/30 pb-1">
                    Modération &amp; Publication
                  </h3>
                  <div className="bg-surface-container p-5 rounded-2xl space-y-6">
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Statut de Visibilité</p>
                      {selectedExp.status === "approved" && <Badge variant="success">Approuvé &amp; En Ligne</Badge>}
                      {selectedExp.status === "pending_approval" && <Badge variant="warning">En attente de validation</Badge>}
                      {selectedExp.status === "rejected" && <Badge variant="danger">Hors-ligne / Suspendu</Badge>}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-outline-variant/30">
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Modifier le statut</p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedExp({ ...selectedExp, status: "approved" })}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                            selectedExp.status === "approved"
                              ? "bg-green-600 border-green-600 text-white shadow-sm"
                              : "bg-white border-outline-variant/40 hover:bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          Approuvé (Visible)
                        </button>
                        <button
                          onClick={() => setSelectedExp({ ...selectedExp, status: "pending_approval" })}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                            selectedExp.status === "pending_approval"
                              ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                              : "bg-white border-outline-variant/40 hover:bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          En Attente (Modération)
                        </button>
                        <button
                          onClick={() => setSelectedExp({ ...selectedExp, status: "rejected" })}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                            selectedExp.status === "rejected"
                              ? "bg-red-600 border-red-600 text-white shadow-sm"
                              : "bg-white border-outline-variant/40 hover:bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          Hors-ligne (Suspendu)
                        </button>
                      </div>
                    </div>

                    {selectedExp.id !== "" && (
                      <div className="pt-4 border-t border-outline-variant/20 space-y-1.5">
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Aperçu rapide</p>
                        <a
                          href={`/experiences/${selectedExp.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-bold text-xs underline block hover:text-primary/80"
                        >
                          Voir la page publique ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-surface-container border-t border-outline-variant/30 flex justify-end gap-3">
              <Button
                variant="outline"
                shape="pill"
                onClick={() => setSelectedExp(null)}
                className="font-bold text-xs"
              >
                Annuler
              </Button>
              <Button
                shape="pill"
                onClick={handleSaveExp}
                className="bg-primary text-white hover:bg-primary/95 font-bold text-xs flex items-center gap-1"
              >
                <Save className="h-4 w-4" /> Enregistrer les modifications
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
