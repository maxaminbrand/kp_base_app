"use server";

import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth/require-auth";
import { subscribeTokenToTopic, unsubscribeTokenFromTopic, getUserFcmTokens } from "@/lib/notifications/fcm-admin";
import { topicAll } from "@/lib/notifications/fcm-topics";

function nowIso() {
  return new Date().toISOString();
}

function getStr(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

function parseTopics(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((t) => (typeof t === "string" ? t.trim() : ""))
      .filter(Boolean)
      .slice(0, 50);
  } catch {
    return [];
  }
}

export async function saveMyFcmTokenAction(formData: FormData) {
  const user = await requireAuth("/login");

  const token = getStr(formData, "token");
  const userAgent = getStr(formData, "userAgent");

  if (!token) throw new Error("Missing token.");

  await adminDb
    .collection("profiles")
    .doc(user.uid)
    .collection("fcmTokens")
    .doc(token)
    .set(
      {
        token,
        updatedAt: nowIso(),
        createdAt: nowIso(),
        userAgent,
      },
      { merge: true }
    );

  // Ensure token is on "all" so broadcast works after opt-in.
  await subscribeTokenToTopic(token, topicAll());

  return { ok: true as const };
}

export async function removeMyFcmTokenAction(formData: FormData) {
  const user = await requireAuth("/login");
  const token = getStr(formData, "token");
  if (!token) throw new Error("Missing token.");

  // Try to unsubscribe from known topics before deleting token doc.
  const profileSnap = await adminDb.collection("profiles").doc(user.uid).get();
  const profile = profileSnap.exists ? (profileSnap.data() as any) : null;
  const topics = Array.isArray(profile?.notificationTopics) ? (profile.notificationTopics as string[]) : [];

  const uniqueTopics = Array.from(
    new Set([topicAll(), ...topics.filter((t) => typeof t === "string" && t.trim()).map((t) => t.trim())])
  );

  for (const t of uniqueTopics) {
    try {
      await unsubscribeTokenFromTopic(token, t);
    } catch {
      // ignore
    }
  }

  await adminDb.collection("profiles").doc(user.uid).collection("fcmTokens").doc(token).delete();

  return { ok: true as const };
}

export async function setMyNotificationTopicsAction(formData: FormData) {
  const user = await requireAuth("/login");

  const topicsJson = getStr(formData, "topicsJson");
  const topics = parseTopics(topicsJson);

  // Save user preference
  await adminDb
    .collection("profiles")
    .doc(user.uid)
    .set(
      {
        notificationTopics: topics,
        notificationTopicsUpdatedAt: nowIso(),
      },
      { merge: true }
    );

  // Apply to ALL tokens this user has
  const tokens = await getUserFcmTokens(user.uid);
  if (!tokens.length) {
    return { ok: true as const, topics, tokens: 0, subscribed: 0, failures: 0 };
  }

  const desiredTopics = Array.from(new Set([topicAll(), ...topics]));
  let subscribed = 0;
  let failures = 0;

  // Subscribe every token to each topic (safe, idempotent)
  for (const tok of tokens) {
    for (const t of desiredTopics) {
      try {
        const res = await subscribeTokenToTopic(tok, t);
        subscribed += res.successCount ?? 0;
        failures += res.failureCount ?? 0;
      } catch {
        failures += 1;
      }
    }
  }

  return { ok: true as const, topics, tokens: tokens.length, subscribed, failures };
}

export async function getMyFcmTokenCountAction() {
  const user = await requireAuth("/login");
  const snap = await adminDb.collection("profiles").doc(user.uid).collection("fcmTokens").get();
  return { ok: true as const, count: snap.size };
}