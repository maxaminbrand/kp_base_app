import admin from "firebase-admin";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Firestore storage convention:
 * profiles/{uid}/fcmTokens/{tokenDocId == token}
 */
export async function getUserFcmTokens(uid: string): Promise<string[]> {
  const snap = await adminDb.collection("profiles").doc(uid).collection("fcmTokens").get();
  const tokens: string[] = [];
  snap.forEach((d) => {
    const t = d.id;
    if (t) tokens.push(t);
  });
  return tokens;
}

export async function deleteUserFcmTokens(uid: string, tokens: string[]) {
  if (!tokens.length) return;

  const batch = adminDb.batch();
  for (const t of tokens) {
    const ref = adminDb.collection("profiles").doc(uid).collection("fcmTokens").doc(t);
    batch.delete(ref);
  }
  await batch.commit();
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function shouldDeleteToken(error: unknown): boolean {
  const code = (error as any)?.code as string | undefined;
  return code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token";
}

export type SendPayload = {
  title: string;
  body?: string;
  link?: string; // used for webpush fcmOptions.link and data.link
  data?: Record<string, string>; // extra data payload (strings only)
};

function buildMessageBase(payload: SendPayload) {
  const title = payload.title || "Notification";
  const body = payload.body || "";
  const link = payload.link || "/";

  return {
    notification: { title, body },
    data: { ...(payload.data ?? {}), link },
    webpush: {
      fcmOptions: { link },
    },
  } satisfies admin.messaging.Message;
}

export async function subscribeTokenToTopic(token: string, topic: string) {
  if (!token) throw new Error("Missing token.");
  if (!topic) throw new Error("Missing topic.");

  const res = await admin.messaging().subscribeToTopic([token], topic);
  return res;
}

export async function unsubscribeTokenFromTopic(token: string, topic: string) {
  if (!token) throw new Error("Missing token.");
  if (!topic) throw new Error("Missing topic.");

  const res = await admin.messaging().unsubscribeFromTopic([token], topic);
  return res;
}

export async function sendToTopic(topic: string, payload: SendPayload) {
  if (!topic) throw new Error("Missing topic.");
  const base = buildMessageBase(payload);

  const id = await admin.messaging().send({ ...(base as any), topic });
  return { messageId: id };
}

export async function sendToAll(payload: SendPayload) {
  // Convention: "all" topic
  return sendToTopic("all", payload);
}

/**
 * Sends to all tokens a user has registered under profiles/{uid}/fcmTokens/*.
 * Also deletes invalid tokens from Firestore based on FCM error codes.
 */
export async function sendToUser(uid: string, payload: SendPayload) {
  if (!uid) throw new Error("Missing uid.");

  const tokens = await getUserFcmTokens(uid);
  if (!tokens.length) return { ok: true as const, attempted: 0, success: 0, failures: 0, deleted: 0 };

  const base = buildMessageBase(payload);

  let attempted = 0;
  let success = 0;
  let failures = 0;
  const toDelete: string[] = [];

  // sendEachForMulticast supports up to 500 tokens per call
  for (const batchTokens of chunk(tokens, 500)) {
    attempted += batchTokens.length;

    const res = await admin.messaging().sendEachForMulticast({
      tokens: batchTokens,
      notification: (base as any).notification,
      data: (base as any).data,
      webpush: (base as any).webpush,
    });

    success += res.successCount;
    failures += res.failureCount;

    res.responses.forEach((r, idx) => {
      if (!r.success && shouldDeleteToken(r.error)) {
        toDelete.push(batchTokens[idx]);
      }
    });
  }

  if (toDelete.length) {
    await deleteUserFcmTokens(uid, toDelete);
  }

  return {
    ok: true as const,
    attempted,
    success,
    failures,
    deleted: toDelete.length,
  };
}