// app/api/reports/[id]/route.js
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { resolveReport } from "@/lib/queries/reports";

const ALLOWED = ["reviewed", "resolved", "dismissed"];

export async function PATCH(request, { params }) {
  const { id } = await params;
  const admin = await requireRole("admin");
  if (!admin) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

  const { status } = await request.json().catch(() => ({}));
  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 422 });
  }

  const report = await resolveReport(id, admin.id, status);
  if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });
  return NextResponse.json({ report });
}
