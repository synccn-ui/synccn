"use client";

import type * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

export interface CheckboxCardOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ElementType;
  disabled?: boolean;
}

export interface CheckboxCardsProps {
  /** Cards to show. */
  options: CheckboxCardOption[];
  /** Controlled selection. */
  value?: string[];
  /** Initial selection when uncontrolled. */
  defaultValue?: string[];
  /** Called with the new selection. */
  onValueChange?: (value: string[]) => void;
  /** Columns from the sm breakpoint up. */
  columns?: 1 | 2 | 3;
  /** Extra classes for the root element. */
  className?: string;
}

/** Selectable cards for picking several options, each with an icon and description. */
export function CheckboxCards({ options, value, defaultValue = [], onValueChange, columns = 2, className }: CheckboxCardsProps) {
  const [sel, setSel] = useControllable({ value, defaultValue, onChange: onValueChange });
  return (
    <div role="group" className={cn("grid gap-2.5", columns === 3 ? "sm:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "", className)}>
      {options.map((o) => {
        const on = sel.includes(o.value);
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            role="checkbox"
            aria-checked={on}
            disabled={o.disabled}
            onClick={() => setSel(on ? sel.filter((x) => x !== o.value) : [...sel, o.value])}
            className={cn(
              "relative flex gap-3 rounded-xl border p-4 text-left transition-[border-color,background-color,box-shadow] hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50",
              on && "border-primary/70 bg-brand-soft shadow-[0_0_0_1px_var(--primary)] hover:bg-brand-soft"
            )}
          >
            {Icon && (
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-lg border bg-background transition-colors",
                  on && "border-primary/40"
                )}
              >
                <Icon className="size-4" />
              </span>
            )}
            <span className="grid min-w-0 flex-1 gap-0.5 pr-6">
              <span className="text-sm font-medium">{o.label}</span>
              {o.description && <span className="text-[13px] leading-snug text-muted-foreground">{o.description}</span>}
            </span>
            <span
              className={cn(
                "absolute right-3.5 top-3.5 grid size-[18px] place-items-center rounded-full border transition-colors",
                on ? "border-primary bg-primary text-primary-foreground" : "border-input"
              )}
            >
              <Check className={cn("size-3 transition-transform", on ? "scale-100" : "scale-0")} strokeWidth={3} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
