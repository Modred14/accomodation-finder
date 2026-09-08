// components/accommodation/ContactOwnerButton.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";

export default function ContactOwnerButton({ propertyId, isAuthenticated, isStudent }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function handleClick() {
    if (!isAuthenticated) {
      router.push(`/login?next=/accommodations`);
      return;
    }
    if (!isStudent) {
      toast("Only student accounts can message owners.", "info");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Could not start conversation.", "error");
        return;
      }
      router.push(`/dashboard/messages/${data.conversation.id}`);
    } catch {
      toast("Network error. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} size="lg" className="w-full" disabled={loading}>
      <MessageCircle className="h-4 w-4" /> {loading ? "Starting chat…" : "Message owner"}
    </Button>
  );
}
