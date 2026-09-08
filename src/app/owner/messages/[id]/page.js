// app/owner/messages/[id]/page.js
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getConversationById, getMessages, getConversationsForUser, markConversationRead } from "@/lib/queries/conversations";
import DashboardShell from "@/components/layout/DashboardShell";
import ConversationList from "@/components/dashboard/ConversationList";
import MessageThread from "@/components/dashboard/MessageThread";

export const metadata = { title: "Conversation — OAU Lodge" };

export default async function OwnerConversationPage({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const conversation = await getConversationById(id, user.id);
  if (!conversation) notFound();

  await markConversationRead(id, user.id);
  const [messages, conversations] = await Promise.all([
    getMessages(id),
    getConversationsForUser(user.id, "owner"),
  ]);

  return (
    <DashboardShell variant="owner" title="Messages">
      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r border-border lg:block">
          <ConversationList conversations={conversations} role="owner" activeId={id} />
        </div>
        <div>
          <div className="flex items-center gap-2 border-b border-border p-3 lg:hidden">
            <Link href="/owner/messages" className="rounded-full p-1.5 hover:bg-surface">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-sm font-medium text-ink">{conversation.student_name}</p>
              {conversation.property_title && <p className="text-xs text-muted">{conversation.property_title}</p>}
            </div>
          </div>
          <div className="hidden border-b border-border p-3 lg:block">
            <p className="text-sm font-medium text-ink">{conversation.student_name}</p>
            {conversation.property_title && (
              <Link href={`/accommodations/${conversation.property_slug}`} className="text-xs text-brand-700 hover:underline">
                {conversation.property_title}
              </Link>
            )}
          </div>
          <MessageThread conversationId={id} currentUserId={user.id} initialMessages={messages} />
        </div>
      </div>
    </DashboardShell>
  );
}
