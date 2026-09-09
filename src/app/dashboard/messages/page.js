// app/dashboard/messages/page.js
import { MessageCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/queries/conversations";
import DashboardShell from "@/components/layout/DashboardShell";
import ConversationList from "@/components/dashboard/ConversationList";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

export const metadata = { title: "Messages — Abodé" };

export default async function StudentMessagesPage() {
  const user = await getCurrentUser();
  const conversations = await getConversationsForUser(user.id, "student");

  return (
    <DashboardShell variant="student" title="Messages" description="Conversations with landlords and agents.">
      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No conversations yet"
          description="Message an owner from any property page to start a conversation."
          action={<Button href="/accommodations">Browse listings</Button>}
        />
      ) : (
        <div className="rounded-xl border border-border">
          <ConversationList conversations={conversations} role="student" />
        </div>
      )}
    </DashboardShell>
  );
}
