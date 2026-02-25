import { redirect } from "next/navigation";
import { getServerUser, type ServerUser } from "@/lib/auth/get-server-user";

export async function requireAuth(redirectTo: string = "/login"): Promise<ServerUser> {
  const user = await getServerUser();
  if (!user) redirect(redirectTo);
  return user;
}