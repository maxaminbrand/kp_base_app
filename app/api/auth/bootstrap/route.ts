import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

function now() {
  return Date.now();
}

type BootstrapBody = {
  idToken: string;

  /**
   * IMPORTANT:
   * Do NOT allow the client to set privileged claims in production.
   * This field is only honored if ALLOW_BOOTSTRAP_CLAIMS === "true".
   */
  claims?: Record<string, unknown>;
};

const ALLOWED_APP_ROLES = new Set(["owner", "admin", "staff", "dev"] as const);

function sanitizeAppRole(value: unknown) {
  if (typeof value !== "string") return undefined;
  return ALLOWED_APP_ROLES.has(value as any) ? value : undefined;
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<BootstrapBody>;
  const idToken = body.idToken;

  if (!idToken || typeof idToken !== "string") {
    return new NextResponse("Missing idToken", { status: 400 });
  }

  // 1) Verify identity
  const decoded = await adminAuth.verifyIdToken(idToken);
  const uid = decoded.uid;

  // 2) Claims: default owner (lock-in). Optional override ONLY if explicitly enabled.
  const allowOverrides = process.env.ALLOW_BOOTSTRAP_CLAIMS === "true";

  let appRole: string = "owner";
  if (allowOverrides) {
    const overrideRole = sanitizeAppRole(body.claims?.appRole);
    if (overrideRole) appRole = overrideRole;
  }

  const finalClaims: Record<string, unknown> = { appRole };

  // 3) Set custom claims
  await adminAuth.setCustomUserClaims(uid, finalClaims);

  // 4) Ensure profile exists (profiles/{uid})
  const profileRef = adminDb.collection("profiles").doc(uid);
  const snap = await profileRef.get();

  const baseProfile = {
    uid,
    email: decoded.email ?? null,
    displayName: decoded.name ?? null,
    phone: (decoded as any).phone_number ?? null,
    activeBusinessId: null,
    updatedAt: now(),
  };

  if (!snap.exists) {
    await profileRef.set({
      ...baseProfile,
      createdAt: now(),
    });
  } else {
    await profileRef.set(baseProfile, { merge: true });
  }

  // 5) Tell client to refresh token before minting session cookie
  return NextResponse.json({ ok: true, refresh: true, appliedClaims: finalClaims });
}