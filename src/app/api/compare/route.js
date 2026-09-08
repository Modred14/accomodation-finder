// app/api/compare/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getComparisonIds, clearComparison } from "@/lib/queries/comparisons";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const ids = await getComparisonIds(user.id);
  return NextResponse.json({ ids });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await clearComparison(user.id);
  return NextResponse.json({ ok: true });
}
