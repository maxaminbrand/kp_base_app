"use client";

import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { createSessionAndGetRedirectAction } from "@/app/auth/actions";

function getNextFromLocation(): string | null {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export async function loginWithEmailAction(input: { email: string; password: string }) {
  const email = input.email.trim();
  const password = input.password;

  if (!email || !password) throw new Error("Email and password are required.");

  const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
  const idToken = await cred.user.getIdToken(true);

  const next = getNextFromLocation();
  const res = await createSessionAndGetRedirectAction({ idToken, next });

  return res.redirectTo;
}

export async function loginWithGoogleAction() {
  const cred = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
  const idToken = await cred.user.getIdToken(true);

  const next = getNextFromLocation();
  const res = await createSessionAndGetRedirectAction({ idToken, next });

  return res.redirectTo;
}