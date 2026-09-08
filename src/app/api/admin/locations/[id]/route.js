// app/api/admin/locations/[id]/route.js
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { updateLocation, deleteLocation, getLocationById } from "@/lib/queries/universities";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const admin = await requireRole("admin");
  if (!admin) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

  const existing = await getLocationById(id);
  if (!existing) return NextResponse.json({ error: "Location not found." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const location = await updateLocation(id, {
    name: body.name ?? existing.name,
    description: body.description ?? existing.description,
    distance_to_campus_km: body.distance_to_campus_km ?? existing.distance_to_campus_km,
    walk_minutes: body.walk_minutes ?? existing.walk_minutes,
    is_active: body.is_active ?? existing.is_active,
  });
  return NextResponse.json({ location });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const admin = await requireRole("admin");
  if (!admin) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

  await deleteLocation(id);
  return NextResponse.json({ ok: true });
}
