// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validation/auth";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: "Please fix the errors below.", fieldErrors }, { status: 422 });
  }

  const { role, full_name, email, phone, password, university_id, agency_name } = parsed.data;

  const { rows: existing } = await query("select id from users where email = $1", [email]);
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "An account with this email already exists.", fieldErrors: { email: ["Already registered"] } },
      { status: 409 }
    );
  }

  const password_hash = await hashPassword(password);

  const { rows } = await query(
    `insert into users (role, full_name, email, phone, password_hash, university_id, agency_name)
     values ($1,$2,$3,$4,$5,$6,$7)
     returning id, role, full_name, email, phone, university_id, is_verified, status`,
    [
      role,
      full_name,
      email,
      phone || null,
      password_hash,
      role === "student" && university_id ? university_id : null,
      role === "agent" && agency_name ? agency_name : null,
    ]
  );

  const user = rows[0];
  const token = await createSessionToken(user);
  await setSessionCookie(token);

  return NextResponse.json({ user });
}
