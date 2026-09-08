// components/auth/RegisterForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Building2, Briefcase } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const ROLE_HOME = {
  student: "/dashboard",
  landlord: "/owner",
  agent: "/owner",
};

const ROLES = [
  { value: "student", label: "Student", icon: GraduationCap, blurb: "Search & save rooms" },
  { value: "landlord", label: "Landlord", icon: Building2, blurb: "List your property" },
  { value: "agent", label: "Agent", icon: Briefcase, blurb: "Manage listings for owners" },
];

export default function RegisterForm({ universities, defaultRole }) {
  const router = useRouter();
  const [form, setForm] = useState({
    role: defaultRole && ROLES.some((r) => r.value === defaultRole) ? defaultRole : "student",
    full_name: "",
    email: "",
    phone: "",
    password: "",
    university_id: universities[0]?.id || "",
    agency_name: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setErrors({});
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setErrors(data.fieldErrors || {});
        setLoading(false);
        return;
      }
      router.push(ROLE_HOME[data.user.role] || "/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-lg border border-danger-500/30 bg-danger-100 px-3.5 py-2.5 text-sm text-danger-600">
          {error}
        </p>
      )}

      <div>
        <span className="mb-2 block text-sm font-medium text-ink">I am a...</span>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map(({ value, label, icon: Icon, blurb }) => (
            <button
              type="button"
              key={value}
              onClick={() => set("role", value)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-colors ${
                form.role === value ? "border-brand-700 bg-brand-50" : "border-border hover:bg-surface"
              }`}
            >
              <Icon className={`h-5 w-5 ${form.role === value ? "text-brand-700" : "text-muted"}`} />
              <span className="text-xs font-semibold text-ink">{label}</span>
              <span className="hidden text-[10px] text-muted sm:block">{blurb}</span>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Full name"
        required
        value={form.full_name}
        onChange={(e) => set("full_name", e.target.value)}
        error={errors.full_name?.[0]}
        placeholder="Your full name"
      />
      <Input
        label="Email address"
        type="email"
        required
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        error={errors.email?.[0]}
        placeholder="you@example.com"
        autoComplete="email"
      />
      <Input
        label="Phone number"
        type="tel"
        value={form.phone}
        onChange={(e) => set("phone", e.target.value)}
        placeholder="+234..."
      />

      {form.role === "student" && (
        <Select
          label="University"
          required
          value={form.university_id}
          onChange={(e) => set("university_id", e.target.value)}
          error={errors.university_id?.[0]}
        >
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
      )}

      {form.role === "agent" && (
        <Input
          label="Agency name (optional)"
          value={form.agency_name}
          onChange={(e) => set("agency_name", e.target.value)}
          placeholder="e.g. Ife Homes Realty"
        />
      )}

      <Input
        label="Password"
        type="password"
        required
        value={form.password}
        onChange={(e) => set("password", e.target.value)}
        error={errors.password?.[0]}
        placeholder="At least 8 characters"
        autoComplete="new-password"
      />

      <Button type="submit" size="lg" disabled={loading} className="mt-1">
        {loading ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
