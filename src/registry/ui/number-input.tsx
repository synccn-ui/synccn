"use client";

import { useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

export interface NumberInputProps {
  /** Controlled value. */
  value?: number;
  /** Initial value when uncontrolled. */
  defaultValue?: number;
  /** Called with the new value. */
  onValueChange?: (value: number) => void;
  /** Lowest value. */
  min?: number;
  /** Highest value. */
  max?: number;
  /** Amount per step. */
  step?: number;
  /** Formats the displayed value. */
  format?: (value: number) => string;
  /** Accessible name for the field. */
  "aria-label"?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/** Stepper input. Hold a button to repeat; arrow keys and scroll-free typing work too. */
export function NumberInput({
  value,
  defaultValue = 0,
  onValueChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  format,
  className,
  "aria-label": ariaLabel = "Quantity",
}: NumberInputProps) {
  const [n, setN] = useControllable({ value, defaultValue, onChange: onValueChange });
  const hold = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const latest = useRef(n);
  latest.current = n;

  const bump = (dir: number) => setN(clamp(+(latest.current + dir * step).toFixed(6)));
  const start = (dir: number) => {
    bump(dir);
    let delay = 380;
    const loop = () => {
      bump(dir);
      delay = Math.max(50, delay * 0.8);
      hold.current = setTimeout(loop, delay);
    };
    hold.current = setTimeout(loop, delay);
  };
  const stop = () => clearTimeout(hold.current);

  const btn =
    "grid h-full w-9 place-items-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent";
  return (
    <div
      className={cn(
        "inline-flex h-9 items-stretch overflow-hidden rounded-md border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/25",
        className
      )}
    >
      <button
        type="button"
        aria-label="Decrease"
        className={btn}
        disabled={n <= min}
        onPointerDown={() => start(-1)}
        onPointerUp={stop}
        onPointerLeave={stop}
        onKeyDown={(e) => e.key === "Enter" && bump(-1)}
      >
        <Minus className="size-3.5" />
      </button>
      <input
        aria-label={ariaLabel}
        inputMode="decimal"
        value={format ? format(n) : n}
        onChange={(e) => {
          const v = parseFloat(e.target.value.replace(/[^\d.-]/g, ""));
          if (!Number.isNaN(v)) setN(clamp(v));
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") (e.preventDefault(), bump(1));
          if (e.key === "ArrowDown") (e.preventDefault(), bump(-1));
        }}
        className="w-14 border-x bg-transparent text-center text-base font-medium tabular-nums outline-none sm:text-sm"
      />
      <button
        type="button"
        aria-label="Increase"
        className={btn}
        disabled={n >= max}
        onPointerDown={() => start(1)}
        onPointerUp={stop}
        onPointerLeave={stop}
        onKeyDown={(e) => e.key === "Enter" && bump(1)}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
