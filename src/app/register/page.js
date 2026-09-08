// app/register/page.js
import Link from "next/link";
import { Building2 } from "lucide-react";
import RegisterForm from "@/components/auth/RegisterForm";
import { getUniversities } from "@/lib/queries/universities";

export const metadata = { title: "Create account — OAU Lodge" };

export default async function RegisterPage({ searchParams }) {
  const sp = await searchParams;
  const universities = await getUniversities();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white">
          <Building2 className="h-5 w-5" />
        </span>
        <span className="font-display text-xl font-medium">OAU Lodge</span>
      </Link>
      <div className="rounded-xl border border-border bg-paper p-6 sm:p-8">
        <h1 className="font-display text-2xl font-medium text-ink">Create your account</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Join students, landlords, and agents already on OAU Lodge.</p>
        <RegisterForm universities={universities} defaultRole={sp.role} />
      </div>
    </div>
  );
}
