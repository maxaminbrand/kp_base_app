import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/get-server-user";
import type { MyAppRole } from "@/lib/auth/my-app-claims";

export async function requireAppRole(
  allowed: MyAppRole[],
  opts?: { unauthRedirectTo?: string; unauthorizedRedirectTo?: string }
) {
  const user = await getServerUser();
  if (!user) redirect(opts?.unauthRedirectTo ?? "/login");

  const role = user.claims.appRole; // normalized by getMyAppClaims()
  if (!allowed.includes(role)) {
    redirect(opts?.unauthorizedRedirectTo ?? "/dashboard");
  }

  return user;
}