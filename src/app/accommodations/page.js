// app/accommodations/page.js
import { SearchX } from "lucide-react";
import { searchProperties, getFacilities } from "@/lib/queries/properties";
import { getUniversities, getLocations } from "@/lib/queries/universities";
import { getFavouriteIds } from "@/lib/queries/favourites";
import { getComparisonIds } from "@/lib/queries/comparisons";
import { getCurrentUser } from "@/lib/auth";
import SearchFilters from "@/components/accommodation/SearchFilters";
import PropertyCard from "@/components/accommodation/PropertyCard";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = {
  title: "Find accommodation — OAU Lodge",
};

export default async function AccommodationsPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const filters = {
    q: sp.q || undefined,
    universityId: sp.universityId || undefined,
    locationId: sp.locationId || undefined,
    propertyType: sp.propertyType || undefined,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    minBedrooms: sp.minBedrooms ? Number(sp.minBedrooms) : undefined,
    availableOnly: sp.availableOnly === "1",
    verifiedOnly: sp.verifiedOnly === "1",
    facilities: Array.isArray(sp.facility) ? sp.facility : sp.facility ? [sp.facility] : [],
    sort: sp.sort || "newest",
  };

  const [{ items, total, totalPages }, universities, locations, facilities, user] = await Promise.all([
    searchProperties(filters, { page, pageSize: 12 }),
    getUniversities(),
    getLocations(),
    getFacilities(),
    getCurrentUser(),
  ]);

  let favouriteIds = [];
  let comparisonIds = [];
  if (user?.role === "student") {
    [favouriteIds, comparisonIds] = await Promise.all([getFavouriteIds(user.id), getComparisonIds(user.id)]);
  }

  function buildHref(targetPage) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(sp)) {
      if (key === "page") continue;
      if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
      else if (value) params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/accommodations${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">Find your next room</h1>
        <p className="mt-1 text-sm text-muted">
          {total} {total === 1 ? "listing" : "listings"} available near your university
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <SearchFilters universities={universities} locations={locations} facilities={facilities} />

        <div className="flex-1">
          {items.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No listings match your filters"
              description="Try widening your price range, choosing a different area, or clearing some filters."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isAuthenticated={!!user}
                  isFavourited={favouriteIds.includes(property.id)}
                  isComparing={comparisonIds.includes(property.id)}
                />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
        </div>
      </div>
    </div>
  );
}
