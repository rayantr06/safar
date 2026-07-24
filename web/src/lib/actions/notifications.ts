"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkRole } from "@/lib/utils/auth-check";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
};

export type NotificationSettingsMap = Record<string, {
  dashboard_enabled: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
}>;

const DEFAULT_SETTINGS: NotificationSettingsMap = {
  new_reservation: { dashboard_enabled: true, email_enabled: false, whatsapp_enabled: false },
  cancellation: { dashboard_enabled: true, email_enabled: false, whatsapp_enabled: false },
  partner_request: { dashboard_enabled: true, email_enabled: false, whatsapp_enabled: false },
  new_partner: { dashboard_enabled: true, email_enabled: false, whatsapp_enabled: false },
  payment_status: { dashboard_enabled: true, email_enabled: false, whatsapp_enabled: false },
};

export async function getNotifications(): Promise<NotificationItem[]> {
  await checkRole(["admin"]);

  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from("notifications")
    .select("id, type, title, message, is_read, metadata, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createNotification(data: {
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}) {
  const admin = createAdminClient() as any;
  const { data: settingsRow } = await admin
    .from("notification_settings")
    .select("dashboard_enabled")
    .eq("event_type", data.type)
    .single();
  if (settingsRow && !settingsRow.dashboard_enabled) {
    return;
  }

  const { data: notification, error } = await admin
    .from("notifications")
    .insert({
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
      is_read: false,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return notification;
}

export async function markNotificationAsRead(id: string) {
  await checkRole(["admin"]);

  const admin = createAdminClient() as any;
  const { error } = await admin.from("notifications").update({ is_read: true }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsAsRead() {
  await checkRole(["admin"]);

  const admin = createAdminClient() as any;
  const { error } = await admin.from("notifications").update({ is_read: true }).eq("is_read", false);
  if (error) throw new Error(error.message);
}

export async function deleteNotification(id: string) {
  await checkRole(["admin"]);

  const admin = createAdminClient() as any;
  const { error } = await admin.from("notifications").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getNotificationSettings(): Promise<NotificationSettingsMap> {
  await checkRole(["admin"]);

  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from("notification_settings")
    .select("event_type, dashboard_enabled, email_enabled, whatsapp_enabled");
  if (error) throw new Error(error.message);
  const settings: NotificationSettingsMap = { ...DEFAULT_SETTINGS };
  for (const row of data || []) {
    settings[row.event_type] = {
      dashboard_enabled: row.dashboard_enabled,
      email_enabled: row.email_enabled,
      whatsapp_enabled: row.whatsapp_enabled,
    };
  }
  return settings;
}

export async function updateNotificationSettings(settings: NotificationSettingsMap) {
  await checkRole(["admin"]);

  const admin = createAdminClient() as any;
  for (const [eventType, value] of Object.entries(settings)) {
    const { error } = await admin.from("notification_settings").upsert(
      {
        event_type: eventType,
        dashboard_enabled: value.dashboard_enabled,
        email_enabled: value.email_enabled,
        whatsapp_enabled: value.whatsapp_enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_type" }
    );
    if (error) throw new Error(error.message);
  }
}

export async function getUnreadCount(): Promise<number> {
  await checkRole(["admin"]);

  const admin = createAdminClient() as any;
  const { count, error } = await admin
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);
  if (error) throw new Error(error.message);
  return count || 0;
}
