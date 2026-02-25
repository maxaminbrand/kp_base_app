import { PushTools } from "@/components/dev/push-tools";

export const runtime = "nodejs";

export default function DevPushPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-6">
        <h1 className="text-xl font-semibold">Push Notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dev tools for FCM token registration and test notifications.
        </p>
      </div>

      <PushTools />
    </div>
  );
}