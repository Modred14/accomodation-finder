// app/api/reports/route.js
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createReport, getReportsForUser, getAllReports } from "@/lib/queries/reports";

const schema = z.object({
  propertyId: z.string().uuid().optional(),
  reason: z.enum(["fraudulent", "inaccurate", "unavailable", "inappropriate", "other"]),
  details: z.string().max(1000).optional().or(z.literal("")),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  if (user.role === "admin") {
    const items = await getAllReports();
    return NextResponse.json({ items });
  }
  const items = await getReportsForUser(user.id);
  return NextResponse.json({ items });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please select a reason for reporting." }, { status: 422 });
  }

  const report = await createReport(user.id, {
    property_id: parsed.data.propertyId,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });

  return NextResponse.json({ report });
}
