"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupWithEmailAction } from "@/app/signup/actions";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

async function onSignup(e: React.FormEvent) {
  e.preventDefault();
  setErr(null);
  setLoading(true);
  try {
    const redirectTo = await signupWithEmailAction({ email, password });
    router.push(redirectTo);
    router.refresh();
  } catch (e: any) {
    setErr(e?.message ?? "Sign up failed.");
  } finally {
    setLoading(false);
  }
}

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        <>
          Already have an account?{" "}
          <Link className="text-[hsl(var(--primary))] hover:opacity-90" href="/login">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSignup} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--fg))]">Email address</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--fg))]">Password</label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
          <div className="text-xs text-[hsl(var(--muted-fg))]">Minimum 6 characters.</div>
        </div>

        {err ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        <Button className="w-full" disabled={loading} type="submit">
          {loading ? "Creating…" : "Create account"}
        </Button>

        <div className="text-xs text-[hsl(var(--muted-fg))]">
          By continuing, you agree to our Terms and Privacy Policy.
        </div>
      </form>
    </AuthShell>
  );
}