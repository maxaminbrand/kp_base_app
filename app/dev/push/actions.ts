"use server";

import { cookies } from "next/headers";
import admin from "firebase-admin";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

function cookieName() {
  return process.env.AUTH_SESSION_COOKIE_NAME ?? "session";
}

async function requireDevUid() {
  const store = await cookies();
  const session = store.get(cookieName())?.value;
  if (!session) throw new Error("Unauthorized");

  const decoded = await adminAuth.verifySessionCookie(session, true);
  const appRole = (decoded as any).appRole as string | undefined;
  if (appRole !== "dev") throw new Error("Forbidden");
  return decoded.uid as string;
}

function nowIso() {
  return new Date().toISOString();
}

export async function saveFcmTokenAction(formData: FormData) {
  const uid = await requireDevUid();

  const token = String(formData.get("token") ?? "").trim();
  if (!token) throw new Error("Missing token.");

  await adminDb
    .collection("profiles")
    .doc(uid)
    .collection("fcmTokens")
    .doc(token)
    .set(
      {
        token,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        userAgent: String(formData.get("userAgent") ?? ""),
      },
      { merge: true }
    );

  return { ok: true as const };
}

export async function sendTestPushAction(formData: FormData) {
  await requireDevUid();

  const token = String(formData.get("token") ?? "").trim();
  const title = String(formData.get("title") ?? "Test notification").trim() || "Test notification";
  const body = String(formData.get("body") ?? "This is a test push from /dev/push").trim();
  const link = String(formData.get("link") ?? "/").trim() || "/";

  if (!token) throw new Error("Missing token.");

  const app = admin.apps.length ? admin.app() : undefined;
  if (!app) throw new Error("Firebase Admin not initialized.");

  const msgId = await admin.messaging().send({
    token,
    notification: { title, body },
    data: { link },
    webpush: {
      fcmOptions: { link },
    },
  });

  return { ok: true as const, messageId: msgId };
}