// app/page.js
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  MessageCircle,
  MapPin,
  ArrowRight,
  GraduationCap,
  ListChecks,
  CalendarCheck,
  UserCheck,
  Eye,
} from "lucide-react";
import { searchProperties } from "@/lib/queries/properties";
import { getUniversities } from "@/lib/queries/universities";
import { getCurrentUser } from "@/lib/auth";
import { getFavouriteIds } from "@/lib/queries/favourites";
import { getComparisonIds } from "@/lib/queries/comparisons";
import PropertyCard from "@/components/accommodation/PropertyCard";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import { formatNaira, periodLabel } from "@/lib/format";

// A quiet bronze relief texture on the deep-navy sections — a nod to the Ife
// bronze heads referenced in the brand's design tokens, not a stock gradient.
const bronzeField = {
  backgroundImage: `
    repeating-linear-gradient(135deg, rgba(216,168,94,0.07) 0px, rgba(216,168,94,0.07) 1px, transparent 1px, transparent 15px),
    radial-gradient(ellipse 80% 60% at 85% 0%, rgba(216,168,94,0.10), transparent 60%)
  `,
};

const STEPS = [
  {
    n: "01",
    title: "Search by campus or area",
    body: "Filter by university, distance to campus, price, and room type — see only what actually fits.",
    icon: Search,
  },
  {
    n: "02",
    title: "Shortlist and message owners",
    body: "Compare rooms side by side and ask landlords or agents questions directly, in-app.",
    icon: MessageCircle,
  },
  {
    n: "03",
    title: "Book an inspection",
    body: "Pick a time that works and request a visit. No calls back and forth to arrange it.",
    icon: CalendarCheck,
  },
  {
    n: "04",
    title: "Move in with confidence",
    body: "Pay only once you've seen the place in person and you're sure it's the one.",
    icon: ListChecks,
  },
];

export default async function HomePage() {
  const [user, universities, { items: featured }] = await Promise.all([
    getCurrentUser(),
    getUniversities(),
    searchProperties({ verifiedOnly: true, sort: "rating" }, { page: 1, pageSize: 6 }),
  ]);

  let favouriteIds = [];
  let comparisonIds = [];
  if (user?.role === "student") {
    [favouriteIds, comparisonIds] = await Promise.all([getFavouriteIds(user.id), getComparisonIds(user.id)]);
  }

  const withPhotos = featured.filter((p) => p.cover_image);
  const stackPhotos = withPhotos.slice(0, 3);
  const priceTagProperty = withPhotos[0];

  return (
    <div>
      <style>{`
        @keyframes heroRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .hero-rise-1 { animation: heroRise .7s cubic-bezier(.22,.61,.36,1) both; }
        .hero-rise-2 { animation: heroRise .7s cubic-bezier(.22,.61,.36,1) .1s both; }
        .hero-rise-3 { animation: heroRise .7s cubic-bezier(.22,.61,.36,1) .2s both; }
        .hero-rise-4 { animation: heroRise .7s cubic-bezier(.22,.61,.36,1) .32s both; }
      `}</style>

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900" style={bronzeField}>
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <h1 className="hero-rise-1 max-w-lg font-display text-[2.75rem] font-medium leading-[1.04] tracking-tight text-white sm:text-6xl">
              Find your room before your mates do.
            </h1>
            <p className="hero-rise-2 mt-5 max-w-md text-[16px] leading-relaxed text-brand-100">
              Search verified rooms near your campus, message landlords directly, and book an
              inspection — before you pay anyone a single kobo.
            </p>

            <form
              action="/accommodations"
              className="hero-rise-3 mt-8 flex flex-col gap-2 rounded-xl bg-white p-2 shadow-card sm:flex-row"
            >
              <label className="flex flex-1 items-center gap-2 px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-muted" />
                <input
                  name="q"
                  placeholder="Search by area, university, or keyword"
                  className="w-full bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
                />
              </label>
              <Button type="submit" size="lg" className="shrink-0">
                Search rooms
              </Button>
            </form>

            {universities.length > 0 && (
              <div className="hero-rise-4 mt-6 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-brand-300">Jump to:</span>
                {universities.slice(0, 6).map((u) => (
                  <Link
                    key={u.id}
                    href={`/accommodations?universityId=${u.id}`}
                    className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10"
                  >
                    {u.short_name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Photo stack — real listing photos, presented like prints, not a stock grid */}
          {stackPhotos.length > 0 && (
            <div className="hero-rise-4 relative hidden h-[420px] lg:block">
              {stackPhotos[2] && (
                <div className="absolute right-6 top-2 h-64 w-52 -rotate-6 rounded-lg border-4 border-white bg-white shadow-card">
                  <div className="relative h-full w-full overflow-hidden rounded-sm">
                    <SafeImage src={stackPhotos[2].cover_image} alt={stackPhotos[2].cover_image_alt || `Exterior of ${stackPhotos[2].title}`} fill sizes="220px" className="object-cover" />
                  </div>
                </div>
              )}
              {stackPhotos[1] && (
                <div className="absolute left-2 top-16 h-64 w-52 rotate-3 rounded-lg border-4 border-white bg-white shadow-card">
                  <div className="relative h-full w-full overflow-hidden rounded-sm">
                    <SafeImage src={stackPhotos[1].cover_image} alt={stackPhotos[1].cover_image_alt || `Exterior of ${stackPhotos[1].title}`} fill sizes="220px" className="object-cover" />
                  </div>
                </div>
              )}
              {stackPhotos[0] && (
                <div className="absolute bottom-2 left-24 h-72 w-60 -rotate-2 rounded-lg border-4 border-white bg-white shadow-card transition-transform duration-500 hover:rotate-0">
                  <div className="relative h-full w-full overflow-hidden rounded-sm">
                    <SafeImage src={stackPhotos[0].cover_image} alt={stackPhotos[0].cover_image_alt || `Exterior of ${stackPhotos[0].title}`} fill sizes="240px" className="object-cover" />
                  </div>
                  {priceTagProperty && (
                    <span className="absolute -bottom-3 left-3 inline-flex items-center rounded-full bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white shadow-card">
                      From {formatNaira(priceTagProperty.price_amount)}
                      {periodLabel(priceTagProperty.price_period)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Verification strip — a hairline-divided band, not boxed cards */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { icon: ShieldCheck, title: "Verified before you pay", body: "Flagged listings get a physical check, so photos match reality." },
              { icon: MapPin, title: "Distance that matters", body: "Every listing shows real distance to campus, not vague estimates." },
              { icon: MessageCircle, title: "Talk to landlords directly", body: "Message owners and agents in-app, and request an inspection in a tap." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-3.5 px-1 py-8 sm:px-8">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                <div>
                  <h3 className="text-sm font-semibold text-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — a genuine four-step sequence */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-lg">
          <h2 className="font-display text-3xl font-medium leading-tight text-ink">How renting through Abodé works</h2>
          <p className="mt-2 text-[15px] text-muted">Four steps, from first search to your own front door.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-4 lg:divide-x lg:divide-border lg:gap-x-0">
          {STEPS.map(({ n, title, body }) => (
            <div key={n} className="lg:px-8 lg:first:pl-0 lg:last:pr-0">
              <span className="font-display text-4xl font-medium text-accent-300">{n}</span>
              <h3 className="mt-3 text-[15px] font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What "verified" actually means */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border bg-surface-2 lg:order-2">
            <SafeImage
              src={priceTagProperty?.cover_image}
              alt={priceTagProperty?.cover_image_alt || (priceTagProperty ? `Exterior of ${priceTagProperty.title}` : "Property photo")}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          <div className="lg:order-1">
            <h2 className="font-display text-3xl font-medium leading-tight text-ink">
              The &ldquo;Verified&rdquo; badge means something specific
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
              It&apos;s not a checkbox a landlord ticks. Before a listing carries that badge, it has to
              hold up to this:
            </p>

            <ul className="mt-7 space-y-5">
              {[
                { icon: Eye, text: "A team member visits the property in person" },
                { icon: ListChecks, text: "Photos are checked against what's actually there" },
                { icon: UserCheck, text: "The landlord's identity and ownership are reviewed" },
                { icon: ShieldCheck, text: "Student reports are investigated, not ignored" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[15px] text-ink">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-medium leading-tight text-ink">Highly rated, verified rooms</h2>
            <p className="mt-2 text-[15px] text-muted">A snapshot of what&apos;s available right now.</p>
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

      {/* Campus coverage */}
      {universities.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-medium text-ink">Campuses we cover</h2>
            <div className="mt-7 grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {universities.slice(0, 3).map((u) => (
                <Link
                  key={u.id}
                  href={`/accommodations?universityId=${u.id}`}
                  className="group flex items-start justify-between gap-4 py-6 sm:px-8 sm:first:pl-0 sm:last:pr-0"
                >
                  <div className="flex gap-3.5">
                    <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                    <div>
                      <h3 className="text-[15px] font-semibold text-ink">{u.name}</h3>
                      <p className="mt-1 text-sm text-muted">{u.city}, {u.state} state</p>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Landlord CTA */}
      <section className="relative overflow-hidden bg-brand-900" style={bronzeField}>
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-medium leading-tight text-white">Own a property near a campus?</h2>
            <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-brand-100">
              List it here and reach students who are actively searching for a place this
              session — not just browsing.
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