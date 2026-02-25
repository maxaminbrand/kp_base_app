"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { House } from "lucide-react";
import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  rightImageClassName,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  rightImageClassName?: string;
}) {
  return (
    <div className="min-h-dvh w-full">
      <div className="grid min-h-dvh w-full grid-cols-1 lg:grid-cols-2">
        {/* Left: form panel */}
        <div className="relative flex items-center justify-center bg-[hsl(var(--bg))] px-4 py-10">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(900px_500px_at_20%_0%,hsl(var(--primary))/14%,transparent_55%)]" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }} 
            className="relative w-full max-w-md"
          >
            <div className="mb-7">
              <div className="mb-4 flex items-center gap-2">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--muted))] ring-1 ring-[hsl(var(--border))]">
                  <Link href="/">
                    <House className="text-primary" size={48}/>
                  </Link>
                </div>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--fg))]">
                {title}
              </h1>

              {subtitle ? (
                <div className="mt-2 text-sm text-[hsl(var(--muted-fg))]">
                  {subtitle}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border bg-[hsl(var(--bg))] p-5 shadow-[0_10px_40px_-22px_rgba(0,0,0,0.55)]">
              {children}
            </div>
          </motion.div>
        </div>

        {/* Right: image panel */}
        <div
          className={cn(
            "hidden lg:block relative overflow-hidden",
            "bg-[hsl(var(--muted))]",
            rightImageClassName ??
              "bg-[url('/auth/desk.jpg')] bg-cover bg-center",
          )}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_70%_20%,rgba(255,255,255,0.30),transparent_55%)]" />
        </div>
      </div>
    </div>
  );
}
