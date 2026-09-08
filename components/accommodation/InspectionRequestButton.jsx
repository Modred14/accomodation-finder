// components/accommodation/InspectionRequestButton.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";

export default function InspectionRequestButton({ propertyId, isAuthenticated, isStudent }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ preferredDate: "", preferredTime: "Morning", message: "" });
  const router = useRouter();
  const toast = useToast();

  function handleOpen() {
    if (!isAuthenticated) {
      router.push(`/login?next=/accommodations`);
      return;
    }
    if (!isStudent) {
      toast("Only student accounts can request inspections.", "info");
      return;
    }
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Could not send request.", "error");
        setLoading(false);
        return;
      }
      setSent(true);
      toast("Inspection request sent!", "success");
    } catch {
      toast("Network error. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={handleOpen} variant="outline" size="lg" className="w-full">
        <CalendarCheck className="h-4 w-4" /> Request inspection
      </Button>

      <Modal open={open} onClose={() => { setOpen(false); setSent(false); }} title="Request an inspection">
        {sent ? (
          <div className="py-4 text-center">
            <p className="text-sm text-ink">
              Your request has been sent to the owner. You&apos;ll be notified once they respond — check your dashboard for updates.
            </p>
            <Button className="mt-4" onClick={() => { setOpen(false); setSent(false); }}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Preferred date"
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={form.preferredDate}
              onChange={(e) => setForm((f) => ({ ...f, preferredDate: e.target.value }))}
            />
            <Select
              label="Preferred time"
              value={form.preferredTime}
              onChange={(e) => setForm((f) => ({ ...f, preferredTime: e.target.value }))}
            >
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </Select>
            <Textarea
              label="Message (optional)"
              rows={3}
              placeholder="Anything the owner should know before you visit?"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Sending…" : "Send request"}
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
