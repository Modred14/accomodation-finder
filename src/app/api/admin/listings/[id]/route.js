// app/api/admin/listings/[id]/route.js
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { setPropertyStatus, getPropertyById } from "@/lib/queries/properties";

const ALLOWED_STATUS = ["published", "rejected", "pending_review", "archived"];

export async function PATCH(request, { params }) {
  const { id } = await params;
  const admin = await requireRole("admin");
  if (!admin) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

  const property = await getPropertyById(id);
  if (!property) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  const { status, verified, notes } = await request.json().catch(() => ({}));
  if (status && !ALLOWED_STATUS.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 422 });
  }

  await setPropertyStatus(id, status || property.status, { verified, notes });
  const updated = await getPropertyById(id);
  return NextResponse.json({ property: updated });
}
