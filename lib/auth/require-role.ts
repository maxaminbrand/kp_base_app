import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import type { MyAppRole } from "@/lib/auth/my-app-claims";
import type { ServerUser } from "@/lib/auth/get-server-user";

export async function requireRole(
  allowed: MyAppRole[],
  opts?: { redirectTo?: string; unauthRedirectTo?: string }
): Promise<ServerUser> {
  const user = await requireAuth(opts?.unauthRedirectTo ?? "/login");

  const role = user.claims.appRole;
  if (!role || !allowed.includes(role)) {
    redirect(opts?.redirectTo ?? "/dashboard");
  }

  return user;
}