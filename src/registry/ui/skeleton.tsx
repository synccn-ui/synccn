import type * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Extra classes for the root element. */
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-md bg-muted bg-[linear-gradient(90deg,transparent_0%,color-mix(in_oklch,var(--background)_70%,transparent)_50%,transparent_100%)] bg-[length:200%_100%] animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

export interface SpinnerProps {
  /** Size in pixels. */
  size?: number;
  /** Extra classes for the root element. */
  className?: string;
}

export function Spinner({ size = 20, className }: SpinnerProps) {
  return (
    <span role="status" aria-label="Loading" className={cn("inline-block", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" className="size-full animate-spin">
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x="11"
            y="2"
            width="2"
            height="6"
            rx="1"
            fill="currentColor"
            opacity={0.2 + i * 0.1}
            transform={`rotate(${i * 45} 12 12)`}
          />
        ))}
      </svg>
    </span>
  );
}
