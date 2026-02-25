import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export const runtime = "nodejs";

type SessionBody = { idToken: string };

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<SessionBody>;
  const idToken = body.idToken;

  if (!idToken || typeof idToken !== "string") {
    return new NextResponse("Missing idToken", { status: 400 });
  }

  // Verify token (contains refreshed claims)
  await adminAuth.verifyIdToken(idToken);

  const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

  const store = await cookies();
  const cookieName = process.env.AUTH_SESSION_COOKIE_NAME ?? "session";

  store.set(cookieName, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn / 1000,
  });

  return NextResponse.json({ ok: true });
}
