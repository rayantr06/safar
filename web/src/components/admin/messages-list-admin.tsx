"use client";

import { useState } from "react";
import { Mail, Check, Archive, Trash2, Eye, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  updateContactMessageStatus,
  deleteContactMessage,
  type ContactMessage,
} from "@/lib/actions/contact";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Nouveau", color: "bg-blue-100 text-blue-700" },
  read: { label: "Lu", color: "bg-amber-100 text-amber-700" },
  replied: { label: "Répondu", color: "bg-green-100 text-green-700" },
  archived: { label: "Archivé", color: "bg-gray-100 text-gray-600" },
};

const SUBJECT_LABELS: Record<string, string> = {
  booking: "Réservation",
  partnership: "Partenariat",
  custom: "Sur mesure",
  other: "Autre",
};

export function MessagesListAdmin({
  initialMessages,
}: {
  initialMessages: ContactMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const newCount = messages.filter((m) => m.status === "new").length;

  const filtered =
    filter === "all" ? messages : messages.filter((m) => m.status === filter);

  async function handleMarkRead(id: string) {
    await updateContactMessageStatus(id, "read");
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "read" } : m))
    );
  }

  async function handleMarkReplied(id: string) {
    await updateContactMessageStatus(id, "replied");
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "replied" } : m))
    );
  }

  async function handleArchive(id: string) {
    await updateContactMessageStatus(id, "archived");
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "archived" } : m))
    );
  }

  async function handleDelete(id: string) {
    await deleteContactMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
    const msg = messages.find((m) => m.id === id);
    if (msg && msg.status === "new") {
      handleMarkRead(id);
    }
  }

  function formatTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days}j`;
    return new Date(dateStr).toLocaleDateString("fr-FR");
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "all", label: "Tous", count: messages.length },
          { key: "new", label: "Nouveaux", count: newCount },
          { key: "read", label: "Lus", count: messages.filter((m) => m.status === "read").length },
          { key: "replied", label: "Répondus", count: messages.filter((m) => m.status === "replied").length },
          { key: "archived", label: "Archivés", count: messages.filter((m) => m.status === "archived").length },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f.key
                ? "bg-primary text-white"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {f.label}
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
              filter === f.key ? "bg-white/20" : "bg-outline-variant/20"
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Messages */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="💬"
          title="Aucun message"
          subtitle={
            filter === "all"
              ? "Les messages du formulaire de contact apparaîtront ici."
              : `Aucun message avec le statut "${STATUS_LABELS[filter]?.label || filter}".`
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => {
            const statusInfo = STATUS_LABELS[msg.status] || STATUS_LABELS.new;
            const isExpanded = expandedId === msg.id;

            return (
              <div
                key={msg.id}
                className={`bg-surface-container-lowest rounded-2xl border transition-all ${
                  msg.status === "new"
                    ? "border-primary/20 shadow-sm"
                    : "border-outline-variant/10"
                }`}
              >
                {/* Header row */}
                <button
                  onClick={() => toggleExpand(msg.id)}
                  className="w-full p-5 flex items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      msg.status === "new"
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-container text-on-surface-variant"
                    }`}>
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        {msg.subject && (
                          <span className="px-2 py-0.5 rounded bg-surface-container text-[9px] font-bold text-on-surface-variant">
                            {SUBJECT_LABELS[msg.subject] || msg.subject}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-sm text-on-surface truncate">
                        {msg.full_name}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {msg.email} · {formatTimeAgo(msg.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-on-surface-variant" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-on-surface-variant" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-outline-variant/10 pt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-on-surface-variant font-bold">Nom:</span>
                          <p className="text-on-surface">{msg.full_name}</p>
                        </div>
                        <div>
                          <span className="text-on-surface-variant font-bold">Email:</span>
                          <p className="text-on-surface">{msg.email}</p>
                        </div>
                        {msg.phone && (
                          <div>
                            <span className="text-on-surface-variant font-bold">Téléphone:</span>
                            <p className="text-on-surface">{msg.phone}</p>
                          </div>
                        )}
                        {msg.subject && (
                          <div>
                            <span className="text-on-surface-variant font-bold">Sujet:</span>
                            <p className="text-on-surface">
                              {SUBJECT_LABELS[msg.subject] || msg.subject}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-on-surface-variant font-bold text-xs">Message:</span>
                        <p className="text-sm text-on-surface mt-1 whitespace-pre-wrap bg-surface-container p-4 rounded-xl">
                          {msg.message}
                        </p>
                      </div>

                      {msg.admin_note && (
                        <div>
                          <span className="text-on-surface-variant font-bold text-xs">Note admin:</span>
                          <p className="text-sm text-on-surface mt-1 bg-primary/5 p-3 rounded-xl border border-primary/10">
                            {msg.admin_note}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        {msg.status === "new" && (
                          <button
                            onClick={() => handleMarkRead(msg.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold hover:bg-amber-200 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Marquer lu
                          </button>
                        )}
                        {msg.status !== "replied" && msg.status !== "archived" && (
                          <button
                            onClick={() => handleMarkReplied(msg.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-100 text-green-700 text-xs font-bold hover:bg-green-200 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Répondu
                          </button>
                        )}
                        {msg.status !== "archived" && (
                          <button
                            onClick={() => handleArchive(msg.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-colors"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            Archiver
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-error/10 text-error text-xs font-bold hover:bg-error/20 transition-colors ml-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
