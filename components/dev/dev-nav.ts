export type DevNavGroupId =
  | "auth"
  | "overrides"
  | "profiles"
  | "businesses"
  | "permissions"
  | "tools"
  | "quick";

export type DevNavItem = {
  label: string;
  href: string;
};

export type DevNavGroup = {
  id: DevNavGroupId;
  label: string;
  icon:
    | "home"
    | "shield"
    | "zap"
    | "user"
    | "building"
    | "key"
    | "wrench"
    | "link";
  items: DevNavItem[];
};

export const devNav = {
  top: [{ label: "Overview", href: "/dev", icon: "home" as const }],

  groups: [
    {
      id: "auth",
      label: "Auth & Session",
      icon: "shield",
      items: [
        { label: "Users", href: "/dev/auth/users" },
        { label: "Manage Users", href: "/dev/manage-users" },
        { label: "Push Notifications", href: "/dev/push" },
        { label: "Notifications", href: "/dev/notifications" },
        { label: "Current Session", href: "/dev/auth/session" },
        { label: "Claims Viewer", href: "/dev/auth/claims" },
        { label: "Revoke Sessions", href: "/dev/auth/revoke" },
      ],
    },
    {
      id: "overrides",
      label: "Overrides",
      icon: "zap",
      items: [
        { label: "Set App Role", href: "/dev/overrides/roles" },
        { label: "Force Token Refresh", href: "/dev/overrides/refresh" },
        { label: "Impersonate User", href: "/dev/overrides/impersonate" }, // placeholder (optional later)
      ],
    },
    {
      id: "profiles",
      label: "Profiles",
      icon: "user",
      items: [{ label: "Search Profiles", href: "/dev/profiles" }],
    },
    {
      id: "businesses",
      label: "Businesses",
      icon: "building",
      items: [{ label: "Businesses List", href: "/dev/businesses" }],
    },
    {
      id: "permissions",
      label: "Permissions",
      icon: "key",
      items: [
        { label: "Permission Tester", href: "/dev/permissions/test" },
        { label: "Guards Tester", href: "/dev/permissions/guards" },
        { label: "Matrix", href: "/dev/permissions/matrix" },
      ],
    },
    {
      id: "tools",
      label: "Tools",
      icon: "wrench",
      items: [
        { label: "Firestore Explorer", href: "/dev/tools/firestore" },
        { label: "Indexes Helper", href: "/dev/tools/indexes" },
        { label: "Env (safe)", href: "/dev/tools/env" },
        { label: "Jobs / Triggers", href: "/dev/tools/jobs" }, // placeholder (optional later)
      ],
    },
    {
      id: "quick",
      label: "Quick Links",
      icon: "link",
      items: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Profile", href: "/dashboard/profile" },
        { label: "Admin", href: "/admin" },
      ],
    },
  ] satisfies DevNavGroup[],
};