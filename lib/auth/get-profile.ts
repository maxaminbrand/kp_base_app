import { adminDb } from "@/lib/firebase/admin";

export type ProfileDoc = Record<string, unknown> & {
  uid?: string;
};

export async function getProfile(uid: string): Promise<ProfileDoc | null> {
  const snap = await adminDb.collection("profiles").doc(uid).get();
  if (!snap.exists) return null;
  return snap.data() as ProfileDoc;
}