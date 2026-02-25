"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const oobCode = params.get("oobCode") ?? "";

  const [loading, setLoading] = React.useState(true);
  const [valid, setValid] = React.useState(false);
  const [email, setEmail] = React.useState<string | null>(null);

  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function run() {
      setErr(null);
      setLoading(true);
      try {
        if (!oobCode) throw new Error("Missing reset code.");
        const email = await verifyPasswordResetCode(firebaseAuth, oobCode);
        if (!mounted) return;
        setEmail(email);
        setValid(true);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Invalid or expired reset link.");
        setValid(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [oobCode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await confirmPasswordReset(firebaseAuth, oobCode, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 600);
    } catch (e: any) {
      setErr(e?.message ?? "Could not reset password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle={
        email ? (
          <>
            Resetting password for <span className="font-medium">{email}</span>
          </>
        ) : (
          <>
            <Link className="text-[hsl(var(--primary))] hover:opacity-90" href="/login">
              Back to sign in
            </Link>
          </>
        )
      }
    >
      {loading ? (
        <div className="text-sm text-[hsl(var(--muted-fg))]">Checking reset link…</div>
      ) : !valid ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {err ?? "Invalid or expired reset link."}
          </div>
          <Button asChild className="w-full" variant="secondary">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </div>
      ) : done ? (
        <div className="space-y-3">
          <div className="text-sm text-[hsl(var(--fg))]">Password updated. Redirecting to sign in…</div>
          <Button asChild className="w-full">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[hsl(var(--fg))]">New password</label>
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

          <Button className="w-full" disabled={submitting} type="submit">
            {submitting ? "Saving…" : "Set new password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}