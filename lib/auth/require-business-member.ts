import { redirect } from "next/navigation";
import type { BusinessRole } from "@/lib/auth/roles";
import { getBusinessMembership } from "@/lib/auth/business-membership";

/**
 * NOTE:
 * This expects you already have a working server user getter.
 * If your getServerUser() is elsewhere, swap this import to your path.
 */
import { getServerUser } from "@/lib/auth/get-server-user";

export async function requireBusinessMember(
  businessId: string,
  allowedRoles: BusinessRole[] = ["owner", "admin", "staff", "viewer"],
  opts?: { unauthRedirectTo?: string; unauthorizedRedirectTo?: string }
) {
  const user = await getServerUser();
  if (!user) redirect(opts?.unauthRedirectTo ?? "/login");

  const membership = await getBusinessMembership(businessId, user.uid);
  if (!membership || !allowedRoles.includes(membership.role)) {
    redirect(opts?.unauthorizedRedirectTo ?? "/dashboard");
  }

  return { user, membership };
}