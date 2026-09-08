// app/admin/locations/page.js
import { getUniversities, getLocations } from "@/lib/queries/universities";
import DashboardShell from "@/components/layout/DashboardShell";
import LocationManager from "@/components/admin/LocationManager";

export const metadata = { title: "Locations — Admin — OAU Lodge" };

export default async function AdminLocationsPage() {
  const [universities, locations] = await Promise.all([
    getUniversities({ activeOnly: false }),
    getLocations({ activeOnly: false }),
  ]);

  return (
    <DashboardShell variant="admin" title="Locations" description="Manage the areas students can filter by around each university.">
      <LocationManager universities={universities} locations={locations} />
    </DashboardShell>
  );
}
