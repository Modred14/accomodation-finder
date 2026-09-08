// app/compare/page.js
import Image from "next/image";
import Link from "next/link";
import { Scale, X, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getComparisonIds, MAX_COMPARISON_ITEMS } from "@/lib/queries/comparisons";
import { getPropertiesByIds } from "@/lib/queries/properties";
import { formatNaira, periodLabel, propertyTypeLabel, formatDistance } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import ClearCompareButton from "@/components/accommodation/ClearCompareButton";
import RemoveFromCompareButton from "@/components/accommodation/RemoveFromCompareButton";

export const metadata = { title: "Compare properties — OAU Lodge" };

export default async function ComparePage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "student") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={Scale}
          title="Sign in as a student to compare properties"
          description="Create a free account to save and compare up to 4 listings side by side."
          action={<Button href="/login">Sign in</Button>}
        />
      </div>
    );
  }

  const ids = await getComparisonIds(user.id);
  const properties = ids.length ? await getPropertiesByIds(ids) : [];
  // preserve the order items were added
  properties.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  if (properties.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={Scale}
          title="Nothing to compare yet"
          description={`Add up to ${MAX_COMPARISON_ITEMS} properties from search results to compare price, facilities, and distance side by side.`}
          action={<Button href="/accommodations">Browse listings</Button>}
        />
      </div>
    );
  }

  const allFacilityNames = Array.from(
    new Set(properties.flatMap((p) => (p.facilities || []).map((f) => f.name)))
  ).sort();

  const rows = [
    { label: "Price", render: (p) => `${formatNaira(p.price_amount)} ${periodLabel(p.price_period)}` },
    { label: "Type", render: (p) => propertyTypeLabel(p.property_type) },
    { label: "Location", render: (p) => p.location_name },
    { label: "Distance to campus", render: (p) => formatDistance(p.distance_to_campus_km) || "—" },
    { label: "Bedrooms", render: (p) => p.bedrooms },
    { label: "Bathrooms", render: (p) => p.bathrooms },
    { label: "Max occupants", render: (p) => p.max_occupants },
    { label: "Rating", render: (p) => (p.review_count > 0 ? `${p.avg_rating} (${p.review_count})` : "No reviews") },
    {
      label: "Verified",
      render: (p) =>
        p.is_verified ? (
          <span className="inline-flex items-center gap-1 text-success-600">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </span>
        ) : (
          "Not verified"
        ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">Compare properties</h1>
          <p className="mt-1 text-sm text-muted">
            {properties.length} of {MAX_COMPARISON_ITEMS} slots used
          </p>
        </div>
        <ClearCompareButton />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-40 bg-surface p-3 text-left align-bottom text-xs font-medium text-muted"> </th>
              {properties.map((p) => (
                <th key={p.id} className="min-w-[200px] border-l border-border bg-surface p-3 text-left align-top">
                  <div className="relative">
                    <RemoveFromCompareButton propertyId={p.id} />
                    <Link href={`/accommodations/${p.slug}`} className="block pr-6">
                      {p.cover_image && (
                        <div className="relative mb-2 h-24 w-full overflow-hidden rounded-lg">
                          <Image src={p.cover_image} alt={p.title} fill sizes="220px" className="object-cover" />
                        </div>
                      )}
                      <p className="line-clamp-2 text-sm font-medium text-ink">{p.title}</p>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <th className="sticky left-0 z-10 bg-paper p-3 text-left text-xs font-medium text-muted">{row.label}</th>
                {properties.map((p) => (
                  <td key={p.id} className="border-l border-border p-3 text-ink">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-border">
              <th className="sticky left-0 z-10 bg-paper p-3 text-left text-xs font-medium text-muted">Facilities</th>
              {properties.map((p) => {
                const names = new Set((p.facilities || []).map((f) => f.name));
                return (
                  <td key={p.id} className="border-l border-border p-3 align-top">
                    <ul className="flex flex-col gap-1">
                      {allFacilityNames.map((name) => (
                        <li key={name} className={names.has(name) ? "text-ink" : "text-muted/40 line-through"}>
                          {name}
                        </li>
                      ))}
                    </ul>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
