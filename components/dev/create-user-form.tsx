"use client";

import * as React from "react";
import { createUserAction } from "@/app/dev/auth/users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Role = "dev" | "admin" | "staff" | "owner" | "user";

export function CreateUserForm() {
  const [err, setErr] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{
    uid: string;
    email: string;
    role: Role;
    resetLink: string;
    tempPasswordSet: boolean;
  } | null>(null);

  const [setTempPassword, setSetTempPassword] = React.useState(false);

  return (
    <div className="rounded-2xl border p-5">
      <div className="text-sm font-semibold">Create User</div>

      {err ? (
        <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {err}
        </div>
      ) : null}

      {result ? (
        <div className="mt-3 rounded-xl border bg-primary/5 px-3 py-3 text-sm">
          <div className="font-medium text-primary">User created</div>
          <div className="mt-1 text-muted-foreground">
            {result.email} • {result.role} • {result.uid}
          </div>

          <div className="mt-3 text-sm font-medium">Password reset link</div>
          <div className="mt-1 break-all rounded-lg border bg-background px-3 py-2 text-xs">
            {result.resetLink}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(result.resetLink);
              }}
            >
              Copy reset link
            </Button>

            <a
              className="text-sm text-primary hover:underline"
              href={result.resetLink}
              target="_blank"
              rel="noreferrer"
            >
              Open link
            </a>
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            Temp password set: {result.tempPasswordSet ? "Yes" : "No"}
          </div>
        </div>
      ) : null}

      <form
        className="mt-4 space-y-3"
        action={async (fd) => {
          setErr(null);
          setResult(null);
          try {
            const res = await createUserAction(fd);
            setResult({
              uid: res.uid,
              email: res.email,
              role: res.role as Role,
              resetLink: res.resetLink,
              tempPasswordSet: res.tempPasswordSet,
            });
          } catch (e: any) {
            setErr(e?.message ?? "Failed to create user.");
          }
        }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input name="email" type="email" autoComplete="off" required />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <select name="role" defaultValue="user" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            <option value="user">user</option>
            <option value="staff">staff</option>
            <option value="admin">admin</option>
            <option value="owner">owner</option>
            <option value="dev">dev</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="setTempPassword"
            name="setTempPassword"
            type="checkbox"
            className="h-4 w-4"
            checked={setTempPassword}
            onChange={(e) => setSetTempPassword(e.target.checked)}
          />
          <label htmlFor="setTempPassword" className="text-sm">
            Set temporary password
          </label>
        </div>

        {setTempPassword ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">Temporary password</label>
            <Input name="tempPassword" type="password" minLength={6} required />
            <div className="text-xs text-muted-foreground">Minimum 6 characters.</div>
          </div>
        ) : null}

        <Button type="submit" className="w-full">
          Create user
        </Button>
      </form>
    </div>
  );
}