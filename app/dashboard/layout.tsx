import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/require-auth";
import LogoutButton from "@/components/auth/logout-button";
import Sidebar from "@/components/base/sidebar/page";
import { NavLink } from "@/types/main";
import Link from "next/link";

const SIDEBAR_LINKS: NavLink[] = [{ label: "Profile", href: "/profile" }];

export default async function DashbaordLayout({ children }: { children: React.ReactNode }) {
   await requireAuth("/login");
  return (
    <section className="flex h-screen">
      {/* Sidebar */}
      <div className="flex flex-col border-r">
        <div className="flex-col grow">
          <div className="border-b">SH</div>
          <Sidebar links={SIDEBAR_LINKS} base="/dashboard" />
        </div>
        <div className="border-t">
          <LogoutButton />
        </div>
      </div>
      {/* Right Side */}
      <div className="flex flex-col w-full">
        <div className="border-b">
          <Link href='/'>Home</Link>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}
<div>Sidebar Component</div>;
