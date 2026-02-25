"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebase/admin";
import { sendToAll, sendToTopic, sendToUser, type SendPayload } from "@/lib/notifications/fcm-admin";

function getString(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function buildPayload(fd: FormData): SendPayload {
  const title = getString(fd, "title");
  const body = getString(fd, "body");
  const link = getString(fd, "link") || "/";

  if (!title) throw new Error("Title is required.");

  return {
    title,
    body: body || undefined,
    link,
  };
}

export async function sendToAllAction(fd: FormData) {
  const payload = buildPayload(fd);
  return await sendToAll(payload);
}

export async function sendToTopicAction(fd: FormData) {
  const topic = getString(fd, "topic");
  if (!topic) throw new Error("Topic is required.");
  const payload = buildPayload(fd);
  return await sendToTopic(topic, payload);
}

export async function sendToUserAction(fd: FormData) {
  const uid = getString(fd, "uid");
  if (!uid) throw new Error("User UID is required.");
  const payload = buildPayload(fd);
  return await sendToUser(uid, payload);
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Loads token doc ids from profiles/{uid}/fcmTokens/{tokenDocId==token}
 */
async function getUserTokens(uid: string): Promise<string[]> {
  const snap = await adminDb.collection("profiles").doc(uid).collection("fcmTokens").get();
  const tokens: string[] = [];
  snap.forEach((d) => {
    if (d.id) tokens.push(d.id);
  });
  return tokens;
}

export async function subscribeUserToTopicAction(fd: FormData) {
  const uid = getString(fd, "uid");
  const topic = getString(fd, "topic");
  if (!uid) throw new Error("User UID is required.");
  if (!topic) throw new Error("Topic is required.");

  const tokens = await getUserTokens(uid);
  if (!tokens.length) {
    return { ok: true as const, uid, topic, tokens: 0, subscribed: 0, failures: 0 };
  }

  let subscribed = 0;
  let failures = 0;

  // Admin SDK supports up to 1000 tokens per call.
  for (const batchTokens of chunk(tokens, 1000)) {
    const res = await admin.messaging().subscribeToTopic(batchTokens, topic);
    subscribed += res.successCount ?? 0;
    failures += res.failureCount ?? 0;
  }

  return { ok: true as const, uid, topic, tokens: tokens.length, subscribed, failures };
}

export async function unsubscribeUserFromTopicAction(fd: FormData) {
  const uid = getString(fd, "uid");
  const topic = getString(fd, "topic");
  if (!uid) throw new Error("User UID is required.");
  if (!topic) throw new Error("Topic is required.");

  const tokens = await getUserTokens(uid);
  if (!tokens.length) {
    return { ok: true as const, uid, topic, tokens: 0, unsubscribed: 0, failures: 0 };
  }

  let unsubscribed = 0;
  let failures = 0;

  for (const batchTokens of chunk(tokens, 1000)) {
    const res = await admin.messaging().unsubscribeFromTopic(batchTokens, topic);
    unsubscribed += res.successCount ?? 0;
    failures += res.failureCount ?? 0;
  }

  return { ok: true as const, uid, topic, tokens: tokens.length, unsubscribed, failures };
}