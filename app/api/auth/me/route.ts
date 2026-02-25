import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function GET() {
  const store = await cookies();
  const cookieName = process.env.AUTH_SESSION_COOKIE_NAME ?? "session";
  const session = store.get(cookieName)?.value;

  if (!session) {
    return NextResponse.json({ authed: false, user: null }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const uid = decoded.uid;

    const profileSnap = await adminDb.collection("profiles").doc(uid).get();
    const profile = profileSnap.exists ? (profileSnap.data() as Record<string, unknown>) : null;

    return NextResponse.json({
      authed: true,
      user: {
        uid,
        email: (decoded.email as string | undefined) ?? null,
        claims: {
          appRole: (decoded as any).appRole ?? "owner",
        },
        profile,
      },
    });
  } catch {
    return NextResponse.json({ authed: false, user: null }, { status: 401 });
  }
}