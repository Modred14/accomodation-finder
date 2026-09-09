// app/owner/messages/page.js
import { MessageCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/queries/conversations";
import DashboardShell from "@/components/layout/DashboardShell";
import ConversationList from "@/components/dashboard/ConversationList";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Messages — Abodé" };

export default async function OwnerMessagesPage() {
  const user = await getCurrentUser();
  const conversations = await getConversationsForUser(user.id, "owner");

  return (
    <DashboardShell variant="owner" title="Messages" description="Conversations with prospective students.">
      {conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title="No conversations yet" description="When a student messages you about a listing, it will show up here." />
      ) : (
        <div className="rounded-xl border border-border">
          <ConversationList conversations={conversations} role="owner" />
        </div>
      )}
    </DashboardShell>
  );
}
