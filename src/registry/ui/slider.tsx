"use client";

import type * as React from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

export interface SliderProps {
  /** Controlled value; two numbers make a range. */
  value?: number[];
  /** Initial value when uncontrolled. */
  defaultValue?: number[];
  /** Called with the new value. */
  onValueChange?: (value: number[]) => void;
  /** Lowest value. */
  min?: number;
  /** Highest value. */
  max?: number;
  /** Amount per step. */
  step?: number;
  /** Prevents changes. */
  disabled?: boolean;
  /** Bubble with the value on hover and focus. */
  showValue?: boolean;
  /** Formats the bubble value. */
  format?: (value: number) => React.ReactNode;
  /** Accessible name. */
  "aria-label"?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/** Single value or range slider. Pass an array as value for a range. */
export function Slider({
  value,
  defaultValue = [50],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  showValue = false,
  format = (v) => v,
  className,
  "aria-label": ariaLabel = "Slider",
}: SliderProps) {
  const [vals, setVals] = useControllable({ value, defaultValue, onChange: onValueChange });
  const track = useRef<HTMLDivElement>(null);
  const active = useRef(0);
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const snap = (v: number) => Math.min(max, Math.max(min, Math.round((v - min) / step) * step + min));

  const fromPointer = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    return snap(min + ((clientX - r.left) / r.width) * (max - min));
  };

  const update = (i: number, v: number) => {
    const next = [...vals];
    next[i] = v;
    if (next.length === 2) {
      if (i === 0) next[0] = Math.min(v, next[1]);
      else next[1] = Math.max(v, next[0]);
    }
    setVals(next);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const v = fromPointer(e.clientX);
    active.current = vals.length === 2 && Math.abs(v - vals[1]) < Math.abs(v - vals[0]) ? 1 : 0;
    update(active.current, v);
    const move = (ev: PointerEvent) => update(active.current, fromPointer(ev.clientX));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onKey = (e: React.KeyboardEvent<HTMLElement>, i: number) => {
    const big = (max - min) / 10;
    const delta = ({ ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big } as Record<string, number>)[e.key];
    if (e.key === "Home") return (e.preventDefault(), update(i, min));
    if (e.key === "End") return (e.preventDefault(), update(i, max));
    if (delta == null) return;
    e.preventDefault();
    update(i, snap(vals[i] + delta));
  };

  const lo = vals.length === 2 ? pct(vals[0]) : 0;
  const hi = pct(vals[vals.length - 1]);

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center py-2", disabled && "opacity-50", className)}>
      <div ref={track} onPointerDown={onPointerDown} className="relative h-1.5 w-full grow cursor-pointer rounded-full bg-muted">
        <div className="absolute h-full rounded-full bg-primary" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
        {vals.map((v, i) => (
          <div
            key={i}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={vals.length === 2 ? `${ariaLabel} ${i === 0 ? "minimum" : "maximum"}` : ariaLabel}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={v}
            onKeyDown={(e) => onKey(e, i)}
            className="group absolute top-1/2 block size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-sm transition-shadow hover:ring-4 hover:ring-brand-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
            style={{ left: `${pct(v)}%` }}
          >
            {showValue && (
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {format(v)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
