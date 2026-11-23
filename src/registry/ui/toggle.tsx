"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

export interface ToggleProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "pressed" | "defaultPressed" | "onPressedChange" | "variant" | "size"
> {
  /** Controlled state. */
  pressed?: boolean;
  /** Initial state when uncontrolled. */
  defaultPressed?: boolean;
  /** Called with the new state. */
  onPressedChange?: (pressed: boolean) => void;
  /** Border style. */
  variant?: "default" | "outline";
  /** Size. */
  size?: "sm" | "default" | "lg";
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

/** A two-state button: pressed or not. */
export function Toggle({
  pressed,
  defaultPressed = false,
  onPressedChange,
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: ToggleProps) {
  const [on, setOn] = useControllable({ value: pressed, defaultValue: defaultPressed, onChange: onPressedChange });
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setOn(!on)}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors [&_svg]:size-4",
        "hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50",
        variant === "outline" && "border border-input shadow-xs",
        size === "sm" ? "h-8 min-w-8 px-2" : size === "lg" ? "h-10 min-w-10 px-3" : "h-9 min-w-9 px-2.5",
        on ? "bg-accent text-foreground" : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
