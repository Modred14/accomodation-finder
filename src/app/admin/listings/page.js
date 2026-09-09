// app/admin/listings/page.js
import Link from "next/link";
import { ListChecks } from "lucide-react";
import { getModerationQueue } from "@/lib/queries/admin";
import DashboardShell from "@/components/layout/DashboardShell";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import SafeImage from "@/components/ui/SafeImage";
import ModerationActions from "@/components/admin/ModerationActions";
import { formatNaira, periodLabel } from "@/lib/format";

export const metadata = { title: "Listings — Admin — Abodé" };

const STATUS_TONE = { draft: "neutral", pending_review: "accent", published: "success", rejected: "danger", archived: "neutral" };

export default async function AdminListingsPage() {
  const listings = await getModerationQueue();

  return (
    <DashboardShell variant="admin" title="Listings" description="Review new submissions and manage verification status.">
      {listings.length === 0 ? (
        <EmptyState icon={ListChecks} title="No listings yet" />
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row">
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-28">
                <SafeImage src={p.cover_image} alt={p.cover_image_alt || `Exterior of ${p.title}`} label="No photo" fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/accommodations/${p.slug}`} className="line-clamp-1 text-sm font-medium text-ink hover:underline">
                    {p.title}
                  </Link>
                  <Badge tone={STATUS_TONE[p.status]} className="shrink-0 capitalize">
                    {p.status.replace("_", " ")}
                  </Badge>
                  {p.is_verified && <Badge tone="success">Verified</Badge>}
                </div>
                <p className="mt-1 text-xs text-muted">
                  {p.owner_name} ({p.owner_email}) · {p.location_name}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {formatNaira(p.price_amount)} {periodLabel(p.price_period)}
                </p>
                <div className="mt-3">
                  <ModerationActions propertyId={p.id} status={p.status} isVerified={p.is_verified} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}