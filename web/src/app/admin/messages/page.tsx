import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessagesListAdmin } from "@/components/admin/messages-list-admin";
import { getContactMessages } from "@/lib/actions/contact";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const messages = await getContactMessages();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-headline-sm text-headline-sm text-on-surface text-2xl font-bold">
          Messages Contact
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Gérez les messages reçus via le formulaire de contact.
        </p>
      </div>
      <MessagesListAdmin initialMessages={messages.data || []} />
    </div>
  );
}
