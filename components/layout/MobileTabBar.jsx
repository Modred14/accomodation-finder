// components/layout/MobileTabBar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, Scale, User } from "lucide-react";

export default function MobileTabBar({ user }) {
  const pathname = usePathname();

  const items =
    user?.role === "student"
      ? [
          { href: "/", label: "Home", icon: Home },
          { href: "/accommodations", label: "Search", icon: Search },
          { href: "/dashboard/favourites", label: "Saved", icon: Heart },
          { href: "/compare", label: "Compare", icon: Scale },
          { href: "/dashboard", label: "Account", icon: User },
        ]
      : user?.role === "landlord" || user?.role === "agent"
      ? [
          { href: "/", label: "Home", icon: Home },
          { href: "/accommodations", label: "Search", icon: Search },
          { href: "/owner/listings", label: "Listings", icon: Heart },
          { href: "/owner/messages", label: "Messages", icon: Scale },
          { href: "/owner", label: "Account", icon: User },
        ]
      : user?.role === "admin"
      ? [
          { href: "/", label: "Home", icon: Home },
          { href: "/accommodations", label: "Search", icon: Search },
          { href: "/admin/listings", label: "Listings", icon: Heart },
          { href: "/admin/reports", label: "Reports", icon: Scale },
          { href: "/admin", label: "Account", icon: User },
        ]
      : [
          { href: "/", label: "Home", icon: Home },
          { href: "/accommodations", label: "Search", icon: Search },
          { href: "/compare", label: "Compare", icon: Scale },
          { href: "/login", label: "Sign in", icon: User },
        ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-paper/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }}>
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                  active ? "text-brand-700" : "text-muted"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
