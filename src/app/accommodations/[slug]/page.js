// app/accommodations/[slug]/page.js
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  BedDouble,
  Bath,
  Users,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Phone,
  Mail,
} from "lucide-react";
import { getPropertyBySlug, incrementViewCount } from "@/lib/queries/properties";
import { getReviewsForProperty, getUserReviewForProperty } from "@/lib/queries/reviews";
import { isFavourite } from "@/lib/queries/favourites";
import { getComparisonIds } from "@/lib/queries/comparisons";
import { getCurrentUser } from "@/lib/auth";
import { formatNaira, periodLabel, propertyTypeLabel, formatDistance } from "@/lib/format";
import ImageGallery from "@/components/accommodation/ImageGallery";
import FavouriteButton from "@/components/accommodation/FavouriteButton";
import CompareToggle from "@/components/accommodation/CompareToggle";
import InspectionRequestButton from "@/components/accommodation/InspectionRequestButton";
import ContactOwnerButton from "@/components/accommodation/ContactOwnerButton";
import ReportListingButton from "@/components/accommodation/ReportListingButton";
import ReviewSection from "@/components/accommodation/ReviewSection";
import MapEmbed from "@/components/accommodation/MapEmbed";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};
  return {
    title: `${property.title} — Abodé`,
    description: property.description?.slice(0, 150),
  };
}

export default async function PropertyDetailPage({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const user = await getCurrentUser();
  const isStudent = user?.role === "student";
  const isOwner = user?.id === property.owner_id;

  const [reviews, favourited, comparisonIds, myReview] = await Promise.all([
    getReviewsForProperty(property.id),
    isStudent ? isFavourite(user.id, property.id) : false,
    isStudent ? getComparisonIds(user.id) : [],
    isStudent ? getUserReviewForProperty(user.id, property.id) : null,
  ]);

  if (!isOwner && user?.role !== "admin") {
    incrementViewCount(property.id).catch(() => {});
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {property.status !== "published" && (
        <div className="mb-4 rounded-lg border border-accent-300 bg-accent-50 px-4 py-2.5 text-sm text-accent-700">
          This listing is currently <strong>{property.status.replace("_", " ")}</strong> and only visible to you, the
          owner, and admins.
        </div>
      )}

      <nav className="mb-4 text-sm text-muted">
        <Link href="/accommodations" className="hover:text-brand-700">
          Find accommodation
        </Link>{" "}
        / <span className="text-ink">{property.title}</span>
      </nav>

      <ImageGallery images={property.images} title={property.title} />

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {property.is_verified ? (
                  <Badge tone="success">
                    <ShieldCheck className="h-3 w-3" /> Verified listing
                  </Badge>
                ) : (
                  <Badge tone="neutral">
                    <ShieldAlert className="h-3 w-3" /> Not yet verified
                  </Badge>
                )}
                {!property.is_available && <Badge tone="danger">Unavailable</Badge>}
              </div>
              <h1 className="font-display text-2xl font-medium leading-snug text-ink sm:text-3xl">{property.title}</h1>
              <p className="mt-1.5 flex items-center gap-1 text-sm text-muted">
                <MapPin className="h-4 w-4 shrink-0" />
                {property.address_line}, {property.location_name}
                {formatDistance(property.distance_to_campus_km) && ` · ${formatDistance(property.distance_to_campus_km)}`}
              </p>
              <div className="mt-2">
                <StarRating rating={property.avg_rating} reviewCount={property.review_count} size="md" />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 lg:hidden">
              <FavouriteButton
                propertyId={property.id}
                initialFavourited={favourited}
                isAuthenticated={!!user}
                canFavourite={!isOwner}
                className="static shadow-none bg-surface hover:bg-surface-2"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-border p-4 text-center sm:max-w-sm">
            <div>
              <BedDouble className="mx-auto mb-1 h-5 w-5 text-brand-700" />
              <p className="text-sm font-medium text-ink">{property.bedrooms} bed</p>
            </div>
            <div>
              <Bath className="mx-auto mb-1 h-5 w-5 text-brand-700" />
              <p className="text-sm font-medium text-ink">{property.bathrooms} bath</p>
            </div>
            <div>
              <Users className="mx-auto mb-1 h-5 w-5 text-brand-700" />
              <p className="text-sm font-medium text-ink">Up to {property.max_occupants}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xl font-medium text-ink">About this place</h2>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-muted">{property.description}</p>
            <p className="mt-2 text-sm text-muted">
              {propertyTypeLabel(property.property_type)} · {property.room_type}
            </p>
          </div>

          {property.facilities.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-medium text-ink">Facilities</h2>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
                {property.facilities.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 text-sm text-ink">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success-500" />
                    {f.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-display text-xl font-medium text-ink">Location</h2>
            <p className="mt-1 mb-3 text-sm text-muted">{property.location_description}</p>
            <MapEmbed latitude={property.latitude} longitude={property.longitude} title={property.title} />
          </div>

          <div className="mt-8 border-t border-border pt-8">
            <ReviewSection
              propertyId={property.id}
              reviews={reviews}
              isAuthenticated={!!user}
              isStudent={isStudent}
              existingReview={myReview}
            />
          </div>
        </div>

        {/* Sticky booking / contact panel */}
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-80">
          <div className="rounded-xl border border-border p-5">
            <p className="font-display text-2xl font-medium text-ink">
              {formatNaira(property.price_amount)}
              <span className="text-sm font-normal text-muted"> {periodLabel(property.price_period)}</span>
            </p>

            {!isOwner && (
              <div className="mt-4 flex flex-col gap-2.5">
                <ContactOwnerButton propertyId={property.id} isAuthenticated={!!user} isStudent={isStudent} />
                <InspectionRequestButton propertyId={property.id} isAuthenticated={!!user} isStudent={isStudent} />
                <div className="hidden gap-2.5 lg:flex">
                  <FavouriteButton
                    propertyId={property.id}
                    initialFavourited={favourited}
                    isAuthenticated={!!user}
                    className="static shadow-none border border-border bg-transparent hover:bg-surface"
                  />
                  <CompareToggle
                    propertyId={property.id}
                    initialAdded={comparisonIds.includes(property.id)}
                    isAuthenticated={!!user}
                    variant="text"
                  />
                </div>
              </div>
            )}

            {isOwner && (
              <Link
                href={`/owner/listings/${property.id}/edit`}
                className="mt-4 block rounded-lg bg-brand-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-800"
              >
                Edit this listing
              </Link>
            )}

            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Listed by</p>
              <p className="mt-1 text-sm font-medium text-ink">
                {property.owner_agency_name || property.owner_name}
                {property.owner_is_verified && (
                  <ShieldCheck className="ml-1 inline h-3.5 w-3.5 text-success-500" />
                )}
              </p>
              <p className="text-xs capitalize text-muted">{property.owner_role}</p>

              {!isOwner && user && (
                <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted">
                  {property.owner_phone && (
                    <a href={`tel:${property.owner_phone}`} className="flex items-center gap-1.5 hover:text-brand-700">
                      <Phone className="h-3.5 w-3.5" /> {property.owner_phone}
                    </a>
                  )}
                  <a href={`mailto:${property.owner_email}`} className="flex items-center gap-1.5 hover:text-brand-700">
                    <Mail className="h-3.5 w-3.5" /> {property.owner_email}
                  </a>
                </div>
              )}
            </div>

            {!isOwner && (
              <div className="mt-4 border-t border-border pt-4">
                <ReportListingButton propertyId={property.id} isAuthenticated={!!user} />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
