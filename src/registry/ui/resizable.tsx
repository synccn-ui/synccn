"use client";

import type * as React from "react";
import { Children, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResizablePanelsProps {
  /** Split side by side or stacked. */
  direction?: "horizontal" | "vertical";
  /** Starting sizes as percentages, one per panel. */
  defaultSizes?: number[];
  /** Smallest panel size as a percentage. */
  minSize?: number;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Two or more panels split by draggable handles. sizes are percentages.
 * Handles also respond to arrow keys.
 */
export function ResizablePanels({ children, direction = "horizontal", defaultSizes, minSize = 15, className }: ResizablePanelsProps) {
  const panels = Children.toArray(children);
  const [sizes, setSizes] = useState(defaultSizes || panels.map(() => 100 / panels.length));
  const root = useRef<HTMLDivElement>(null);
  const h = direction === "horizontal";

  const resize = (i: number, delta: number) =>
    setSizes((s) => {
      const n = [...s];
      const total = n[i] + n[i + 1];
      n[i] = Math.max(minSize, Math.min(total - minSize, n[i] + delta));
      n[i + 1] = total - n[i];
      return n;
    });

  const startDrag = (i: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    const r = root.current!.getBoundingClientRect();
    let last = h ? e.clientX : e.clientY;
    const move = (ev: PointerEvent) => {
      const cur = h ? ev.clientX : ev.clientY;
      resize(i, ((cur - last) / (h ? r.width : r.height)) * 100);
      last = cur;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.style.cursor = "";
    };
    document.body.style.cursor = h ? "col-resize" : "row-resize";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div ref={root} className={cn("flex w-full overflow-hidden rounded-xl border", h ? "flex-row" : "flex-col", className)}>
      {panels.map((p, i) => (
        <div key={i} className="contents">
          <div className="min-h-0 min-w-0 overflow-auto" style={{ flexBasis: `${sizes[i]}%`, flexGrow: 0, flexShrink: 0 }}>
            {p}
          </div>
          {i < panels.length - 1 && (
            <div
              role="separator"
              tabIndex={0}
              aria-orientation={h ? "vertical" : "horizontal"}
              aria-valuenow={Math.round(sizes[i])}
              onPointerDown={startDrag(i)}
              onKeyDown={(e) => {
                const d = { ArrowLeft: -2, ArrowUp: -2, ArrowRight: 2, ArrowDown: 2 }[e.key];
                if (d) (e.preventDefault(), resize(i, d));
              }}
              className={cn(
                "group relative z-10 flex shrink-0 touch-none items-center justify-center bg-border transition-colors hover:bg-ring focus-visible:bg-ring focus-visible:outline-none",
                h ? "w-px cursor-col-resize" : "h-px cursor-row-resize"
              )}
            >
              <span
                className={cn(
                  "absolute grid place-items-center rounded-sm border bg-background text-muted-foreground",
                  h ? "h-6 w-3.5" : "h-3.5 w-6 rotate-90"
                )}
              >
                <GripVertical className="size-3" />
              </span>
              <span className={cn("absolute", h ? "inset-y-0 -inset-x-2" : "inset-x-0 -inset-y-2")} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
