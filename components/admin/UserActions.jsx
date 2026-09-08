// components/admin/UserActions.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldOff, UserX, UserCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";

export default function UserActions({ userId, status, isVerified }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function act(payload, message) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Could not update user.", "error");
        return;
      }
      toast(message, "success");
      router.refresh();
    } catch {
      toast("Network error.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant={isVerified ? "subtle" : "accent"}
        disabled={loading}
        onClick={() => act({ is_verified: !isVerified }, isVerified ? "Verification removed." : "User verified.")}
      >
        {isVerified ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
        {isVerified ? "Unverify" : "Verify"}
      </Button>
      {status === "suspended" ? (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => act({ status: "active" }, "User reinstated.")}>
          <UserCheck className="h-3.5 w-3.5" /> Reinstate
        </Button>
      ) : (
        <Button size="sm" variant="danger" disabled={loading} onClick={() => act({ status: "suspended" }, "User suspended.")}>
          <UserX className="h-3.5 w-3.5" /> Suspend
        </Button>
      )}
    </div>
  );
}
