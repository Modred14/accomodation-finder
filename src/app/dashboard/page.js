// app/dashboard/page.js
import Link from "next/link";
import { Heart, Scale, CalendarCheck, MessageCircle, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getFavouriteIds } from "@/lib/queries/favourites";
import { getComparisonIds } from "@/lib/queries/comparisons";
import { getInspectionsForStudent } from "@/lib/queries/inspections";
import { getConversationsForUser } from "@/lib/queries/conversations";
import DashboardShell from "@/components/layout/DashboardShell";
import Button from "@/components/ui/Button";

export const metadata = { title: "Dashboard — Abodé" };

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  const [favouriteIds, comparisonIds, inspections, conversations] = await Promise.all([
    getFavouriteIds(user.id),
    getComparisonIds(user.id),
    getInspectionsForStudent(user.id),
    getConversationsForUser(user.id, "student"),
  ]);

  const pendingInspections = inspections.filter((i) => i.status === "pending").length;
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const cards = [
    { label: "Saved properties", value: favouriteIds.length, icon: Heart, href: "/dashboard/favourites" },
    { label: "In comparison", value: comparisonIds.length, icon: Scale, href: "/compare" },
    { label: "Inspection requests", value: inspections.length, sub: pendingInspections ? `${pendingInspections} pending` : null, icon: CalendarCheck, href: "/dashboard/inspections" },
    { label: "Conversations", value: conversations.length, sub: unreadMessages ? `${unreadMessages} unread` : null, icon: MessageCircle, href: "/dashboard/messages" },
  ];

  return (
    <DashboardShell variant="student" title={`Welcome back, ${user.full_name.split(" ")[0]}`} description="Here's what's happening with your search.">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map(({ label, value, sub, icon: Icon, href }) => (
          <Link key={label} href={href} className="rounded-xl border border-border p-4 transition-shadow hover:shadow-card">
            <Icon className="mb-2 h-5 w-5 text-brand-700" />
            <p className="font-display text-2xl font-medium text-ink">{value}</p>
            <p className="text-xs text-muted">{label}</p>
            {sub && <p className="mt-0.5 text-xs font-medium text-accent-600">{sub}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border p-6 text-center">
        <Search className="mx-auto mb-2 h-6 w-6 text-muted" />
        <p className="text-sm text-muted">Still looking for the right place?</p>
        <Button href="/accommodations" className="mt-3">
          Continue searching
        </Button>
      </div>
    </DashboardShell>
  );
}
