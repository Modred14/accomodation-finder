// app/api/inspections/route.js
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createInspectionRequest, getInspectionsForStudent, getInspectionsForOwner } from "@/lib/queries/inspections";
import { getPropertyById } from "@/lib/queries/properties";

const schema = z.object({
  propertyId: z.string().uuid(),
  preferredDate: z.string().min(1),
  preferredTime: z.string().min(1),
  message: z.string().max(1000).optional().or(z.literal("")),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  if (user.role === "student") {
    const items = await getInspectionsForStudent(user.id);
    return NextResponse.json({ items });
  }
  if (user.role === "landlord" || user.role === "agent") {
    const items = await getInspectionsForOwner(user.id);
    return NextResponse.json({ items });
  }
  return NextResponse.json({ items: [] });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (user.role !== "student") {
    return NextResponse.json({ error: "Only students can request inspections." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please choose a preferred date and time." }, { status: 422 });
  }

  const property = await getPropertyById(parsed.data.propertyId);
  if (!property) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  const inspection = await createInspectionRequest(user.id, {
    property_id: property.id,
    owner_id: property.owner_id,
    preferred_date: parsed.data.preferredDate,
    preferred_time: parsed.data.preferredTime,
    message: parsed.data.message,
  });

  return NextResponse.json({ inspection });
}
