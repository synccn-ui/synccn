"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageCompareProps {
  /** Image (or any element) on the left. */
  before: React.ReactNode;
  /** Image on the right; sets the height. */
  after: React.ReactNode;
  /** Label on the left. */
  beforeLabel?: string;
  /** Label on the right. */
  afterLabel?: string;
  /** Starting position, 0–100. */
  initial?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** Before/after slider. Drag the handle, click anywhere, or use the arrow keys. */
export function ImageCompare({ before, after, beforeLabel = "Before", afterLabel = "After", initial = 50, className }: ImageCompareProps) {
  const [pos, setPos] = useState(initial);
  const ref = useRef<HTMLDivElement>(null);
  const at = (x: number) => {
    const r = ref.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={ref}
      className={cn("relative w-full touch-none select-none overflow-hidden rounded-xl border", className)}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        at(e.clientX);
      }}
      onPointerMove={(e) => e.buttons && at(e.clientX)}
    >
      <div className="pointer-events-none">{after}</div>
      <div className="pointer-events-none absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {before}
      </div>
      <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
        {afterLabel}
      </span>
      <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgb(0_0_0/.4)]" style={{ left: `${pos}%` }}>
        <button
          type="button"
          role="slider"
          aria-label="Comparison position"
          aria-valuenow={Math.round(pos)}
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={(e) => {
            const d = { ArrowLeft: -4, ArrowRight: 4 }[e.key];
            if (d) (e.preventDefault(), setPos((p) => Math.min(100, Math.max(0, p + d))));
          }}
          className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-white text-black shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <ChevronsLeftRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
