// app/admin/page.js
import Link from "next/link";
import { Users, Building2, ShieldAlert, CalendarCheck, ListChecks } from "lucide-react";
import { getPlatformStats } from "@/lib/queries/admin";
import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = { title: "Admin dashboard — Abodé" };

function sumBy(rows, key, value) {
  return rows.find((r) => r[key] === value)?.count || 0;
}

export default async function AdminDashboardPage() {
  const { userCounts, propertyCounts, reportCounts, inspectionCounts } = await getPlatformStats();

  const totalUsers = userCounts.reduce((s, r) => s + r.count, 0);
  const totalProperties = propertyCounts.reduce((s, r) => s + r.count, 0);
  const pendingReview = sumBy(propertyCounts, "status", "pending_review");
  const openReports = sumBy(reportCounts, "status", "open");
  const pendingInspections = sumBy(inspectionCounts, "status", "pending");

  const cards = [
    { label: "Total users", value: totalUsers, icon: Users, href: "/admin/users" },
    { label: "Total listings", value: totalProperties, sub: pendingReview ? `${pendingReview} awaiting review` : null, icon: Building2, href: "/admin/listings" },
    { label: "Open reports", value: openReports, icon: ShieldAlert, href: "/admin/reports" },
    { label: "Pending inspections", value: pendingInspections, icon: CalendarCheck, href: "/admin/listings" },
  ];

  return (
    <DashboardShell variant="admin" title="Platform overview" description="Monitor activity and keep listings trustworthy.">
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

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-medium">
            <Users className="h-4 w-4 text-brand-700" /> Users by role
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            {userCounts.map((r) => (
              <li key={r.role} className="flex justify-between border-b border-border pb-2 capitalize last:border-0">
                <span>{r.role}</span>
                <span className="font-medium text-ink">{r.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-medium">
            <ListChecks className="h-4 w-4 text-brand-700" /> Listings by status
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            {propertyCounts.map((r) => (
              <li key={r.status} className="flex justify-between border-b border-border pb-2 capitalize last:border-0">
                <span>{r.status.replace("_", " ")}</span>
                <span className="font-medium text-ink">{r.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
