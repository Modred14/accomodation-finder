// app/owner/listings/page.js
import Link from "next/link";
import { Building2, Plus, Eye } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { searchProperties } from "@/lib/queries/properties";
import DashboardShell from "@/components/layout/DashboardShell";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ListingRowActions from "@/components/owner/ListingRowActions";
import { formatNaira, periodLabel } from "@/lib/format";

export const metadata = { title: "My listings — Abodé" };

const STATUS_TONE = { draft: "neutral", pending_review: "accent", published: "success", rejected: "danger", archived: "neutral" };

export default async function OwnerListingsPage() {
  const user = await getCurrentUser();
  const { items } = await searchProperties(
    { ownerId: user.id, status: ["draft", "pending_review", "published", "rejected", "archived"] },
    { page: 1, pageSize: 100 }
  );

  return (
    <DashboardShell variant="owner" title="My listings" description="Manage, edit, and track every property you've listed.">
      <div className="mb-4 flex justify-end">
        <Button href="/owner/listings/new" size="sm">
          <Plus className="h-4 w-4" /> Add property
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No listings yet"
          description="Add your first property so students can find, save, and enquire about it."
          action={<Button href="/owner/listings/new">List a property</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/accommodations/${p.slug}`} className="line-clamp-1 text-sm font-medium text-ink hover:underline">
                    {p.title}
                  </Link>
                  <Badge tone={STATUS_TONE[p.status]} className="shrink-0 capitalize">
                    {p.status.replace("_", " ")}
                  </Badge>
                  {p.is_verified && <Badge tone="success">Verified</Badge>}
                  {!p.is_available && <Badge tone="danger">Unavailable</Badge>}
                </div>
                <p className="mt-1 text-xs text-muted">
                  {p.location_name} · {formatNaira(p.price_amount)} {periodLabel(p.price_period)}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <Eye className="h-3 w-3" /> {p.view_count} views
                </p>
              </div>
              <ListingRowActions propertyId={p.id} isAvailable={p.is_available} />
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
