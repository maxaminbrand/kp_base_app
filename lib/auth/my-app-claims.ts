export type MyAppRole = "owner" | "admin" | "staff" | "dev";

export type MyAppClaims = {
  appRole: MyAppRole; // always normalized
};

const ROLES = new Set<MyAppRole>(["owner", "admin", "staff", "dev"]);

export function getMyAppClaims(decodedClaims: Record<string, unknown>): MyAppClaims {
  const raw = decodedClaims?.appRole;
  const appRole: MyAppRole = typeof raw === "string" && ROLES.has(raw as MyAppRole) ? (raw as MyAppRole) : "owner";
  return { appRole };
}