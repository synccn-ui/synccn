"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

export interface RatingProps {
  /** Controlled rating. */
  value?: number;
  /** Initial rating when uncontrolled. */
  defaultValue?: number;
  /** Called with the new rating (0 when cleared). */
  onValueChange?: (value: number) => void;
  /** Number of stars. */
  max?: number;
  /** Display only. */
  readOnly?: boolean;
  /** Star size in pixels. */
  size?: number;
  /** Extra classes for the root element. */
  className?: string;
}

export function Rating({ value, defaultValue = 0, onValueChange, max = 5, readOnly = false, size = 20, className }: RatingProps) {
  const [current, setCurrent] = useControllable({ value, defaultValue, onChange: onValueChange });
  const [hover, setHover] = useState(0);
  const shown = hover || current;
  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      className={cn("inline-flex items-center gap-0.5", className)}
      onPointerLeave={() => setHover(0)}
      onKeyDown={(e) => {
        if (readOnly) return;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") setCurrent(Math.min(max, current + 1));
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") setCurrent(Math.max(0, current - 1));
      }}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const on = n <= shown;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === current}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            tabIndex={readOnly ? -1 : n === Math.max(1, current) ? 0 : -1}
            disabled={readOnly}
            onPointerEnter={() => !readOnly && setHover(n)}
            onClick={() => setCurrent(n === current ? 0 : n)}
            className="rounded-sm transition-transform enabled:hover:scale-110 enabled:active:scale-95 focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-default"
          >
            <Star
              style={{ width: size, height: size }}
              className={cn("transition-colors", on ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/40")}
            />
          </button>
        );
      })}
    </div>
  );
}
