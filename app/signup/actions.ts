"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { createSessionAndGetRedirectAction } from "@/app/auth/actions";

function getNextFromLocation(): string | null {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

async function bootstrapViaRoute(idToken: string) {
  const res = await fetch("/api/auth/bootstrap", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) throw new Error(await res.text());

  const json = (await res.json()) as { ok: boolean; refresh?: boolean };
  return { refresh: !!json.refresh };
}

export async function signupWithEmailAction(input: { email: string; password: string }) {
  const email = input.email.trim();
  const password = input.password;

  if (!email || !password) throw new Error("Email and password are required.");

  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);

  // 1) token
  let idToken = await cred.user.getIdToken(true);

  // 2) bootstrap profile + claims (profiles/{uid}, appRole default)
  const boot = await bootstrapViaRoute(idToken);

  // 3) refresh if bootstrap asked for it
  if (boot.refresh) idToken = await cred.user.getIdToken(true);

  // 4) mint session cookie + get redirect
  const next = getNextFromLocation();
  const res = await createSessionAndGetRedirectAction({
    idToken,
    next,
    defaultRedirectTo: "/dashboard/onboarding",
  });

  return res.redirectTo;
}