"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import type { DevNavGroup, DevNavGroupId } from "@/app/dev/dev-nav";
import {
  HomeIcon,
  ShieldIcon,
  ZapIcon,
  UserIcon,
  BuildingIcon,
  KeyIcon,
  WrenchIcon,
  LinkIcon,
  ChevronIcon,
  LogoutIcon,
} from "@/components/dev/dev-icons";

function iconFor(name: DevNavGroup["icon"]) {
  const cls = "h-5 w-5";
  switch (name) {
    case "home":
      return <HomeIcon className={cls} />;
    case "shield":
      return <ShieldIcon className={cls} />;
    case "zap":
      return <ZapIcon className={cls} />;
    case "user":
      return <UserIcon className={cls} />;
    case "building":
      return <BuildingIcon className={cls} />;
    case "key":
      return <KeyIcon className={cls} />;
    case "wrench":
      return <WrenchIcon className={cls} />;
    case "link":
      return <LinkIcon className={cls} />;
    default:
      return <HomeIcon className={cls} />;
  }
}

function normalize(p: string) {
  if (!p) return "/";
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

function isActivePath(pathname: string, href: string) {
  const p = normalize(pathname);
  const h = normalize(href);

  if (h === "/dev") return p === "/dev";
  return p === h || p.startsWith(h + "/");
}

function Tooltip(props: { show: boolean; text: string }) {
  if (!props.show) return null;
  return (
    <span className="pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 rounded-md border bg-black/80 px-2 py-1 text-xs text-white group-hover:block">
      {props.text}
    </span>
  );
}

/**
 * Dumb sidebar UI (presentation):
 * - desktop: supports collapsed + accordion
 * - mobile: parent can pass collapsed=false and close drawer via onNavigate
 */
export function DevSidebar(props: {
  collapsed: boolean;
  openGroup: DevNavGroupId | null;
  groups: DevNavGroup[];
  onToggleGroup: (id: DevNavGroupId) => void;
  onRequestExpand: () => void; // when collapsed + group click -> auto-expand
  onNavigate?: () => void; // close mobile drawer after nav
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    props.onNavigate?.();
    router.push("/login");
    router.refresh();
  }

  const activeLinkCls = "bg-primary/10 text-primary";
  const hoverCls = "hover:bg-primary/10";

  return (
    <nav className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="space-y-2">
          {/* Overview */}
          <Link
            href="/dev"
            onClick={() => props.onNavigate?.()}
            className={[
              "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
              hoverCls,
              isActivePath(pathname, "/dev") ? activeLinkCls : "",
              props.collapsed ? "justify-center px-2" : "",
            ].join(" ")}
            title={props.collapsed ? "Overview" : undefined}
          >
            <span className="text-primary">
              <HomeIcon className="h-5 w-5" />
            </span>
            {!props.collapsed ? <span>Overview</span> : null}
            <Tooltip show={props.collapsed} text="Overview" />
          </Link>

          {/* Groups */}
          {props.groups.map((g) => {
            const groupActive = g.items.some((it) => isActivePath(pathname, it.href));
            const open = props.openGroup === g.id;

            return (
              <div key={g.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (props.collapsed) {
                      props.onRequestExpand();
                      props.onToggleGroup(g.id);
                      return;
                    }
                    props.onToggleGroup(g.id);
                  }}
                  className={[
                    "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                    hoverCls,
                    groupActive ? activeLinkCls : "",
                    props.collapsed ? "justify-center px-2" : "justify-between",
                  ].join(" ")}
                  title={props.collapsed ? g.label : undefined}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-primary">{iconFor(g.icon)}</span>
                    {!props.collapsed ? <span>{g.label}</span> : null}
                  </span>

                  {!props.collapsed ? (
                    <motion.span
                      animate={{ rotate: open ? 90 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="text-muted-foreground"
                    >
                      <ChevronIcon className="h-4 w-4" />
                    </motion.span>
                  ) : null}

                  <Tooltip show={props.collapsed} text={g.label} />
                </button>

                <AnimatePresence initial={false}>
                  {!props.collapsed && open ? (
                    <motion.div
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-1 pl-2">
                        {g.items.map((it) => {
                          const active = isActivePath(pathname, it.href);
                          return (
                            <Link
                              key={it.href}
                              href={it.href}
                              onClick={() => props.onNavigate?.()}
                              className={[
                                "block rounded-lg px-3 py-2 text-sm transition",
                                hoverCls,
                                active ? activeLinkCls : "text-foreground",
                              ].join(" ")}
                            >
                              {it.label}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout bottom */}
      <div className="border-t px-3 py-3">
        <button
          type="button"
          onClick={logout}
          className={[
            "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
            hoverCls,
            "cursor-pointer",
            props.collapsed ? "justify-center px-2" : "",
          ].join(" ")}
          title={props.collapsed ? "Logout" : undefined}
        >
          <span className="text-primary">
            <LogoutIcon className="h-5 w-5" />
          </span>
          {!props.collapsed ? <span>Logout</span> : null}
          <Tooltip show={props.collapsed} text="Logout" />
        </button>
      </div>
    </nav>
  );
}