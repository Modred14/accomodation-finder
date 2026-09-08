// app/api/admin/users/[id]/route.js
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { setUserStatus, setUserVerified } from "@/lib/queries/admin";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const admin = await requireRole("admin");
  if (!admin) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

  if (id === admin.id) {
    return NextResponse.json({ error: "You cannot modify your own account here." }, { status: 400 });
  }

  const { status, is_verified } = await request.json().catch(() => ({}));
  let user;
  if (status) user = await setUserStatus(id, status);
  if (is_verified !== undefined) user = await setUserVerified(id, is_verified);

  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json({ user });
}
