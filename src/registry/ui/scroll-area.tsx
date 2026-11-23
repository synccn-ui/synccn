"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ScrollAreaProps {
  /** Scroll direction. */
  orientation?: "vertical" | "horizontal";
  /** Fade edges that have more content. */
  fade?: boolean;
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

/** Scroll container with a slim scrollbar and edge fades that appear only when there's more to see. */
export function ScrollArea({ className, children, orientation = "vertical", fade = true }: ScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  const h = orientation === "horizontal";
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => {
      const pos = h ? el.scrollLeft : el.scrollTop;
      const max = h ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
      setEdges({ start: pos > 2, end: pos < max - 2 });
    };
    on();
    el.addEventListener("scroll", on, { passive: true });
    const ro = new ResizeObserver(on);
    ro.observe(el);
    return () => (el.removeEventListener("scroll", on), ro.disconnect());
  }, [h]);
  const mask = fade
    ? `linear-gradient(to ${h ? "right" : "bottom"}, ${edges.start ? "transparent" : "black"}, black 28px, black calc(100% - 28px), ${edges.end ? "transparent" : "black"})`
    : undefined;
  return (
    <div
      ref={ref}
      tabIndex={0}
      className={cn(
        "scrollbar-thin rounded-xl border focus-visible:outline-2 focus-visible:outline-ring",
        h ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto overflow-x-hidden",
        className
      )}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      {children}
    </div>
  );
}

export interface ScrollProgressProps {
  /** Scroll container to track. Defaults to the page. */
  target?: React.RefObject<HTMLElement | null>;
  /** Extra classes for the root element. */
  className?: string;
}

/** A thin bar that fills as a scroll container (or the page) is read. */
export function ScrollProgress({ target, className }: ScrollProgressProps) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = target?.current;
    const src = el || window;
    const on = () => {
      const top = el ? el.scrollTop : window.scrollY;
      const max = el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - innerHeight;
      setP(max > 0 ? Math.min(1, top / max) : 0);
    };
    on();
    src.addEventListener("scroll", on, { passive: true });
    return () => src.removeEventListener("scroll", on);
  }, [target]);
  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(p * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-0.5 w-full bg-transparent", className)}
    >
      <div className="h-full origin-left bg-primary transition-transform duration-75" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}
