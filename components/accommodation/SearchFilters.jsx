// components/accommodation/SearchFilters.jsx
"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { propertyTypeLabel } from "@/lib/format";

const PROPERTY_TYPES = ["self_contain", "room_and_parlour", "shared_room", "flat", "hostel", "duplex"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "distance", label: "Closest to campus" },
  { value: "rating", label: "Top rated" },
];

export default function SearchFilters({ universities, locations, facilities }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    q: searchParams.get("q") || "",
    universityId: searchParams.get("universityId") || "",
    locationId: searchParams.get("locationId") || "",
    propertyType: searchParams.get("propertyType") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minBedrooms: searchParams.get("minBedrooms") || "",
    availableOnly: searchParams.get("availableOnly") === "1",
    verifiedOnly: searchParams.get("verifiedOnly") === "1",
    facilities: searchParams.getAll("facility"),
    sort: searchParams.get("sort") || "newest",
  });

  const filteredLocations = form.universityId
    ? locations.filter((l) => l.university_id === form.universityId)
    : locations;

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleFacility(id) {
    setForm((f) => ({
      ...f,
      facilities: f.facilities.includes(id) ? f.facilities.filter((x) => x !== id) : [...f.facilities, id],
    }));
  }

  function apply() {
    const params = new URLSearchParams();
    if (form.q) params.set("q", form.q);
    if (form.universityId) params.set("universityId", form.universityId);
    if (form.locationId) params.set("locationId", form.locationId);
    if (form.propertyType) params.set("propertyType", form.propertyType);
    if (form.minPrice) params.set("minPrice", form.minPrice);
    if (form.maxPrice) params.set("maxPrice", form.maxPrice);
    if (form.minBedrooms) params.set("minBedrooms", form.minBedrooms);
    if (form.availableOnly) params.set("availableOnly", "1");
    if (form.verifiedOnly) params.set("verifiedOnly", "1");
    if (form.sort && form.sort !== "newest") params.set("sort", form.sort);
    for (const f of form.facilities) params.append("facility", f);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  function reset() {
    setForm({
      q: "",
      universityId: "",
      locationId: "",
      propertyType: "",
      minPrice: "",
      maxPrice: "",
      minBedrooms: "",
      availableOnly: false,
      verifiedOnly: false,
      facilities: [],
      sort: "newest",
    });
    router.push(pathname);
    setOpen(false);
  }

  const activeCount = [
    form.universityId,
    form.locationId,
    form.propertyType,
    form.minPrice,
    form.maxPrice,
    form.minBedrooms,
    form.availableOnly,
    form.verifiedOnly,
    ...form.facilities,
  ].filter(Boolean).length;

  const body = (
    <div className="flex flex-col gap-5">
      <Input
        label="Keyword"
        placeholder="e.g. self-contain, Damico, wifi"
        value={form.q}
        onChange={(e) => update("q", e.target.value)}
      />

      <Select label="University" value={form.universityId} onChange={(e) => update("universityId", e.target.value)}>
        <option value="">All universities</option>
        {universities.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </Select>

      <Select label="Area / location" value={form.locationId} onChange={(e) => update("locationId", e.target.value)}>
        <option value="">All areas</option>
        {filteredLocations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </Select>

      <Select label="Room type" value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)}>
        <option value="">Any type</option>
        {PROPERTY_TYPES.map((t) => (
          <option key={t} value={t}>
            {propertyTypeLabel(t)}
          </option>
        ))}
      </Select>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">Price range (₦ per session)</span>
        <div className="flex items-center gap-2">
          <Input
            aria-label="Minimum price"
            type="number"
            min="0"
            placeholder="Min"
            value={form.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
          />
          <span className="text-muted">–</span>
          <Input
            aria-label="Maximum price"
            type="number"
            min="0"
            placeholder="Max"
            value={form.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
          />
        </div>
      </div>

      <Select label="Minimum bedrooms" value={form.minBedrooms} onChange={(e) => update("minBedrooms", e.target.value)}>
        <option value="">Any</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
      </Select>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">Facilities</span>
        <div className="flex flex-wrap gap-2">
          {facilities.map((f) => (
            <button
              type="button"
              key={f.id}
              onClick={() => toggleFacility(f.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                form.facilities.includes(f.id)
                  ? "border-brand-700 bg-brand-50 text-brand-700"
                  : "border-border text-ink hover:bg-surface"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.availableOnly}
            onChange={(e) => update("availableOnly", e.target.checked)}
            className="h-4 w-4 rounded border-border text-brand-700 focus:ring-brand-500"
          />
          Available now only
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.verifiedOnly}
            onChange={(e) => update("verifiedOnly", e.target.checked)}
            className="h-4 w-4 rounded border-border text-brand-700 focus:ring-brand-500"
          />
          Verified listings only
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" onClick={reset} type="button">
          Reset
        </Button>
        <Button className="flex-1" onClick={apply} type="button">
          Show results
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-24 rounded-xl border border-border bg-paper p-5">
          <h2 className="mb-4 font-display text-lg font-medium">Filters</h2>
          {body}
        </div>
      </aside>

      {/* Mobile trigger + sort */}
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-paper px-4 py-2.5 text-sm font-medium"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
        <select
          value={form.sort}
          onChange={(e) => {
            update("sort", e.target.value);
            const params = new URLSearchParams(searchParams.toString());
            params.set("sort", e.target.value);
            router.push(`${pathname}?${params.toString()}`);
          }}
          className="rounded-lg border border-border bg-paper px-3 py-2.5 text-sm"
          aria-label="Sort by"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop sort row */}
      <div className="mb-4 hidden justify-end lg:flex">
        <select
          value={form.sort}
          onChange={(e) => {
            update("sort", e.target.value);
            const params = new URLSearchParams(searchParams.toString());
            params.set("sort", e.target.value);
            router.push(`${pathname}?${params.toString()}`);
          }}
          className="rounded-lg border border-border bg-paper px-3 py-2 text-sm"
          aria-label="Sort by"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile filter sheet */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button className="absolute inset-0 bg-ink/40" aria-label="Close filters" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-paper p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-medium">Filters</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1.5 hover:bg-surface">
                <X className="h-5 w-5" />
              </button>
            </div>
            {body}
          </div>
        </div>
      )}
    </>
  );
}
