"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getFcmToken, listenForForegroundMessages } from "@/lib/notifications/fcm-client";
import {
  getMyFcmTokenCountAction,
  removeMyFcmTokenAction,
  saveMyFcmTokenAction,
  setMyNotificationTopicsAction,
} from "@/app/dashboard/profile/notification-actions";

type Props = {
  initialTokenCount: number;
  initialTopics: string[];
};

type BannerState =
  | { kind: "idle" }
  | { kind: "ok"; message: string }
  | { kind: "error"; message: string };

const DEFAULT_TOPICS = [
  { key: "events", label: "Events" },
  { key: "promos", label: "Promos" },
  { key: "deals", label: "Deals" },
];

function Banner({ state }: { state: BannerState }) {
  if (state.kind === "idle") return null;
  return (
    <div className="rounded-xl border px-4 py-3 text-sm">
      <div className="font-medium">{state.kind === "ok" ? "Success" : "Error"}</div>
      <div className="mt-1 text-muted-foreground">{state.message}</div>
    </div>
  );
}

function lsKey() {
  return "sbbn_fcm_token";
}

function safePermission(): NotificationPermission | "unsupported" {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

export function NotificationSettings({ initialTokenCount, initialTopics }: Props) {
  const [banner, setBanner] = React.useState<BannerState>({ kind: "idle" });

  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">(safePermission());
  const [tokenCount, setTokenCount] = React.useState<number>(initialTokenCount);

  const [deviceToken, setDeviceToken] = React.useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(lsKey()) ?? "";
  });

  const [topics, setTopics] = React.useState<string[]>(() => {
    const cleaned = (initialTopics ?? []).map((t) => t.trim()).filter(Boolean);
    return Array.from(new Set(cleaned));
  });

  const [customTopic, setCustomTopic] = React.useState("");

  const [foreground, setForeground] = React.useState<{ title: string; body: string } | null>(null);

  React.useEffect(() => {
    let unsub: null | (() => void) = null;

    (async () => {
      unsub = await listenForForegroundMessages((payload) => {
        const t = payload?.notification?.title ?? "Notification";
        const b = payload?.notification?.body ?? "";
        setForeground({ title: t, body: b });

        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification(t, { body: b });
          } catch {
            // ignore
          }
        }
      });
    })();

    return () => {
      try {
        unsub?.();
      } catch {
        // ignore
      }
    };
  }, []);

  async function refreshCounts() {
    try {
      const res = await getMyFcmTokenCountAction();
      setTokenCount(res.count ?? 0);
    } catch {
      // ignore
    }
  }

  async function enableOnThisDevice() {
    setBanner({ kind: "idle" });

    if (typeof Notification === "undefined") {
      setBanner({ kind: "error", message: "Notifications are not supported in this browser." });
      setPermission("unsupported");
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setBanner({ kind: "error", message: `Notification permission: ${perm}` });
        return;
      }

      const token = await getFcmToken();
      if (!token) {
        setBanner({ kind: "error", message: "FCM is not supported in this environment." });
        return;
      }

      const fd = new FormData();
      fd.set("token", token);
      fd.set("userAgent", typeof navigator !== "undefined" ? navigator.userAgent : "");

      await saveMyFcmTokenAction(fd);

      setDeviceToken(token);
      if (typeof window !== "undefined") window.localStorage.setItem(lsKey(), token);

      await refreshCounts();
      setBanner({ kind: "ok", message: "Notifications enabled on this device." });
    } catch (e: any) {
      setBanner({ kind: "error", message: e?.message ?? "Failed to enable notifications." });
    }
  }

  async function disableOnThisDevice() {
    setBanner({ kind: "idle" });

    if (!deviceToken) {
      setBanner({ kind: "error", message: "No token saved for this device." });
      return;
    }

    try {
      const fd = new FormData();
      fd.set("token", deviceToken);

      await removeMyFcmTokenAction(fd);

      setDeviceToken("");
      if (typeof window !== "undefined") window.localStorage.removeItem(lsKey());

      await refreshCounts();
      setBanner({ kind: "ok", message: "Notifications disabled on this device." });
    } catch (e: any) {
      setBanner({ kind: "error", message: e?.message ?? "Failed to disable notifications." });
    }
  }

  function toggleTopic(t: string) {
    setTopics((prev) => {
      const s = new Set(prev);
      if (s.has(t)) s.delete(t);
      else s.add(t);
      return Array.from(s);
    });
  }

  function addCustomTopic() {
    const t = customTopic.trim();
    if (!t) return;
    setTopics((prev) => Array.from(new Set([...prev, t])));
    setCustomTopic("");
  }

  async function saveTopics() {
    setBanner({ kind: "idle" });

    try {
      const fd = new FormData();
      fd.set("topicsJson", JSON.stringify(topics));

      const res = await setMyNotificationTopicsAction(fd);
      await refreshCounts();

      setBanner({
        kind: "ok",
        message: `Saved topics (${res.topics?.length ?? topics.length}). Applied to ${res.tokens ?? 0} device(s).`,
      });
    } catch (e: any) {
      setBanner({ kind: "error", message: e?.message ?? "Failed to save topics." });
    }
  }

  const enabledHere = permission === "granted" && !!deviceToken;

  return (
    <div className="rounded-2xl border p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold">Notifications</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Enable push on this device, then choose what you want to receive.
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm">
            <span className="font-medium">Permission:</span>{" "}
            <span className="text-muted-foreground">
              {permission === "unsupported" ? "unsupported" : permission}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Devices:</span>{" "}
            <span className="text-muted-foreground">{tokenCount}</span>
          </div>
        </div>
      </div>

      <Banner state={banner} />

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={enableOnThisDevice} disabled={permission === "unsupported" || enabledHere}>
          Enable on this device
        </Button>
        <Button type="button" onClick={disableOnThisDevice} disabled={!enabledHere} variant="outline">
          Disable on this device
        </Button>
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-semibold">Topics</div>
        <div className="text-sm text-muted-foreground">
          These are your preferences. When saved, subscriptions are applied across all your registered devices.
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DEFAULT_TOPICS.map((t) => {
            const checked = topics.includes(t.key);
            return (
              <label key={t.key} className="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer">
                <Checkbox checked={checked} onCheckedChange={() => toggleTopic(t.key)} />
                <span className="text-sm">{t.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{t.key}</span>
              </label>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Input
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Add custom topic (e.g. business_123)"
          />
          <Button type="button" onClick={addCustomTopic} variant="outline">
            Add
          </Button>
        </div>

        {topics.length ? (
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTopic(t)}
                className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
                title="Click to remove"
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No topics selected.</div>
        )}

        <div className="flex gap-2">
          <Button type="button" onClick={saveTopics}>
            Save topics
          </Button>
          <Button type="button" onClick={refreshCounts} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-xl border p-4 space-y-2">
        <div className="text-sm font-semibold">Foreground message</div>
        {foreground ? (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{foreground.title}</span>
            {foreground.body ? <span> — {foreground.body}</span> : null}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No foreground message received yet.</div>
        )}
      </div>
    </div>
  );
}