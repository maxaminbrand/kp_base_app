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

export type ListedUser = {
  uid: string;
  email: string | null;
  disabled: boolean;
  appRole: AppRole | "unknown";
  createdAt?: string | null;
  lastSignInAt?: string | null;
};

export type ListUsersResult = {
  users: ListedUser[];
  nextPageToken: string | null;
  mode: "list" | "search";
};

function normalizeRole(v: unknown): AppRole | "unknown" {
  const s = String(v ?? "");
  return s === "dev" || s === "admin" || s === "staff" || s === "owner" || s === "user" ? s : "unknown";
}

export async function listUsersAction(params: {
  q?: string | null;
  pageToken?: string | null;
  limit?: number | null;
}): Promise<ListUsersResult> {
  await requireDev();

  const q = (params.q ?? "").trim();
  const pageToken = (params.pageToken ?? "").trim() || undefined;
  const limit = Math.min(Math.max(Number(params.limit ?? 20) || 20, 5), 100);

  // SEARCH MODE (exact matches only; fast + deterministic)
  // - if q looks like email -> getUserByEmail
  // - else treat as uid -> getUser
  if (q) {
    try {
      const rec = q.includes("@") ? await adminAuth.getUserByEmail(q) : await adminAuth.getUser(q);
      const claims = (rec.customClaims ?? {}) as Record<string, unknown>;
      const appRole = normalizeRole(claims.appRole);

      return {
        mode: "search",
        nextPageToken: null,
        users: [
          {
            uid: rec.uid,
            email: rec.email ?? null,
            disabled: rec.disabled,
            appRole,
            createdAt: rec.metadata?.creationTime ?? null,
            lastSignInAt: rec.metadata?.lastSignInTime ?? null,
          },
        ],
      };
    } catch {
      return { mode: "search", nextPageToken: null, users: [] };
    }
  }

  // LIST MODE (paged)
  const res = await adminAuth.listUsers(limit, pageToken);
  const users: ListedUser[] = res.users.map((u) => {
    const claims = (u.customClaims ?? {}) as Record<string, unknown>;
    const appRole = normalizeRole(claims.appRole);

    return {
      uid: u.uid,
      email: u.email ?? null,
      disabled: u.disabled,
      appRole,
      createdAt: u.metadata?.creationTime ?? null,
      lastSignInAt: u.metadata?.lastSignInTime ?? null,
    };
  });

  return { mode: "list", users, nextPageToken: res.pageToken ?? null };
}

export async function updateUserAction(formData: FormData) {
  await requireDev();

  const uid = String(formData.get("uid") ?? "").trim();
  const nextRole = normalizeRole(formData.get("role"));
  const disabled = String(formData.get("disabled") ?? "") === "on";

  if (!uid) throw new Error("Missing uid.");
  if (nextRole === "unknown") throw new Error("Invalid role.");

  // Update Auth user disabled/enabled
  await adminAuth.updateUser(uid, { disabled });

  // Preserve other claims, update appRole
  const existing = await adminAuth.getUser(uid);
  const existingClaims = (existing.customClaims ?? {}) as Record<string, unknown>;
  await adminAuth.setCustomUserClaims(uid, { ...existingClaims, appRole: nextRole });

  // Keep profiles/{uid} in sync (profiles collection)
  const email = existing.email ?? null;
  await adminDb.collection("profiles").doc(uid).set(
    {
      uid,
      email,
      role: nextRole,
      disabled,
      updatedAt: nowIso(),
    },
    { merge: true }
  );

  return { ok: true as const };
}