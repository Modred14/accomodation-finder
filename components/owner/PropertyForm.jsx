// components/owner/PropertyForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ImagePlus } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { propertyTypeLabel } from "@/lib/format";

const PROPERTY_TYPES = ["self_contain", "room_and_parlour", "shared_room", "flat", "hostel", "duplex"];
const PERIODS = [
  { value: "per_session", label: "Per session" },
  { value: "per_year", label: "Per year" },
  { value: "per_semester", label: "Per semester" },
  { value: "per_month", label: "Per month" },
];

export default function PropertyForm({ universities, locations, facilities, initial, propertyId }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!propertyId;

  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    property_type: initial?.property_type || "self_contain",
    room_type: initial?.room_type || "",
    price_amount: initial?.price_amount || "",
    price_period: initial?.price_period || "per_session",
    bedrooms: initial?.bedrooms ?? 1,
    bathrooms: initial?.bathrooms ?? 1,
    max_occupants: initial?.max_occupants ?? 1,
    address_line: initial?.address_line || "",
    university_id: initial?.university_id || universities[0]?.id || "",
    location_id: initial?.location_id || "",
    distance_to_campus_km: initial?.distance_to_campus_km || "",
    facility_ids: initial?.facility_ids || [],
    image_urls: initial?.image_urls || [],
  });
  const [imageInput, setImageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const filteredLocations = locations.filter((l) => l.university_id === form.university_id);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleFacility(id) {
    setForm((f) => ({
      ...f,
      facility_ids: f.facility_ids.includes(id) ? f.facility_ids.filter((x) => x !== id) : [...f.facility_ids, id],
    }));
  }

  function addImage() {
    const url = imageInput.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      toast("Enter a valid image URL.", "error");
      return;
    }
    if (form.image_urls.length >= 10) {
      toast("Maximum 10 photos per listing.", "error");
      return;
    }
    set("image_urls", [...form.image_urls, url]);
    setImageInput("");
  }

  function removeImage(url) {
    set("image_urls", form.image_urls.filter((u) => u !== url));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(isEdit ? `/api/properties/${propertyId}` : "/api/properties", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Please fix the errors and try again.", "error");
        setErrors(data.fieldErrors || {});
        setLoading(false);
        return;
      }
      toast(isEdit ? "Listing updated and sent for review." : "Listing created and sent for review.", "success");
      router.push("/owner/listings");
      router.refresh();
    } catch {
      toast("Network error. Please try again.", "error");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="rounded-xl border border-border p-4 sm:p-5">
        <h2 className="mb-4 font-display text-lg font-medium">Basic details</h2>
        <div className="flex flex-col gap-4">
          <Input label="Listing title" required value={form.title} onChange={(e) => set("title", e.target.value)} error={errors.title?.[0]} placeholder="e.g. Self-Contain Apartment, Road 1 Ede Road" />
          <Textarea label="Description" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the property, condition, and what's nearby..." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Property type" value={form.property_type} onChange={(e) => set("property_type", e.target.value)}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {propertyTypeLabel(t)}
                </option>
              ))}
            </Select>
            <Input label="Room type label" required value={form.room_type} onChange={(e) => set("room_type", e.target.value)} placeholder="e.g. Self-contain, 2-bedroom flat" error={errors.room_type?.[0]} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border p-4 sm:p-5">
        <h2 className="mb-4 font-display text-lg font-medium">Pricing &amp; capacity</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Price (₦)" type="number" required min="0" value={form.price_amount} onChange={(e) => set("price_amount", e.target.value)} error={errors.price_amount?.[0]} />
          <Select label="Price period" value={form.price_period} onChange={(e) => set("price_period", e.target.value)}>
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
          <Input label="Bedrooms" type="number" min="0" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
          <Input label="Bathrooms" type="number" min="0" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
          <Input label="Max occupants" type="number" min="1" value={form.max_occupants} onChange={(e) => set("max_occupants", e.target.value)} />
        </div>
      </section>

      <section className="rounded-xl border border-border p-4 sm:p-5">
        <h2 className="mb-4 font-display text-lg font-medium">Location</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="University"
            value={form.university_id}
            onChange={(e) => {
              set("university_id", e.target.value);
              set("location_id", "");
            }}
          >
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
          <Select label="Area / location" required value={form.location_id} onChange={(e) => set("location_id", e.target.value)} error={errors.location_id?.[0]}>
            <option value="">Select an area</option>
            {filteredLocations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
          <Input label="Full address" required value={form.address_line} onChange={(e) => set("address_line", e.target.value)} error={errors.address_line?.[0]} placeholder="Street, closest landmark" className="sm:col-span-2" />
          <Input label="Distance to campus (km, optional)" type="number" step="0.1" min="0" value={form.distance_to_campus_km} onChange={(e) => set("distance_to_campus_km", e.target.value)} />
        </div>
      </section>

      <section className="rounded-xl border border-border p-4 sm:p-5">
        <h2 className="mb-4 font-display text-lg font-medium">Facilities</h2>
        <div className="flex flex-wrap gap-2">
          {facilities.map((f) => (
            <button
              type="button"
              key={f.id}
              onClick={() => toggleFacility(f.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                form.facility_ids.includes(f.id) ? "border-brand-700 bg-brand-50 text-brand-700" : "border-border text-ink hover:bg-surface"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border p-4 sm:p-5">
        <h2 className="mb-1 font-display text-lg font-medium">Photos</h2>
        <p className="mb-4 text-xs text-muted">Paste a hosted image URL (e.g. from your phone&apos;s cloud backup or an image host) and add it. The first photo becomes the cover image.</p>
        <div className="flex gap-2">
          <Input placeholder="https://..." value={imageInput} onChange={(e) => setImageInput(e.target.value)} className="flex-1" />
          <Button type="button" variant="outline" onClick={addImage}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {form.image_urls.length > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {form.image_urls.map((url, i) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center bg-surface-2 text-[10px] text-muted">
                  Couldn&apos;t load
                </div>
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-ink/70 px-1.5 py-0.5 text-[10px] text-white">Cover</span>}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-xs text-muted">
            <ImagePlus className="h-4 w-4" /> No photos added yet
          </div>
        )}
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Save changes" : "Submit for review"}
        </Button>
      </div>
    </form>
  );
}