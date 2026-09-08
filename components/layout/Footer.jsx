// components/layout/Footer.jsx
import Link from "next/link";
import { Building2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="hidden border-t border-border bg-surface md:block">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
                <Building2 className="h-4 w-4" />
              </span>
              <span className="font-display text-lg font-medium">OAU Lodge</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Verified off-campus accommodation for students at Obafemi Awolowo University and beyond.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Students</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/accommodations" className="hover:text-brand-700">Search rooms</Link></li>
              <li><Link href="/compare" className="hover:text-brand-700">Compare properties</Link></li>
              <li><Link href="/register" className="hover:text-brand-700">Create an account</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Owners &amp; agents</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li><Link href="/register?role=landlord" className="hover:text-brand-700">List a property</Link></li>
              <li><Link href="/login" className="hover:text-brand-700">Manage listings</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Trust &amp; safety</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Verified badges on inspected listings</li>
              <li>Report suspicious listings anytime</li>
              <li>Admin-reviewed before publishing</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} OAU Lodge. Built for students, by design.</p>
          <p>Ile-Ife, Osun State, Nigeria</p>
        </div>
      </div>
    </footer>
  );
}
