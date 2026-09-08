// app/api/properties/[id]/route.js
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { getPropertyById, updateProperty, deleteProperty, setPropertyAvailability } from "@/lib/queries/properties";

const schema = z.object({
  title: z.string().trim().min(5).max(150).optional(),
  description: z.string().trim().max(3000).optional(),
  property_type: z.enum(["self_contain", "room_and_parlour", "shared_room", "flat", "hostel", "duplex"]).optional(),
  room_type: z.string().trim().min(2).max(80).optional(),
  price_amount: z.coerce.number().positive().optional(),
  price_period: z.enum(["per_session", "per_year", "per_semester", "per_month"]).optional(),
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  bathrooms: z.coerce.number().int().min(0).max(20).optional(),
  max_occupants: z.coerce.number().int().min(1).max(20).optional(),
  address_line: z.string().trim().min(5).max(200).optional(),
  university_id: z.string().uuid().optional(),
  location_id: z.string().uuid().optional(),
  distance_to_campus_km: z.coerce.number().min(0).max(100).optional(),
  is_available: z.boolean().optional(),
  facility_ids: z.array(z.string().uuid()).optional(),
  image_urls: z.array(z.string().url()).max(10).optional(),
});

async function assertOwnership(id, user) {
  const property = await getPropertyById(id);
  if (!property) return null;
  if (user.role !== "admin" && property.owner_id !== user.id) return null;
  return property;
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = await requireRole(["landlord", "agent", "admin"]);
  if (!user) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

  const property = await assertOwnership(id, user);
  if (!property) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // Availability-only toggles shouldn't reset moderation status.
  const keys = Object.keys(parsed.data);
  if (keys.length === 1 && keys[0] === "is_available") {
    await setPropertyAvailability(id, parsed.data.is_available);
    const updated = await getPropertyById(id);
    return NextResponse.json({ property: updated });
  }

  const updated = await updateProperty(id, parsed.data);
  return NextResponse.json({ property: updated });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = await requireRole(["landlord", "agent", "admin"]);
  if (!user) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

  const property = await assertOwnership(id, user);
  if (!property) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  await deleteProperty(id);
  return NextResponse.json({ ok: true });
}
