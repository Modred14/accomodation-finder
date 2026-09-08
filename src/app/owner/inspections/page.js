// app/owner/inspections/page.js
import { CalendarCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getInspectionsForOwner } from "@/lib/queries/inspections";
import DashboardShell from "@/components/layout/DashboardShell";
import InspectionCard from "@/components/dashboard/InspectionCard";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Inspection requests — OAU Lodge" };

export default async function OwnerInspectionsPage() {
  const user = await getCurrentUser();
  const inspections = await getInspectionsForOwner(user.id);

  return (
    <DashboardShell variant="owner" title="Inspection requests" description="Confirm or decline visits students have requested.">
      {inspections.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No inspection requests yet" description="When students request to view your properties, they'll show up here." />
      ) : (
        <div className="flex flex-col gap-3">
          {inspections.map((i) => (
            <InspectionCard key={i.id} inspection={i} role="owner" />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
