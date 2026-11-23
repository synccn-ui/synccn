"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperProps {
  /** Steps in order. */
  steps: { title: string; description?: string }[];
  /** Zero-based index of the active step. */
  current?: number;
  /** Layout direction. */
  orientation?: "horizontal" | "vertical";
  /** Makes steps clickable. */
  onStepClick?: (index: number) => void;
  /** Extra classes for the root element. */
  className?: string;
}

/** steps: [{ title, description? }]. `current` is the zero-based active step. */
export function Stepper({ steps, current = 0, orientation = "horizontal", onStepClick, className }: StepperProps) {
  const vertical = orientation === "vertical";
  return (
    <ol className={cn(vertical ? "grid gap-0" : "flex w-full items-start", className)}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === steps.length - 1;
        return (
          <li
            key={s.title}
            className={cn(
              "relative",
              vertical ? "flex gap-3 pb-6 last:pb-0" : "flex flex-1 flex-col items-center gap-2 text-center last:flex-none sm:last:flex-1"
            )}
          >
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute bg-border transition-colors duration-500",
                  vertical ? "left-[15px] top-9 h-[calc(100%-2.5rem)] w-0.5" : "left-[calc(50%+22px)] top-[15px] h-0.5 w-[calc(100%-44px)]",
                  done && "bg-primary"
                )}
              />
            )}
            <button
              type="button"
              disabled={!onStepClick}
              onClick={() => onStepClick?.(i)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 bg-background text-sm font-semibold tabular-nums transition-colors disabled:cursor-default",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary text-primary animate-pulse-ring",
                !done && !active && "text-muted-foreground"
              )}
            >
              {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
            </button>
            <div className={cn("grid gap-0.5", !vertical && "hidden px-2 sm:grid")}>
              <p className={cn("text-sm font-medium", !done && !active && "text-muted-foreground")}>{s.title}</p>
              {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
