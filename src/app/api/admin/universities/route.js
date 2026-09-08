// app/api/admin/universities/route.js
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createUniversity } from "@/lib/queries/universities";

const schema = z.object({
  name: z.string().trim().min(2).max(150),
  short_name: z.string().trim().min(2).max(20),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
});

export async function POST(request) {
  const admin = await requireRole("admin");
  if (!admin) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all fields correctly." }, { status: 422 });
  }

  const university = await createUniversity(parsed.data);
  return NextResponse.json({ university });
}
