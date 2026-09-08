// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 422 });
  }

  const { email, password } = parsed.data;

  const { rows } = await query(
    `select id, role, full_name, email, password_hash, status from users where email = $1`,
    [email]
  );
  const user = rows[0];

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  if (user.status === "suspended") {
    return NextResponse.json(
      { error: "Your account has been suspended. Contact support for help." },
      { status: 403 }
    );
  }

  const token = await createSessionToken(user);
  await setSessionCookie(token);

  const { password_hash, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}
