import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationsAdmin } from "@/components/admin/notifications-admin";
import { getNotifications, getNotificationSettings } from "@/lib/actions/notifications";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [notifications, settings] = await Promise.all([
    getNotifications(),
    getNotificationSettings(),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-headline-sm text-headline-sm text-on-surface text-2xl font-bold">
          Notifications
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Gérez vos notifications et configurez les alertes.
        </p>
      </div>
      <NotificationsAdmin
        initialNotifications={notifications}
        initialSettings={settings}
      />
    </div>
  );
}
