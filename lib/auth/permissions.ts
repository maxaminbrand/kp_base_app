import type { AppRole, BusinessRole, Permission } from "@/lib/auth/roles";

const BUSINESS_ROLE_PERMISSIONS: Record<BusinessRole, Permission[]> = {
  owner: [
    "supplies:read",
    "supplies:write",
    "deals:read",
    "deals:write",
    "business:manage",
    "members:manage",
  ],
  admin: [
    "supplies:read",
    "supplies:write",
    "deals:read",
    "deals:write",
    "business:manage",
    "members:manage",
  ],
  staff: ["supplies:read", "supplies:write", "deals:read"],
  viewer: ["supplies:read", "deals:read"],
};

const APP_ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  // appRole "owner" is your default for normal business users (not SBBN staff)
  owner: [],
  staff: ["deals:read", "deals:write"],
  admin: ["deals:read", "deals:write", "business:manage", "members:manage"],
  dev: [
    "supplies:read",
    "supplies:write",
    "deals:read",
    "deals:write",
    "business:manage",
    "members:manage",
  ],
};

export function hasPermissionFromBusinessRole(role: BusinessRole, perm: Permission) {
  return BUSINESS_ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
}

export function hasPermissionFromAppRole(role: AppRole, perm: Permission) {
  return APP_ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
}