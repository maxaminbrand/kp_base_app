export type AppRole = "owner" | "admin" | "staff" | "dev";

export type BusinessRole = "owner" | "admin" | "staff" | "viewer";

export type Permission =
  | "supplies:read"
  | "supplies:write"
  | "deals:read"
  | "deals:write"
  | "business:manage"
  | "members:manage";