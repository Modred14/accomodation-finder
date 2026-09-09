// app/admin/users/page.js
import { Users } from "lucide-react";
import { getAllUsers } from "@/lib/queries/admin";
import DashboardShell from "@/components/layout/DashboardShell";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import UserActions from "@/components/admin/UserActions";

export const metadata = { title: "Users — Admin — Abodé" };

const ROLE_TABS = [
  { value: "", label: "All" },
  { value: "student", label: "Students" },
  { value: "landlord", label: "Landlords" },
  { value: "agent", label: "Agents" },
  { value: "admin", label: "Admins" },
];

export default async function AdminUsersPage({ searchParams }) {
  const sp = await searchParams;
  const role = sp.role || "";
  const users = await getAllUsers({ role: role || undefined, q: sp.q || undefined });

  return (
    <DashboardShell variant="admin" title="Users" description="Manage students, landlords, agents, and verification status.">
      <div className="mb-4 -mx-1 flex gap-1 overflow-x-auto px-1">
        {ROLE_TABS.map((t) => (
          <a
            key={t.value}
            href={t.value ? `/admin/users?role=${t.value}` : "/admin/users"}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
              role === t.value ? "border-brand-700 bg-brand-50 text-brand-700" : "border-border text-ink hover:bg-surface"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div key={u.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-ink">{u.full_name}</p>
                  <Badge tone="neutral" className="capitalize">
                    {u.role}
                  </Badge>
                  {u.is_verified && <Badge tone="success">Verified</Badge>}
                  {u.status === "suspended" && <Badge tone="danger">Suspended</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-muted">{u.email} {u.phone ? `· ${u.phone}` : ""}</p>
                {(u.role === "landlord" || u.role === "agent") && (
                  <p className="mt-0.5 text-xs text-muted">{u.listing_count} listing{u.listing_count === 1 ? "" : "s"}</p>
                )}
              </div>
              {u.role !== "admin" && <UserActions userId={u.id} status={u.status} isVerified={u.is_verified} />}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
