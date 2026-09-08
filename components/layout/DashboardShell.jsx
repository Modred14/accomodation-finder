// components/layout/DashboardShell.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Heart,
  Scale,
  CalendarCheck,
  MessageCircle,
  Flag,
  Building2,
  ListChecks,
  Users,
  ShieldAlert,
  School,
  MapPinned,
} from "lucide-react";

const NAV_CONFIG = {
  student: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/favourites", label: "Favourites", icon: Heart },
    { href: "/dashboard/inspections", label: "Inspections", icon: CalendarCheck },
    { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
    { href: "/dashboard/reports", label: "My reports", icon: Flag },
    { href: "/compare", label: "Compare", icon: Scale },
  ],
  owner: [
    { href: "/owner", label: "Overview", icon: LayoutDashboard },
    { href: "/owner/listings", label: "My listings", icon: Building2 },
    { href: "/owner/inspections", label: "Inspections", icon: CalendarCheck },
    { href: "/owner/messages", label: "Messages", icon: MessageCircle },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/listings", label: "Listings", icon: ListChecks },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: ShieldAlert },
    { href: "/admin/universities", label: "Universities", icon: School },
    { href: "/admin/locations", label: "Locations", icon: MapPinned },
  ],
};

export default function DashboardShell({ variant, title, description, children }) {
  const pathname = usePathname();
  const navItems = NAV_CONFIG[variant] || [];
  const rootHref = navItems[0]?.href;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Desktop sidebar nav */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = href === pathname || (href !== rootHref && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-surface"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile horizontal tab row */}
        <div className="-mx-4 mb-2 overflow-x-auto px-4 lg:hidden">
          <div className="flex w-max gap-1.5 pb-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = href === pathname || (href !== rootHref && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium ${
                    active ? "border-brand-700 bg-brand-50 text-brand-700" : "border-border text-ink"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
