// app/api/admin/locations/route.js
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createLocation } from "@/lib/queries/universities";

const schema = z.object({
  university_id: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  distance_to_campus_km: z.coerce.number().min(0).max(100).optional(),
  walk_minutes: z.coerce.number().int().min(0).max(500).optional(),
});

export async function POST(request) {
  const admin = await requireRole("admin");
  if (!admin) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all fields correctly." }, { status: 422 });
  }

  const location = await createLocation(parsed.data);
  return NextResponse.json({ location });
}
