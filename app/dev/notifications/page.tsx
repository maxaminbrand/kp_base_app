import { NotificationManager } from "@/components/dev/notification-manager";

export const runtime = "nodejs";

export default function DevNotificationsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-6">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dev tools for sending FCM notifications and managing topic subscriptions.
        </p>
      </div>

      <NotificationManager />
    </div>
  );
}