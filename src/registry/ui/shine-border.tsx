import type * as React from "react";
import { cn } from "@/lib/utils";

export interface ShineBorderProps {
  /** Colours of the moving glint. */
  colors?: string[];
  /** Border width in pixels. */
  width?: number;
  /** Seconds per rotation. */
  duration?: number;
  /** Classes for the inner surface. */
  innerClassName?: string;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** A rotating gradient that glints around the border of its container. */
export function ShineBorder({
  children,
  colors = ["oklch(0.75 0.15 230)", "oklch(0.7 0.2 300)", "oklch(0.8 0.14 60)"],
  width = 1.5,
  duration = 8,
  className,
  innerClassName,
}: ShineBorderProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl p-[var(--w)]", className)}
      style={{ "--w": `${width}px` } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="absolute inset-[-100%] animate-[spin_var(--d)_linear_infinite]"
        style={
          {
            "--d": `${duration}s`,
            background: `conic-gradient(from 0deg, transparent 0deg, ${colors.join(", ")}, transparent 140deg, transparent 360deg)`,
          } as React.CSSProperties
        }
      />
      <div className={cn("relative h-full rounded-[calc(1rem-var(--w))] bg-card", innerClassName)}>{children}</div>
    </div>
  );
}

export interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Button with a light sweep across its surface. */
export function ShinyButton({ children, className, ...props }: ShinyButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "group relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-full border bg-background px-6 text-sm font-medium transition-[box-shadow,transform] duration-300",
        "hover:shadow-[0_0_24px_-4px_color-mix(in_oklch,var(--foreground)_35%,transparent)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-ring",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full animate-[shine_3s_ease-in-out_infinite] bg-[linear-gradient(100deg,transparent_20%,color-mix(in_oklch,var(--foreground)_18%,transparent)_50%,transparent_80%)]"
      />
      <span className="relative">{children}</span>
      <style>{`@keyframes shine{0%{transform:translateX(-100%)}60%,100%{transform:translateX(100%)}}`}</style>
    </button>
  );
}
