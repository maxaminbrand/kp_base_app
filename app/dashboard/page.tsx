import { requireAuth } from "@/lib/auth/require-auth";
import { adminDb } from "@/lib/firebase/admin";
import { NotificationSettings } from "@/components/notifications/notification-settings";

export const runtime = "nodejs";

async function getTokenCount(uid: string) {
  const snap = await adminDb.collection("profiles").doc(uid).collection("fcmTokens").get();
  return snap.size;
}

async function getNotificationPrefs(uid: string): Promise<{ topics: string[] }> {
  const doc = await adminDb.collection("profiles").doc(uid).get();
  const data = doc.exists ? (doc.data() as any) : null;

  const topics = Array.isArray(data?.notificationTopics) ? (data.notificationTopics as string[]) : [];
  return { topics: topics.filter((t) => typeof t === "string" && t.trim()) };
}

export default async function Page() {
  const user = await requireAuth("/login");

  const [tokenCount, prefs] = await Promise.all([getTokenCount(user.uid), getNotificationPrefs(user.uid)]);

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-2xl border p-6">
        <div className="text-lg font-semibold">Profile</div>
        <div className="mt-1 text-sm text-muted-foreground">Manage your account and preferences.</div>
      </div>

      <NotificationSettings initialTokenCount={tokenCount} initialTopics={prefs.topics} />
    </div>
  );
} 