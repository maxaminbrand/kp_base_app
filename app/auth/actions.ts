"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

type MyAppRole = "owner" | "admin" | "staff" | "dev";

function normalizeRole(raw: unknown): MyAppRole {
  return raw === "dev" || raw === "admin" || raw === "staff" || raw === "owner" ? raw : "owner";
}

function isSafeNext(next: unknown): next is string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//");
}

export async function createSessionAndGetRedirectAction(input: {
  idToken: string;
  next?: string | null;
  defaultRedirectTo?: string; // ✅ caller-controlled default
}) {
  const decoded = await adminAuth.verifyIdToken(input.idToken);
  const appRole = normalizeRole((decoded as any).appRole);

  const expiresIn = 7 * 24 * 60 * 60 * 1000;
  const sessionCookie = await adminAuth.createSessionCookie(input.idToken, { expiresIn });

  const store = await cookies();
  const cookieName = process.env.AUTH_SESSION_COOKIE_NAME ?? "session";

  store.set(cookieName, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn / 1000,
  });

  const roleDefault = appRole === "dev" ? "/dev" : (input.defaultRedirectTo ?? "/dashboard");
  const redirectTo = isSafeNext(input.next) ? input.next : roleDefault;

  return { ok: true as const, redirectTo, appRole };
}