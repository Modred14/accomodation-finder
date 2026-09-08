// components/accommodation/ReviewSection.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toaster";
import { relativeTime } from "@/lib/format";

export default function ReviewSection({ propertyId, reviews, isAuthenticated, isStudent, existingReview }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) {
      toast("Please select a star rating.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Could not submit review.", "error");
        return;
      }
      setSubmitted(true);
      toast("Thanks for your review!", "success");
      router.refresh();
    } catch {
      toast("Network error. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-medium text-ink">
        Reviews {reviews.length > 0 && <span className="text-muted">({reviews.length})</span>}
      </h2>

      {isStudent && !submitted && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-border p-4">
          <p className="mb-2 text-sm font-medium text-ink">
            {existingReview ? "Update your review" : "Have you stayed here? Leave a review"}
          </p>
          <div className="mb-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                type="button"
                key={i}
                onClick={() => setRating(i)}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${i} star${i > 1 ? "s" : ""}`}
              >
                <Star
                  className={`h-6 w-6 ${
                    i <= (hoverRating || rating) ? "fill-accent-500 text-accent-500" : "fill-surface-2 text-surface-2"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            rows={3}
            placeholder="Share your experience with this property..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button type="submit" size="sm" className="mt-3" disabled={loading}>
            {loading ? "Submitting…" : existingReview ? "Update review" : "Submit review"}
          </Button>
        </form>
      )}

      {!isAuthenticated && (
        <p className="mt-3 text-sm text-muted">
          <a href="/login" className="font-medium text-brand-700 hover:underline">
            Sign in
          </a>{" "}
          as a student to leave a review.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-5">
        {reviews.length === 0 && <p className="text-sm text-muted">No reviews yet — be the first to share your experience.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="border-b border-border pb-5 last:border-0">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-ink">{r.reviewer_name}</p>
              <span className="text-xs text-muted">{relativeTime(r.created_at)}</span>
            </div>
            <div className="mb-1.5 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? "fill-accent-500 text-accent-500" : "fill-surface-2 text-surface-2"}`} />
              ))}
            </div>
            {r.comment && <p className="text-sm text-muted">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
