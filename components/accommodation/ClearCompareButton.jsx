// components/accommodation/ClearCompareButton.jsx
"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";

export default function ClearCompareButton() {
  const router = useRouter();
  const toast = useToast();

  async function handleClick() {
    await fetch("/api/compare", { method: "DELETE" });
    toast("Comparison list cleared.", "success");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      Clear all
    </Button>
  );
}
