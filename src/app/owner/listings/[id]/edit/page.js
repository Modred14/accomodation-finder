// app/owner/listings/[id]/edit/page.js
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPropertyForEdit } from "@/lib/queries/properties";
import { getUniversities, getLocations } from "@/lib/queries/universities";
import { getFacilities } from "@/lib/queries/properties";
import DashboardShell from "@/components/layout/DashboardShell";
import PropertyForm from "@/components/owner/PropertyForm";

export const metadata = { title: "Edit listing — OAU Lodge" };

export default async function EditListingPage({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const property = await getPropertyForEdit(id);
  if (!property) notFound();
  if (user.role !== "admin" && property.owner_id !== user.id) redirect("/owner/listings");

  const [universities, locations, facilities] = await Promise.all([
    getUniversities(),
    getLocations(),
    getFacilities(),
  ]);

  return (
    <DashboardShell variant="owner" title="Edit property" description="Substantive changes are re-reviewed before going live again.">
      <PropertyForm universities={universities} locations={locations} facilities={facilities} initial={property} propertyId={property.id} />
    </DashboardShell>
  );
}
