// app/api/conversations/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getConversationsForUser, getOrCreateConversation } from "@/lib/queries/conversations";
import { getPropertyById } from "@/lib/queries/properties";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const items = await getConversationsForUser(user.id, user.role);
  return NextResponse.json({ items });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (user.role !== "student") {
    return NextResponse.json({ error: "Only students can start a conversation with an owner." }, { status: 403 });
  }

  const { propertyId } = await request.json().catch(() => ({}));
  if (!propertyId) return NextResponse.json({ error: "propertyId is required." }, { status: 400 });

  const property = await getPropertyById(propertyId);
  if (!property) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  const conversation = await getOrCreateConversation({
    studentId: user.id,
    ownerId: property.owner_id,
    propertyId: property.id,
  });

  return NextResponse.json({ conversation });
}
