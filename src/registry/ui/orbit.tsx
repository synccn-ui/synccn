import type * as React from "react";
import { Children } from "react";
import { cn } from "@/lib/utils";

export interface OrbitProps {
  /** Orbit radius in pixels. */
  radius?: number;
  /** Seconds per revolution. */
  duration?: number;
  /** Orbit anticlockwise. */
  reverse?: boolean;
  /** Draw the dashed orbit path. */
  path?: boolean;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Places children on a circular path that rotates around the centre. */
export function Orbit({ children, radius = 110, duration = 24, reverse = false, path = true, className }: OrbitProps) {
  const items = Children.toArray(children);
  return (
    <>
      {path && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed"
          style={{ width: radius * 2, height: radius * 2 }}
        />
      )}
      {items.map((child, i) => (
        <div
          key={i}
          style={
            {
              "--orbit-radius": radius,
              "--orbit-duration": duration,
              animationDelay: `${-(duration / items.length) * i}s`,
              animationDirection: reverse ? "reverse" : "normal",
            } as React.CSSProperties
          }
          className={cn("absolute left-1/2 top-1/2 -ml-5 -mt-5 grid size-10 animate-orbit place-items-center", className)}
        >
          {child}
        </div>
      ))}
    </>
  );
}

export interface PatternProps {
  /** Pattern style. */
  variant?: "dots" | "grid";
  /** How the edges fade out. */
  fade?: "radial" | "top" | "none";
  /** Extra classes for the root element. */
  className?: string;
}

/** Dot or grid backdrop, faded toward the edges. */
export function Pattern({ variant = "dots", fade = "radial", className }: PatternProps) {
  const masks = {
    radial: "[mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]",
    top: "[mask-image:linear-gradient(to_bottom,black,transparent)]",
    none: "",
  };
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", variant === "dots" ? "bg-dots" : "bg-grid", masks[fade], className)}
    />
  );
}

export interface MeteorsProps {
  /** Number of streaks. */
  count?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** Falling streaks of light. */
export function Meteors({ count = 14, className }: MeteorsProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const left = (i * 137) % 100;
        return (
          <span
            key={i}
            className={cn(
              "absolute top-0 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-foreground/70 shadow-[0_0_0_1px_oklch(1_0_0/0.08)]",
              "before:absolute before:top-1/2 before:h-px before:w-14 before:-translate-y-1/2 before:bg-gradient-to-r before:from-foreground/60 before:to-transparent",
              className
            )}
            style={{
              left: `${left}%`,
              top: `${-10 + ((i * 53) % 40)}%`,
              animationDelay: `${(i * 0.73) % 5}s`,
              animationDuration: `${3 + ((i * 7) % 5)}s`,
            }}
          />
        );
      })}
    </div>
  );
}
