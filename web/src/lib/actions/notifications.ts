"use server";

import { getPersistedMockData, savePersistedMockData } from "@/lib/actions/experiences";

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

export async function getNotifications(): Promise<NotificationItem[]> {
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
  const db = await getPersistedMockData();
  if (!db.notifications) return;

  const notif = db.notifications.find((n: any) => n.id === id);
  if (notif) {
    notif.is_read = true;
    await savePersistedMockData(db);
  }
}

export async function markAllNotificationsAsRead() {
  const db = await getPersistedMockData();
  if (!db.notifications) return;

  db.notifications.forEach((n: any) => {
    n.is_read = true;
  });
  await savePersistedMockData(db);
}

export async function deleteNotification(id: string) {
  const db = await getPersistedMockData();
  if (!db.notifications) return;

  db.notifications = db.notifications.filter((n: any) => n.id !== id);
  await savePersistedMockData(db);
}

export async function getNotificationSettings(): Promise<NotificationSettingsMap> {
  const db = await getPersistedMockData();
  return db.notification_settings || {
    new_reservation: { dashboard_enabled: true, email_enabled: false, whatsapp_enabled: false },
    cancellation: { dashboard_enabled: true, email_enabled: false, whatsapp_enabled: false },
    partner_request: { dashboard_enabled: true, email_enabled: false, whatsapp_enabled: false },
    new_partner: { dashboard_enabled: true, email_enabled: false, whatsapp_enabled: false },
    payment_status: { dashboard_enabled: true, email_enabled: false, whatsapp_enabled: false },
  };
}

export async function updateNotificationSettings(settings: NotificationSettingsMap) {
  const db = await getPersistedMockData();
  db.notification_settings = settings;
  await savePersistedMockData(db);
}

export async function getUnreadCount(): Promise<number> {
  const db = await getPersistedMockData();
  if (!db.notifications) return 0;
  return db.notifications.filter((n: any) => !n.is_read).length;
}
