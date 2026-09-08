// app/dashboard/inspections/page.js
import { CalendarCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getInspectionsForStudent } from "@/lib/queries/inspections";
import DashboardShell from "@/components/layout/DashboardShell";
import InspectionCard from "@/components/dashboard/InspectionCard";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

export const metadata = { title: "My inspections — OAU Lodge" };

export default async function StudentInspectionsPage() {
  const user = await getCurrentUser();
  const inspections = await getInspectionsForStudent(user.id);

  return (
    <DashboardShell variant="student" title="Inspection requests" description="Track the status of your property visit requests.">
      {inspections.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No inspection requests yet"
          description="Request an inspection from any property page to schedule a visit with the owner."
          action={<Button href="/accommodations">Browse listings</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {inspections.map((i) => (
            <InspectionCard key={i.id} inspection={i} role="student" />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
