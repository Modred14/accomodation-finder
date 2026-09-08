// components/admin/ModerationActions.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ShieldCheck, ShieldOff } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";

export default function ModerationActions({ propertyId, status, isVerified }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function act(payload, message) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast(message, "success");
      router.refresh();
    } catch {
      toast("Could not update listing.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "published" && (
        <Button size="sm" disabled={loading} onClick={() => act({ status: "published" }, "Listing approved and published.")}>
          <Check className="h-3.5 w-3.5" /> Approve
        </Button>
      )}
      {status !== "rejected" && (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => act({ status: "rejected" }, "Listing rejected.")}>
          <X className="h-3.5 w-3.5" /> Reject
        </Button>
      )}
      <Button
        size="sm"
        variant={isVerified ? "subtle" : "accent"}
        disabled={loading}
        onClick={() => act({ verified: !isVerified }, isVerified ? "Verification removed." : "Listing verified.")}
      >
        {isVerified ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
        {isVerified ? "Unverify" : "Verify"}
      </Button>
    </div>
  );
}
