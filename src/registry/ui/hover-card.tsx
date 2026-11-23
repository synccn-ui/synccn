"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePresence } from "@/lib/hooks";

export interface HoverCardProps {
  /** Element that opens the card. */
  trigger: React.ReactNode;
  /** Milliseconds before opening. */
  openDelay?: number;
  /** Milliseconds before closing. */
  closeDelay?: number;
  /** Where the card appears. */
  side?: "top" | "bottom";
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Rich preview that appears when the pointer rests on (or keyboard focuses) the trigger. */
export function HoverCard({ trigger, children, openDelay = 300, closeDelay = 150, side = "bottom", className }: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { mounted, closing } = usePresence(open, 120);
  const show = () => {
    clearTimeout(t.current);
    t.current = setTimeout(() => setOpen(true), openDelay);
  };
  const hide = () => {
    clearTimeout(t.current);
    t.current = setTimeout(() => setOpen(false), closeDelay);
  };
  return (
    <span className="relative inline-flex" onPointerEnter={show} onPointerLeave={hide} onFocus={show} onBlur={hide}>
      {trigger}
      {mounted && (
        <div
          role="dialog"
          onPointerEnter={() => clearTimeout(t.current)}
          onPointerLeave={hide}
          className={cn(
            "absolute left-1/2 z-50 w-72 -translate-x-1/2 rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl shadow-black/10",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
            closing ? "animate-out" : "animate-in",
            className
          )}
        >
          {children}
        </div>
      )}
    </span>
  );
}
