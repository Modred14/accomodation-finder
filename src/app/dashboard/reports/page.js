// app/dashboard/reports/page.js
import { Flag } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getReportsForUser } from "@/lib/queries/reports";
import DashboardShell from "@/components/layout/DashboardShell";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { relativeTime } from "@/lib/format";

export const metadata = { title: "My reports — OAU Lodge" };

const STATUS_TONE = { open: "accent", reviewed: "brand", resolved: "success", dismissed: "neutral" };

export default async function StudentReportsPage() {
  const user = await getCurrentUser();
  const reports = await getReportsForUser(user.id);

  return (
    <DashboardShell variant="student" title="My reports" description="Listings you've flagged for review.">
      {reports.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="You haven't reported anything"
          description="If a listing looks suspicious or inaccurate, report it from the property page."
          action={<Button href="/accommodations">Browse listings</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink">{r.property_title || "Listing removed"}</p>
                <Badge tone={STATUS_TONE[r.status]} className="capitalize">
                  {r.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs capitalize text-muted">
                Reason: {r.reason} · {relativeTime(r.created_at)}
              </p>
              {r.details && <p className="mt-1.5 text-sm text-muted">{r.details}</p>}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
