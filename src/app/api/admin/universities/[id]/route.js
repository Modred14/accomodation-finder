// app/api/admin/universities/[id]/route.js
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { updateUniversity, deleteUniversity, getUniversityById } from "@/lib/queries/universities";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const admin = await requireRole("admin");
  if (!admin) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

  const existing = await getUniversityById(id);
  if (!existing) return NextResponse.json({ error: "University not found." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const university = await updateUniversity(id, {
    name: body.name ?? existing.name,
    short_name: body.short_name ?? existing.short_name,
    city: body.city ?? existing.city,
    state: body.state ?? existing.state,
    is_active: body.is_active ?? existing.is_active,
  });
  return NextResponse.json({ university });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const admin = await requireRole("admin");
  if (!admin) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

  await deleteUniversity(id);
  return NextResponse.json({ ok: true });
}
