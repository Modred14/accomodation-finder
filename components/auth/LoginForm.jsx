// components/auth/LoginForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const ROLE_HOME = {
  student: "/dashboard",
  landlord: "/owner",
  agent: "/owner",
  admin: "/admin",
};

export default function LoginForm({ next }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push(next || ROLE_HOME[data.user.role] || "/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg border border-danger-500/30 bg-danger-100 px-3.5 py-2.5 text-sm text-danger-600">
          {error}
        </p>
      )}
      <Input
        label="Email address"
        type="email"
        required
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        placeholder="you@example.com"
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        required
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        placeholder="••••••••"
        autoComplete="current-password"
      />
      <Button type="submit" size="lg" disabled={loading} className="mt-1">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand-700 hover:underline">
          Create one
        </Link>
      </p>
      <div className="mt-2 rounded-lg bg-surface p-3 text-xs text-muted">
        <p className="font-medium text-ink">Demo accounts (password: Password123!)</p>
        <p className="mt-1">Student: chiamaka.student@oaulodge.app</p>
        <p>Landlord: bayo.landlord@oaulodge.app</p>
        <p>Agent: tunde.agent@oaulodge.app</p>
        <p>Admin: admin@oaulodge.app</p>
      </div>
    </form>
  );
}
