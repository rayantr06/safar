"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search, Phone, Mail, Anchor, ShieldCheck, MapPin, Users, Send,
  Plus, Key, Edit2, Trash2, ToggleLeft, ToggleRight, X, Save, Lock, Landmark, Check
} from "lucide-react";
import { formatPriceDA, formatPhone } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { validatePartner, savePartnerCommissionSettings } from "@/lib/actions/experiences";
import {
  createPartner,
  updatePartner,
  resetPartnerPassword,
  disablePartnerAccount,
  addPartnerEquipment,
  updatePartnerEquipment,
  deletePartnerEquipment,
  togglePartnerEquipmentStatus
} from "@/lib/actions/admin-partners";

interface PartnersListAdminProps {
  initialPartners: any[];
}

export function PartnersListAdmin({ initialPartners }: PartnersListAdminProps) {
  const [partners, setPartners] = useState(initialPartners);
  const [selectedPartner, setSelectedPartner] = useState<any | null>(initialPartners[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Right sidebar tab state
  const [activeTab, setActiveTab] = useState<"profile" | "fleet" | "finance">("profile");

  // Commission Form State
  const [commRate, setCommRate] = useState<number>(initialPartners[0]?.commission_rate || 15);
  const [commType, setCommType] = useState<"percentage" | "fixed">(initialPartners[0]?.commission_type || "percentage");
  const [commEffectiveDate, setCommEffectiveDate] = useState<string>(
    initialPartners[0]?.commission_effective_date || new Date().toISOString().split("T")[0]
  );
  const [commActive, setCommActive] = useState<boolean>(
    initialPartners[0]?.commission_status === "active" || initialPartners[0]?.status === "active"
  );
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  // Modals & Forms State
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    name: "",
    company_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    location: "Port de Béjaïa",
    notes: "",
    password: "password123",
    commission_type: "percentage" as "percentage" | "fixed",
    commission_value: 15,
  });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [editingEquip, setEditingEquip] = useState<any | null>(null);
  const [equipForm, setEquipForm] = useState({
    name: "",
    type: "private" as "private" | "shared" | "jetski" | "kayak" | "paddle",
    description: "",
    main_image_url: "",
    capacity: 6,
    price_total: 20000, // In DA
    duration_minutes: 120,
    location: "Port de Béjaïa",
    available_services: "",
    quantity: 1,
  });

  // Re-sync forms when selecting a new partner
  const handleSelectPartner = (partner: any) => {
    setSelectedPartner(partner);
    setCommRate(partner.commission_rate || 15);
    setCommType(partner.commission_type || "percentage");
    setCommEffectiveDate(partner.commission_effective_date || new Date().toISOString().split("T")[0]);
    setCommActive(partner.commission_status === "active" || partner.status === "active");
  };

  // Dynamic metrics calculations
  const activeCount = partners.filter((p) => p.status === "active").length;
  const pendingCount = partners.filter((p) => p.status === "pending").length;
  const boatsCount = partners.reduce((sum, p) => sum + (p.boats || 0), 0);
  const totalRevenue = partners.reduce((sum, p) => sum + (p.total_revenue || 0), 0);

  // 1. Create/Update Partner
  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      if (isEditingPartner && selectedPartner) {
        const res = await updatePartner(selectedPartner.id, {
          name: partnerForm.name,
          company_name: partnerForm.company_name,
          phone: partnerForm.phone,
          whatsapp: partnerForm.whatsapp,
          email: partnerForm.email,
          address: partnerForm.address,
          location: partnerForm.location,
          notes: partnerForm.notes,
          commission_type: partnerForm.commission_type,
          commission_value: Number(partnerForm.commission_value),
        });

        if (res.success) {
          const updatedPartner = {
            ...selectedPartner,
            name: partnerForm.name,
            company_name: partnerForm.company_name,
            phone: partnerForm.phone,
            whatsapp: partnerForm.whatsapp || partnerForm.phone,
            email: partnerForm.email,
            address: partnerForm.address,
            location: partnerForm.location,
            notes: partnerForm.notes,
            commission_type: partnerForm.commission_type,
            commission_rate: Number(partnerForm.commission_value),
          };

          setPartners((prev) =>
            prev.map((p) => (p.id === selectedPartner.id ? updatedPartner : p))
          );
          setSelectedPartner(updatedPartner);
          setIsPartnerModalOpen(false);
          alert("Partenaire mis à jour avec succès !");
        } else {
          alert("Erreur : " + res.error);
        }
      } else {
        const res = await createPartner(partnerForm);
        if (res.success && res.partnerId) {
          const newPartner = {
            id: res.partnerId,
            name: partnerForm.name,
            company_name: partnerForm.company_name || "",
            phone: partnerForm.phone,
            whatsapp: partnerForm.whatsapp || partnerForm.phone,
            email: partnerForm.email,
            address: partnerForm.address || "",
            location: partnerForm.location || "Port de Béjaïa",
            notes: partnerForm.notes || "",
            commission_type: partnerForm.commission_type,
            commission_rate: Number(partnerForm.commission_value),
            status: "active",
            joined: "Aujourd'hui",
            boats: 0,
            boatsList: [],
            total_revenue: 0,
            safar_revenue: 0,
            safar_commissions: 0,
            direct_revenue: 0,
          };

          setPartners((prev) => [...prev, newPartner]);
          setSelectedPartner(newPartner);
          setIsPartnerModalOpen(false);
          alert("Partenaire et compte de connexion créés avec succès !");
        } else {
          alert("Erreur : " + res.error);
        }
      }
    } catch (err: any) {
      alert("Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // 2. Validate Partner Request
  const handleValidatePartner = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "active" } : p))
    );
    if (selectedPartner && selectedPartner.id === id) {
      setSelectedPartner((prev: any) => ({ ...prev, status: "active" }));
    }

    try {
      await validatePartner(id, "active");
    } catch (err) {
      console.error("Failed to validate partner:", err);
      setPartners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "pending" } : p))
      );
      if (selectedPartner && selectedPartner.id === id) {
        setSelectedPartner((prev: any) => ({ ...prev, status: "pending" }));
      }
    }
  };

  // 3. Reset Partner Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner || !newPassword) return;
    setSaveLoading(true);
    try {
      const res = await resetPartnerPassword(selectedPartner.id, newPassword);
      if (res.success) {
        setIsPasswordModalOpen(false);
        setNewPassword("");
        alert("Mot de passe réinitialisé avec succès !");
      } else {
        alert("Erreur : " + res.error);
      }
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // 4. Toggle Partner Account (Disable/Enable)
  const handleToggleAccountStatus = async (isDisabled: boolean) => {
    if (!selectedPartner) return;
    try {
      const res = await disablePartnerAccount(selectedPartner.id, isDisabled);
      if (res.success) {
        const nextStatus = isDisabled ? "disabled" : "active";
        setPartners((prev) =>
          prev.map((p) => (p.id === selectedPartner.id ? { ...p, is_disabled: isDisabled, status: nextStatus } : p))
        );
        setSelectedPartner((prev: any) => ({ ...prev, is_disabled: isDisabled, status: nextStatus }));
      } else {
        alert("Erreur : " + res.error);
      }
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  // 5. Save Partner Commission from Sidebar
  const handleSaveCommission = async () => {
    if (!selectedPartner) return;
    setSaveLoading(true);
    try {
      const res = await updatePartner(selectedPartner.id, {
        name: selectedPartner.name,
        company_name: selectedPartner.company_name,
        phone: selectedPartner.phone,
        whatsapp: selectedPartner.whatsapp,
        email: selectedPartner.email,
        address: selectedPartner.address,
        location: selectedPartner.location,
        notes: selectedPartner.notes,
        commission_type: commType,
        commission_value: Number(commRate),
        status: commActive ? "active" : "disabled",
      });

      if (res.success) {
        const nextStatus = commActive ? "active" : "disabled";
        const updated = {
          ...selectedPartner,
          commission_rate: Number(commRate),
          commission_type: commType,
          commission_status: commActive ? "active" : "inactive",
          status: nextStatus,
          is_disabled: !commActive,
          commission_last_modified: new Date().toISOString()
        };

        setPartners((prev) =>
          prev.map((p) => (p.id === selectedPartner.id ? updated : p))
        );
        setSelectedPartner(updated);
        alert("Paramètres de commission mis à jour avec succès !");
      } else {
        alert("Erreur : " + res.error);
      }
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // 6. Add/Edit Equipment
  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    setSaveLoading(true);
    try {
      const payload = {
        name: equipForm.name,
        type: equipForm.type,
        description: equipForm.description,
        main_image_url: equipForm.main_image_url || undefined,
        capacity: Number(equipForm.capacity),
        price_total: Math.round(Number(equipForm.price_total) * 100), // convert to centimes
        duration_minutes: Number(equipForm.duration_minutes),
        location: equipForm.location,
        available_services: equipForm.available_services,
        quantity: Number(equipForm.quantity)
      };

      if (editingEquip) {
        const res = await updatePartnerEquipment(selectedPartner.id, editingEquip.id, payload);
        if (res.success) {
          const updatedEquip = {
            ...editingEquip,
            ...payload
          };

          const newBoatsList = (selectedPartner.boatsList || []).map((b: any) =>
            b.id === editingEquip.id ? updatedEquip : b
          );

          const updatedPartner = {
            ...selectedPartner,
            boatsList: newBoatsList,
            boats: newBoatsList.length
          };

          setPartners((prev) =>
            prev.map((p) => (p.id === selectedPartner.id ? updatedPartner : p))
          );
          setSelectedPartner(updatedPartner);
          setIsEquipModalOpen(false);
          setEditingEquip(null);
          alert("Équipement mis à jour avec succès !");
        } else {
          alert("Erreur : " + res.error);
        }
      } else {
        const res = await addPartnerEquipment(selectedPartner.id, payload);
        if (res.success && res.boatId) {
          const newBoat = {
            id: res.boatId,
            provider_id: selectedPartner.id,
            ...payload,
            is_active: true
          };

          const newBoatsList = [...(selectedPartner.boatsList || []), newBoat];
          const updatedPartner = {
            ...selectedPartner,
            boatsList: newBoatsList,
            boats: newBoatsList.length
          };

          setPartners((prev) =>
            prev.map((p) => (p.id === selectedPartner.id ? updatedPartner : p))
          );
          setSelectedPartner(updatedPartner);
          setIsEquipModalOpen(false);
          alert("Nouvel équipement créé et associé !");
        } else {
          alert("Erreur : " + res.error);
        }
      }
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // 7. Delete Equipment
  const handleDeleteEquipment = async (equipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedPartner || !confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) return;
    try {
      const res = await deletePartnerEquipment(selectedPartner.id, equipId);
      if (res.success) {
        const newBoatsList = (selectedPartner.boatsList || []).filter((b: any) => b.id !== equipId);
        const updatedPartner = {
          ...selectedPartner,
          boatsList: newBoatsList,
          boats: newBoatsList.length
        };
        setPartners((prev) =>
          prev.map((p) => (p.id === selectedPartner.id ? updatedPartner : p))
        );
        setSelectedPartner(updatedPartner);
        alert("Équipement supprimé avec succès.");
      } else {
        alert("Erreur : " + res.error);
      }
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  // 8. Toggle Equipment Active Status
  const handleToggleEquipmentActive = async (equipId: string, isCurrentlyActive: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetStatus = !isCurrentlyActive;
    try {
      const res = await togglePartnerEquipmentStatus(equipId, targetStatus);
      if (res.success) {
        const newBoatsList = (selectedPartner.boatsList || []).map((b: any) =>
          b.id === equipId ? { ...b, is_active: targetStatus } : b
        );
        const updatedPartner = {
          ...selectedPartner,
          boatsList: newBoatsList
        };
        setPartners((prev) =>
          prev.map((p) => (p.id === selectedPartner.id ? updatedPartner : p))
        );
        setSelectedPartner(updatedPartner);
      } else {
        alert("Erreur : " + res.error);
      }
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.phone?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && partner.status === "active") ||
      (statusFilter === "Pending" && partner.status === "pending") ||
      (statusFilter === "Disabled" && partner.status === "disabled");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Partners */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-primary/10 rounded-lg text-lg">👥</span>
            <span className="text-success text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">En ligne</span>
          </div>
          <div className="mt-4">
            <p className="text-on-surface-variant text-xs font-bold uppercase">Partenaires Actifs</p>
            <p className="font-mono font-bold text-headline-sm text-on-surface">{activeCount} <span className="text-xs font-normal text-outline">propriétaires</span></p>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-tertiary-fixed p-6 rounded-3xl border border-tertiary-fixed-dim/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-on-tertiary-fixed-variant/10 text-on-tertiary-fixed-variant rounded-lg text-lg">⏳</span>
          </div>
          <div className="mt-4">
            <p className="text-on-tertiary-fixed-variant text-xs font-bold uppercase">En attente de validation</p>
            <p className="font-mono font-bold text-headline-sm text-on-tertiary-fixed">{pendingCount} <span className="text-xs font-normal text-on-tertiary-fixed-variant/70 font-sans">demandes</span></p>
          </div>
        </div>

        {/* Active Boats */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-secondary/10 text-secondary rounded-lg text-lg">⛵</span>
          </div>
          <div className="mt-4">
            <p className="text-on-surface-variant text-xs font-bold uppercase">Bateaux Actifs</p>
            <p className="font-mono font-bold text-headline-sm text-on-surface">{boatsCount} <span className="text-xs font-normal text-outline">navires</span></p>
          </div>
        </div>

        {/* Partner Earnings */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-primary/10 text-primary rounded-lg text-lg">💰</span>
          </div>
          <div className="mt-4">
            <p className="text-on-surface-variant text-xs font-bold uppercase">CA Total Partenaires</p>
            <p className="font-mono font-bold text-headline-sm text-on-surface">{formatPriceDA(totalRevenue * 100)}</p>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        {/* Left Side: Filter and List */}
        <div className="flex-grow flex flex-col border-r border-outline-variant/20 min-w-0">
          {/* Filter Bar */}
          <div className="p-5 border-b border-outline-variant/10 bg-surface-container-lowest/50 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-xl border border-outline-variant/30 text-xs">
              <span>Statut:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none focus:ring-0 p-0 font-bold"
              >
                <option value="All">Tous</option>
                <option value="Active">Actifs</option>
                <option value="Pending">En attente</option>
                <option value="Disabled">Désactivés</option>
              </select>
            </div>
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="pl-9 h-8 border-none bg-surface-container-low rounded-xl text-xs"
              />
            </div>
            <div className="text-xs text-outline font-bold">
              {filteredPartners.length} résultats
            </div>
            <div className="sm:ml-auto">
              <Button
                onClick={() => {
                  setPartnerForm({
                    name: "",
                    company_name: "",
                    phone: "",
                    whatsapp: "",
                    email: "",
                    address: "",
                    location: "Port de Béjaïa",
                    notes: "",
                    password: "password123",
                    commission_type: "percentage",
                    commission_value: 15,
                  });
                  setIsEditingPartner(false);
                  setIsPartnerModalOpen(true);
                }}
                className="bg-primary text-white flex items-center gap-1 hover:opacity-90 transition-all font-bold text-xs"
                shape="pill"
              >
                <Plus className="h-4 w-4" /> Ajouter un partenaire
              </Button>
            </div>
          </div>

          {/* List Table */}
          <div className="flex-grow overflow-x-auto overflow-y-auto max-h-[600px]">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 bg-surface-container-high/50 backdrop-blur-sm z-10 text-[10px] font-bold uppercase text-on-surface-variant">
                <tr>
                  <th className="p-4 pl-6 border-b border-outline-variant/20">Partenaire</th>
                  <th className="p-4 border-b border-outline-variant/20 text-center">Flotte</th>
                  <th className="p-4 border-b border-outline-variant/20 text-right">CA Généré</th>
                  <th className="p-4 border-b border-outline-variant/20 text-center">Statut</th>
                  <th className="p-4 pr-6 border-b border-outline-variant/20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-xs">
                {filteredPartners.map((partner) => {
                  const isSelected = selectedPartner?.id === partner.id;
                  const isAccountDisabled = partner.is_disabled || partner.status === "disabled";
                  return (
                    <tr
                      key={partner.id}
                      onClick={() => handleSelectPartner(partner)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-secondary-container/15 font-bold" : "hover:bg-primary/[0.02]"
                      }`}
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold shrink-0">
                            {partner.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-on-surface truncate">{partner.name}</p>
                            <p className="text-[10px] text-on-surface-variant">{formatPhone(partner.phone)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono">{partner.boats} equip.</td>
                      <td className="p-4 text-right font-mono text-primary font-bold">
                        {formatPriceDA(partner.total_revenue * 100)}
                      </td>
                      <td className="p-4 text-center">
                        {isAccountDisabled ? (
                          <Badge variant="danger">Désactivé</Badge>
                        ) : partner.status === "active" ? (
                          <Badge variant="success">Actif</Badge>
                        ) : (
                          <Badge variant="warning">En attente</Badge>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          {partner.status === "pending" && (
                            <Button
                              size="sm"
                              shape="pill"
                              className="bg-success hover:bg-success/90 text-white text-[10px] h-7 px-3"
                              onClick={(e) => handleValidatePartner(partner.id, e)}
                            >
                              Valider
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            shape="pill"
                            className="text-[10px] h-7 px-3"
                            onClick={() => handleSelectPartner(partner)}
                          >
                            Détails
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Profile Detail Panel with Tabs */}
        {selectedPartner && (
          <aside className="w-full lg:w-96 bg-surface-container-lowest border-l border-outline-variant/20 flex flex-col justify-between shrink-0">
            {/* Header info */}
            <div className="p-6 border-b border-outline-variant/20 text-center relative">
              <div className="relative w-16 h-16 mx-auto mb-3 bg-primary-fixed rounded-full flex items-center justify-center text-primary font-bold text-xl">
                {selectedPartner.name?.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-bold text-md text-on-surface truncate">{selectedPartner.name}</h3>
              <p className="text-[10px] text-on-surface-variant flex items-center justify-center gap-1 mt-1 font-semibold">
                <MapPin className="h-3 w-3 text-primary" /> {selectedPartner.location || "Port de Béjaïa"}
              </p>

              {/* Navigation tabs */}
              <div className="flex mt-6 bg-surface-container rounded-lg p-1 text-[10px] font-bold">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex-1 py-1.5 rounded-md transition-all uppercase tracking-wider ${
                    activeTab === "profile" ? "bg-white text-primary shadow-xs" : "text-outline hover:text-on-surface"
                  }`}
                >
                  Profil
                </button>
                <button
                  onClick={() => setActiveTab("fleet")}
                  className={`flex-1 py-1.5 rounded-md transition-all uppercase tracking-wider ${
                    activeTab === "fleet" ? "bg-white text-primary shadow-xs" : "text-outline hover:text-on-surface"
                  }`}
                >
                  Flotte ({selectedPartner.boatsList?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("finance")}
                  className={`flex-1 py-1.5 rounded-md transition-all uppercase tracking-wider ${
                    activeTab === "finance" ? "bg-white text-primary shadow-xs" : "text-outline hover:text-on-surface"
                  }`}
                >
                  Finances
                </button>
              </div>
            </div>

            {/* Scrollable tab contents */}
            <div className="flex-1 overflow-y-auto max-h-[500px] p-6 space-y-6">
              
              {/* Tab 1: Profile & Credentials */}
              {activeTab === "profile" && (
                <div className="space-y-5 text-xs">
                  <div>
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Informations Générales</h4>
                    <div className="bg-surface p-4 rounded-2xl border border-outline-variant/30 space-y-3">
                      {selectedPartner.company_name && (
                        <div className="flex justify-between py-1 border-b border-outline-variant/10">
                          <span className="text-outline">Entreprise</span>
                          <span className="font-bold">{selectedPartner.company_name}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1 border-b border-outline-variant/10">
                        <span className="text-outline">Téléphone</span>
                        <span className="font-mono font-bold">{formatPhone(selectedPartner.phone)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-outline-variant/10">
                        <span className="text-outline">WhatsApp</span>
                        <span className="font-mono font-bold">{formatPhone(selectedPartner.whatsapp || selectedPartner.phone)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-outline-variant/10">
                        <span className="text-outline">E-mail</span>
                        <span className="font-bold truncate max-w-[180px]">{selectedPartner.email}</span>
                      </div>
                      {selectedPartner.address && (
                        <div className="flex flex-col py-1">
                          <span className="text-outline mb-1">Adresse</span>
                          <span className="font-bold">{selectedPartner.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedPartner.notes && (
                    <div>
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Notes</h4>
                      <p className="bg-surface p-3 rounded-xl border border-outline-variant/20 text-on-surface-variant italic leading-relaxed">
                        {selectedPartner.notes}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Compte de Connexion</h4>
                    <div className="bg-surface p-4 rounded-2xl border border-outline-variant/30 space-y-4">
                      {/* Active / Disabled Status Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-on-surface">Statut du compte</p>
                          <p className="text-[10px] text-on-surface-variant">Autoriser l&apos;accès plateforme</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleAccountStatus(!selectedPartner.is_disabled)}
                          className="p-1 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant"
                        >
                          {!selectedPartner.is_disabled ? (
                            <ToggleRight className="h-8 w-8 text-success" />
                          ) : (
                            <ToggleLeft className="h-8 w-8 text-on-surface-variant opacity-50" />
                          )}
                        </button>
                      </div>

                      <div className="pt-2 border-t border-outline-variant/10 flex flex-wrap gap-2">
                        <Button
                          onClick={() => {
                            setPartnerForm({
                              name: selectedPartner.name || "",
                              company_name: selectedPartner.company_name || "",
                              phone: selectedPartner.phone || "",
                              whatsapp: selectedPartner.whatsapp || "",
                              email: selectedPartner.email || "",
                              address: selectedPartner.address || "",
                              location: selectedPartner.location || "Port de Béjaïa",
                              notes: selectedPartner.notes || "",
                              password: "", // hide password in edit mode
                              commission_type: selectedPartner.commission_type || "percentage",
                              commission_value: selectedPartner.commission_rate || 15,
                            });
                            setIsEditingPartner(true);
                            setIsPartnerModalOpen(true);
                          }}
                          variant="outline"
                          shape="pill"
                          className="flex-1 text-[10px] font-bold h-8"
                        >
                          Modifier profil
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setNewPassword("");
                            setIsPasswordModalOpen(true);
                          }}
                          variant="outline"
                          shape="pill"
                          className="flex-1 text-[10px] font-bold h-8 flex items-center justify-center gap-1"
                        >
                          <Key className="h-3 w-3" /> Clé Accès
                        </Button>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${(selectedPartner.whatsapp || selectedPartner.phone).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-green-600/10 active:scale-95 transition-all text-center"
                  >
                    💬 Ouvrir WhatsApp Partenaire
                  </a>
                </div>
              )}

              {/* Tab 2: Fleet / Equipment Management */}
              {activeTab === "fleet" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Flotte Enregistrée</h4>
                    <Button
                      onClick={() => {
                        setEquipForm({
                          name: "",
                          type: "private",
                          description: "",
                          main_image_url: "",
                          capacity: 6,
                          price_total: 20000,
                          duration_minutes: 120,
                          location: selectedPartner.location || "Port de Béjaïa",
                          available_services: "",
                          quantity: 1,
                        });
                        setEditingEquip(null);
                        setIsEquipModalOpen(true);
                      }}
                      size="sm"
                      shape="pill"
                      className="bg-primary-container text-on-primary-container hover:opacity-90 font-bold text-[10px] h-7 px-3"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Ajouter
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {selectedPartner.boatsList && selectedPartner.boatsList.length > 0 ? (
                      selectedPartner.boatsList.map((boat: any) => {
                        const isBoatActive = boat.is_active !== false;
                        return (
                          <div key={boat.id} className="bg-surface p-3.5 rounded-2xl border border-outline-variant/30 relative flex flex-col gap-3 group">
                            
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-lg shrink-0">
                                {boat.type === "jetski" ? "🏍️" : "⛵"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                  <p className="font-bold text-on-surface truncate text-xs">{boat.name}</p>
                                  <button
                                    onClick={(e) => handleToggleEquipmentActive(boat.id, isBoatActive, e)}
                                    className="text-on-surface-variant hover:text-primary transition-colors"
                                  >
                                    {isBoatActive ? (
                                      <ToggleRight className="h-5 w-5 text-success" />
                                    ) : (
                                      <ToggleLeft className="h-5 w-5 text-on-surface-variant opacity-60" />
                                    )}
                                  </button>
                                </div>
                                <p className="text-[10px] text-outline font-bold uppercase tracking-wider mt-0.5">
                                  {boat.type === "private" ? "Bateau Privé" :
                                   boat.type === "shared" ? "Bateau Partagé" :
                                   boat.type === "jetski" ? `Jet Ski (Qté: ${boat.quantity || 1})` : boat.type}
                                </p>
                              </div>
                            </div>

                            {boat.description && (
                              <p className="text-[10px] text-on-surface-variant leading-relaxed line-clamp-2 italic">
                                {boat.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-bold border-t border-outline-variant/10 pt-2.5">
                              <div>
                                <span className="font-mono text-primary">{formatPriceDA(boat.price_total)}</span>
                                <span className="text-outline font-normal"> / {boat.duration_minutes / 60}h</span>
                              </div>
                              <div>
                                👥 {boat.capacity} voyageurs
                              </div>
                            </div>

                            {/* Equipment Actions */}
                            <div className="flex gap-1.5 justify-end pt-1 border-t border-outline-variant/10">
                              <button
                                onClick={() => {
                                  setEquipForm({
                                    name: boat.name || "",
                                    type: boat.type || "private",
                                    description: boat.description || "",
                                    main_image_url: boat.main_image_url || "",
                                    capacity: boat.capacity || 6,
                                    price_total: (boat.price_total || 0) / 100, // convert back to DA
                                    duration_minutes: boat.duration_minutes || 120,
                                    location: boat.location || "Port de Béjaïa",
                                    available_services: boat.available_services || "",
                                    quantity: boat.quantity || 1,
                                  });
                                  setEditingEquip(boat);
                                  setIsEquipModalOpen(true);
                                }}
                                className="text-[10px] font-bold text-outline hover:text-primary py-1 px-2.5 rounded-md hover:bg-surface-container flex items-center gap-1 transition-all"
                              >
                                <Edit2 className="h-3 w-3" /> Modifier
                              </button>
                              <button
                                onClick={(e) => handleDeleteEquipment(boat.id, e)}
                                className="text-[10px] font-bold text-outline hover:text-error py-1 px-2.5 rounded-md hover:bg-error-container/20 flex items-center gap-1 transition-all"
                              >
                                <Trash2 className="h-3 w-3" /> Supprimer
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-surface p-4 rounded-2xl border border-dashed border-outline-variant/40 text-center text-outline">
                        <Anchor className="h-6 w-6 mx-auto mb-2 opacity-30" />
                        <p className="text-[10px]">Aucun équipement enregistré.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Financial breakdown & commission configuration */}
              {activeTab === "finance" && (
                <div className="space-y-6 text-xs">
                  <div>
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Calcul des Gains</h4>
                    <div className="bg-surface p-4 rounded-2xl border border-outline-variant/30 space-y-3.5">
                      <div className="flex justify-between py-0.5 border-b border-outline-variant/10">
                        <span className="text-outline">CA Réservations Safar DZ (Brut)</span>
                        <span className="font-mono font-bold">{formatPriceDA((selectedPartner.safar_revenue || 0) * 100)}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-outline-variant/10 text-tertiary font-bold">
                        <span>Commissions Prélevées Safar</span>
                        <span className="font-mono">{formatPriceDA((selectedPartner.safar_commissions || 0) * 100)}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-outline-variant/10">
                        <span className="text-outline">CA Réservations Directes</span>
                        <span className="font-mono font-bold">{formatPriceDA((selectedPartner.direct_revenue || 0) * 100)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-primary border-t border-outline-variant/30 pt-3 text-sm">
                        <span>Revenu Net Partenaire</span>
                        <span className="font-mono">{formatPriceDA(((selectedPartner.total_revenue || 0) - (selectedPartner.safar_commissions || 0)) * 100)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Configuration de la Commission</h4>
                    <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 space-y-4">
                      
                      {/* Commission Type Selector */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-on-surface-variant uppercase">Type de Commission</label>
                        <select
                          value={commType}
                          onChange={(e) => setCommType(e.target.value as "percentage" | "fixed")}
                          className="w-full bg-white border border-outline-variant/30 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option value="percentage">Pourcentage (%)</option>
                          <option value="fixed">Montant Fixe (DA)</option>
                        </select>
                      </div>

                      {/* Commission value */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-on-surface-variant uppercase">
                          {commType === "percentage" ? "Taux de Commission (%)" : "Valeur fixe de Commission (DA)"}
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            value={commRate}
                            onChange={(e) => setCommRate(Number(e.target.value))}
                            className="h-9 bg-white rounded-xl text-xs font-bold font-mono pl-3 pr-10"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-outline font-bold">
                            {commType === "percentage" ? "%" : "DA"}
                          </span>
                        </div>
                      </div>

                      {/* Date d'effet */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-on-surface-variant uppercase">Date d&apos;effet</label>
                        <Input
                          type="date"
                          value={commEffectiveDate}
                          onChange={(e) => setCommEffectiveDate(e.target.value)}
                          className="h-9 bg-white rounded-xl text-xs font-mono font-bold"
                        />
                      </div>

                      <div className="text-[9px] text-outline space-y-0.5 border-t border-outline-variant/10 pt-3">
                        <p>Commission actuelle : <span className="font-bold text-on-surface font-mono">{selectedPartner.commission_rate || 15}{selectedPartner.commission_type === "fixed" ? " DA" : "%"}</span></p>
                        <p>Dernière modification : <span className="font-mono text-on-surface font-semibold">{new Date(selectedPartner.commission_last_modified || Date.now()).toLocaleDateString("fr-FR")}</span></p>
                      </div>

                      <Button
                        onClick={handleSaveCommission}
                        disabled={saveLoading}
                        className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-xs h-9 mt-2"
                        shape="pill"
                      >
                        {saveLoading ? "Sauvegarde..." : "Enregistrer la commission"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT PARTNER */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsPartnerModalOpen(false)} />
          
          <div className="bg-white rounded-3xl shadow-2xl border border-outline-variant/30 w-full max-w-xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3.5 mb-5">
              <h3 className="font-headline-sm text-lg font-bold text-primary">
                {isEditingPartner ? "Modifier les informations partenaire" : "Créer un profil partenaire"}
              </h3>
              <button onClick={() => setIsPartnerModalOpen(false)} className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Nom du Partenaire / Capitaine</label>
                  <Input
                    required
                    value={partnerForm.name}
                    onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                    placeholder="Ex: Capitaine Ahmed"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Nom de l&apos;entreprise (Optionnel)</label>
                  <Input
                    value={partnerForm.company_name}
                    onChange={(e) => setPartnerForm({ ...partnerForm, company_name: e.target.value })}
                    placeholder="Ex: Evasion Marine"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">E-mail de connexion</label>
                  <Input
                    required
                    type="email"
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    placeholder="Ex: ahmed@safar.dz"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Téléphone</label>
                  <Input
                    required
                    value={partnerForm.phone}
                    onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                    placeholder="Ex: 0550123456"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">WhatsApp</label>
                  <Input
                    value={partnerForm.whatsapp}
                    onChange={(e) => setPartnerForm({ ...partnerForm, whatsapp: e.target.value })}
                    placeholder="Ex: 0550123456"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Adresse</label>
                  <Input
                    value={partnerForm.address}
                    onChange={(e) => setPartnerForm({ ...partnerForm, address: e.target.value })}
                    placeholder="Ex: Boulevard de la Marine, Béjaïa"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Localisation principale</label>
                  <Input
                    value={partnerForm.location}
                    onChange={(e) => setPartnerForm({ ...partnerForm, location: e.target.value })}
                    placeholder="Ex: Port de Béjaïa"
                    className="h-10 rounded-xl"
                  />
                </div>

                {!isEditingPartner && (
                  <div className="flex flex-col gap-1.5 col-span-2 bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-2">
                    <p className="font-bold text-primary text-xs flex items-center gap-1.5 mb-2">
                      <Lock className="h-4 w-4" /> Identifiants de connexion initiale
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase">Mot de passe partenaire</label>
                      <Input
                        required
                        type="password"
                        value={partnerForm.password}
                        onChange={(e) => setPartnerForm({ ...partnerForm, password: e.target.value })}
                        placeholder="Créer un mot de passe"
                        className="h-9 bg-white rounded-xl"
                      />
                    </div>
                  </div>
                )}

                <div className="col-span-2 border-t border-outline-variant/10 pt-4 flex flex-col gap-3">
                  <p className="font-bold text-on-surface uppercase text-[10px] tracking-wider">Paramètres de Commission initiaux</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase">Type de commission</label>
                      <select
                        value={partnerForm.commission_type}
                        onChange={(e) => setPartnerForm({ ...partnerForm, commission_type: e.target.value as "percentage" | "fixed" })}
                        className="h-9 bg-surface-container rounded-xl border border-outline-variant/30 p-2 font-bold focus:ring-2 focus:ring-primary outline-none"
                      >
                        <option value="percentage">Pourcentage (%)</option>
                        <option value="fixed">Montant Fixe (DA)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase">Valeur commission</label>
                      <Input
                        required
                        type="number"
                        min={0}
                        value={partnerForm.commission_value}
                        onChange={(e) => setPartnerForm({ ...partnerForm, commission_value: Number(e.target.value) })}
                        className="h-9 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Notes particulières</label>
                  <textarea
                    value={partnerForm.notes}
                    onChange={(e) => setPartnerForm({ ...partnerForm, notes: e.target.value })}
                    placeholder="Écrire des détails sur le partenaire..."
                    rows={3}
                    className="w-full bg-white border border-outline-variant/40 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <Button
                  type="button"
                  variant="outline"
                  shape="pill"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="font-bold text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={saveLoading}
                  shape="pill"
                  className="bg-primary text-white font-bold text-xs px-6"
                >
                  {saveLoading ? "Enregistrement..." : "Enregistrer le partenaire"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PASSWORD RESET */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsPasswordModalOpen(false)} />
          
          <div className="bg-white rounded-3xl shadow-2xl border border-outline-variant/30 w-full max-w-sm relative z-10 flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3 mb-4">
              <h3 className="font-headline-sm text-sm font-bold text-primary">Réinitialiser le mot de passe</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Nouveau mot de passe</label>
                <Input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Saisir le nouveau mot de passe"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
                <Button
                  type="button"
                  variant="outline"
                  shape="pill"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="font-bold text-[10px] h-8"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={saveLoading}
                  shape="pill"
                  className="bg-primary text-white font-bold text-[10px] h-8 px-4"
                >
                  Modifier
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT EQUIPMENT (BOAT / JETSKI) */}
      {isEquipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => { setIsEquipModalOpen(false); setEditingEquip(null); }} />
          
          <div className="bg-white rounded-3xl shadow-2xl border border-outline-variant/30 w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-10 flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3.5 mb-5">
              <h3 className="font-headline-sm text-md font-bold text-primary">
                {editingEquip ? `Modifier ${editingEquip.name}` : "Ajouter un équipement flotte"}
              </h3>
              <button onClick={() => { setIsEquipModalOpen(false); setEditingEquip(null); }} className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Equipment Category Selection */}
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Type de flotte</label>
                  <select
                    value={equipForm.type}
                    onChange={(e) => setEquipForm({ ...equipForm, type: e.target.value as any })}
                    className="h-10 bg-surface-container rounded-xl border border-outline-variant/30 p-2 font-bold focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="private">Bateau (Sortie Privée)</option>
                    <option value="shared">Bateau (Sortie Partagée)</option>
                    <option value="jetski">Jet Ski</option>
                    <option value="kayak">Kayak</option>
                    <option value="paddle">Paddle Board</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Nom / Modèle</label>
                  <Input
                    required
                    value={equipForm.name}
                    onChange={(e) => setEquipForm({ ...equipForm, name: e.target.value })}
                    placeholder="Ex: Sirène de Béjaïa, SeaDoo Spark"
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Description</label>
                  <textarea
                    value={equipForm.description}
                    onChange={(e) => setEquipForm({ ...equipForm, description: e.target.value })}
                    placeholder="Description technique, caractéristiques de l'équipement..."
                    rows={3}
                    className="w-full bg-white border border-outline-variant/40 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Photo (URL de l&apos;image)</label>
                  <Input
                    value={equipForm.main_image_url}
                    onChange={(e) => setEquipForm({ ...equipForm, main_image_url: e.target.value })}
                    placeholder="Ex: https://photos.com/bateau.jpg"
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Capacité passagers</label>
                  <Input
                    required
                    type="number"
                    min={1}
                    value={equipForm.capacity}
                    onChange={(e) => setEquipForm({ ...equipForm, capacity: Number(e.target.value) })}
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Localisation d&apos;amarrage</label>
                  <Input
                    value={equipForm.location}
                    onChange={(e) => setEquipForm({ ...equipForm, location: e.target.value })}
                    placeholder="Ex: Port de Béjaïa"
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Tarif par défaut (DA)</label>
                  <Input
                    required
                    type="number"
                    min={1}
                    value={equipForm.price_total}
                    onChange={(e) => setEquipForm({ ...equipForm, price_total: Number(e.target.value) })}
                    className="h-10 rounded-xl font-bold font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">Durée standard (Minutes)</label>
                  <select
                    value={equipForm.duration_minutes}
                    onChange={(e) => setEquipForm({ ...equipForm, duration_minutes: Number(e.target.value) })}
                    className="h-10 bg-surface-container rounded-xl border border-outline-variant/30 p-2 font-bold focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={60}>1 Heure</option>
                    <option value={120}>2 Heures (Standard)</option>
                    <option value={180}>3 Heures</option>
                    <option value={240}>4 Heures</option>
                    <option value={480}>8 Heures (Journée)</option>
                  </select>
                </div>

                {/* Specific field: Jet Ski quantity */}
                {equipForm.type === "jetski" && (
                  <div className="flex flex-col gap-1.5 col-span-2 animate-in fade-in duration-200">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase">Quantité disponible</label>
                    <Input
                      required
                      type="number"
                      min={1}
                      value={equipForm.quantity}
                      onChange={(e) => setEquipForm({ ...equipForm, quantity: Number(e.target.value) })}
                      className="h-10 rounded-xl font-mono"
                    />
                  </div>
                )}

                {/* Specific field: Boat services */}
                {(equipForm.type === "private" || equipForm.type === "shared") && (
                  <div className="flex flex-col gap-1.5 col-span-2 animate-in fade-in duration-200">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase">Services Inclus (Séparés par virgules)</label>
                    <Input
                      value={equipForm.available_services}
                      onChange={(e) => setEquipForm({ ...equipForm, available_services: e.target.value })}
                      placeholder="Ex: Drinks, Captain, Life vests, Snorkeling gear"
                      className="h-10 rounded-xl"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <Button
                  type="button"
                  variant="outline"
                  shape="pill"
                  onClick={() => { setIsEquipModalOpen(false); setEditingEquip(null); }}
                  className="font-bold text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={saveLoading}
                  shape="pill"
                  className="bg-primary text-white font-bold text-xs px-6"
                >
                  {saveLoading ? "Sauvegarde..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
