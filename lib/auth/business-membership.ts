import { adminDb } from "@/lib/firebase/admin";
import type { BusinessRole } from "@/lib/auth/roles";

export type BusinessMembership = {
  businessId: string;
  uid: string;
  role: BusinessRole;
};

export async function getBusinessMembership(
  businessId: string,
  uid: string
): Promise<BusinessMembership | null> {
  const ref = adminDb.collection("businesses").doc(businessId).collection("members").doc(uid);
  const snap = await ref.get();

  if (!snap.exists) return null;

  const data = snap.data() as { role?: BusinessRole } | undefined;
  const role = data?.role;

  if (!role) return null;

  return { businessId, uid, role };
}