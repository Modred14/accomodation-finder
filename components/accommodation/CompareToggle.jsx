// components/accommodation/CompareToggle.jsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Scale } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";

export default function CompareToggle({ propertyId, initialAdded, isAuthenticated, variant = "icon" }) {
  const [added, setAdded] = useState(!!initialAdded);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login?next=/accommodations");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/compare/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId }),
        });
        const data = await res.json();
        if (data.limitReached) {
          toast(`You can compare up to ${data.max} properties at a time.`, "error");
          return;
        }
        setAdded(data.added);
        toast(data.added ? "Added to comparison" : "Removed from comparison", "success");
        router.refresh();
      } catch {
        toast("Something went wrong. Try again.", "error");
      }
    });
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={pending}
        aria-pressed={added}
        aria-label={added ? "Remove from comparison" : "Add to comparison"}
        className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white disabled:opacity-60`}
      >
        <Scale className={`h-4.5 w-4.5 ${added ? "text-brand-700" : "text-ink"}`} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
        added ? "border-brand-700 bg-brand-50 text-brand-700" : "border-border hover:bg-surface"
      }`}
    >
      <Scale className="h-4 w-4" />
      {added ? "Added to compare" : "Add to compare"}
    </button>
  );
}
