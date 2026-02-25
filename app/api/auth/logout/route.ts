import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function POST() {
  const store = await cookies();
  const cookieName = process.env.AUTH_SESSION_COOKIE_NAME ?? "session";
  const session = store.get(cookieName)?.value;

  // Best-effort revoke, then clear cookie
  if (session) {
    try {
      const decoded = await adminAuth.verifySessionCookie(session, true);
      await adminAuth.revokeRefreshTokens(decoded.uid);
    } catch {
      // ignore — still clear cookie
    }
  }

  store.set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}