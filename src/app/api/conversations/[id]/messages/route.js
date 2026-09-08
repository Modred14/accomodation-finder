// app/api/conversations/[id]/messages/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getConversationById, getMessages, sendMessage, markConversationRead } from "@/lib/queries/conversations";

export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const conversation = await getConversationById(id, user.id);
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

  await markConversationRead(id, user.id);
  const messages = await getMessages(id);
  return NextResponse.json({ messages });
}

export async function POST(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const conversation = await getConversationById(id, user.id);
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

  const { body } = await request.json().catch(() => ({}));
  if (!body || !body.trim()) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });

  const message = await sendMessage(id, user.id, body.trim());
  return NextResponse.json({ message });
}
