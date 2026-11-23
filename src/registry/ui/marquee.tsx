import type * as React from "react";
import { cn } from "@/lib/utils";

export interface MarqueeProps {
  /** Scroll the other way. */
  reverse?: boolean;
  /** Scroll up instead of sideways. */
  vertical?: boolean;
  /** Pause while the pointer is over it. */
  pauseOnHover?: boolean;
  /** Seconds for one full loop. */
  duration?: number;
  /** CSS length between items. */
  gap?: string;
  /** Copies of the content (2 is enough for most widths). */
  repeat?: number;
  /** Fade the edges. */
  fade?: boolean;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Infinite scrolling row (or column). Pauses on hover; edges fade out. */
export function Marquee({
  children,
  reverse = false,
  vertical = false,
  pauseOnHover = true,
  duration = 30,
  gap = "1rem",
  repeat = 2,
  fade = true,
  className,
}: MarqueeProps) {
  return (
    <div
      style={{ "--duration": `${duration}s`, "--gap": gap } as React.CSSProperties}
      className={cn(
        "group flex overflow-hidden [gap:var(--gap)]",
        vertical ? "flex-col" : "flex-row",
        fade &&
          (vertical
            ? "[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
            : "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"),
        className
      )}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}
          className={cn(
            "flex shrink-0 justify-around [gap:var(--gap)]",
            vertical ? "animate-marquee-y flex-col" : "animate-marquee flex-row",
            reverse && "[animation-direction:reverse]",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
