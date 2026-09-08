// components/admin/UniversityManager.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Power } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toaster";

export default function UniversityManager({ universities }) {
  const [form, setForm] = useState({ name: "", short_name: "", city: "", state: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function handleAdd(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Could not add university.", "error");
        return;
      }
      toast("University added.", "success");
      setForm({ name: "", short_name: "", city: "", state: "" });
      router.refresh();
    } catch {
      toast("Network error.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(u) {
    await fetch(`/api/admin/universities/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !u.is_active }),
    });
    router.refresh();
  }

  async function remove(u) {
    if (!confirm(`Remove ${u.name}? This will fail if it still has listings.`)) return;
    const res = await fetch(`/api/admin/universities/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Could not remove — it may still have locations or listings.", "error");
      return;
    }
    toast("University removed.", "success");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 rounded-xl border border-border p-4 sm:grid-cols-5 sm:items-end">
        <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="sm:col-span-2" />
        <Input label="Short name" required value={form.short_name} onChange={(e) => setForm((f) => ({ ...f, short_name: e.target.value }))} placeholder="e.g. OAU" />
        <Input label="City" required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
        <Input label="State" required value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
        <Button type="submit" disabled={loading} className="sm:col-span-5">
          <Plus className="h-4 w-4" /> Add university
        </Button>
      </form>

      <div className="flex flex-col gap-2.5">
        {universities.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                {u.name} <Badge tone={u.is_active ? "success" : "neutral"}>{u.is_active ? "Active" : "Inactive"}</Badge>
              </p>
              <p className="text-xs text-muted">{u.short_name} · {u.city}, {u.state}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggleActive(u)}>
                <Power className="h-3.5 w-3.5" /> {u.is_active ? "Deactivate" : "Activate"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(u)}>
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
