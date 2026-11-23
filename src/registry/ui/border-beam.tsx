import type * as React from "react";
import { cn } from "@/lib/utils";

export interface BorderBeamProps {
  /** Length of the light in pixels. */
  size?: number;
  /** Seconds per lap. */
  duration?: number;
  /** Seconds to offset the start. */
  delay?: number;
  /** Colour at the head of the light. */
  colorFrom?: string;
  /** Colour at the tail. */
  colorTo?: string;
  /** Border thickness in pixels. */
  borderWidth?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * A short light that travels around its parent's border.
 * Place inside a `relative overflow-hidden rounded-*` element.
 */
export function BorderBeam({
  size = 120,
  duration = 6,
  delay = 0,
  colorFrom = "var(--primary)",
  colorTo = "transparent",
  borderWidth = 1.5,
  className,
}: BorderBeamProps) {
  return (
    <div
      aria-hidden
      style={{ "--beam-duration": duration, "--bw": `${borderWidth}px` } as React.CSSProperties}
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-[length:var(--bw)] border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]"
    >
      <div
        className={cn("absolute aspect-square animate-beam", className)}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo})`,
          animationDelay: `-${delay}s`,
        }}
      />
    </div>
  );
}
