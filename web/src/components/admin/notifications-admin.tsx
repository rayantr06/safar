"use client";

import { useState } from "react";
import { Bell, BellOff, Check, CheckCheck, Mail, MessageSquare, Settings, Trash2, X } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  updateNotificationSettings,
  type NotificationItem,
  type NotificationSettingsMap,
} from "@/lib/actions/notifications";

const EVENT_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  new_reservation: { label: "Nouvelle réservation", icon: "🎫", description: "Quand un client réserve une expérience" },
  cancellation: { label: "Annulation", icon: "❌", description: "Quand une réservation est annulée" },
  partner_request: { label: "Demande partenaire", icon: "📩", description: "Quand un partenaire fait une demande" },
  new_partner: { label: "Nouveau partenaire", icon: "🤝", description: "Quand un partenaire rejoint la plateforme" },
  payment_status: { label: "Statut paiement", icon: "💰", description: "Changements de statut de paiement" },
};

const TYPE_COLORS: Record<string, string> = {
  new_reservation: "bg-blue-100 text-blue-700",
  cancellation: "bg-red-100 text-red-700",
  partner_request: "bg-amber-100 text-amber-700",
  new_partner: "bg-green-100 text-green-700",
  payment_status: "bg-purple-100 text-purple-700",
};

export function NotificationsAdmin({
  initialNotifications,
  initialSettings,
}: {
  initialNotifications: NotificationItem[];
  initialSettings: NotificationSettingsMap;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState<"notifications" | "settings">("notifications");
  const [saving, setSaving] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function handleMarkRead(id: string) {
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }

  async function handleMarkAllRead() {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function handleDelete(id: string) {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function handleSaveSettings() {
    setSaving(true);
    try {
      await updateNotificationSettings(settings);
    } finally {
      setSaving(false);
    }
  }

  function toggleSetting(eventType: string, channel: "dashboard_enabled" | "email_enabled" | "whatsapp_enabled") {
    setSettings((prev) => ({
      ...prev,
      [eventType]: {
        ...prev[eventType],
        [channel]: !prev[eventType]?.[channel],
      },
    }));
  }

  function formatTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  }

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "notifications" ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <Bell className="h-4 w-4" />
          Notifications
          {unreadCount > 0 && (
            <span className="bg-error text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "settings" ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <Settings className="h-4 w-4" />
          Paramètres
        </button>
      </div>

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div>
          {notifications.length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout marquer comme lu
              </button>
            </div>
          )}

          {notifications.length === 0 ? (
            <EmptyState
              icon="🔔"
              title="Aucune notification"
              subtitle="Vous recevrez des notifications ici lorsque de nouvelles réservations ou événements se produisent."
            />
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const eventInfo = EVENT_LABELS[notif.type] || { label: notif.type, icon: "📌", description: "" };
                const colorClass = TYPE_COLORS[notif.type] || "bg-gray-100 text-gray-600";

                return (
                  <div
                    key={notif.id}
                    className={`bg-surface-container-lowest p-5 rounded-2xl border transition-all ${
                      notif.is_read
                        ? "border-outline-variant/10 opacity-70"
                        : "border-primary/20 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl flex-shrink-0 mt-0.5">
                          {eventInfo.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${colorClass}`}>
                              {eventInfo.label}
                            </span>
                            {!notif.is_read && (
                              <span className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-on-surface mb-1">{notif.title}</h4>
                          {notif.message && (
                            <p className="text-xs text-on-surface-variant">{notif.message}</p>
                          )}
                          <p className="text-[10px] text-outline mt-2 font-bold">{formatTimeAgo(notif.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notif.is_read && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
                            title="Marquer comme lu"
                          >
                            <Check className="h-4 w-4 text-primary" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="p-2 rounded-lg hover:bg-error/10 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-error" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/15">
            <h3 className="font-bold text-on-surface text-sm">Configuration des notifications</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Choisissez quelles notifications vous souhaitez recevoir et par quel canal.
            </p>
          </div>

          {/* Settings Grid */}
          <div className="divide-y divide-outline-variant/10">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container/50">
              <div className="col-span-5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Événement</div>
              <div className="col-span-2 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center justify-center gap-1">
                <Bell className="h-3 w-3" /> Dashboard
              </div>
              <div className="col-span-2 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center justify-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </div>
              <div className="col-span-3 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center justify-center gap-1">
                <MessageSquare className="h-3 w-3" /> WhatsApp
              </div>
            </div>

            {/* Rows */}
            {Object.entries(EVENT_LABELS).map(([eventType, info]) => {
              const s = settings[eventType] || { dashboard_enabled: true, email_enabled: false, whatsapp_enabled: false };
              return (
                <div key={eventType} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-container/30 transition-colors">
                  <div className="col-span-5">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{info.icon}</span>
                      <div>
                        <p className="font-bold text-xs text-on-surface">{info.label}</p>
                        <p className="text-[10px] text-on-surface-variant">{info.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <button
                      onClick={() => toggleSetting(eventType, "dashboard_enabled")}
                      className={`relative w-10 h-5 rounded-full transition-colors ${s.dashboard_enabled ? "bg-primary" : "bg-outline-variant"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.dashboard_enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <button
                      onClick={() => toggleSetting(eventType, "email_enabled")}
                      className={`relative w-10 h-5 rounded-full transition-colors ${s.email_enabled ? "bg-primary" : "bg-outline-variant"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.email_enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  <div className="col-span-3 flex justify-center items-center gap-2">
                    <button
                      onClick={() => toggleSetting(eventType, "whatsapp_enabled")}
                      className={`relative w-10 h-5 rounded-full transition-colors ${s.whatsapp_enabled ? "bg-primary" : "bg-outline-variant"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.whatsapp_enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                    <span className="text-[9px] text-outline font-bold">Bientôt</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save */}
          <div className="p-6 border-t border-outline-variant/15 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
