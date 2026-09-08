// app/api/reviews/route.js
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { upsertReview } from "@/lib/queries/reviews";
import { getPropertyById } from "@/lib/queries/properties";

const schema = z.object({
  propertyId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().or(z.literal("")),
});

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (user.role !== "student") {
    return NextResponse.json({ error: "Only students can leave reviews." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please choose a rating and try again." }, { status: 422 });
  }

  const property = await getPropertyById(parsed.data.propertyId);
  if (!property) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  const review = await upsertReview(user.id, parsed.data.propertyId, {
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });

  return NextResponse.json({ review });
}
