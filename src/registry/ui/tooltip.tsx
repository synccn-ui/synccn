"use client";

import type * as React from "react";
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const pos = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

export interface TooltipProps {
  /** Tooltip text. */
  content: React.ReactNode;
  /** Where it appears. */
  side?: "top" | "bottom" | "left" | "right";
  /** Milliseconds before showing. */
  delay?: number;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Shows on hover and keyboard focus after a short delay. */
export function Tooltip({ content, side = "top", delay = 250, children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();
  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };
  return (
    <span
      className="relative inline-flex"
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => e.key === "Escape" && hide()}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 w-max max-w-60 animate-in rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md",
            pos[side],
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
