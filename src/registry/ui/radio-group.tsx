"use client";

import type * as React from "react";
import { useId, useRef } from "react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Choices. */
  options: RadioOption[];
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. Defaults to the first option. */
  defaultValue?: string;
  /** Called with the new value. */
  onValueChange?: (value: string) => void;
  /** Dots or selectable cards. */
  variant?: "default" | "cards";
  /** Accessible name if no label is given. */
  name?: string;
  /** Accessible name for the group. */
  label?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * options: [{ value, label, description?, disabled? }]
 * variant "default" renders dots, "cards" renders selectable tiles.
 */
export function RadioGroup({ options, value, defaultValue, onValueChange, variant = "default", className, name, label }: RadioGroupProps) {
  const gid = useId();
  const [current, setCurrent] = useControllable({ value, defaultValue: defaultValue ?? options[0]?.value, onChange: onValueChange });
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const dir = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[e.key];
    if (!dir) return;
    e.preventDefault();
    let n = i;
    do n = (n + dir + options.length) % options.length;
    while (options[n].disabled && n !== i);
    setCurrent(options[n].value);
    refs.current[n]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label || name}
      className={cn(variant === "cards" ? "grid gap-2.5 sm:grid-cols-3" : "grid gap-3", className)}
    >
      {options.map((o, i) => {
        const checked = o.value === current;
        const id = `${gid}-${i}`;
        return (
          <label
            key={o.value}
            htmlFor={id}
            className={cn(
              "flex cursor-pointer items-start gap-2.5 select-none",
              o.disabled && "cursor-not-allowed opacity-50",
              variant === "cards" &&
                "relative rounded-lg border p-3.5 transition-colors hover:bg-accent/60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
              variant === "cards" && checked && "border-primary bg-brand-soft hover:bg-brand-soft"
            )}
          >
            <button
              ref={(el) => {
              refs.current[i] = el;
            }}
              id={id}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={o.disabled}
              tabIndex={checked ? 0 : -1}
              onClick={() => setCurrent(o.value)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "mt-px grid size-[18px] shrink-0 place-items-center rounded-full border border-input bg-background shadow-xs transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                checked && "border-primary",
                variant === "cards" && "focus-visible:outline-none"
              )}
            >
              <span className={cn("size-2 rounded-full bg-primary transition-transform", checked ? "scale-100" : "scale-0")} />
            </button>
            <span className="grid gap-1 leading-none">
              <span className="text-sm font-medium">{o.label}</span>
              {o.description && <span className="text-[13px] leading-snug text-muted-foreground">{o.description}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}
