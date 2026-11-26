"use client";

import type * as React from "react";
import { useEffect } from "react";
import { X } from "lucide-react";
import { usePresence } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface ActionBarProps {
  /** Items selected. The bar shows while this is above 0. */
  count: number;
  /** Buttons for what to do with the selection. */
  children?: React.ReactNode;
  /** Clears the selection. Also runs on Escape. */
  onClear: () => void;
  /**
   * Noun after the count.
   * @default "selected"
   */
  label?: string;
  /**
   * "fixed" sits at the bottom of the window; "absolute" at the bottom of the nearest positioned parent.
   * @default "fixed"
   */
  position?: "fixed" | "absolute";
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Floating bar that rises from the bottom when items are selected: the count, bulk actions
 * and a clear button. Escape clears. The count is announced to screen readers.
 */
export function ActionBar({ count, children, onClear, label = "selected", position = "fixed", className }: ActionBarProps) {
  const { mounted, closing } = usePresence(count > 0, 180);
  useEffect(() => {
    if (count <= 0) return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClear();
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [count, onClear]);

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {count > 0 ? `${count} ${label}` : ""}
      </p>
      {mounted && (
        <div
          role="toolbar"
          aria-label="Selection actions"
          className={cn(
            position === "fixed" ? "fixed" : "absolute",
            "inset-x-0 bottom-4 z-50 mx-auto flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl",
            closing ? "translate-y-3 opacity-0 transition-[opacity,transform] duration-150" : "animate-in",
            className
          )}
        >
          <span className="flex items-center gap-2 pl-2 pr-1 text-sm font-medium tabular-nums">
            <span className="grid h-6 min-w-6 place-items-center rounded-md bg-primary px-1.5 text-xs text-primary-foreground">{count}</span>
            <span className="hidden whitespace-nowrap sm:inline">{label}</span>
          </span>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto">{children}</div>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <button type="button" onClick={onClear} aria-label="Clear selection" className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}
