// app/owner/page.js
import Link from "next/link";
import { Building2, CalendarCheck, MessageCircle, Eye, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { searchProperties } from "@/lib/queries/properties";
import { getInspectionsForOwner } from "@/lib/queries/inspections";
import { getConversationsForUser } from "@/lib/queries/conversations";
import DashboardShell from "@/components/layout/DashboardShell";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export const metadata = { title: "Owner dashboard — OAU Lodge" };

const STATUS_TONE = { draft: "neutral", pending_review: "accent", published: "success", rejected: "danger", archived: "neutral" };

export default async function OwnerDashboardPage() {
  const user = await getCurrentUser();
  const [{ items: listings, total }, inspections, conversations] = await Promise.all([
    searchProperties({ ownerId: user.id, status: ["draft", "pending_review", "published", "rejected", "archived"] }, { page: 1, pageSize: 100 }),
    getInspectionsForOwner(user.id),
    getConversationsForUser(user.id, "owner"),
  ]);

  const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0);
  const pendingInspections = inspections.filter((i) => i.status === "pending").length;
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const cards = [
    { label: "Listings", value: total, icon: Building2, href: "/owner/listings" },
    { label: "Total views", value: totalViews, icon: Eye, href: "/owner/listings" },
    { label: "Inspection requests", value: inspections.length, sub: pendingInspections ? `${pendingInspections} pending` : null, icon: CalendarCheck, href: "/owner/inspections" },
    { label: "Conversations", value: conversations.length, sub: unreadMessages ? `${unreadMessages} unread` : null, icon: MessageCircle, href: "/owner/messages" },
  ];

  return (
    <DashboardShell variant="owner" title={`Welcome back, ${user.full_name.split(" ")[0]}`} description="Manage your listings and respond to students.">
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map(({ label, value, sub, icon: Icon, href }) => (
          <Link key={label} href={href} className="rounded-xl border border-border p-4 transition-shadow hover:shadow-card">
            <Icon className="mb-2 h-5 w-5 text-brand-700" />
            <p className="font-display text-2xl font-medium text-ink">{value}</p>
            <p className="text-xs text-muted">{label}</p>
            {sub && <p className="mt-0.5 text-xs font-medium text-accent-600">{sub}</p>}
          </Link>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-medium text-ink">Recent listings</h2>
        <Button href="/owner/listings/new" size="sm">
          <Plus className="h-4 w-4" /> Add property
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted">You haven&apos;t listed any properties yet.</p>
          <Button href="/owner/listings/new" className="mt-3">
            List your first property
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {listings.slice(0, 5).map((l) => (
            <Link key={l.id} href={`/owner/listings/${l.id}/edit`} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-surface">
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-medium text-ink">{l.title}</p>
                <p className="text-xs text-muted">{l.location_name}</p>
              </div>
              <Badge tone={STATUS_TONE[l.status]} className="ml-3 shrink-0 capitalize">
                {l.status.replace("_", " ")}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
