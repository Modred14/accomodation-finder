// app/api/inspections/[id]/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateInspectionStatus, cancelInspection } from "@/lib/queries/inspections";

const OWNER_ALLOWED = ["confirmed", "declined", "completed"];

export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { status, note } = await request.json().catch(() => ({}));

  if (user.role === "landlord" || user.role === "agent") {
    if (!OWNER_ALLOWED.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 422 });
    }
    const updated = await updateInspectionStatus(id, user.id, status, note);
    if (!updated) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
    return NextResponse.json({ inspection: updated });
  }

  if (user.role === "student" && status === "cancelled") {
    const updated = await cancelInspection(id, user.id);
    if (!updated) return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
    return NextResponse.json({ inspection: updated });
  }

  return NextResponse.json({ error: "Not permitted." }, { status: 403 });
}
