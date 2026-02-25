"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { loginWithEmailAction, loginWithGoogleAction } from "@/app/login/actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const redirectTo = await loginWithEmailAction({ email, password });
      router.push(redirectTo);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    setLoading(true);
    try {
      const redirectTo = await loginWithGoogleAction();
      router.push(redirectTo);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Google sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign in to your account"
      subtitle={
        <>
          Not a member?{" "}
          <Link className="text-[hsl(var(--primary))] hover:opacity-90" href="/signup">
            Start a 14 day free trial
          </Link>
        </>
      }
    >
      <form onSubmit={onEmailLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--fg))]">Email address</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder=""
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--fg))]">Password</label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {err ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-[hsl(var(--muted-fg))]">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
            Remember me
          </label>

          <Link className="text-sm text-[hsl(var(--primary))] hover:opacity-90" href="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <Button className="w-full" disabled={loading} type="submit">
          {loading ? "Signing in…" : "Sign in"}
        </Button>

        <div className="py-2">
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <div className="text-xs text-[hsl(var(--muted-fg))]">Or continue with</div>
            <Separator className="flex-1" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button type="button" variant="secondary" onClick={onGoogle} disabled={loading}>
            Google
          </Button>
          <Button type="button" variant="secondary" disabled>
            GitHub
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}