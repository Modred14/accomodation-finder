// app/api/properties/route.js
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createProperty } from "@/lib/queries/properties";

const schema = z.object({
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  property_type: z.enum(["self_contain", "room_and_parlour", "shared_room", "flat", "hostel", "duplex"]),
  room_type: z.string().trim().min(2).max(80),
  price_amount: z.coerce.number().positive(),
  price_period: z.enum(["per_session", "per_year", "per_semester", "per_month"]),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(0).max(20),
  max_occupants: z.coerce.number().int().min(1).max(20),
  address_line: z.string().trim().min(5).max(200),
  university_id: z.string().uuid(),
  location_id: z.string().uuid(),
  distance_to_campus_km: z.coerce.number().min(0).max(100).optional(),
  facility_ids: z.array(z.string().uuid()).optional(),
  image_urls: z.array(z.string().url()).max(10).optional(),
});

export async function POST(request) {
  const user = await requireRole(["landlord", "agent"]);
  if (!user) return NextResponse.json({ error: "Only landlords and agents can list properties." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const property = await createProperty(user.id, parsed.data);
  return NextResponse.json({ property });
}
