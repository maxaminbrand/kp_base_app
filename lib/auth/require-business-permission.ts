import { redirect } from "next/navigation";
import type { Permission } from "@/lib/auth/roles";
import { hasPermissionFromBusinessRole } from "@/lib/auth/permissions";
import { requireBusinessMember } from "@/lib/auth/require-business-member";

export async function requireBusinessPermission(
  businessId: string,
  permission: Permission,
  opts?: { unauthRedirectTo?: string; unauthorizedRedirectTo?: string }
) {
  const { user, membership } = await requireBusinessMember(
    businessId,
    ["owner", "admin", "staff", "viewer"],
    opts
  );

  if (!hasPermissionFromBusinessRole(membership.role, permission)) {
    redirect(opts?.unauthorizedRedirectTo ?? "/dashboard");
  }

  return { user, membership };
}