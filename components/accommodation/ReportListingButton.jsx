// components/accommodation/ReportListingButton.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";

const REASONS = [
  { value: "fraudulent", label: "This listing looks fraudulent" },
  { value: "inaccurate", label: "Photos or details don't match reality" },
  { value: "unavailable", label: "Property is no longer available" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Something else" },
];

export default function ReportListingButton({ propertyId, isAuthenticated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ reason: "fraudulent", details: "" });
  const router = useRouter();
  const toast = useToast();

  function handleOpen() {
    if (!isAuthenticated) {
      router.push(`/login?next=/accommodations`);
      return;
    }
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, ...form }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Could not submit report.", "error");
        return;
      }
      setSent(true);
    } catch {
      toast("Network error. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-danger-600"
      >
        <Flag className="h-3.5 w-3.5" /> Report this listing
      </button>

      <Modal open={open} onClose={() => { setOpen(false); setSent(false); }} title="Report this listing">
        {sent ? (
          <div className="py-4 text-center">
            <p className="text-sm text-ink">Thanks — our team will review this listing shortly.</p>
            <Button className="mt-4" onClick={() => { setOpen(false); setSent(false); }}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Select label="Reason" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
            <Textarea
              label="Additional details (optional)"
              rows={3}
              placeholder="Tell us more so we can investigate."
              value={form.details}
              onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
            />
            <Button type="submit" variant="danger" size="lg" disabled={loading}>
              {loading ? "Submitting…" : "Submit report"}
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
