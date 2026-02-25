"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getFcmToken, listenForForegroundMessages } from "@/lib/notifications/fcm-client";
import { saveFcmTokenAction, sendTestPushAction } from "@/app/dev/push/actions";

export function PushTools() {
  const [status, setStatus] = React.useState<string>("");
  const [token, setToken] = React.useState<string>("");
  const [title, setTitle] = React.useState("Test notification");
  const [body, setBody] = React.useState("This is a test push from /dev/push");
  const [link, setLink] = React.useState("/");

  React.useEffect(() => {
    let unsub: null | (() => void) = null;

    (async () => {
      unsub = await listenForForegroundMessages((payload) => {
        const t = payload?.notification?.title ?? "Notification";
        const b = payload?.notification?.body ?? "";
        setStatus(`Foreground message: ${t}${b ? " — " + b : ""}`);

        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification(t, { body: b });
          } catch {}
        }
      });
    })();

    return () => {
      try {
        unsub?.();
      } catch {}
    };
  }, []);

  async function requestPermission() {
    if (typeof Notification === "undefined") {
      setStatus("Notifications are not supported in this browser.");
      return;
    }
    const res = await Notification.requestPermission();
    setStatus(`Notification permission: ${res}`);
  }

  async function getTokenClick() {
    setStatus("Getting token…");
    try {
      const t = await getFcmToken();
      if (!t) {
        setStatus("FCM not supported in this environment.");
        return;
      }
      setToken(t);
      setStatus("Token ready.");
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to get token.");
    }
  }

  async function saveTokenClick() {
    if (!token) {
      setStatus("No token yet.");
      return;
    }
    setStatus("Saving token…");
    try {
      const fd = new FormData();
      fd.set("token", token);
      fd.set("userAgent", typeof navigator !== "undefined" ? navigator.userAgent : "");
      await saveFcmTokenAction(fd);
      setStatus("Token saved to profiles/{uid}/fcmTokens.");
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to save token.");
    }
  }

  async function sendTestClick() {
    if (!token) {
      setStatus("No token yet.");
      return;
    }
    setStatus("Sending push…");
    try {
      const fd = new FormData();
      fd.set("token", token);
      fd.set("title", title);
      fd.set("body", body);
      fd.set("link", link);
      const res = await sendTestPushAction(fd);
      setStatus(`Sent. messageId: ${res.messageId}`);
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to send push.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-5">
        <div className="text-sm font-semibold">Setup</div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="secondary" onClick={requestPermission}>
            Request permission
          </Button>
          <Button type="button" variant="secondary" onClick={getTokenClick}>
            Get token
          </Button>
          <Button type="button" variant="secondary" onClick={saveTokenClick} disabled={!token}>
            Save token
          </Button>
        </div>

        {token ? (
          <div className="mt-3 break-all rounded-xl border bg-background px-3 py-2 text-xs">{token}</div>
        ) : null}

        {status ? <div className="mt-3 text-sm text-muted-foreground">{status}</div> : null}
      </div>

      <div className="rounded-2xl border p-5">
        <div className="text-sm font-semibold">Send test push</div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Link</label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Body</label>
            <Input value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
        </div>

        <Button className="mt-4 w-full" type="button" onClick={sendTestClick} disabled={!token}>
          Send test notification
        </Button>
      </div>
    </div>
  );
}