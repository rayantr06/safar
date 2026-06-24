"use client";

import * as React from "react";
import { useState } from "react";
import {
  Globe,
  FileText,
  Image as ImageIcon,
  Settings,
  Phone,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  Folder,
  ChevronRight,
  Link as LinkIcon,
  Palette,
  Layout,
  DollarSign,
  Check,
  Eye,
  EyeOff,
  Star,
  MessageSquare,
  AlertTriangle,
  Upload,
  RefreshCw
} from "lucide-react";
import { saveCmsSection, addMediaAsset, deleteMediaAsset, saveAccommodation, deleteAccommodation } from "@/lib/actions/website-cms";
import { saveExperience } from "@/lib/actions/experiences";
import { IMAGES } from "@/lib/constants";

interface WebsiteCmsAdminProps {
  initialCms: any;
  experiences: any[];
  destinations: any[];
  accommodations: any[];
}

export function WebsiteCmsAdmin({ initialCms, experiences, destinations, accommodations }: WebsiteCmsAdminProps) {
  const [cms, setCms] = useState(initialCms);
  const [activeTab, setActiveTab] = useState("homepage");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Media library state
  const [mediaList, setMediaList] = useState<any[]>(initialCms?.media_library || []);
  const [mediaFolderFilter, setMediaFolderFilter] = useState("All");
  const [newMediaForm, setNewMediaForm] = useState({ name: "", url: "", folder: "General", type: "image/jpeg" });
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);

  // Testimonials state
  const [testimonials, setTestimonials] = useState<any[]>(initialCms?.testimonials || []);
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);

  // Partners state
  const [partners, setPartners] = useState<any[]>(initialCms?.partners_logos || []);
  const [newPartner, setNewPartner] = useState({ name: "", logo_url: "" });

  // Banners state
  const [banners, setBanners] = useState<any[]>(initialCms?.banners || []);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [showBannerModal, setShowBannerModal] = useState(false);

  // Accommodations state
  const [accommodationsList, setAccommodationsList] = useState<any[]>(accommodations || []);
  const [editingAccommodation, setEditingAccommodation] = useState<any | null>(null);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);
  const [accSearchQuery, setAccSearchQuery] = useState("");
  const [accTypeFilter, setAccTypeFilter] = useState("all");
  const [accWilayaFilter, setAccWilayaFilter] = useState("all");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newCustomAmenity, setNewCustomAmenity] = useState("");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [modalTab, setModalTab] = useState("general");

  // Categories state
  const [categoriesList, setCategoriesList] = useState<any[]>(initialCms?.categories || []);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("⛵");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");

  // Hero gallery state (carousel cards)
  const [heroGallery, setHeroGallery] = useState<any[]>(initialCms?.hero_gallery || [
    { id: "hg-1", name: "Bateau privé", icon: "🚤", image: "" },
    { id: "hg-2", name: "Bateau par place", icon: "⛵", image: "" },
    { id: "hg-3", name: "Jet Ski", icon: "⚡", image: "" },
    { id: "hg-4", name: "Kayak", icon: "🛶", image: "" },
    { id: "hg-5", name: "Paddle", icon: "🏄", image: "" },
    { id: "hg-6", name: "Quads", icon: "🏎️", image: "" },
  ]);

  // Hero background image states
  const [heroMediaUrl, setHeroMediaUrl] = useState(initialCms?.hero?.media_url || "");
  const [heroMediaType, setHeroMediaType] = useState(initialCms?.hero?.media_type || "image");
  const [showHeroMediaPicker, setShowHeroMediaPicker] = useState(false);

  React.useEffect(() => {
    if (cms.hero) {
      setHeroMediaUrl(cms.hero.media_url || "");
      setHeroMediaType(cms.hero.media_type || "image");
    }
  }, [cms.hero]);

  // Toast notifier
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setSaveStatus(message);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Accommodations Handlers
  const handleSaveAccommodationLocal = async () => {
    if (!editingAccommodation.title) {
      alert("Veuillez saisir un nom pour l'hébergement.");
      return;
    }

    const city = editingAccommodation.city || "";
    const wilaya = editingAccommodation.wilaya || "";
    const location = city && wilaya ? `${city}, ${wilaya}` : (city || wilaya || editingAccommodation.location || "Béjaïa");

    const payload = {
      ...editingAccommodation,
      location,
      images: editingAccommodation.images || [],
      blocked_dates: editingAccommodation.blocked_dates || [],
      amenities: editingAccommodation.amenities || [],
      custom_amenities: editingAccommodation.custom_amenities || []
    };

    try {
      const res = await saveAccommodation(payload.id || null, payload);
      if (res.success) {
        setAccommodationsList(res.accommodations || []);
        setShowAccommodationModal(false);
        setEditingAccommodation(null);
        showToast("Hébergement enregistré avec succès !");
      }
    } catch (err) {
      showToast("Erreur lors de l'enregistrement de l'hébergement.", "error");
    }
  };

  const handleDeleteAccommodationLocal = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet hébergement ?")) return;
    try {
      const res = await deleteAccommodation(id);
      if (res.success) {
        setAccommodationsList(res.accommodations || []);
        showToast("Hébergement supprimé.");
      }
    } catch (err) {
      showToast("Erreur de suppression.", "error");
    }
  };

  // Category Handlers
  const handleAddCategoryLocal = async () => {
    if (!newCategoryName) {
      alert("Veuillez saisir un nom pour la catégorie.");
      return;
    }
    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      icon: newCategoryIcon || "⛵",
      description: newCategoryDesc || "",
      is_active: true
    };
    const updated = [...categoriesList, newCat];
    setCategoriesList(updated);
    setNewCategoryName("");
    setNewCategoryDesc("");
    await handleSaveSection("categories", updated);
  };

  const handleDeleteCategoryLocal = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;
    const updated = categoriesList.filter((c) => c.id !== id);
    setCategoriesList(updated);
    await handleSaveSection("categories", updated);
  };

  const handleUpdateExperienceCategory = async (expId: string, categoryName: string) => {
    try {
      const res = await saveExperience(expId, { category: categoryName });
      if (res.success) {
        showToast("Catégorie de l'expérience mise à jour !");
      }
    } catch (err) {
      showToast("Erreur lors de la mise à jour de la catégorie.", "error");
    }
  };

  // Section Save Handler
  const handleSaveSection = async (sectionKey: string, sectionData: any) => {
    try {
      const res = await saveCmsSection(sectionKey, sectionData);
      if (res.success) {
        setCms(res.cms);
        showToast("Configurations enregistrées avec succès !");
      }
    } catch (err) {
      console.error(err);
      showToast("Une erreur est survenue lors de l'enregistrement.", "error");
    }
  };

  // Testimonial Handlers
  const handleSaveTestimonial = async () => {
    let updatedList = [...testimonials];
    if (editingTestimonial.id) {
      // Edit
      updatedList = updatedList.map((t) => (t.id === editingTestimonial.id ? editingTestimonial : t));
    } else {
      // Add
      const newT = { ...editingTestimonial, id: `t-${Date.now()}` };
      updatedList.push(newT);
    }
    
    setTestimonials(updatedList);
    setShowTestimonialModal(false);
    setEditingTestimonial(null);
    await handleSaveSection("testimonials", updatedList);
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce témoignage ?")) return;
    const updatedList = testimonials.filter((t) => t.id !== id);
    setTestimonials(updatedList);
    await handleSaveSection("testimonials", updatedList);
  };

  // Partner Handlers
  const handleAddPartner = async () => {
    if (!newPartner.name || !newPartner.logo_url) {
      alert("Veuillez remplir tous les champs du partenaire.");
      return;
    }
    const updatedList = [...partners, { id: `p-${Date.now()}`, ...newPartner }];
    setPartners(updatedList);
    setNewPartner({ name: "", logo_url: "" });
    await handleSaveSection("partners_logos", updatedList);
  };

  const handleDeletePartner = async (id: string) => {
    const updatedList = partners.filter((p) => p.id !== id);
    setPartners(updatedList);
    await handleSaveSection("partners_logos", updatedList);
  };

  // Banners Handlers
  const handleSaveBanner = async () => {
    let updatedList = [...banners];
    if (editingBanner.id) {
      updatedList = updatedList.map((b) => (b.id === editingBanner.id ? editingBanner : b));
    } else {
      const newB = { ...editingBanner, id: `banner-${Date.now()}` };
      updatedList.push(newB);
    }
    
    setBanners(updatedList);
    setShowBannerModal(false);
    setEditingBanner(null);
    await handleSaveSection("banners", updatedList);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette bannière ?")) return;
    const updatedList = banners.filter((b) => b.id !== id);
    setBanners(updatedList);
    await handleSaveSection("banners", updatedList);
  };

  // Media Library Handlers
  const handleAddMedia = async () => {
    if (!newMediaForm.name || !newMediaForm.url) {
      alert("Veuillez saisir un nom et une URL.");
      return;
    }
    const asset = {
      name: newMediaForm.name,
      url: newMediaForm.url,
      folder: newMediaForm.folder,
      size: `${Math.floor(100 + Math.random() * 400)} KB`,
      type: newMediaForm.type
    };

    try {
      const res = await addMediaAsset(asset);
      if (res.success) {
        setMediaList([...mediaList, res.asset]);
        setShowAddMediaModal(false);
        setNewMediaForm({ name: "", url: "", folder: "General", type: "image/jpeg" });
        showToast("Fichier ajouté à la médiathèque !");
      }
    } catch (err) {
      showToast("Erreur lors de l'ajout du média.", "error");
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce média ?")) return;
    try {
      const res = await deleteMediaAsset(id);
      if (res.success) {
        setMediaList(mediaList.filter((m) => m.id !== id));
        showToast("Média supprimé.");
      }
    } catch (err) {
      showToast("Erreur de suppression.", "error");
    }
  };

  // Tab List config
  const navItems = [
    { id: "homepage", label: "Page d'accueil", icon: Layout },
    { id: "testimonials", label: "Témoignages", icon: MessageSquare },
    { id: "experiences", label: "Expériences CMS", icon: ShipIcon },
    { id: "accommodations", label: "Hébergements", icon: HomeIcon },
    { id: "destinations", label: "Destinations", icon: MapPinIcon },
    { id: "media", label: "Médiathèque", icon: ImageIcon },
    { id: "texts", label: "Textes du site", icon: FileText },
    { id: "seo", label: "Référencement SEO", icon: Globe },
    { id: "contact", label: "Contact & Sociaux", icon: Phone },
    { id: "settings", label: "Configuration", icon: Settings }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative pb-10">
      {/* Toast Alert */}
      {saveStatus && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-primary-container/20 font-bold animate-in slide-in-from-bottom">
          <Check className="h-5 w-5 bg-white/20 p-0.5 rounded-full" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/20 pb-6">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary">Gestion du Site</h1>
          <p className="text-on-surface-variant font-body-lg text-body-lg mt-1">
            Centralisez, personnalisez et mettez à jour tout le contenu visible sur la plateforme Safar DZ.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-success-light text-green-700 font-bold px-3 py-1.5 rounded-full border border-green-200 self-start md:self-auto">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          Synchro directe client opérationnelle
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 shrink-0 bg-surface-container-low p-4 rounded-3xl border border-outline-variant/30 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-label-md font-bold transition-all shrink-0 lg:shrink ${
                  isActive
                    ? "bg-primary text-on-primary shadow-md shadow-primary/10"
                    : "text-on-surface-variant hover:bg-surface-variant/50"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* CMS Forms Area */}
        <main className="flex-1 w-full bg-white rounded-3xl border border-outline-variant/20 p-6 md:p-10 shadow-xs">
          {/* ====================================================
              TAB: HOMEPAGE (Hero, About, Banners, Partners)
              ==================================================== */}
          {activeTab === "homepage" && (
            <div className="space-y-12">
              <section className="space-y-6">
                <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                  <Layout className="h-6 w-6 text-primary" /> Section Hero
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSaveSection("hero", {
                      title: formData.get("hero_title"),
                      subtitle: formData.get("hero_subtitle"),
                      media_url: formData.get("hero_media"),
                      media_type: formData.get("hero_media_type"),
                      cta_text: formData.get("hero_cta_text"),
                      cta_link: formData.get("hero_cta_link")
                    });
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20"
                >
                  {/* Background Live Preview */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Aperçu de l&apos;arrière-plan actuel (Image/Vidéo)</label>
                    <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-surface-container-high border border-outline-variant/20 flex items-center justify-center shadow-inner group">
                      {heroMediaUrl ? (
                        heroMediaType === "video" ? (
                          <video
                            src={heroMediaUrl}
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={heroMediaUrl}
                            alt="Aperçu du fond Hero"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                            onError={(e) => {
                              // fallback on image error
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="h-10 w-10 text-outline mx-auto mb-2" />
                          <span className="text-xs text-outline font-bold">Aucun média d&apos;arrière-plan configuré ou URL invalide</span>
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[10px] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border border-white/10">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Aperçu en direct
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Titre Principal Hero</label>
                    <input
                      type="text"
                      name="hero_title"
                      defaultValue={cms.hero?.title || ""}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Sous-titre Hero</label>
                    <textarea
                      name="hero_subtitle"
                      rows={3}
                      defaultValue={cms.hero?.subtitle || ""}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Type de Média</label>
                    <select
                      name="hero_media_type"
                      value={heroMediaType}
                      onChange={(e) => setHeroMediaType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md font-medium"
                    >
                      <option value="image">Image</option>
                      <option value="video">Vidéo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">URL Média (Image/Vidéo)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="hero_media"
                        value={heroMediaUrl}
                        onChange={(e) => setHeroMediaUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                      />
                      <button
                        type="button"
                        onClick={() => setShowHeroMediaPicker(true)}
                        className="px-4 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
                        title="Sélectionner depuis la médiathèque"
                      >
                        <Folder className="h-4 w-4" /> Sélectionner
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Texte du Bouton CTA</label>
                    <input
                      type="text"
                      name="hero_cta_text"
                      defaultValue={cms.hero?.cta_text || ""}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Lien CTA</label>
                    <input
                      type="text"
                      name="hero_cta_link"
                      defaultValue={cms.hero?.cta_link || ""}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md font-medium"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Save className="h-4.5 w-4.5" /> Enregistrer le Hero
                    </button>
                  </div>
                </form>
              </section>

              {/* Hero Gallery / Carousel Cards */}
              <section className="space-y-6 pt-6 border-t border-outline-variant/10">
                <div className="flex justify-between items-center">
                  <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                    <ImageIcon className="h-6 w-6 text-primary" /> Galerie Hero (Carousel)
                  </h3>
                  <button
                    onClick={() => {
                      setHeroGallery([
                        ...heroGallery,
                        { id: `hg-${Date.now()}`, name: "", icon: "📷", image: "" }
                      ]);
                    }}
                    className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Ajouter une carte
                  </button>
                </div>
                <p className="text-sm text-on-surface-variant -mt-3">
                  Ces images apparaissent dans le carousel 3D en bas du hero. Ajoutez un nom, une icône emoji et l'URL de l'image pour chaque carte.
                </p>

                <div className="space-y-4">
                  {heroGallery.map((card: any, idx: number) => (
                    <div key={card.id} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/20 flex flex-col md:flex-row gap-4 items-start">
                      {/* Preview */}
                      <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/20 relative">
                        {card.image ? (
                          <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl text-outline">
                            {card.icon || "📷"}
                          </div>
                        )}
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                          #{idx + 1}
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Nom</label>
                          <input
                            type="text"
                            value={card.name}
                            onChange={(e) => {
                              const updated = [...heroGallery];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setHeroGallery(updated);
                            }}
                            placeholder="Bateau privé"
                            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Icône (Emoji)</label>
                          <input
                            type="text"
                            value={card.icon}
                            onChange={(e) => {
                              const updated = [...heroGallery];
                              updated[idx] = { ...updated[idx], icon: e.target.value };
                              setHeroGallery(updated);
                            }}
                            placeholder="🚤"
                            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">URL Image</label>
                          <input
                            type="text"
                            value={card.image}
                            onChange={(e) => {
                              const updated = [...heroGallery];
                              updated[idx] = { ...updated[idx], image: e.target.value };
                              setHeroGallery(updated);
                            }}
                            placeholder="https://..."
                            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row md:flex-col gap-2 shrink-0">
                        {idx > 0 && (
                          <button
                            onClick={() => {
                              const updated = [...heroGallery];
                              [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
                              setHeroGallery(updated);
                            }}
                            className="p-1.5 hover:bg-surface-container rounded-lg text-primary text-xs font-bold"
                            title="Monter"
                          >
                            ▲
                          </button>
                        )}
                        {idx < heroGallery.length - 1 && (
                          <button
                            onClick={() => {
                              const updated = [...heroGallery];
                              [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
                              setHeroGallery(updated);
                            }}
                            className="p-1.5 hover:bg-surface-container rounded-lg text-primary text-xs font-bold"
                            title="Descendre"
                          >
                            ▼
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm("Supprimer cette carte ?")) {
                              setHeroGallery(heroGallery.filter((_, i) => i !== idx));
                            }
                          }}
                          className="p-1.5 hover:bg-error-container/20 rounded-lg text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSaveSection("hero_gallery", heroGallery)}
                    className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Save className="h-4.5 w-4.5" /> Enregistrer la galerie
                  </button>
                </div>
              </section>

              {/* Promo Banners Section */}
              <section className="space-y-6 pt-6 border-t border-outline-variant/10">
                <div className="flex justify-between items-center">
                  <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                    📢 Bannières Publicitaires
                  </h3>
                  <button
                    onClick={() => {
                      setEditingBanner({ title: "", subtitle: "", image_url: "", link: "", is_active: true });
                      setShowBannerModal(true);
                    }}
                    className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Nouvelle bannière
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {banners.map((banner) => (
                    <div key={banner.id} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${banner.is_active ? "bg-green-100 text-green-700" : "bg-outline-variant text-on-surface-variant"}`}>
                            {banner.is_active ? "Active" : "Inactive"}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingBanner(banner);
                                setShowBannerModal(true);
                              }}
                              className="p-1.5 hover:bg-surface-container rounded-lg text-primary"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="p-1.5 hover:bg-error-container/20 rounded-lg text-error"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-on-surface">{banner.title}</h4>
                        <p className="text-xs text-on-surface-variant">{banner.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* About section */}
              <section className="space-y-6 pt-6 border-t border-outline-variant/10">
                <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                  ℹ️ Section À Propos
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSaveSection("about", {
                      text: formData.get("about_text"),
                      images: [formData.get("about_img1"), formData.get("about_img2")]
                    });
                  }}
                  className="grid grid-cols-1 gap-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Description À Propos de Safar DZ</label>
                    <textarea
                      name="about_text"
                      rows={4}
                      defaultValue={cms.about?.text || ""}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Image 1 URL</label>
                      <input
                        type="text"
                        name="about_img1"
                        defaultValue={cms.about?.images?.[0] || ""}
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Image 2 URL</label>
                      <input
                        type="text"
                        name="about_img2"
                        defaultValue={cms.about?.images?.[1] || ""}
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Save className="h-4.5 w-4.5" /> Enregistrer À Propos
                    </button>
                  </div>
                </form>
              </section>

              {/* Partners section */}
              <section className="space-y-6 pt-6 border-t border-outline-variant/10">
                <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                  🤝 Partenaires & Logos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20">
                  {/* Add partner logo */}
                  <div className="md:col-span-1 space-y-4 border-r border-outline-variant/20 pr-6">
                    <h4 className="font-bold text-xs uppercase text-outline">Ajouter un Partenaire</h4>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Nom</label>
                      <input
                        type="text"
                        value={newPartner.name}
                        onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                        placeholder="Ex: Capitaine Salim"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">URL du Logo (carré)</label>
                      <input
                        type="text"
                        value={newPartner.logo_url}
                        onChange={(e) => setNewPartner({ ...newPartner, logo_url: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                        placeholder="https://..."
                      />
                    </div>
                    <button
                      onClick={handleAddPartner}
                      className="w-full py-2 bg-primary text-on-primary font-bold rounded-lg text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Ajouter
                    </button>
                  </div>

                  {/* Partners list grid */}
                  <div className="md:col-span-2 flex flex-wrap gap-4 items-center">
                    {partners.map((partner) => (
                      <div key={partner.id} className="relative group flex items-center gap-3 bg-surface-container-low border border-outline-variant/30 px-4 py-2 rounded-xl">
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="w-10 h-10 object-cover rounded-full"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-on-surface">{partner.name}</p>
                        </div>
                        <button
                          onClick={() => handleDeletePartner(partner.id)}
                          className="p-1 hover:bg-error-container/20 rounded-md text-error opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ====================================================
              TAB: TESTIMONIALS
              ==================================================== */}
          {activeTab === "testimonials" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                    ⭐ Gestion des Témoignages
                  </h3>
                  <p className="text-on-surface-variant text-xs mt-1">Ajoutez, modifiez ou retirez des retours d&apos;expérience clients affichés sur le site.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingTestimonial({ name: "", role: "Client", avatar: IMAGES.GUIDE_IMAGE, comment: "", rating: 5 });
                    setShowTestimonialModal(true);
                  }}
                  className="px-4 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Ajouter un témoignage
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((t) => (
                  <div key={t.id} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 flex flex-col justify-between relative group shadow-xs">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-1 text-amber-500">
                          {Array.from({ length: t.rating || 5 }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingTestimonial(t);
                              setShowTestimonialModal(true);
                            }}
                            className="p-1 hover:bg-surface-container rounded-lg text-primary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(t.id)}
                            className="p-1 hover:bg-error-container/20 rounded-lg text-error"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-on-surface italic leading-relaxed">
                        &quot;{t.comment}&quot;
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-outline-variant/10">
                      <img
                        src={t.avatar || IMAGES.GUIDE_IMAGE}
                        alt={t.name}
                        className="w-10 h-10 object-cover rounded-full bg-surface-container-high"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-on-surface">{t.name}</h4>
                        <p className="text-[10px] text-outline">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====================================================
              TAB: EXPERIENCES
              ==================================================== */}
          {activeTab === "experiences" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                  🛥️ Catégories & Expériences
                </h3>
                <p className="text-on-surface-variant text-xs mt-1">Gérez les catégories d&apos;activité et associez-y vos sorties en mer.</p>
              </div>

              {/* Selector for featured experiences */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 space-y-4">
                <h4 className="font-bold text-xs uppercase text-outline">Expériences à la Une (Homepage)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[0, 1, 2].map((index) => {
                    const selectedId = cms.featured_experiences_ids?.[index] || "";
                    return (
                      <div key={index} className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-on-surface-variant">Emplacement {index + 1}</label>
                        <select
                          value={selectedId}
                          onChange={(e) => {
                            const newFeatured = [...(cms.featured_experiences_ids || [])];
                            newFeatured[index] = e.target.value;
                            handleSaveSection("featured_experiences_ids", newFeatured);
                          }}
                          className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary text-body-md"
                        >
                          <option value="">-- Sélectionner une expérience --</option>
                          {experiences.map((exp) => (
                            <option key={exp.id} value={exp.id}>
                              {exp.title} ({exp.partner})
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Category Management Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-outline-variant/10">
                {/* Form to add category */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 space-y-4">
                  <h4 className="font-bold text-xs uppercase text-outline">Ajouter une Catégorie</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Nom de la catégorie</label>
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs"
                        placeholder="Ex: Quads"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Emoji / Icône</label>
                      <input
                        type="text"
                        value={newCategoryIcon}
                        onChange={(e) => setNewCategoryIcon(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs"
                        placeholder="Ex: 🏎️"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Description courte</label>
                      <textarea
                        value={newCategoryDesc}
                        onChange={(e) => setNewCategoryDesc(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs"
                        placeholder="Description de l'activité..."
                      />
                    </div>
                    <button
                      onClick={handleAddCategoryLocal}
                      className="w-full py-2 bg-primary text-on-primary font-bold rounded-lg text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Créer la catégorie
                    </button>
                  </div>
                </div>

                {/* Categories List */}
                <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 space-y-4">
                  <h4 className="font-bold text-xs uppercase text-outline">Catégories Actives</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[280px] overflow-y-auto pr-2">
                    {categoriesList.map((cat) => (
                      <div key={cat.id} className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl flex items-start justify-between gap-2">
                        <div className="flex gap-2">
                          <span className="text-2xl shrink-0">{cat.icon}</span>
                          <div>
                            <h5 className="font-bold text-xs text-on-surface">{cat.name}</h5>
                            <p className="text-[10px] text-on-surface-variant line-clamp-1 mt-0.5">{cat.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCategoryLocal(cat.id)}
                          className="p-1 hover:bg-error-container/20 rounded-md text-error"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Experiences Category Assignment */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 space-y-4 pt-6 border-t border-outline-variant/10">
                <h4 className="font-bold text-xs uppercase text-outline">Catégorisation des Expériences</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-outline-variant/20 pb-2">
                        <th className="font-bold pb-2">Titre de l&apos;expérience</th>
                        <th className="font-bold pb-2">Partenaire</th>
                        <th className="font-bold pb-2">Catégorie assignée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {experiences.map((exp) => (
                        <tr key={exp.id} className="hover:bg-surface-container-low/20">
                          <td className="py-3 pr-4 font-medium">{exp.title}</td>
                          <td className="py-3 pr-4 text-on-surface-variant">{exp.partner}</td>
                          <td className="py-3">
                            <select
                              defaultValue={exp.category || ""}
                              onChange={(e) => handleUpdateExperienceCategory(exp.id, e.target.value)}
                              className="px-2 py-1 bg-surface-container-low border border-outline-variant/30 rounded-md focus:ring-1 focus:ring-primary outline-none font-medium"
                            >
                              <option value="">-- Sans catégorie --</option>
                              {categoriesList.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.icon} {c.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Direct links to main experiences dashboard */}
              <div className="p-6 bg-primary-container/10 border border-primary-container/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h4 className="font-bold text-sm text-primary">Gestion complète des Expériences</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Vous souhaitez créer une nouvelle expérience, modifier des prix, durées, ou valider le planning d&apos;un bateau ?</p>
                </div>
                <a
                  href="/admin/experiences"
                  className="px-5 py-3 bg-primary text-on-primary text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                >
                  Aller au catalogue d&apos;expériences <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}

          {/* ====================================================
              TAB: ACCOMMODATIONS (Hébergements)
              ==================================================== */}
          {activeTab === "accommodations" && (() => {
            const uniqueWilayas = Array.from(
              new Set(
                accommodationsList
                  .map((a) => a.wilaya || (a.location?.split(",")?.[1]?.trim()) || "Béjaïa")
                  .filter(Boolean)
              )
            );

            const filteredAccommodations = accommodationsList.filter((acc) => {
              const matchesSearch =
                !accSearchQuery ||
                acc.title?.toLowerCase().includes(accSearchQuery.toLowerCase()) ||
                acc.location?.toLowerCase().includes(accSearchQuery.toLowerCase()) ||
                acc.city?.toLowerCase().includes(accSearchQuery.toLowerCase()) ||
                acc.description?.toLowerCase().includes(accSearchQuery.toLowerCase());
                
              const matchesType = accTypeFilter === "all" || acc.type === accTypeFilter;
              const matchesWilaya = accWilayaFilter === "all" || (acc.wilaya || (acc.location?.split(",")?.[1]?.trim()) || "Béjaïa") === accWilayaFilter;
              
              return matchesSearch && matchesType && matchesWilaya;
            });

            return (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                      🏠 Gestion des Hébergements
                    </h3>
                    <p className="text-on-surface-variant text-xs mt-1">Ajoutez, modifiez ou supprimez des villas, appartements et studios recommandés.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAccommodation({
                        title: "",
                        type: "villa",
                        wilaya: "Béjaïa",
                        city: "",
                        address: "",
                        short_description: "",
                        description: "",
                        location: "Boulimate, Béjaïa",
                        price: 15000,
                        promo_price: null,
                        currency: "DA",
                        pricing_type: "night",
                        availability: "Disponible",
                        image_url: "",
                        images: [],
                        is_active: true,
                        contact_phone: "+213 550 12 34 56",
                        max_guests: 6,
                        rooms_count: 2,
                        beds_count: 4,
                        bathrooms_count: 1,
                        amenities: ["Wi-Fi", "Climatisation", "Cuisine équipée"],
                        custom_amenities: [],
                        booking_type: "whatsapp",
                        whatsapp_phone: "+213 556 48 36 34",
                        min_stay_nights: 1,
                        blocked_dates: []
                      });
                      setNewImageUrl("");
                      setNewCustomAmenity("");
                      setShowAccommodationModal(true);
                    }}
                    className="px-4 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 self-start md:self-auto"
                  >
                    <Plus className="h-4 w-4" /> Ajouter un hébergement
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  {/* Search text */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                    <input
                      type="text"
                      placeholder="Rechercher un logement..."
                      value={accSearchQuery}
                      onChange={(e) => setAccSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  {/* Type Filter */}
                  <div>
                    <select
                      value={accTypeFilter}
                      onChange={(e) => setAccTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="all">Tous les types de biens</option>
                      <option value="villa">Villa</option>
                      <option value="appartement">Appartement</option>
                      <option value="maison">Maison</option>
                      <option value="studio">Studio</option>
                    </select>
                  </div>
                  {/* Wilaya Filter */}
                  <div>
                    <select
                      value={accWilayaFilter}
                      onChange={(e) => setAccWilayaFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="all">Toutes les wilayas</option>
                      {uniqueWilayas.map((wilaya) => (
                        <option key={wilaya} value={wilaya}>{wilaya}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Accommodations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredAccommodations.map((acc) => {
                    const pricingTypeText = acc.pricing_type === "stay" ? "séjour" : "nuit";
                    return (
                      <div key={acc.id} className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:border-outline-variant transition-all">
                        <div className="relative h-44 w-full bg-surface-container-high">
                          <img
                            src={acc.image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"}
                            alt={acc.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full text-white shadow-sm ${
                              acc.availability === "Disponible" 
                                ? "bg-emerald-500" 
                                : acc.availability === "Sur demande"
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}>
                              {acc.availability}
                            </span>
                            {acc.type && (
                              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-primary/95 text-on-primary uppercase tracking-wider self-start shadow-sm">
                                {acc.type}
                              </span>
                            )}
                          </div>
                          <div className="absolute top-3 right-3 flex gap-1">
                            <button
                              onClick={() => {
                                setEditingAccommodation({
                                  ...acc,
                                  images: acc.images || [acc.image_url].filter(Boolean),
                                  blocked_dates: acc.blocked_dates || [],
                                  amenities: acc.amenities || [],
                                  custom_amenities: acc.custom_amenities || []
                                });
                                setNewImageUrl("");
                                setNewCustomAmenity("");
                                setShowAccommodationModal(true);
                              }}
                              className="p-1.5 bg-white/95 backdrop-blur-xs rounded-lg text-primary hover:bg-white transition-colors shadow-xs"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAccommodationLocal(acc.id)}
                              className="p-1.5 bg-red-50/95 backdrop-blur-xs rounded-lg text-error hover:bg-red-50 transition-colors shadow-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h4 className="font-bold text-sm text-primary line-clamp-1">{acc.title}</h4>
                            <p className="text-xs text-on-surface-variant flex items-center gap-0.5 mt-1 font-semibold">
                              <MapPinIcon className="h-3.5 w-3.5 text-secondary shrink-0" /> 
                              {acc.city ? `${acc.city}, ${acc.wilaya || "Béjaïa"}` : acc.location}
                            </p>
                            <p className="text-xs text-on-surface-variant line-clamp-2 mt-2">{acc.short_description || acc.description}</p>
                            
                            {/* Capacity details badges */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              <span className="text-[10px] bg-surface-container-low px-2 py-0.5 rounded-md font-bold text-on-surface-variant">
                                👥 {acc.max_guests || 6} voyageur{acc.max_guests > 1 ? "s" : ""}
                              </span>
                              <span className="text-[10px] bg-surface-container-low px-2 py-0.5 rounded-md font-bold text-on-surface-variant">
                                🚪 {acc.rooms_count || 2} ch.
                              </span>
                              <span className="text-[10px] bg-surface-container-low px-2 py-0.5 rounded-md font-bold text-on-surface-variant">
                                🛏️ {acc.beds_count || 4} lit{acc.beds_count > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10">
                            <div>
                              <span className="text-[9px] text-outline block uppercase tracking-wider">Tarif / {pricingTypeText}</span>
                              <div className="flex items-baseline gap-1.5">
                                {acc.promo_price ? (
                                  <>
                                    <span className="font-bold text-sm text-primary">
                                      {(acc.promo_price).toLocaleString("fr-DZ")} {acc.currency || "DA"}
                                    </span>
                                    <span className="text-xs text-outline line-through">
                                      {(acc.price).toLocaleString("fr-DZ")}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-bold text-sm text-primary">
                                    {acc.price ? `${acc.price.toLocaleString("fr-DZ")} ${acc.currency || "DA"}` : "Sur demande"}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${acc.is_active ? "bg-green-100 text-green-700" : "bg-outline-variant text-on-surface-variant"}`}>
                              {acc.is_active ? "Actif" : "Désactivé"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredAccommodations.length === 0 && (
                    <div className="col-span-full py-12 text-center text-outline">
                      <HomeIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-bold">Aucun hébergement ne correspond à vos filtres.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ====================================================
              TAB: DESTINATIONS
              ==================================================== */}
          {activeTab === "destinations" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                  🗺️ Catalogue des Destinations
                </h3>
                <p className="text-on-surface-variant text-xs mt-1">Ajoutez et éditez les lieux géographiques clés qui incitent les clients à réserver des balades.</p>
              </div>

              {/* Link to standard destination page */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {destinations.map((dest) => (
                  <div key={dest.id} className="border border-outline-variant/20 bg-surface-container-lowest rounded-2xl overflow-hidden flex gap-4 p-4">
                    <img
                      src={dest.photo_url}
                      alt={dest.name}
                      className="w-24 h-24 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm truncate">{dest.name}</h4>
                        <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{dest.description}</p>
                      </div>
                      <span className="text-[10px] text-outline font-medium">{dest.location || "Béjaïa"}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-primary-container/10 border border-primary-container/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h4 className="font-bold text-sm text-primary">Gestion complète des Destinations</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Ajoutez, éditez en vedette, modifiez les images ou descriptions des destinations.</p>
                </div>
                <a
                  href="/admin/destinations"
                  className="px-5 py-3 bg-primary text-on-primary text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                >
                  Gérer les destinations <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}

          {/* ====================================================
              TAB: MEDIA
              ==================================================== */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                    🖼️ Médiathèque
                  </h3>
                  <p className="text-on-surface-variant text-xs mt-1">Gérez tous les visuels du site. Téléversez des fichiers, ou copiez leurs liens directs.</p>
                </div>
                <button
                  onClick={() => setShowAddMediaModal(true)}
                  className="px-4 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Upload className="h-4 w-4" /> Importer une image
                </button>
              </div>

              {/* Folder filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 border-b border-outline-variant/10">
                {["All", "Experiences", "Destinations", "General"].map((folder) => (
                  <button
                    key={folder}
                    onClick={() => setMediaFolderFilter(folder)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                      mediaFolderFilter === folder
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {folder === "All" ? "Tous les dossiers" : folder}
                  </button>
                ))}
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {mediaList
                  .filter((m) => mediaFolderFilter === "All" || m.folder === mediaFolderFilter)
                  .map((media) => (
                    <div key={media.id} className="group relative border border-outline-variant/20 bg-surface-container-lowest rounded-2xl overflow-hidden aspect-square flex flex-col justify-between">
                      {/* Image container */}
                      <div className="relative flex-1 bg-surface-container-high">
                        <img
                          src={media.url}
                          alt={media.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          onClick={() => handleDeleteMedia(media.id)}
                          className="absolute top-2 right-2 p-1.5 bg-error/90 hover:bg-error text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {/* Description bar */}
                      <div className="p-3 border-t border-outline-variant/10 flex justify-between items-center bg-white">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-on-surface truncate">{media.name}</p>
                          <p className="text-[9px] text-outline font-medium mt-0.5">{media.size}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(media.url);
                            showToast("Lien de l'image copié !");
                          }}
                          className="p-1 text-primary hover:bg-primary/10 rounded-md"
                          title="Copier le lien"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ====================================================
              TAB: TEXTS
              ==================================================== */}
          {activeTab === "texts" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                  📝 Gestion des Textes du Site
                </h3>
                <p className="text-on-surface-variant text-xs mt-1">Configurez les labels, boutons et options de menu sans modifier une ligne de code.</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSaveSection("website_texts", {
                    hero_title: formData.get("hero_title"),
                    hero_subtitle: formData.get("hero_subtitle"),
                    footer_desc: formData.get("footer_desc"),
                    btn_reserve: formData.get("btn_reserve"),
                    nav_experiences: formData.get("nav_experiences"),
                    nav_destinations: formData.get("nav_destinations"),
                    nav_about: formData.get("nav_about"),
                    nav_contact: formData.get("nav_contact")
                  });
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20"
              >
                <div>
                  <h4 className="font-bold text-xs uppercase text-outline md:col-span-2 mb-2">Textes du Menu</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Lien Expériences</label>
                      <input
                        type="text"
                        name="nav_experiences"
                        defaultValue={cms.website_texts?.nav_experiences || "Expériences"}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Lien Destinations</label>
                      <input
                        type="text"
                        name="nav_destinations"
                        defaultValue={cms.website_texts?.nav_destinations || "Destinations"}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase text-outline md:col-span-2 mb-2">Autres liens</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Lien À Propos</label>
                      <input
                        type="text"
                        name="nav_about"
                        defaultValue={cms.website_texts?.nav_about || "À propos"}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Lien Contact</label>
                      <input
                        type="text"
                        name="nav_contact"
                        defaultValue={cms.website_texts?.nav_contact || "Contact"}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 border-t border-outline-variant/10 pt-4">
                  <h4 className="font-bold text-xs uppercase text-outline mb-4">Textes Pied de page (Footer) & Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Description Footer</label>
                      <textarea
                        name="footer_desc"
                        rows={2}
                        defaultValue={cms.website_texts?.footer_desc || ""}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Texte du Bouton Réserver</label>
                      <input
                        type="text"
                        name="btn_reserve"
                        defaultValue={cms.website_texts?.btn_reserve || "Réserver"}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Save className="h-4.5 w-4.5" /> Enregistrer les Textes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ====================================================
              TAB: SEO
              ==================================================== */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                  🔍 Référencement & SEO
                </h3>
                <p className="text-on-surface-variant text-xs mt-1">Configurez les balises Meta de chaque page pour optimiser le classement Google et le partage sur les réseaux sociaux.</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSaveSection("seo", {
                    home: {
                      title: formData.get("home_seo_title"),
                      description: formData.get("home_seo_desc"),
                      keywords: formData.get("home_seo_keywords"),
                      og_image: formData.get("home_seo_image")
                    },
                    experiences: {
                      title: formData.get("exp_seo_title"),
                      description: formData.get("exp_seo_desc"),
                      keywords: formData.get("exp_seo_keywords"),
                      og_image: formData.get("exp_seo_image")
                    }
                  });
                }}
                className="space-y-8"
              >
                {/* Page: Home */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 space-y-4">
                  <h4 className="font-bold text-xs uppercase text-primary">Page d&apos;accueil (/)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Méta Titre (Title Tag)</label>
                      <input
                        type="text"
                        name="home_seo_title"
                        defaultValue={cms.seo?.home?.title || ""}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Mots-clés (Keywords)</label>
                      <input
                        type="text"
                        name="home_seo_keywords"
                        defaultValue={cms.seo?.home?.keywords || ""}
                        placeholder="Ex: bateau, bejaia, mer"
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Méta Description</label>
                      <textarea
                        name="home_seo_desc"
                        rows={2}
                        defaultValue={cms.seo?.home?.description || ""}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Image de partage social (OG Image URL)</label>
                      <input
                        type="text"
                        name="home_seo_image"
                        defaultValue={cms.seo?.home?.og_image || ""}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Page: Experiences */}
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 space-y-4">
                  <h4 className="font-bold text-xs uppercase text-primary">Page Expériences (/experiences)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Méta Titre (Title Tag)</label>
                      <input
                        type="text"
                        name="exp_seo_title"
                        defaultValue={cms.seo?.experiences?.title || ""}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Mots-clés (Keywords)</label>
                      <input
                        type="text"
                        name="exp_seo_keywords"
                        defaultValue={cms.seo?.experiences?.keywords || ""}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Méta Description</label>
                      <textarea
                        name="exp_seo_desc"
                        rows={2}
                        defaultValue={cms.seo?.experiences?.description || ""}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Image de partage social (OG Image URL)</label>
                      <input
                        type="text"
                        name="exp_seo_image"
                        defaultValue={cms.seo?.experiences?.og_image || ""}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Save className="h-4.5 w-4.5" /> Enregistrer le SEO
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ====================================================
              TAB: CONTACT
              ==================================================== */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                  📞 Informations de Contact & Réseaux
                </h3>
                <p className="text-on-surface-variant text-xs mt-1">Définissez vos coordonnées. Celles-ci seront appliquées en pied de page et sur les formulaires d&apos;assistance.</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSaveSection("contact_info", {
                    phone: formData.get("phone"),
                    whatsapp: formData.get("whatsapp"),
                    email: formData.get("email"),
                    address: formData.get("address"),
                    socials: {
                      facebook: formData.get("facebook"),
                      instagram: formData.get("instagram"),
                      tiktok: formData.get("tiktok")
                    }
                  });
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20"
              >
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Numéro de Téléphone</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={cms.contact_info?.phone || ""}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">WhatsApp (avec indicatif)</label>
                  <input
                    type="text"
                    name="whatsapp"
                    defaultValue={cms.contact_info?.whatsapp || ""}
                    placeholder="Ex: 213556483634"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Adresse E-mail de Contact</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={cms.contact_info?.email || ""}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Adresse physique des bureaux</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={cms.contact_info?.address || ""}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  />
                </div>

                <div className="md:col-span-2 border-t border-outline-variant/10 pt-4">
                  <h4 className="font-bold text-xs uppercase text-outline mb-4">Liens Réseaux Sociaux</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Lien Facebook</label>
                      <input
                        type="text"
                        name="facebook"
                        defaultValue={cms.contact_info?.socials?.facebook || ""}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Lien Instagram</label>
                      <input
                        type="text"
                        name="instagram"
                        defaultValue={cms.contact_info?.socials?.instagram || ""}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Lien TikTok</label>
                      <input
                        type="text"
                        name="tiktok"
                        defaultValue={cms.contact_info?.socials?.tiktok || ""}
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Save className="h-4.5 w-4.5" /> Enregistrer le Contact
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ====================================================
              TAB: CONFIGURATION (Brand colors, logo, settings)
              ==================================================== */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                  ⚙️ Paramètres du Site & Charte
                </h3>
                <p className="text-on-surface-variant text-xs mt-1">Configurez le nom de l&apos;application, les couleurs de la charte graphique et d&apos;autres aspects fonctionnels.</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSaveSection("settings", {
                    logo_text: formData.get("logo_text"),
                    favicon_url: formData.get("favicon_url"),
                    brand_color_primary: formData.get("primary_color"),
                    brand_color_secondary: formData.get("secondary_color"),
                    brand_color_dark: formData.get("dark_color"),
                    general_info: {
                      site_name: formData.get("site_name"),
                      site_slogan: formData.get("site_slogan")
                    }
                  });
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20"
              >
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Nom du Site (Safar DZ)</label>
                  <input
                    type="text"
                    name="site_name"
                    defaultValue={cms.settings?.general_info?.site_name || "Safar DZ"}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Slogan du Site</label>
                  <input
                    type="text"
                    name="site_slogan"
                    defaultValue={cms.settings?.general_info?.site_slogan || ""}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Texte du Logo (Affiché en en-tête)</label>
                  <input
                    type="text"
                    name="logo_text"
                    defaultValue={cms.settings?.logo_text || "SafarDZ"}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">URL du Favicon</label>
                  <input
                    type="text"
                    name="favicon_url"
                    defaultValue={cms.settings?.favicon_url || "/favicon.ico"}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  />
                </div>

                <div className="md:col-span-2 border-t border-outline-variant/10 pt-4">
                  <h4 className="font-bold text-xs uppercase text-outline mb-4">Charte Graphique (Couleurs principales)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Couleur Primaire</label>
                        <input
                          type="color"
                          name="primary_color"
                          defaultValue={cms.settings?.brand_color_primary || "#003693"}
                          className="w-12 h-10 border border-outline-variant/35 rounded-lg cursor-pointer bg-transparent"
                        />
                      </div>
                      <span className="text-xs font-mono font-bold mt-4">{cms.settings?.brand_color_primary || "#003693"}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Couleur Secondaire</label>
                        <input
                          type="color"
                          name="secondary_color"
                          defaultValue={cms.settings?.brand_color_secondary || "#4e5d8a"}
                          className="w-12 h-10 border border-outline-variant/35 rounded-lg cursor-pointer bg-transparent"
                        />
                      </div>
                      <span className="text-xs font-mono font-bold mt-4">{cms.settings?.brand_color_secondary || "#4e5d8a"}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Couleur sombre (Body text)</label>
                        <input
                          type="color"
                          name="dark_color"
                          defaultValue={cms.settings?.brand_color_dark || "#0f172a"}
                          className="w-12 h-10 border border-outline-variant/35 rounded-lg cursor-pointer bg-transparent"
                        />
                      </div>
                      <span className="text-xs font-mono font-bold mt-4">{cms.settings?.brand_color_dark || "#0f172a"}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Save className="h-4.5 w-4.5" /> Enregistrer la Charte
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ====================================================
          MODAL: ADD/EDIT TESTIMONIAL
          ==================================================== */}
      {showTestimonialModal && editingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs" onClick={() => setShowTestimonialModal(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 border border-outline-variant/20">
            <h3 className="font-headline-sm text-headline-sm text-primary">
              {editingTestimonial.id ? "Modifier le Témoignage" : "Ajouter un Témoignage"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Nom du Voyageur</label>
                <input
                  type="text"
                  value={editingTestimonial.name}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  placeholder="Ex: Kamel M."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Rôle / Label (Client, Skipper...)</label>
                <input
                  type="text"
                  value={editingTestimonial.role}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Note (1 à 5 étoiles)</label>
                <select
                  value={editingTestimonial.rating}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm font-bold"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {"⭐".repeat(r)} ({r})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Commentaire client</label>
                <textarea
                  value={editingTestimonial.comment}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, comment: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  placeholder="Saisissez le retour d'expérience..."
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/10">
              <button
                onClick={() => setShowTestimonialModal(false)}
                className="px-4 py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-highest"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveTestimonial}
                className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: ADD/EDIT BANNER
          ==================================================== */}
      {showBannerModal && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs" onClick={() => setShowBannerModal(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 border border-outline-variant/20">
            <h3 className="font-headline-sm text-headline-sm text-primary">
              {editingBanner.id ? "Modifier la Bannière" : "Ajouter une Bannière"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Titre de l&apos;Offre</label>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  placeholder="Ex: Offre de Printemps"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Détails de l&apos;Offre</label>
                <input
                  type="text"
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  placeholder="Ex: -15% en semaine !"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Lien de redirection (Link URL)</label>
                <input
                  type="text"
                  value={editingBanner.link}
                  onChange={(e) => setEditingBanner({ ...editingBanner, link: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <span className="text-xs font-bold text-on-surface-variant">Bannière Active</span>
                <button
                  onClick={() => setEditingBanner({ ...editingBanner, is_active: !editingBanner.is_active })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${editingBanner.is_active ? "bg-primary" : "bg-outline-variant"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${editingBanner.is_active ? "translate-x-6" : ""}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/10">
              <button
                onClick={() => setShowBannerModal(false)}
                className="px-4 py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-highest"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveBanner}
                className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: ADD MEDIA IMAGE
          ==================================================== */}
      {showAddMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs" onClick={() => setShowAddMediaModal(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 border border-outline-variant/20">
            <h3 className="font-headline-sm text-headline-sm text-primary">Importer un Média</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Nom du Fichier</label>
                <input
                  type="text"
                  value={newMediaForm.name}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  placeholder="Ex: sunset-bateau"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Lien URL de l&apos;Image</label>
                <input
                  type="text"
                  value={newMediaForm.url}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, url: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Dossier de Destination</label>
                <select
                  value={newMediaForm.folder}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, folder: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm font-medium"
                >
                  <option value="General">General</option>
                  <option value="Experiences">Experiences</option>
                  <option value="Destinations">Destinations</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/10">
              <button
                onClick={() => setShowAddMediaModal(false)}
                className="px-4 py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-highest"
              >
                Annuler
              </button>
              <button
                onClick={handleAddMedia}
                className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90"
              >
                Importer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: ADD/EDIT ACCOMMODATION
          ==================================================== */}
      {showAccommodationModal && editingAccommodation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs" onClick={() => setShowAccommodationModal(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 border border-outline-variant/20 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20 shrink-0">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                {editingAccommodation.id ? "Modifier l'Hébergement" : "Ajouter un Hébergement"}
              </h3>
              <button
                onClick={() => setShowAccommodationModal(false)}
                className="p-1 hover:bg-surface-container rounded-lg text-outline-variant hover:text-on-surface-variant transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 border-b border-outline-variant/10 pb-2 shrink-0 overflow-x-auto no-scrollbar">
              {[
                { id: "general", label: "Informations" },
                { id: "photos", label: "Photos" },
                { id: "amenities", label: "Équipements" },
                { id: "calendar", label: "Disponibilité" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModalTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    modalTab === tab.id
                      ? "bg-primary/10 text-primary border-b-2 border-primary rounded-b-none"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto pr-2 py-2 space-y-6">
              
              {/* TAB 1: GENERAL */}
              {modalTab === "general" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Informations Générales</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Nom de l'hébergement</label>
                        <input
                          type="text"
                          value={editingAccommodation.title}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, title: e.target.value })}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                          placeholder="Ex: Villa Vue sur Mer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Type de bien</label>
                        <select
                          value={editingAccommodation.type || "villa"}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, type: e.target.value })}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                          <option value="villa">Villa</option>
                          <option value="appartement">Appartement</option>
                          <option value="maison">Maison</option>
                          <option value="studio">Studio</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Wilaya</label>
                        <input
                          type="text"
                          value={editingAccommodation.wilaya || "Béjaïa"}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, wilaya: e.target.value })}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Ville</label>
                        <input
                          type="text"
                          value={editingAccommodation.city || ""}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, city: e.target.value })}
                          placeholder="Ex: Boulimate"
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Adresse</label>
                        <input
                          type="text"
                          value={editingAccommodation.address || ""}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, address: e.target.value })}
                          placeholder="Ex: Route nationale 24"
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Description courte (Liste)</label>
                      <input
                        type="text"
                        value={editingAccommodation.short_description || ""}
                        onChange={(e) => setEditingAccommodation({ ...editingAccommodation, short_description: e.target.value })}
                        placeholder="Ex: Superbe villa avec accès plage"
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1">Description complète</label>
                      <textarea
                        value={editingAccommodation.description}
                        onChange={(e) => setEditingAccommodation({ ...editingAccommodation, description: e.target.value })}
                        rows={4}
                        placeholder="Description détaillée du bien..."
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-outline-variant/10 pt-4">
                    <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Capacité d'accueil</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Voyageurs max.</label>
                        <input
                          type="number"
                          value={editingAccommodation.max_guests || 6}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, max_guests: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Chambres</label>
                        <input
                          type="number"
                          value={editingAccommodation.rooms_count || 2}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, rooms_count: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Lits</label>
                        <input
                          type="number"
                          value={editingAccommodation.beds_count || 4}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, beds_count: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Salles de bain</label>
                        <input
                          type="number"
                          value={editingAccommodation.bathrooms_count || 1}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, bathrooms_count: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-outline-variant/10 pt-4">
                    <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Tarification</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Prix Standard</label>
                        <input
                          type="number"
                          value={editingAccommodation.price || 0}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, price: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Prix Promo (facultatif)</label>
                        <input
                          type="number"
                          value={editingAccommodation.promo_price || ""}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, promo_price: parseInt(e.target.value) || null })}
                          placeholder="Ex: 22000"
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Devise</label>
                        <select
                          value={editingAccommodation.currency || "DA"}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, currency: e.target.value })}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                          <option value="DA">DA</option>
                          <option value="€">€ (Euro)</option>
                          <option value="$">$ (USD)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Base Tarifaire</label>
                        <select
                          value={editingAccommodation.pricing_type || "night"}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, pricing_type: e.target.value })}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                          <option value="night">Par nuit</option>
                          <option value="stay">Par séjour</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-outline-variant/10 pt-4">
                    <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Réservation & Paramètres</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Type de confirmation</label>
                        <select
                          value={editingAccommodation.booking_type || "whatsapp"}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, booking_type: e.target.value })}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                          <option value="whatsapp">Redirection WhatsApp</option>
                          <option value="direct">Confirmation directe</option>
                          <option value="manual">Validation manuelle</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Contact WhatsApp</label>
                        <input
                          type="text"
                          value={editingAccommodation.whatsapp_phone || ""}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, whatsapp_phone: e.target.value })}
                          placeholder="Ex: +213556483634"
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Séjour min. (nuits)</label>
                        <input
                          type="number"
                          value={editingAccommodation.min_stay_nights || 1}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, min_stay_nights: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Statut disponibilité</label>
                        <select
                          value={editingAccommodation.availability || "Disponible"}
                          onChange={(e) => setEditingAccommodation({ ...editingAccommodation, availability: e.target.value })}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                          <option value="Disponible">Disponible</option>
                          <option value="Sur demande">Sur demande</option>
                          <option value="Complet">Complet</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg self-end h-[42px] border border-outline-variant/15">
                        <span className="text-xs font-bold text-on-surface-variant">Visible sur le site</span>
                        <button
                          type="button"
                          onClick={() => setEditingAccommodation({ ...editingAccommodation, is_active: !editingAccommodation.is_active })}
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${editingAccommodation.is_active ? "bg-primary" : "bg-outline-variant"}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${editingAccommodation.is_active ? "translate-x-6" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PHOTOS */}
              {modalTab === "photos" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Galerie Multi-Images</h4>
                    <p className="text-xs text-on-surface-variant font-medium">Saisissez l&apos;adresse URL d&apos;une image pour l&apos;ajouter au bien. Définissez l&apos;image principale (couverture) et réordonnez la galerie.</p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newImageUrl) return;
                        const currentImages = editingAccommodation.images || [];
                        const updatedImages = [...currentImages, newImageUrl];
                        const coverUrl = editingAccommodation.image_url || newImageUrl;
                        setEditingAccommodation({
                          ...editingAccommodation,
                          images: updatedImages,
                          image_url: coverUrl
                        });
                        setNewImageUrl("");
                      }}
                      className="px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-90 transition-all shrink-0"
                    >
                      Ajouter
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {(editingAccommodation.images || []).map((imgUrl: string, idx: number) => {
                      const isCover = editingAccommodation.image_url === imgUrl;
                      return (
                        <div key={idx} className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 flex gap-3 items-center">
                          <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 relative bg-surface-container-high border border-outline-variant/20">
                            <img src={imgUrl} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                            {isCover && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <span className="bg-primary text-on-primary text-[8px] font-bold px-1 rounded-sm uppercase">Cover</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 text-left">
                            <span className="text-[10px] font-bold text-outline block">Image #{idx + 1}</span>
                            <span className="text-xs text-on-surface truncate block font-mono">{imgUrl}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAccommodation({
                                  ...editingAccommodation,
                                  image_url: imgUrl
                                });
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isCover 
                                  ? "bg-primary text-on-primary" 
                                  : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/15"
                              }`}
                              title="Définir comme couverture"
                            >
                              ★ Cover
                            </button>
                            
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...(editingAccommodation.images || [])];
                                  [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
                                  setEditingAccommodation({
                                    ...editingAccommodation,
                                    images: updated
                                  });
                                }}
                                className="p-1.5 bg-surface-container-lowest rounded-lg hover:bg-surface-container-high text-xs font-bold border border-outline-variant/15"
                                title="Monter"
                              >
                                ▲
                              </button>
                            )}
                            
                            {idx < (editingAccommodation.images || []).length - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...(editingAccommodation.images || [])];
                                  [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
                                  setEditingAccommodation({
                                    ...editingAccommodation,
                                    images: updated
                                  });
                                }}
                                className="p-1.5 bg-surface-container-lowest rounded-lg hover:bg-surface-container-high text-xs font-bold border border-outline-variant/15"
                                title="Descendre"
                              >
                                ▼
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                const currentImages: string[] = editingAccommodation.images || [];
                                const updatedImages = currentImages.filter((_: any, i: number) => i !== idx);
                                let coverUrl = editingAccommodation.image_url;
                                if (isCover) {
                                  coverUrl = updatedImages[0] || "";
                                }
                                setEditingAccommodation({
                                  ...editingAccommodation,
                                  images: updatedImages,
                                  image_url: coverUrl
                                });
                              }}
                              className="p-1.5 hover:bg-error-container/20 rounded-lg text-error"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {(editingAccommodation.images || []).length === 0 && (
                      <div className="py-6 text-center text-outline border border-dashed border-outline-variant/30 rounded-xl">
                        Aucune image dans la galerie. Ajoutez-en une avec le champ ci-dessus.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: AMENITIES */}
              {modalTab === "amenities" && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Équipements Standards</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "Wi-Fi",
                        "Climatisation",
                        "Piscine",
                        "Parking gratuit",
                        "Cuisine équipée",
                        "Vue sur mer",
                        "Vue sur montagne",
                        "Terrasse / Balcon",
                        "Jacuzzi",
                        "Proche plage"
                      ].map((amenity) => {
                        const currentAmenities = editingAccommodation.amenities || [];
                        const isChecked = currentAmenities.includes(amenity);
                        return (
                          <label key={amenity} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 cursor-pointer hover:bg-surface-container-high transition-all">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const updated = isChecked
                                  ? currentAmenities.filter((a: string) => a !== amenity)
                                  : [...currentAmenities, amenity];
                                setEditingAccommodation({
                                  ...editingAccommodation,
                                  amenities: updated
                                });
                              }}
                              className="rounded border-outline-variant/40 text-primary focus:ring-primary h-4.5 w-4.5"
                            />
                            <span className="text-xs font-semibold text-on-surface">{amenity}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-outline-variant/10 pt-4">
                    <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Équipements Personnalisés</h4>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: Barbecue de jardin"
                        value={newCustomAmenity}
                        onChange={(e) => setNewCustomAmenity(e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newCustomAmenity) return;
                          const currentCustom = editingAccommodation.custom_amenities || [];
                          if (currentCustom.includes(newCustomAmenity)) return;
                          setEditingAccommodation({
                            ...editingAccommodation,
                            custom_amenities: [...currentCustom, newCustomAmenity]
                          });
                          setNewCustomAmenity("");
                        }}
                        className="px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-lg hover:opacity-90 transition-all shrink-0"
                      >
                        Ajouter
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(editingAccommodation.custom_amenities || []).map((amenity: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20">
                          <span>{amenity}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (editingAccommodation.custom_amenities || []).filter((a: string) => a !== amenity);
                              setEditingAccommodation({
                                ...editingAccommodation,
                                custom_amenities: updated
                              });
                            }}
                            className="hover:text-primary-container font-extrabold ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {(editingAccommodation.custom_amenities || []).length === 0 && (
                        <span className="text-xs text-outline italic">Aucun équipement personnalisé ajouté.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CALENDAR */}
              {modalTab === "calendar" && (() => {
                const blockedDates = editingAccommodation.blocked_dates || [];
                
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); 
                
                const monthNames = [
                  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
                  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
                ];

                const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

                const days = [];
                for (let i = 0; i < firstDayIndex; i++) {
                  days.push(null);
                }
                for (let i = 1; i <= daysInMonth; i++) {
                  days.push(i);
                }

                const handlePrevMonth = () => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                };

                const handleNextMonth = () => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                };

                const toggleBlockedDate = (dayNum: number) => {
                  const mString = String(currentMonth + 1).padStart(2, '0');
                  const dString = String(dayNum).padStart(2, '0');
                  const dateStr = `${currentYear}-${mString}-${dString}`;
                  
                  const isBlocked = blockedDates.includes(dateStr);
                  const updated = isBlocked
                    ? blockedDates.filter((d: string) => d !== dateStr)
                    : [...blockedDates, dateStr];

                  setEditingAccommodation({
                    ...editingAccommodation,
                    blocked_dates: updated
                  });
                };

                return (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs uppercase text-primary tracking-wider">Bloquer les Dates de Réservation</h4>
                      <p className="text-xs text-on-surface-variant font-medium">Cliquez sur les jours du calendrier pour les marquer comme indisponibles pour cet hébergement.</p>
                    </div>

                    <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/15 space-y-4">
                      <div className="flex justify-between items-center">
                        <button type="button" onClick={handlePrevMonth} className="p-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:bg-surface-container-low text-xs font-bold">
                          ◀
                        </button>
                        <span className="text-sm font-bold text-primary font-mono uppercase tracking-wider">
                          {monthNames[currentMonth]} {currentYear}
                        </span>
                        <button type="button" onClick={handleNextMonth} className="p-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:bg-surface-container-low text-xs font-bold">
                          ▶
                        </button>
                      </div>

                      <div className="grid grid-cols-7 text-center gap-1.5 text-[10px] font-bold text-outline">
                        {daysOfWeek.map((day) => (
                          <div key={day} className="py-1">{day}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 text-center gap-1.5 text-xs">
                        {days.map((dayNum, idx) => {
                          if (dayNum === null) {
                            return <div key={`empty-${idx}`} className="aspect-square py-2" />;
                          }

                          const mString = String(currentMonth + 1).padStart(2, '0');
                          const dString = String(dayNum).padStart(2, '0');
                          const dateStr = `${currentYear}-${mString}-${dString}`;
                          const isBlocked = blockedDates.includes(dateStr);

                          return (
                            <button
                              key={`day-${dayNum}`}
                              type="button"
                              onClick={() => toggleBlockedDate(dayNum)}
                              className={`aspect-square py-2 rounded-xl font-bold transition-all relative flex flex-col items-center justify-center ${
                                isBlocked
                                  ? "bg-error/15 text-error border border-error/30 hover:bg-error/25"
                                  : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-outline-variant/10"
                              }`}
                            >
                              <span>{dayNum}</span>
                              {isBlocked && (
                                <span className="absolute bottom-1 w-1.5 h-1.5 bg-error rounded-full" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Dates indisponibles ({blockedDates.length})</span>
                      <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto p-2 bg-surface-container-low/40 rounded-xl border border-outline-variant/10">
                        {blockedDates.sort().map((dateStr: string) => {
                          const [y, m, d] = dateStr.split("-");
                          return (
                            <div key={dateStr} className="flex items-center gap-1 bg-error-container text-on-error-container text-[11px] font-bold px-2.5 py-1 rounded-full border border-error/15">
                              <span>{`${d}/${m}/${y}`}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAccommodation({
                                    ...editingAccommodation,
                                    blocked_dates: blockedDates.filter((d: string) => d !== dateStr)
                                  });
                                }}
                                className="hover:text-error font-bold text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                        {blockedDates.length === 0 && (
                          <span className="text-xs text-outline italic p-2">Aucune date bloquée actuellement.</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/20 shrink-0">
              <button
                type="button"
                onClick={() => setShowAccommodationModal(false)}
                className="px-4 py-2.5 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-xl hover:bg-surface-container-highest transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveAccommodationLocal}
                className="px-6 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all"
              >
                Enregistrer l'hébergement
              </button>
            </div>

          </div>
        </div>
      )}

      {showHeroMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs" onClick={() => setShowHeroMediaPicker(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 border border-outline-variant/20">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
                <ImageIcon className="h-5 w-5" /> Sélectionner un arrière-plan
              </h3>
              <button
                onClick={() => setShowHeroMediaPicker(false)}
                className="p-1 hover:bg-surface-container rounded-lg text-outline-variant hover:text-on-surface-variant transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">
              Sélectionnez un visuel ou une vidéo de votre médiathèque pour l&apos;appliquer à la section Hero.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[350px] overflow-y-auto pr-2">
              {mediaList.map((media) => {
                const isVideo = media.url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || media.type?.startsWith("video/");
                return (
                  <div
                    key={media.id}
                    onClick={() => {
                      setHeroMediaUrl(media.url);
                      setHeroMediaType(isVideo ? "video" : "image");
                      setShowHeroMediaPicker(false);
                      showToast("Média d&apos;arrière-plan sélectionné !");
                    }}
                    className="group relative cursor-pointer border border-outline-variant/20 hover:border-primary rounded-xl overflow-hidden aspect-square bg-surface-container-low"
                  >
                    {isVideo ? (
                      <video src={media.url} className="w-full h-full object-cover pointer-events-none" muted />
                    ) : (
                      <img src={media.url} alt={media.name} className="w-full h-full object-cover pointer-events-none" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-[10px] font-bold bg-primary px-3 py-1.5 rounded-lg">Sélectionner</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-2 py-1 truncate">
                      {media.name}
                    </div>
                  </div>
                );
              })}
              {mediaList.length === 0 && (
                <div className="col-span-full py-10 text-center text-outline">
                  <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold">Votre médiathèque est vide.</p>
                  <p className="text-[10px] mt-1">Importez d&apos;abord des images dans l&apos;onglet &quot;Médiathèque&quot;.</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-4 border-t border-outline-variant/10">
              <button
                onClick={() => setShowHeroMediaPicker(false)}
                className="px-4 py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-highest"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon fallbacks to prevent loading errors
function ShipIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 21h20" />
      <path d="M19.3 14.8C21.1 13.5 22 11.7 22 9.5c0-3.3-2.3-6-5.5-6-1.5 0-3 .6-4 1.7-1.1-1.1-2.5-1.7-4-1.7C5.3 3.5 3 6.2 3 9.5c0 2.2.9 4 2.7 5.3L12 21l7.3-6.2z" />
    </svg>
  );
}

function MapPinIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function HomeIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
