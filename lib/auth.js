// lib/auth.js
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

const SESSION_COOKIE = "oau_session";
const SESSION_DAYS = 7;

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add it to .env.local.");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * Create a signed session JWT for a user.
 */
export async function createSessionToken(user) {
  return new SignJWT({
    sub: user.id,
    role: user.role,
    name: user.full_name,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}

/**
 * Set the session cookie on the response (Server Actions / Route Handlers).
 */
export async function setSessionCookie(token) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export { SESSION_COOKIE };

/**
 * Read + verify the current session from cookies (Server Components / Route Handlers).
 * Returns the decoded payload ({ sub, role, name, email }) or null.
 */
export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Read the session and hydrate the full current user row from the database.
 * Returns null if there is no valid session or the user no longer exists.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.sub) return null;
  const { rows } = await query(
    `select id, role, full_name, email, phone, university_id, avatar_url,
            agency_name, bio, is_verified, status, created_at
       from users where id = $1`,
    [session.sub]
  );
  return rows[0] || null;
}

/**
 * Throws-free guard for use inside Server Components/route handlers.
 * Returns the user, or null if unauthenticated / wrong role.
 */
export async function requireRole(roles) {
  const user = await getCurrentUser();
  if (!user) return null;
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(user.role)) return null;
  return user;
}
