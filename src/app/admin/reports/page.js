// app/admin/reports/page.js
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getAllReports } from "@/lib/queries/reports";
import DashboardShell from "@/components/layout/DashboardShell";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ReportActions from "@/components/admin/ReportActions";
import { relativeTime } from "@/lib/format";

export const metadata = { title: "Reports — Admin — Abodé" };

const STATUS_TONE = { open: "accent", reviewed: "brand", resolved: "success", dismissed: "neutral" };

export default async function AdminReportsPage() {
  const reports = await getAllReports();

  return (
    <DashboardShell variant="admin" title="Reports" description="Investigate and resolve listings flagged by students.">
      {reports.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No reports" description="Reports from students will appear here." />
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div key={r.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {r.property_title ? (
                    <Link href={`/accommodations/${r.property_slug}`} className="text-sm font-medium text-ink hover:underline">
                      {r.property_title}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-ink">Listing removed</span>
                  )}
                  <Badge tone={STATUS_TONE[r.status]} className="capitalize">
                    {r.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs capitalize text-muted">
                  Reason: {r.reason} · Reported by {r.reporter_name} ({r.reporter_email}) · {relativeTime(r.created_at)}
                </p>
                {r.details && <p className="mt-1.5 text-sm text-muted">{r.details}</p>}
              </div>
              <ReportActions reportId={r.id} status={r.status} />
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
