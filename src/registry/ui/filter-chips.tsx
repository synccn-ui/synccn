"use client";

import type * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

export interface FilterChipsProps {
  /** Filters. */
  options: { value: string; label: React.ReactNode; count?: number; icon?: React.ElementType }[];
  /** Controlled selection. */
  value?: string[];
  /** Initial selection when uncontrolled. */
  defaultValue?: string[];
  /** Called with the new selection. */
  onValueChange?: (value: string[]) => void;
  /** Allow several filters at once. */
  multiple?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/** Toggleable filter pills with counts and a "Clear" action. options: [{ value, label, count?, icon? }] */
export function FilterChips({ options, value, defaultValue = [], onValueChange, multiple = true, className }: FilterChipsProps) {
  const [sel, setSel] = useControllable({ value, defaultValue, onChange: onValueChange });
  const toggle = (v: string) => {
    if (!multiple) return setSel(sel[0] === v ? [] : [v]);
    setSel(sel.includes(v) ? sel.filter((x) => x !== v) : [...sel, v]);
  };
  return (
    <div role="group" className={cn("flex flex-wrap items-center gap-2", className)}>
      {options.map((o) => {
        const on = sel.includes(o.value);
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(o.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              on
                ? "border-foreground bg-foreground text-background"
                : "border-dashed text-muted-foreground hover:border-solid hover:border-foreground/30 hover:text-foreground"
            )}
          >
            {on ? <Check className="size-3.5" /> : Icon && <Icon className="size-3.5" />}
            {o.label}
            {o.count != null && (
              <span className={cn("tabular-nums text-xs", on ? "text-background/60" : "text-muted-foreground/70")}>{o.count}</span>
            )}
          </button>
        );
      })}
      {sel.length > 0 && (
        <button
          type="button"
          onClick={() => setSel([])}
          className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[13px] text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" /> Clear
        </button>
      )}
    </div>
  );
}
