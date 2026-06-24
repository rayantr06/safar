"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, X, Edit2, Trash2, Eye, Users, BedDouble, Bath, MapPin, Star, ChevronDown } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { saveAccommodation, deleteAccommodation } from "@/lib/actions/website-cms";

const ACCOMMODATION_TYPES = [
  { value: "villa", label: "Villa", icon: "🏡" },
  { value: "appartement", label: "Appartement", icon: "🏢" },
  { value: "maison_hotes", label: "Maison d'hôtes", icon: "🏠" },
  { value: "hotel", label: "Hôtel", icon: "🏨" },
  { value: "studio", label: "Studio", icon: "🛏️" },
];

const DEFAULT_AMENITIES = [
  "Wi-Fi", "Climatisation", "Piscine", "Parking gratuit", "Cuisine équipée",
  "Vue sur mer", "Terrasse / Balcon", "Vue sur montagne", "Machine à laver",
  "Sèche-cheveux", "Télévision", "Fer à repasser", "Chauffage",
];

const EMPTY_FORM = {
  title: "", type: "villa", wilaya: "Béjaïa", city: "", address: "",
  short_description: "", description: "", price: 10000, promo_price: null as number | null,
  image_url: "", images: [] as string[], max_guests: 4, rooms_count: 1,
  beds_count: 1, bathrooms_count: 1, amenities: [] as string[],
  custom_amenities: [] as string[], booking_type: "whatsapp",
  whatsapp_phone: "+213 556 48 36 34", contact_phone: "", min_stay_nights: 1,
  is_active: true,
};

export function AccommodationsListAdmin({ initialAccommodations }: { initialAccommodations: any[] }) {
  const [accommodations, setAccommodations] = useState(initialAccommodations);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === "all" ? accommodations : accommodations.filter((a) => a.type === filter);

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(acc: any) {
    setForm({
      title: acc.title || "",
      type: acc.type || "villa",
      wilaya: acc.wilaya || "Béjaïa",
      city: acc.city || "",
      address: acc.address || "",
      short_description: acc.short_description || "",
      description: acc.description || "",
      price: acc.price || 10000,
      promo_price: acc.promo_price || null,
      image_url: acc.image_url || "",
      images: acc.images || [],
      max_guests: acc.max_guests || 4,
      rooms_count: acc.rooms_count || 1,
      beds_count: acc.beds_count || 1,
      bathrooms_count: acc.bathrooms_count || 1,
      amenities: acc.amenities || [],
      custom_amenities: acc.custom_amenities || [],
      booking_type: acc.booking_type || "whatsapp",
      whatsapp_phone: acc.whatsapp_phone || "",
      contact_phone: acc.contact_phone || "",
      min_stay_nights: acc.min_stay_nights || 1,
      is_active: acc.is_active !== false,
    });
    setEditingId(acc.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const accData = {
        ...form,
        id: editingId || `acc-${Date.now()}`,
        slug,
        location: `${form.city || ""}, ${form.wilaya}`.replace(/^, /, ""),
        currency: "DA",
        pricing_type: "night",
        availability: "Disponible",
        blocked_dates: [],
      };

      await saveAccommodation(editingId, accData);

      if (editingId) {
        setAccommodations((prev) => prev.map((a) => (a.id === editingId ? { ...a, ...accData } : a)));
      } else {
        setAccommodations((prev) => [...prev, accData]);
      }
      setShowForm(false);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet hébergement ?")) return;
    await deleteAccommodation(id);
    setAccommodations((prev) => prev.filter((a) => a.id !== id));
  }

  function addImage() {
    if (newImageUrl.trim()) {
      const imgs = [...form.images, newImageUrl.trim()];
      if (!form.image_url) {
        setForm({ ...form, images: imgs, image_url: newImageUrl.trim() });
      } else {
        setForm({ ...form, images: imgs });
      }
      setNewImageUrl("");
    }
  }

  function removeImage(idx: number) {
    const imgs = form.images.filter((_, i) => i !== idx);
    setForm({
      ...form,
      images: imgs,
      image_url: imgs[0] || "",
    });
  }

  function toggleAmenity(amenity: string) {
    const has = form.amenities.includes(amenity);
    setForm({
      ...form,
      amenities: has
        ? form.amenities.filter((a) => a !== amenity)
        : [...form.amenities, amenity],
    });
  }

  function addCustomAmenity() {
    if (newAmenity.trim() && !form.custom_amenities.includes(newAmenity.trim())) {
      setForm({ ...form, custom_amenities: [...form.custom_amenities, newAmenity.trim()] });
      setNewAmenity("");
    }
  }

  function formatPrice(p: number) {
    return new Intl.NumberFormat("fr-DZ").format(p) + " DA";
  }

  const typeInfo = (type: string) => ACCOMMODATION_TYPES.find((t) => t.value === type) || ACCOMMODATION_TYPES[0];

  return (
    <div>
      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === "all" ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
          >
            Tous ({accommodations.length})
          </button>
          {ACCOMMODATION_TYPES.map((t) => {
            const count = accommodations.filter((a) => a.type === t.value).length;
            return (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === t.value ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
              >
                {t.icon} {t.label} ({count})
              </button>
            );
          })}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Ajouter un hébergement
        </button>
      </div>

      {/* Accommodations Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🏠"
          title="Aucun hébergement"
          subtitle="Ajoutez vos villas, appartements et logements pour les proposer aux visiteurs."
          actionLabel="Ajouter un hébergement"
          onAction={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((acc) => {
            const ti = typeInfo(acc.type);
            return (
              <div
                key={acc.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] bg-surface-container">
                  {acc.image_url ? (
                    <Image src={acc.image_url} alt={acc.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-surface-container">
                      {ti.icon}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-on-surface">
                      {ti.icon} {ti.label}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${acc.is_active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {acc.is_active !== false ? "Actif" : "Inactif"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-sm text-on-surface mb-1 truncate">{acc.title}</h3>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-3">
                    <MapPin className="h-3 w-3" /> {acc.location || acc.city || "Béjaïa"}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-4">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {acc.max_guests}</span>
                    <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {acc.beds_count}</span>
                    <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {acc.bathrooms_count}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {acc.promo_price ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary text-sm">{formatPrice(acc.promo_price)}</span>
                          <span className="text-xs text-on-surface-variant line-through">{formatPrice(acc.price)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-primary text-sm">{formatPrice(acc.price)}</span>
                      )}
                      <span className="text-[10px] text-on-surface-variant"> / nuit</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(acc)}
                        className="p-2 rounded-lg bg-surface-container hover:bg-primary/10 transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="p-2 rounded-lg bg-surface-container hover:bg-error/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-error" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-8 px-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/20 w-full max-w-3xl mb-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/15">
              <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                {editingId ? "Modifier l'hébergement" : "Ajouter un hébergement"}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-2 rounded-xl hover:bg-surface-container transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Nom</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Ex: Villa Vue sur Mer - Boulimate"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {ACCOMMODATION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Wilaya</label>
                  <input
                    value={form.wilaya}
                    onChange={(e) => setForm({ ...form, wilaya: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Ville</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Ex: Boulimate"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Adresse</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Ex: Route Nationale 24"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Description courte</label>
                <input
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Résumé en une phrase"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Description complète</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="Description détaillée de l'hébergement"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Prix / nuit (DA)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Prix promo (DA)</label>
                  <input
                    type="number"
                    value={form.promo_price || ""}
                    onChange={(e) => setForm({ ...form, promo_price: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Optionnel"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Séjour minimum (nuits)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.min_stay_nights}
                    onChange={(e) => setForm({ ...form, min_stay_nights: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Capacité</label>
                  <input type="number" min={1} value={form.max_guests} onChange={(e) => setForm({ ...form, max_guests: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Chambres</label>
                  <input type="number" min={0} value={form.rooms_count} onChange={(e) => setForm({ ...form, rooms_count: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Lits</label>
                  <input type="number" min={0} value={form.beds_count} onChange={(e) => setForm({ ...form, beds_count: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">SDB</label>
                  <input type="number" min={0} value={form.bathrooms_count} onChange={(e) => setForm({ ...form, bathrooms_count: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Photos</label>
                <div className="flex gap-2 mb-3">
                  <input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="URL de l'image"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                  />
                  <button onClick={addImage} className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90">
                    Ajouter
                  </button>
                </div>
                {form.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                        <Image src={img} alt="" fill className="object-cover" />
                        {i === 0 && (
                          <div className="absolute top-0 left-0 bg-primary text-white text-[8px] px-1.5 py-0.5 rounded-br-lg font-bold">
                            Cover
                          </div>
                        )}
                        <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Équipements</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {DEFAULT_AMENITIES.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        form.amenities.includes(amenity)
                          ? "bg-primary text-white"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Équipement personnalisé"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomAmenity())}
                  />
                  <button onClick={addCustomAmenity} className="px-3 py-2 bg-secondary-container text-on-secondary-container rounded-xl text-xs font-bold">
                    +
                  </button>
                </div>
                {form.custom_amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.custom_amenities.map((a, i) => (
                      <span key={i} className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        {a}
                        <button onClick={() => setForm({ ...form, custom_amenities: form.custom_amenities.filter((_, j) => j !== i) })}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact & Booking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Type de réservation</label>
                  <select
                    value={form.booking_type}
                    onChange={(e) => setForm({ ...form, booking_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="whatsapp">WhatsApp uniquement</option>
                    <option value="platform">Plateforme Safar DZ</option>
                    <option value="both">Les deux</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Téléphone WhatsApp</label>
                  <input
                    value={form.whatsapp_phone}
                    onChange={(e) => setForm({ ...form, whatsapp_phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="+213 5XX XX XX XX"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3 p-4 bg-surface-container rounded-xl">
                <button
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? "bg-primary" : "bg-outline-variant"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
                <span className="text-xs font-bold text-on-surface">{form.is_active ? "Visible sur le site" : "Masqué"}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-outline-variant/15">
              <button
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
