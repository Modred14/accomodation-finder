// components/owner/ListingRowActions.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";

export default function ListingRowActions({ propertyId, isAvailable }) {
  const [available, setAvailable] = useState(isAvailable);
  const [loading, setLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function toggleAvailability() {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: !available }),
      });
      if (!res.ok) throw new Error();
      setAvailable(!available);
      toast(!available ? "Marked as available." : "Marked as unavailable.", "success");
      router.refresh();
    } catch {
      toast("Could not update availability.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Listing removed.", "success");
      router.refresh();
    } catch {
      toast("Could not remove listing.", "error");
    } finally {
      setLoading(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={toggleAvailability} disabled={loading}>
        {available ? "Mark unavailable" : "Mark available"}
      </Button>
      <Button href={`/owner/listings/${propertyId}/edit`} size="sm" variant="subtle">
        <Pencil className="h-3.5 w-3.5" /> Edit
      </Button>
      <Button size="sm" variant={confirmingDelete ? "danger" : "ghost"} onClick={handleDelete} disabled={loading}>
        <Trash2 className="h-3.5 w-3.5" /> {confirmingDelete ? "Confirm delete" : "Delete"}
      </Button>
    </div>
  );
}
