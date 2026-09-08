// app/api/favourites/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFavouriteIds } from "@/lib/queries/favourites";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const ids = await getFavouriteIds(user.id);
  return NextResponse.json({ ids });
}
