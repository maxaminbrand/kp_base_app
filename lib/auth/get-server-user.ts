import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { getMyAppClaims, type MyAppClaims } from "@/lib/auth/my-app-claims";

export type ServerUser = {
  uid: string;
  email: string | null;
  claims: MyAppClaims;
};

export async function getServerUser(): Promise<ServerUser | null> {
  const sessionCookieName = process.env.AUTH_SESSION_COOKIE_NAME ?? "session";

  const cookieStore = await cookies(); // ✅ cookies() is async in your Next version
  const sessionCookie = cookieStore.get(sessionCookieName)?.value;

  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decoded.uid,
      email: (decoded.email as string | undefined) ?? null,
      claims: getMyAppClaims(decoded as unknown as Record<string, unknown>),
    };
  } catch {
    return null;
  }
}