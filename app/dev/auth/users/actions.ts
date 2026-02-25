"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

type AppRole = "dev" | "admin" | "staff" | "owner" | "user";

function cookieName() {
  return process.env.AUTH_SESSION_COOKIE_NAME ?? "session";
}

async function requireDev() {
  const store = await cookies();
  const session = store.get(cookieName())?.value;
  if (!session) throw new Error("Unauthorized");

  const decoded = await adminAuth.verifySessionCookie(session, true);
  const appRole = (decoded as any).appRole as string | undefined;
  if (appRole !== "dev") throw new Error("Forbidden");
}

function nowIso() {
  return new Date().toISOString();
}

/**
 * Dev-only:
 * - Create user (optional temp password)
 * - Set custom claim appRole
 * - Write profiles/{uid}
 * - Generate password reset link (always)
 */
export async function createUserAction(formData: FormData) {
  await requireDev();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "user") as AppRole;

  const setTempPassword = String(formData.get("setTempPassword") ?? "") === "on";
  const tempPassword = String(formData.get("tempPassword") ?? "");

  if (!email) throw new Error("Email is required.");

  if (setTempPassword) {
    if (!tempPassword || tempPassword.length < 6) {
      throw new Error("Temp password must be at least 6 characters.");
    }
  }

  // Create Auth user (password optional)
  const user = await adminAuth.createUser(
    setTempPassword
      ? { email, password: tempPassword, emailVerified: false, disabled: false }
      : { email, emailVerified: false, disabled: false }
  );

  await adminAuth.setCustomUserClaims(user.uid, { appRole: role });

  await adminDb.collection("profiles").doc(user.uid).set(
    {
      uid: user.uid,
      email,
      role,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    { merge: true }
  );

  const resetLink = await adminAuth.generatePasswordResetLink(email);

  return {
    ok: true as const,
    uid: user.uid,
    email,
    role,
    resetLink,
    tempPasswordSet: setTempPassword,
  };
}