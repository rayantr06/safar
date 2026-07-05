"use server";

import { getPersistedMockData, savePersistedMockData } from "@/lib/actions/experiences";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRole } from "@/lib/utils/auth-check";

const isPlaceholder = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

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

  if (!isPlaceholder()) {
    const admin = createAdminClient() as any;
    const { data, error } = await admin
      .from("notifications")
      .select("id, type, title, message, is_read, metadata, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  const db = await getPersistedMockData();
  return (db.notifications || []).sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function createNotification(data: {
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}) {
  if (!isPlaceholder()) {
    const admin = createAdminClient() as any;
    const { data: settingsRow } = await admin
      .from("notification_settings")
      .select("dashboard_enabled")
      .eq("event_type", data.type)
      .single();
    if (settingsRow && !settingsRow.dashboard_enabled) {
      return; // Notification type is disabled
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

  const db = await getPersistedMockData();
  if (!db.notifications) db.notifications = [];

  // Check if this notification type is enabled
  const settings = db.notification_settings || {};
  const typeSettings = settings[data.type];
  if (typeSettings && !typeSettings.dashboard_enabled) {
    return; // Notification type is disabled
  }

  const notification: NotificationItem = {
    id: `notif-${Date.now()}`,
    type: data.type,
    title: data.title,
    message: data.message,
    is_read: false,
    metadata: data.metadata || {},
    created_at: new Date().toISOString(),
  };

  db.notifications.push(notification);
  await savePersistedMockData(db);
  return notification;
}

export async function markNotificationAsRead(id: string) {
  await checkRole(["admin"]);

  if (!isPlaceholder()) {
    const admin = createAdminClient() as any;
    const { error } = await admin.from("notifications").update({ is_read: true }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const db = await getPersistedMockData();
  if (!db.notifications) return;

  const notif = db.notifications.find((n: any) => n.id === id);
  if (notif) {
    notif.is_read = true;
    await savePersistedMockData(db);
  }
}

export async function markAllNotificationsAsRead() {
  await checkRole(["admin"]);

  if (!isPlaceholder()) {
    const admin = createAdminClient() as any;
    const { error } = await admin.from("notifications").update({ is_read: true }).eq("is_read", false);
    if (error) throw new Error(error.message);
    return;
  }

  const db = await getPersistedMockData();
  if (!db.notifications) return;

  db.notifications.forEach((n: any) => {
    n.is_read = true;
  });
  await savePersistedMockData(db);
}

export async function deleteNotification(id: string) {
  await checkRole(["admin"]);

  if (!isPlaceholder()) {
    const admin = createAdminClient() as any;
    const { error } = await admin.from("notifications").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const db = await getPersistedMockData();
  if (!db.notifications) return;

  db.notifications = db.notifications.filter((n: any) => n.id !== id);
  await savePersistedMockData(db);
}

export async function getNotificationSettings(): Promise<NotificationSettingsMap> {
  await checkRole(["admin"]);

  if (!isPlaceholder()) {
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

  const db = await getPersistedMockData();
  return db.notification_settings || DEFAULT_SETTINGS;
}

export async function updateNotificationSettings(settings: NotificationSettingsMap) {
  await checkRole(["admin"]);

  if (!isPlaceholder()) {
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
    return;
  }

  const db = await getPersistedMockData();
  db.notification_settings = settings;
  await savePersistedMockData(db);
}

export async function getUnreadCount(): Promise<number> {
  await checkRole(["admin"]);

  if (!isPlaceholder()) {
    const admin = createAdminClient() as any;
    const { count, error } = await admin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);
    if (error) throw new Error(error.message);
    return count || 0;
  }

  const db = await getPersistedMockData();
  if (!db.notifications) return 0;
  return db.notifications.filter((n: any) => !n.is_read).length;
}
