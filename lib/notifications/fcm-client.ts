"use client";

import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase/client";

export type FcmForegroundHandler = (payload: MessagePayload) => void;

export async function ensureServiceWorkerReady() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return reg;
  } catch {
    return null;
  }
}

export async function getFcmToken(): Promise<string | null> {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) throw new Error("Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY");

  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  const swReg = await ensureServiceWorkerReady();

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: swReg ?? undefined,
  });

  return token || null;
}

export async function listenForForegroundMessages(handler: FcmForegroundHandler) {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};

  const unsubscribe = onMessage(messaging, (payload) => {
    handler(payload);
  });

  return unsubscribe;
}