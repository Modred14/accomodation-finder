// app/owner/listings/new/page.js
import { getUniversities, getLocations } from "@/lib/queries/universities";
import { getFacilities } from "@/lib/queries/properties";
import DashboardShell from "@/components/layout/DashboardShell";
import PropertyForm from "@/components/owner/PropertyForm";

export const metadata = { title: "Add property — OAU Lodge" };

export default async function NewListingPage() {
  const [universities, locations, facilities] = await Promise.all([
    getUniversities(),
    getLocations(),
    getFacilities(),
  ]);

  return (
    <DashboardShell variant="owner" title="Add a property" description="Listings are reviewed by our team before going live.">
      <PropertyForm universities={universities} locations={locations} facilities={facilities} />
    </DashboardShell>
  );
}
