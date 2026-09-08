// components/dashboard/InspectionCard.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";

const STATUS_TONE = {
  pending: "accent",
  confirmed: "success",
  declined: "danger",
  completed: "brand",
  cancelled: "neutral",
};

export default function InspectionCard({ inspection, role }) {
  const [status, setStatus] = useState(inspection.status);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function updateStatus(newStatus) {
    setLoading(true);
    try {
      const res = await fetch(`/api/inspections/${inspection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Could not update.", "error");
        return;
      }
      setStatus(newStatus);
      toast("Updated.", "success");
      router.refresh();
    } catch {
      toast("Network error.", "error");
    } finally {
      setLoading(false);
    }
  }

  const contactName = role === "student" ? inspection.owner_name : inspection.student_name;
  const contactPhone = role === "student" ? inspection.owner_phone : inspection.student_phone;

  return (
    <div className="flex gap-3 rounded-xl border border-border p-4">
      {inspection.property_image && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-20">
          <Image src={inspection.property_image} alt={inspection.property_title} fill className="object-cover" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Link href={`/accommodations/${inspection.property_slug}`} className="line-clamp-1 text-sm font-medium text-ink hover:underline">
            {inspection.property_title}
          </Link>
          <Badge tone={STATUS_TONE[status] || "neutral"} className="capitalize">
            {status}
          </Badge>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(inspection.preferred_date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {inspection.preferred_time}
          </span>
        </p>
        {inspection.message && <p className="mt-1.5 text-sm text-muted">&ldquo;{inspection.message}&rdquo;</p>}
        <p className="mt-1.5 text-xs text-muted">
          {role === "student" ? "Owner" : "Student"}: {contactName} {contactPhone ? `· ${contactPhone}` : ""}
        </p>

        {role !== "student" && status === "pending" && (
          <div className="mt-3 flex gap-2">
            <Button size="sm" disabled={loading} onClick={() => updateStatus("confirmed")}>
              Confirm
            </Button>
            <Button size="sm" variant="outline" disabled={loading} onClick={() => updateStatus("declined")}>
              Decline
            </Button>
          </div>
        )}
        {role !== "student" && status === "confirmed" && (
          <div className="mt-3">
            <Button size="sm" variant="outline" disabled={loading} onClick={() => updateStatus("completed")}>
              Mark completed
            </Button>
          </div>
        )}
        {role === "student" && (status === "pending" || status === "confirmed") && (
          <div className="mt-3">
            <Button size="sm" variant="outline" disabled={loading} onClick={() => updateStatus("cancelled")}>
              Cancel request
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
