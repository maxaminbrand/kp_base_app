"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "motion/react";

type TabsOption = {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: TabsOption[];
  children: React.ReactNode;
  className?: string;

  /** "text" | "icon" | "both" — default: "text" */
  triggerMode?: "text" | "icon" | "both";

  /** full width equal tabs — default: true */
  equalWidth?: boolean;
};

export function Tabs({
  value,
  onValueChange,
  options,
  children,
  className = "",
  triggerMode = "text",
  equalWidth = true,
}: TabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} className={className}>
      <TabsPrimitive.List
        className="w-full flex gap-1 rounded-xl border bg-background/60 p-1 backdrop-blur"
      >
        {options.map((opt) => (
          <TabTrigger
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
            icon={opt.icon}
            mode={triggerMode}
            equalWidth={equalWidth}
          >
            {opt.label}
          </TabTrigger>
        ))}
      </TabsPrimitive.List>

      <div className="mt-4 w-full">{children}</div>
    </TabsPrimitive.Root>
  );
}

type TabTriggerProps = {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  mode: "text" | "icon" | "both";
  equalWidth: boolean;
};

function TabTrigger({
  value,
  children,
  disabled,
  icon,
  mode,
  equalWidth,
}: TabTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      disabled={disabled}
      className={[
        "relative",
        "inline-flex items-center justify-center gap-2",
        "select-none",
        "rounded-lg",
        "px-3 py-2",
        "text-sm font-medium",
        "transition",
        "outline-none",
        "cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        equalWidth ? "flex-1" : "",
        "text-foreground/70 hover:text-foreground",
        "data-[state=active]:text-foreground",
      ].join(" ")}
    >
      {/* Active background */}
      <motion.span
        layout
        layoutId="tabs-active-pill"
        className="pointer-events-none absolute inset-0 rounded-lg bg-foreground/10"
      />

      <span className="relative z-10 inline-flex items-center gap-2">
        {(mode === "icon" || mode === "both") && icon ? (
          <span className="h-4 w-4 flex items-center justify-center">{icon}</span>
        ) : null}

        {mode === "icon" ? null : (
          <span className="whitespace-nowrap">{children}</span>
        )}
      </span>

      {/* Hide pill when inactive */}
      <style jsx>{`
        [data-state="inactive"] > :global(span[layoutid="tabs-active-pill"]) {
          display: none;
        }
      `}</style>
    </TabsPrimitive.Trigger>
  );
}

export const TabsContent = TabsPrimitive.Content; 