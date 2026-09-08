// components/accommodation/RemoveFromCompareButton.jsx
"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function RemoveFromCompareButton({ propertyId }) {
  const router = useRouter();

  async function handleClick() {
    await fetch("/api/compare/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Remove from comparison"
      className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 hover:bg-danger-100 hover:text-danger-600"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
