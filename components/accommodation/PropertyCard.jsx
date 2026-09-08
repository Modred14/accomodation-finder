// components/accommodation/PropertyCard.jsx
import Image from "next/image";
import Link from "next/link";
import { BedDouble, MapPin, ShieldCheck } from "lucide-react";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";
import FavouriteButton from "@/components/accommodation/FavouriteButton";
import CompareToggle from "@/components/accommodation/CompareToggle";
import { formatNaira, periodLabel, propertyTypeLabel } from "@/lib/format";

export default function PropertyCard({ property, isAuthenticated, isFavourited, isComparing, showActions = true }) {
  return (
    <Link
      href={`/accommodations/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-paper transition-shadow hover:shadow-card"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
        {property.cover_image ? (
          <Image
            src={property.cover_image}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">No photo yet</div>
        )}

        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {property.is_verified && (
            <Badge tone="success" className="bg-white/90 shadow-sm">
              <ShieldCheck className="h-3 w-3" /> Verified
            </Badge>
          )}
          {property.is_available === false && (
            <Badge tone="danger" className="bg-white/90 shadow-sm">
              Unavailable
            </Badge>
          )}
        </div>

        {showActions && (
          <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
            <FavouriteButton
              propertyId={property.id}
              initialFavourited={isFavourited}
              isAuthenticated={isAuthenticated}
            />
            <CompareToggle propertyId={property.id} initialAdded={isComparing} isAuthenticated={isAuthenticated} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-display text-lg font-medium leading-snug text-ink">
            {formatNaira(property.price_amount)}
            <span className="ml-1 text-sm font-normal text-muted">{periodLabel(property.price_period)}</span>
          </p>
        </div>

        <h3 className="line-clamp-1 text-[15px] font-medium text-ink">{property.title}</h3>

        <p className="flex items-center gap-1 text-sm text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {property.location_name}
            {property.distance_to_campus_km ? ` · ${Number(property.distance_to_campus_km).toFixed(1)}km` : ""}
          </span>
        </p>

        <div className="flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            {propertyTypeLabel(property.property_type)} · {property.bedrooms} bed
          </span>
        </div>

        <div className="mt-auto pt-1">
          <StarRating rating={property.avg_rating} reviewCount={property.review_count} />
        </div>
      </div>
    </Link>
  );
}
