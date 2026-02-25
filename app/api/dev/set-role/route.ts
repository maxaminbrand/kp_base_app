import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export const runtime = "nodejs";

type MyAppRole = "owner" | "admin" | "staff" | "dev";
const ALLOWED_ROLES = new Set<MyAppRole>(["owner", "admin", "staff", "dev"]);

function parseAllowlist(envValue: string | undefined) {
  if (!envValue) return [];
  return envValue
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * Dev role setter (script-friendly)
 *
 * Auth:
 * - Requires header: x-dev-secret === DEV_ADMIN_SECRET
 * - Additionally restricts TARGET user to DEV_ADMIN_EMAIL_ALLOWLIST (by email)
 *
 * Env:
 * - DEV_ADMIN_SECRET (required)
 * - DEV_ADMIN_EMAIL_ALLOWLIST (required): comma-separated emails
 */
export async function POST(req: Request) {
  const secret = req.headers.get("x-dev-secret") ?? "";
  const serverSecret = process.env.DEV_ADMIN_SECRET ?? "";
  if (!serverSecret || secret !== serverSecret) return jsonError("Unauthorized", 401);

  const allowlist = parseAllowlist(process.env.DEV_ADMIN_EMAIL_ALLOWLIST);
  if (allowlist.length === 0) return jsonError("Server misconfigured (empty allowlist)", 500);

  const body = (await req.json().catch(() => ({}))) as {
    uid?: string;
    email?: string;
    appRole?: MyAppRole;
  };

  const appRole = body.appRole;
  if (!appRole || !ALLOWED_ROLES.has(appRole)) return jsonError("Invalid appRole", 400);

  // Resolve target user
  let targetUser:
    | Awaited<ReturnType<typeof adminAuth.getUser>>
    | Awaited<ReturnType<typeof adminAuth.getUserByEmail>>;

  if (body.email && typeof body.email === "string") {
    targetUser = await adminAuth.getUserByEmail(body.email);
  } else if (body.uid && typeof body.uid === "string") {
    targetUser = await adminAuth.getUser(body.uid);
  } else {
    return jsonError("Provide uid or email", 400);
  }

  const targetEmail = (targetUser.email ?? "").toLowerCase();
  if (!targetEmail || !allowlist.includes(targetEmail)) {
    return jsonError("Target email not allowlisted", 403);
  }

  // Merge claims
  const prev = (targetUser.customClaims ?? {}) as Record<string, unknown>;
  const nextClaims = { ...prev, appRole };

  await adminAuth.setCustomUserClaims(targetUser.uid, nextClaims);

  return NextResponse.json({
    ok: true,
    target: { uid: targetUser.uid, email: targetUser.email ?? null, appRole },
  });
}