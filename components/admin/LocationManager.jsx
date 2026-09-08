// components/admin/LocationManager.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Power } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toaster";

export default function LocationManager({ universities, locations }) {
  const [form, setForm] = useState({
    university_id: universities[0]?.id || "",
    name: "",
    distance_to_campus_km: "",
    walk_minutes: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function handleAdd(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Could not add location.", "error");
        return;
      }
      toast("Location added.", "success");
      setForm((f) => ({ ...f, name: "", distance_to_campus_km: "", walk_minutes: "" }));
      router.refresh();
    } catch {
      toast("Network error.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(l) {
    await fetch(`/api/admin/locations/${l.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !l.is_active }),
    });
    router.refresh();
  }

  async function remove(l) {
    if (!confirm(`Remove ${l.name}? This will fail if it still has listings.`)) return;
    const res = await fetch(`/api/admin/locations/${l.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Could not remove — it may still have listings.", "error");
      return;
    }
    toast("Location removed.", "success");
    router.refresh();
  }

  const universityName = (id) => universities.find((u) => u.id === id)?.short_name || "";

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 rounded-xl border border-border p-4 sm:grid-cols-5 sm:items-end">
        <Select label="University" value={form.university_id} onChange={(e) => setForm((f) => ({ ...f, university_id: e.target.value }))}>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
        <Input label="Area name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="sm:col-span-2" placeholder="e.g. Damico" />
        <Input label="Distance (km)" type="number" step="0.1" value={form.distance_to_campus_km} onChange={(e) => setForm((f) => ({ ...f, distance_to_campus_km: e.target.value }))} />
        <Input label="Walk (min)" type="number" value={form.walk_minutes} onChange={(e) => setForm((f) => ({ ...f, walk_minutes: e.target.value }))} />
        <Button type="submit" disabled={loading} className="sm:col-span-5">
          <Plus className="h-4 w-4" /> Add location
        </Button>
      </form>

      <div className="flex flex-col gap-2.5">
        {locations.map((l) => (
          <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                {l.name} <Badge tone={l.is_active ? "success" : "neutral"}>{l.is_active ? "Active" : "Inactive"}</Badge>
              </p>
              <p className="text-xs text-muted">
                {universityName(l.university_id)} {l.distance_to_campus_km ? `· ${l.distance_to_campus_km}km` : ""}{" "}
                {l.walk_minutes ? `· ${l.walk_minutes} min walk` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggleActive(l)}>
                <Power className="h-3.5 w-3.5" /> {l.is_active ? "Deactivate" : "Activate"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(l)}>
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
