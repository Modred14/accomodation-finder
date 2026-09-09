// components/layout/Navbar.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Building2, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";

const ROLE_HOME = {
  student: "/dashboard",
  landlord: "/owner",
  agent: "/owner",
  admin: "/admin",
};

export default function Navbar({ user }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const dashboardHref = user ? ROLE_HOME[user.role] || "/" : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-medium tracking-tight text-ink">
            Abodé
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/accommodations"
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              pathname.startsWith("/accommodations") ? "text-brand-700" : "text-ink hover:text-brand-700"
            }`}
          >
            Find accommodation
          </Link>
          <Link
            href="/compare"
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              pathname.startsWith("/compare") ? "text-brand-700" : "text-ink hover:text-brand-700"
            }`}
          >
            Compare
          </Link>
          {(!user || user.role === "student") && (
            <Link href="/register?role=landlord" className="rounded-md px-3 py-2 text-sm font-medium text-ink hover:text-brand-700">
              List a property
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {!user && (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button href="/register" variant="primary" size="sm">
                Create account
              </Button>
            </>
          )}
          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-border py-1.5 pl-1.5 pr-3 hover:bg-surface"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {user.full_name?.[0]?.toUpperCase() || "U"}
                </span>
                <span className="text-sm font-medium">{user.full_name?.split(" ")[0]}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted" />
              </button>
              {menuOpen && (
                <>
                  <button
                    className="fixed inset-0 z-40 cursor-default"
                    aria-hidden
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-paper p-1.5 shadow-card">
                    <Link
                      href={dashboardHref}
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-surface"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={user.role === "student" ? "/dashboard/favourites" : "/owner/listings"}
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-surface"
                      onClick={() => setMenuOpen(false)}
                    >
                      {user.role === "student" ? "Saved properties" : "My listings"}
                    </Link>
                    <Link
                      href={user.role === "student" ? "/dashboard/messages" : "/owner/messages"}
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-surface"
                      onClick={() => setMenuOpen(false)}
                    >
                      Messages
                    </Link>
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={handleLogout}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-danger-600 hover:bg-danger-100"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <button
          className="md:hidden rounded-md p-2 text-ink hover:bg-surface"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-paper px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link href="/accommodations" className="rounded-lg px-3 py-2.5 text-[15px] font-medium hover:bg-surface" onClick={() => setOpen(false)}>
              Find accommodation
            </Link>
            <Link href="/compare" className="rounded-lg px-3 py-2.5 text-[15px] font-medium hover:bg-surface" onClick={() => setOpen(false)}>
              Compare properties
            </Link>
            {!user ? (
              <>
                <Link href="/register?role=landlord" className="rounded-lg px-3 py-2.5 text-[15px] font-medium hover:bg-surface" onClick={() => setOpen(false)}>
                  List a property
                </Link>
                <div className="mt-2 flex gap-2">
                  <Button href="/login" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                    Sign in
                  </Button>
                  <Button href="/register" variant="primary" className="flex-1" onClick={() => setOpen(false)}>
                    Create account
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href={dashboardHref} className="rounded-lg px-3 py-2.5 text-[15px] font-medium hover:bg-surface" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-lg px-3 py-2.5 text-left text-[15px] font-medium text-danger-600 hover:bg-danger-100"
                >
                  Sign out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
