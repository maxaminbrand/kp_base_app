"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        // Same SW for both PWA caching + FCM background messages
        await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
      } catch {
        // ignore
      }
    };

    register();
  }, []);

  return null;
}