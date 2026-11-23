import type * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinningTextProps {
  /** Text around the circle; end with a separator so it loops neatly. */
  text: string;
  /** Diameter in pixels. */
  size?: number;
  /** Seconds per rotation. */
  duration?: number;
  /** Rotate anticlockwise. */
  reverse?: boolean;
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

/** Text set around a circle that slowly rotates. Put an icon or logo in the middle via children. */
export function SpinningText({ text, size = 160, duration = 14, reverse = false, className, children }: SpinningTextProps) {
  const chars = [...text];
  const step = 360 / chars.length;
  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }} aria-label={text} role="img">
      <div
        className="absolute inset-0 animate-[spin_var(--d)_linear_infinite] motion-reduce:animate-none"
        style={{ "--d": `${duration}s`, animationDirection: reverse ? "reverse" : "normal" } as React.CSSProperties}
      >
        {chars.map((ch, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute left-1/2 top-0 h-1/2 origin-bottom -translate-x-1/2 text-[13px] font-medium uppercase tracking-wide"
            style={{ transform: `translateX(-50%) rotate(${i * step}deg)` }}
          >
            {ch}
          </span>
        ))}
      </div>
      {children && <div className="relative">{children}</div>}
    </div>
  );
}
