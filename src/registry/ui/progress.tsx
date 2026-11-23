import type * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps {
  /** Current value. */
  value?: number;
  /** Value that fills the bar. */
  max?: number;
  /** Animated bar for unknown progress. */
  indeterminate?: boolean;
  /** Bar thickness. */
  size?: "sm" | "default" | "lg";
  /** Label above the bar, with the percentage. */
  label?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

export function Progress({ value = 0, max = 100, indeterminate = false, size = "default", className, label }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("grid w-full gap-1.5", className)}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="font-medium">{label}</span>
          {!indeterminate && <span className="tabular-nums text-muted-foreground">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        aria-label={typeof label === "string" ? label : "Progress"}
        className={cn("relative w-full overflow-hidden rounded-full bg-muted", size === "sm" ? "h-1" : size === "lg" ? "h-3" : "h-2")}
      >
        {indeterminate ? (
          <div className="absolute inset-y-0 w-1/3 animate-[indeterminate_1.3s_ease-in-out_infinite] rounded-full bg-primary" />
        ) : (
          <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
        )}
      </div>
    </div>
  );
}

export interface ProgressRingProps {
  /** Percentage, 0–100. */
  value?: number;
  /** Diameter in pixels. */
  size?: number;
  /** Ring thickness in pixels. */
  stroke?: number;
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

/** Circular progress with the value in the middle. */
export function ProgressRing({ value = 0, size = 72, stroke = 7, className, children }: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-semibold tabular-nums">{children ?? `${Math.round(pct)}%`}</span>
    </div>
  );
}
