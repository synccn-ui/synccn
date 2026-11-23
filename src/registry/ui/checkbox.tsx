"use client";

import type * as React from "react";
import { useId } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

export interface CheckboxProps {
  /** Controlled state. */
  checked?: boolean | "indeterminate";
  /** Initial state when uncontrolled. */
  defaultChecked?: boolean | "indeterminate";
  /** Called with the new state. */
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  /** Clickable label. */
  label?: React.ReactNode;
  /** Helper text under the label. */
  description?: React.ReactNode;
  /** Prevents changes. */
  disabled?: boolean;
  /** Id for the control; generated if omitted. */
  id?: string;
  /** Accessible name when there's no visible label (e.g. row checkboxes in a table). */
  "aria-label"?: string;
  /** Extra classes for the root element. */
  className?: string;
}

export function Checkbox({
  checked,
  defaultChecked = false,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
  id: idProp,
  "aria-label": ariaLabel,
}: CheckboxProps) {
  const auto = useId();
  const id = idProp || auto;
  const [value, setValue] = useControllable({ value: checked, defaultValue: defaultChecked, onChange: onCheckedChange });
  const on = value === true || value === "indeterminate";
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={value === "indeterminate" ? "mixed" : value}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setValue(value === true ? false : true)}
        className={cn(
          "mt-px grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-input bg-background shadow-xs transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50",
          on && "border-primary bg-primary text-primary-foreground"
        )}
      >
        {value === "indeterminate" ? (
          <Minus className="size-3" strokeWidth={3.5} />
        ) : (
          <Check className={cn("size-3 transition-transform", on ? "scale-100" : "scale-0")} strokeWidth={3.5} />
        )}
      </button>
      {(label || description) && (
        <div className="grid gap-1 leading-none">
          {label && (
            <label htmlFor={id} className="text-sm font-medium select-none">
              {label}
            </label>
          )}
          {description && <p className="text-[13px] leading-snug text-muted-foreground">{description}</p>}
        </div>
      )}
    </div>
  );
}
