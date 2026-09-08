// app/page.js
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Search, MessageCircle, MapPin, ArrowRight } from "lucide-react";
import { searchProperties } from "@/lib/queries/properties";
import { getUniversities, getLocations } from "@/lib/queries/universities";
import { getCurrentUser } from "@/lib/auth";
import { getFavouriteIds } from "@/lib/queries/favourites";
import { getComparisonIds } from "@/lib/queries/comparisons";
import PropertyCard from "@/components/accommodation/PropertyCard";
import Button from "@/components/ui/Button";

export default async function HomePage() {
  const [user, universities, { items: featured }] = await Promise.all([
    getCurrentUser(),
    getUniversities(),
    searchProperties({ verifiedOnly: true, sort: "rating" }, { page: 1, pageSize: 6 }),
  ]);

  const oau = universities.find((u) => u.short_name === "OAU") || universities[0];
  const locations = oau ? await getLocations({ universityId: oau.id }) : [];

  let favouriteIds = [];
  let comparisonIds = [];
  if (user?.role === "student") {
    [favouriteIds, comparisonIds] = await Promise.all([getFavouriteIds(user.id), getComparisonIds(user.id)]);
  }

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-brand-900">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-accent-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified listings near OAU
            </span>
            <h1 className="mt-5 font-display text-4xl font-medium leading-[1.1] text-white sm:text-5xl">
              Find your room before your mates do.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-brand-100">
              Search, compare, and inspect off-campus lodges around Obafemi Awolowo University —
              with verified landlords, real prices, and no midnight scam alerts.
            </p>

            <form action="/accommodations" className="mt-7 flex flex-col gap-2 rounded-xl bg-white p-2 shadow-card sm:flex-row">
              <label className="flex flex-1 items-center gap-2 px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-muted" />
                <input
                  name="q"
                  placeholder="Search by area, e.g. Damico, Road 1, Mayfair"
                  className="w-full bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
                />
              </label>
              <Button type="submit" size="lg" className="shrink-0">
                Search rooms
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              {locations.slice(0, 5).map((l) => (
                <Link
                  key={l.id}
                  href={`/accommodations?locationId=${l.id}`}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
                >
                  {l.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((p, i) => (
                <div
                  key={p.id}
                  className={`relative overflow-hidden rounded-xl bg-brand-800 ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"}`}
                >
                  {p.cover_image && (
                    <Image src={p.cover_image} alt={p.title} fill sizes="320px" className="object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust points */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: ShieldCheck, title: "Verified before you pay", body: "Our team physically checks flagged listings so photos match reality." },
            { icon: MapPin, title: "Distance that matters", body: "Every listing shows real distance to campus, not vague estimates." },
            { icon: MessageCircle, title: "Talk to landlords directly", body: "Message owners and agents in-app, and request an inspection in a tap." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-medium text-ink">Highly rated, verified rooms</h2>
            <p className="mt-1 text-sm text-muted">A snapshot of what&apos;s available around OAU right now.</p>
          </div>
          <Link href="/accommodations" className="hidden items-center gap-1 text-sm font-medium text-brand-700 hover:underline sm:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-sm text-muted">New verified listings are added regularly — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isAuthenticated={!!user}
                isFavourited={favouriteIds.includes(property.id)}
                isComparing={comparisonIds.includes(property.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-6 sm:hidden">
          <Button href="/accommodations" variant="outline" className="w-full">
            View all listings
          </Button>
        </div>
      </section>

      {/* Landlord CTA */}
      <section className="border-t border-border bg-brand-700">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="font-display text-2xl font-medium text-white">Own a property near campus?</h2>
            <p className="mt-1 max-w-lg text-sm text-brand-100">
              List it on OAU Lodge and reach students actively searching for a place this session.
            </p>
          </div>
          <Button href="/register?role=landlord" variant="accent" size="lg" className="shrink-0">
            List your property
          </Button>
        </div>
      </section>
    </div>
  );
}
