// app/admin/universities/page.js
import { getUniversities } from "@/lib/queries/universities";
import DashboardShell from "@/components/layout/DashboardShell";
import UniversityManager from "@/components/admin/UniversityManager";

export const metadata = { title: "Universities — Admin — OAU Lodge" };

export default async function AdminUniversitiesPage() {
  const universities = await getUniversities({ activeOnly: false });

  return (
    <DashboardShell variant="admin" title="Universities" description="Control which universities students can select and search.">
      <UniversityManager universities={universities} />
    </DashboardShell>
  );
}
