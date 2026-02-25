"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { motion } from "motion/react";
import { firebaseAuth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";

type LogoutButtonVariant = "text" | "icon";

type LogoutButtonProps = {
  variant?: LogoutButtonVariant; // default: "text"
  label?: string; // default: "Logout"
  className?: string;
};

export default function LogoutButton({
  variant = "text",
  label = "Logout",
  className = "",
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);

    // 1) clear server session cookie
    await fetch("/api/auth/logout", { method: "POST" });

    // 2) sign out firebase client (best-effort)
    try {
      await signOut(firebaseAuth);
    } catch {}

    router.push("/login");
    router.refresh();
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={handleLogout}
      disabled={loading}
      aria-label={variant === "icon" ? label : undefined}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition",
        "hover:opacity-80 disabled:opacity-50",
        "cursor-pointer disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {variant === "icon" ? (
        <LogOut className="h-5 w-5" />
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          <span>{label}</span>
        </>
      )}
    </motion.button>
  );
}