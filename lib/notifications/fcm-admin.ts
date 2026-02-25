import admin from "firebase-admin";
import { adminDb } from "@/lib/firebase/admin";

export type SendPayload = {
  title: string;
  body?: string;
  link?: string;
};

function nowIso() {
  return new Date().toISOString();
}

/**
 * firebase-admin Message is a union (Token/Topic/Condition).
 * In v13.6.1 there is no exported BaseMessage type, so we derive a safe base from TokenMessage.
 */
type FcmBaseMessage = Omit<admin.messaging.TokenMessage, "token">;

function buildBaseMessage(payload: SendPayload): FcmBaseMessage {
  const title = payload.title;
  const body = payload.body ?? "";
  const link = payload.link ?? "/";

  return {
    notification: { title, body },
    data: { link },
    webpush: {
      fcmOptions: { link },
    },
  };
}

/**
 * Reads token doc ids from:
 * profiles/{uid}/fcmTokens/{tokenDocId == token}
 */
export async function getUserFcmTokens(uid: string): Promise<string[]> {
  const snap = await adminDb.collection("profiles").doc(uid).collection("fcmTokens").get();
  const tokens: string[] = [];
  snap.forEach((d) => {
    if (d.id) tokens.push(d.id);
  });
  return tokens;
}

export async function subscribeTokenToTopic(token: string, topic: string) {
  return await admin.messaging().subscribeToTopic([token], topic);
}

export async function unsubscribeTokenFromTopic(token: string, topic: string) {
  return await admin.messaging().unsubscribeFromTopic([token], topic);
}

export async function sendToTopic(topic: string, payload: SendPayload) {
  const base = buildBaseMessage(payload);

  const message: admin.messaging.TopicMessage = {
    ...base,
    topic,
  };

  const messageId = await admin.messaging().send(message);
  return { ok: true as const, messageId };
}

export async function sendToAll(payload: SendPayload) {
  const base = buildBaseMessage(payload);

  const message: admin.messaging.TopicMessage = {
    ...base,
    topic: "all",
  };

  const messageId = await admin.messaging().send(message);
  return { ok: true as const, messageId };
}

async function deleteTokenDoc(uid: string, token: string) {
  await adminDb.collection("profiles").doc(uid).collection("fcmTokens").doc(token).delete();
}

function isInvalidTokenError(code?: string) {
  return code === "messaging/invalid-registration-token" || code === "messaging/registration-token-not-registered";
}

export async function sendToUser(uid: string, payload: SendPayload) {
  const tokens = await getUserFcmTokens(uid);

  if (!tokens.length) {
    return { ok: true as const, attempted: 0, success: 0, failures: 0, deleted: 0 };
  }

  const base = buildBaseMessage(payload);

  let success = 0;
  let failures = 0;
  let deleted = 0;

  const chunkSize = 500;
  for (let i = 0; i < tokens.length; i += chunkSize) {
    const batch = tokens.slice(i, i + chunkSize);

    const res = await admin.messaging().sendEachForMulticast({
      ...base,
      tokens: batch,
    });

    success += res.successCount ?? 0;
    failures += res.failureCount ?? 0;

    if (res.responses?.length) {
      const deletes: Promise<void>[] = [];

      res.responses.forEach((r, idx) => {
        if (r.success) return;
        const code = (r.error as any)?.code as string | undefined;
        if (isInvalidTokenError(code)) {
          const badToken = batch[idx];
          deleted += 1;
          deletes.push(deleteTokenDoc(uid, badToken));
        }
      });

      if (deletes.length) await Promise.allSettled(deletes);
    }
  }

  return { ok: true as const, attempted: tokens.length, success, failures, deleted };
}