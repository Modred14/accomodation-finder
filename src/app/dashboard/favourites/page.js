// app/dashboard/favourites/page.js
import { Heart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getFavouriteIds } from "@/lib/queries/favourites";
import { getComparisonIds } from "@/lib/queries/comparisons";
import { getPropertiesByIds } from "@/lib/queries/properties";
import DashboardShell from "@/components/layout/DashboardShell";
import PropertyCard from "@/components/accommodation/PropertyCard";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

export const metadata = { title: "Favourites — Abodé" };

export default async function FavouritesPage() {
  const user = await getCurrentUser();
  const [favouriteIds, comparisonIds] = await Promise.all([
    getFavouriteIds(user.id),
    getComparisonIds(user.id),
  ]);
  const properties = favouriteIds.length ? await getPropertiesByIds(favouriteIds) : [];
  properties.sort((a, b) => favouriteIds.indexOf(a.id) - favouriteIds.indexOf(b.id));

  return (
    <DashboardShell variant="student" title="Saved properties" description="Properties you've bookmarked for later.">
      {properties.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved properties yet"
          description="Tap the heart icon on any listing to save it here for quick access."
          action={<Button href="/accommodations">Browse listings</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isAuthenticated
              isFavourited
              isComparing={comparisonIds.includes(property.id)}
            />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
