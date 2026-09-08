// proxy.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "oau_session";

const ROLE_PREFIXES = [
  { prefix: "/dashboard", roles: ["student"] },
  { prefix: "/owner", roles: ["landlord", "agent"] },
  { prefix: "/admin", roles: ["admin"] },
];

function getSecretKey() {
  const secret = process.env.JWT_SECRET || "dev-only-secret-change-me-please-in-production-0123456789";
  return new TextEncoder().encode(secret);
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const match = ROLE_PREFIXES.find((r) => pathname.startsWith(r.prefix));
  if (!match) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!match.roles.includes(payload.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/owner/:path*", "/admin/:path*"],
};
