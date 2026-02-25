import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";
import { DevShell } from "@/components/dev/dev-shell";

export const runtime = "nodejs";

async function requireDev() {
  const store = await cookies();
  const cookieName = process.env.AUTH_SESSION_COOKIE_NAME ?? "session";
  const session = store.get(cookieName)?.value;

  if (!session) redirect("/login");

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const appRole = (decoded as any).appRole as string | undefined;
    if (appRole !== "dev") redirect("/");
  } catch {
    redirect("/login");
  }
}

export default async function DevLayout({ children }: { children: ReactNode }) {
  await requireDev();
  return <DevShell>{children}</DevShell>;
}