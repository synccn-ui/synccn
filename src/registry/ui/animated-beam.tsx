"use client";

import type * as React from "react";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedBeamProps {
  /** Relatively positioned element that holds both ends. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Element where the beam starts. */
  fromRef: React.RefObject<HTMLElement | null>;
  /** Element where the beam ends. */
  toRef: React.RefObject<HTMLElement | null>;
  /** How far the curve bends, in pixels. Negative bends downwards. */
  curvature?: number;
  /** Run the light from the end back to the start. */
  reverse?: boolean;
  /** Seconds for one pass of the light. */
  duration?: number;
  /** Seconds before the first pass. */
  delay?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Curved line between two elements with a light travelling along it.
 * Pass refs to a shared relative container and to both ends.
 */
export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 3,
  delay = 0,
  className,
}: AnimatedBeamProps) {
  const id = useId().replace(/:/g, "");
  const [d, setD] = useState("");
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      const c = containerRef.current?.getBoundingClientRect();
      const a = fromRef.current?.getBoundingClientRect();
      const b = toRef.current?.getBoundingClientRect();
      if (!c || !a || !b) return;
      const x1 = a.left - c.left + a.width / 2;
      const y1 = a.top - c.top + a.height / 2;
      const x2 = b.left - c.left + b.width / 2;
      const y2 = b.top - c.top + b.height / 2;
      setBox({ w: c.width, h: c.height });
      setD(`M ${x1},${y1} Q ${(x1 + x2) / 2},${(y1 + y2) / 2 - curvature} ${x2},${y2}`);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [containerRef, fromRef, toRef, curvature]);

  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute left-0 top-0", className)}
      width={box.w}
      height={box.h}
      viewBox={`0 0 ${box.w} ${box.h}`}
    >
      <defs>
        <linearGradient id={`g${id}`} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--foreground)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0" />
          <animate
            attributeName="x1"
            values={reverse ? "110%;-10%" : "-10%;110%"}
            dur={`${duration}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values={reverse ? "130%;10%" : "10%;130%"}
            dur={`${duration}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      <path d={d} fill="none" strokeWidth="2" className="stroke-border" />
      <path d={d} fill="none" strokeWidth="2" stroke={`url(#g${id})`} strokeLinecap="round" />
    </svg>
  );
}
