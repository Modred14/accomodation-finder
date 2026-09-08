// components/accommodation/FavouriteButton.jsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";

export default function FavouriteButton({ propertyId, initialFavourited, isAuthenticated, canFavourite = true, className = "" }) {
  const [favourited, setFavourited] = useState(!!initialFavourited);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  if (!canFavourite) return null;

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login?next=/accommodations");
      return;
    }

    const next = !favourited;
    setFavourited(next);
    startTransition(async () => {
      try {
        const res = await fetch("/api/favourites/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFavourited(data.favourited);
        toast(data.favourited ? "Saved to favourites" : "Removed from favourites", "success");
        router.refresh();
      } catch {
        setFavourited(!next);
        toast("Something went wrong. Try again.", "error");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-pressed={favourited}
      aria-label={favourited ? "Remove from favourites" : "Save to favourites"}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white disabled:opacity-60 ${className}`}
    >
      <Heart className={`h-4.5 w-4.5 ${favourited ? "fill-danger-500 text-danger-500" : "text-ink"}`} />
    </button>
  );
}
