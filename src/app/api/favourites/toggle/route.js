// app/api/favourites/toggle/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toggleFavourite } from "@/lib/queries/favourites";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (user.role !== "student") {
    return NextResponse.json({ error: "Only students can save favourites." }, { status: 403 });
  }

  const { propertyId } = await request.json();
  if (!propertyId) return NextResponse.json({ error: "propertyId is required." }, { status: 400 });

  const result = await toggleFavourite(user.id, propertyId);
  return NextResponse.json(result);
}
