import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Served at /firebase-messaging-sw.js
export async function GET() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };

  const body =
    `/* eslint-disable */\n` +
    `
self.__FIREBASE_CONFIG__ = ${JSON.stringify(firebaseConfig)};
self.__PWA_CACHE__ = "sbbn-pwa-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      self.skipWaiting();
      const cache = await caches.open(self.__PWA_CACHE__);
      // Minimal offline shell
      await cache.addAll(["/offline"]);
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = req.mode === "navigate";

  event.respondWith(
    (async () => {
      const cache = await caches.open(self.__PWA_CACHE__);

      if (isNavigation) {
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cached = await cache.match(req);
          if (cached) return cached;
          const offline = await cache.match("/offline");
          return offline || new Response("Offline", { status: 503 });
        }
      }

      // For static assets: cache-first
      const cached = await cache.match(req);
      if (cached) return cached;

      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return cached || new Response("Offline", { status: 503 });
      }
    })()
  );
});

// --- Firebase Cloud Messaging (background push) ---
// Use compat builds for service worker.
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

try {
  firebase.initializeApp(self.__FIREBASE_CONFIG__);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload?.notification?.title || "Notification";
    const body = payload?.notification?.body || "";
    const icon = payload?.notification?.icon || "/pwa/icon.svg";

    const link = payload?.fcmOptions?.link || payload?.data?.link || payload?.data?.url || "/";

    self.registration.showNotification(title, {
      body,
      icon,
      data: { link },
    });
  });

  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const link = event.notification?.data?.link || "/";
    event.waitUntil(
      (async () => {
        const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        for (const client of allClients) {
          if ("focus" in client) {
            client.focus();
            client.navigate(link);
            return;
          }
        }
        if (self.clients.openWindow) await self.clients.openWindow(link);
      })()
    );
  });
} catch (e) {
  // noop
}
`;

  return new NextResponse(body, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
      "service-worker-allowed": "/",
    },
  });
}