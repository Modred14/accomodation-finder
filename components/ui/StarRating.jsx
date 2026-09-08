// components/ui/StarRating.jsx
import { Star } from "lucide-react";

export default function StarRating({ rating = 0, reviewCount, size = "sm" }) {
  const rounded = Math.round(Number(rating) * 2) / 2;
  const dim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  if (!reviewCount) {
    return <span className="text-xs text-muted">No reviews yet</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${dim} ${i <= rounded ? "fill-accent-500 text-accent-500" : "fill-surface-2 text-surface-2"}`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-ink">{Number(rating).toFixed(1)}</span>
      <span className="text-xs text-muted">({reviewCount})</span>
    </div>
  );
}
