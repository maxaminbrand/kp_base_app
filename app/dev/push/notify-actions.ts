"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { sendToAll, sendToTopic, sendToUser, subscribeTokenToTopic, unsubscribeTokenFromTopic } from "@/lib/notifications/fcm-admin";

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
  return decoded.uid as string;
}

function getStr(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

export async function subscribeTopicAction(formData: FormData) {
  await requireDev();
  const token = getStr(formData, "token");
  const topic = getStr(formData, "topic");
  const res = await subscribeTokenToTopic(token, topic);
  return { ok: true as const, res };
}

export async function unsubscribeTopicAction(formData: FormData) {
  await requireDev();
  const token = getStr(formData, "token");
  const topic = getStr(formData, "topic");
  const res = await unsubscribeTokenFromTopic(token, topic);
  return { ok: true as const, res };
}

export async function sendToAllAction(formData: FormData) {
  await requireDev();
  const title = getStr(formData, "title") || "Notification";
  const body = getStr(formData, "body");
  const link = getStr(formData, "link") || "/";
  return await sendToAll({ title, body, link });
}

export async function sendToTopicAction(formData: FormData) {
  await requireDev();
  const topic = getStr(formData, "topic");
  const title = getStr(formData, "title") || "Notification";
  const body = getStr(formData, "body");
  const link = getStr(formData, "link") || "/";
  return await sendToTopic(topic, { title, body, link });
}

export async function sendToUserAction(formData: FormData) {
  await requireDev();
  const uid = getStr(formData, "uid");
  const title = getStr(formData, "title") || "Notification";
  const body = getStr(formData, "body");
  const link = getStr(formData, "link") || "/";
  return await sendToUser(uid, { title, body, link });
}