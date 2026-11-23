"use client";

import type * as React from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

const sizes = {
  sm: { track: "h-4 w-7", thumb: "size-3", on: "translate-x-3" },
  default: { track: "h-5 w-9", thumb: "size-4", on: "translate-x-4" },
  lg: { track: "h-6 w-11", thumb: "size-5", on: "translate-x-5" },
};

export interface SwitchProps extends Omit<
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">,
  "checked" | "defaultChecked" | "onCheckedChange" | "label" | "size" | "disabled" | "id"
> {
  /** Controlled state. */
  checked?: boolean;
  /** Initial state when uncontrolled. */
  defaultChecked?: boolean;
  /** Called with the new state. */
  onCheckedChange?: (checked: boolean) => void;
  /** Clickable label. */
  label?: React.ReactNode;
  /** Track size. */
  size?: "sm" | "default" | "lg";
  /** Prevents changes. */
  disabled?: boolean;
  /** Id for the control; generated if omitted. */
  id?: string;
  /** Extra classes for the root element. */
  className?: string;
}

export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  label,
  size = "default",
  disabled,
  className,
  id: idProp,
  ...props
}: SwitchProps) {
  const auto = useId();
  const id = idProp || auto;
  const [on, setOn] = useControllable({ value: checked, defaultValue: defaultChecked, onChange: onCheckedChange });
  const s = sizes[size];
  const control = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => setOn(!on)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50",
        on ? "bg-primary" : "bg-input",
        s.track,
        !label && className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-sm ring-0 transition-transform duration-200 ease-[cubic-bezier(.3,1.5,.6,1)]",
          s.thumb,
          on ? s.on : "translate-x-0"
        )}
      />
    </button>
  );
  if (!label) return control;
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {control}
      <label htmlFor={id} className="text-sm font-medium select-none">
        {label}
      </label>
    </div>
  );
}
