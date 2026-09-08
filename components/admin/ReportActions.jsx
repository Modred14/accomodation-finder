// components/admin/ReportActions.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";

export default function ReportActions({ reportId, status }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function act(newStatus) {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast("Report updated.", "success");
      router.refresh();
    } catch {
      toast("Could not update report.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (status === "resolved" || status === "dismissed") return null;

  return (
    <div className="flex flex-wrap gap-2">
      {status === "open" && (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => act("reviewed")}>
          Mark reviewed
        </Button>
      )}
      <Button size="sm" disabled={loading} onClick={() => act("resolved")}>
        Resolve
      </Button>
      <Button size="sm" variant="ghost" disabled={loading} onClick={() => act("dismissed")}>
        Dismiss
      </Button>
    </div>
  );
}
