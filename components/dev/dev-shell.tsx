"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { DevSidebar } from "@/components/dev/dev-sidebar";
import { devNav, type DevNavGroupId } from "@/components/dev/dev-nav";
import {
  ChevronCollapseIcon,
  MenuIcon,
  XIcon,
  MessageIcon,
  UserIcon,
} from "@/components/dev/dev-icons";

const LS_COLLAPSED = "devSidebarCollapsed";
const LS_OPEN_GROUP = "devSidebarOpenGroup";

function readBool(key: string, fallback: boolean) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === "true";
  } catch {
    return fallback;
  }
}

function readStr(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [breakpointPx]);

  return isMobile;
}

export function DevShell(props: { children: React.ReactNode }) {
  const isMobile = useIsMobile(768);

  const [hydrated, setHydrated] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [openGroup, setOpenGroup] = React.useState<DevNavGroupId | null>(null);

  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setCollapsed(readBool(LS_COLLAPSED, false));
    const saved = readStr(LS_OPEN_GROUP);
    const valid = saved && devNav.groups.some((g) => g.id === saved) ? (saved as DevNavGroupId) : null;
    setOpenGroup(valid ?? null);
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    write(LS_COLLAPSED, String(collapsed));
  }, [collapsed, hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;
    write(LS_OPEN_GROUP, openGroup ?? "");
  }, [openGroup, hydrated]);

  React.useEffect(() => {
    // close drawer when switching to desktop
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  function toggleGroup(id: DevNavGroupId) {
    setOpenGroup((prev) => (prev === id ? null : id));
  }

  const contentHeader = (
    <div className="flex items-center justify-between border-b px-4 py-3 md:px-6">
      <div className="flex items-center gap-2">
        {/* Mobile hamburger */}
        {isMobile ? (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-lg p-2 transition hover:bg-primary/10 cursor-pointer"
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <MenuIcon className="h-5 w-5 text-primary" />
          </button>
        ) : null}

        <div className="text-sm font-medium text-muted-foreground">Engineering Dashboard</div>
      </div>

      {/* Top-right icons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg p-2 transition hover:bg-primary/10 cursor-pointer"
          aria-label="Messages"
          title="Messages"
        >
          <MessageIcon className="h-5 w-5 text-primary" />
        </button>

        <button
          type="button"
          className="rounded-lg p-2 transition hover:bg-primary/10 cursor-pointer"
          aria-label="Profile"
          title="Profile"
        >
          <UserIcon className="h-5 w-5 text-primary" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      {!isMobile ? (
        <motion.aside
          animate={{ width: collapsed ? 72 : 300 }}
          transition={{ duration: 0.2 }}
          className="flex h-screen flex-col border-r bg-background"
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            {!collapsed ? (
              <div className="text-sm font-semibold tracking-tight">Dev Tools</div>
            ) : (
              <div className="sr-only">Dev Tools</div>
            )}

            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="inline-flex items-center justify-center rounded-lg p-2 transition hover:bg-primary/10 cursor-pointer"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {/* expanded => clicking collapses left (chevron points left) */}
              <motion.span
                animate={{ rotate: collapsed ? 0 : 180 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className="text-primary"
              >
                <ChevronCollapseIcon className="h-5 w-5" />
              </motion.span>
            </button>
          </div>

          <DevSidebar
            collapsed={collapsed}
            openGroup={openGroup}
            groups={devNav.groups}
            onToggleGroup={toggleGroup}
            onRequestExpand={() => setCollapsed(false)}
          />
        </motion.aside>
      ) : null}

      {/* Mobile drawer sidebar (off-screen by default) */}
      <AnimatePresence>
        {isMobile && mobileOpen ? (
          <>
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close sidebar"
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              className="fixed left-0 top-0 z-50 h-screen w-[300px] border-r bg-background"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="text-sm font-semibold tracking-tight">Dev Tools</div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center rounded-lg p-2 transition hover:bg-primary/10 cursor-pointer"
                  aria-label="Close sidebar"
                  title="Close sidebar"
                >
                  <XIcon className="h-5 w-5 text-primary" />
                </button>
              </div>

              <DevSidebar
                collapsed={false}
                openGroup={openGroup}
                groups={devNav.groups}
                onToggleGroup={toggleGroup}
                onRequestExpand={() => {}}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {contentHeader}
        <main className="flex-1 p-4 md:p-6">{props.children}</main>
      </div>
    </div>
  );
}