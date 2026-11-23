"use client";

import type * as React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutoSide, useClickOutside, useControllable, useEscape, usePresence } from "@/lib/hooks";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ElementType;
  disabled?: boolean;
  /** Options with the same group are shown under one heading. */
  group?: string;
}

export interface SelectProps {
  /** Choices. */
  options: SelectOption[];
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the new value. */
  onValueChange?: (value: string) => void;
  /** Shown when nothing is selected. */
  placeholder?: string;
  /** Prevents opening. */
  disabled?: boolean;
  /** Accessible name if there's no visible label. */
  "aria-label"?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Accessible listbox select with keyboard navigation and typeahead.
 * options: [{ value, label, icon?, disabled?, group? }]
 */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  className,
  disabled,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [current, setCurrent] = useControllable<string | undefined>({ value, defaultValue, onChange: onValueChange as ((v: string | undefined) => void) | undefined });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ str: "", t: 0 });
  const id = useId();
  const { mounted, closing } = usePresence(open, 120);
  const side = useAutoSide(root, list, mounted);
  useClickOutside(root, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);

  const selected = options.find((o) => o.value === current);

  useEffect(() => {
    if (open)
      setActive(
        Math.max(
          0,
          options.findIndex((o) => o.value === current)
        )
      );
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, mounted]);

  const move = (dir: number) => {
    let n = active;
    for (let i = 0; i < options.length; i++) {
      n = (n + dir + options.length) % options.length;
      if (!options[n].disabled) break;
    }
    setActive(n);
  };

  const choose = (o: SelectOption) => {
    if (o.disabled) return;
    setCurrent(o.value);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      return setOpen(true);
    }
    if (!open) return;
    if (e.key === "ArrowDown") (e.preventDefault(), move(1));
    else if (e.key === "ArrowUp") (e.preventDefault(), move(-1));
    else if (e.key === "Enter" || e.key === " ") (e.preventDefault(), choose(options[active]));
    else if (e.key === "Tab") setOpen(false);
    else if (e.key.length === 1) {
      const now = Date.now();
      typed.current.str = now - typed.current.t > 600 ? e.key : typed.current.str + e.key;
      typed.current.t = now;
      const i = options.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.str.toLowerCase()));
      if (i >= 0) setActive(i);
    }
  };

  return (
    <div ref={root} className={cn("relative w-full", className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={onKey}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs transition-[border-color,box-shadow]",
          "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:opacity-50",
          open && "border-ring ring-[3px] ring-ring/25"
        )}
      >
        <span className={cn("flex min-w-0 items-center gap-2 truncate", !selected && "text-muted-foreground")}>
          {selected?.icon && <selected.icon className="size-4 shrink-0 text-muted-foreground" />}
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>
      {mounted && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          className={cn(
            "absolute z-50 max-h-64 w-full min-w-40 overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5 scrollbar-thin",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            closing ? "animate-out" : "animate-in"
          )}
        >
          {options.map((o, i) => {
            const showGroup = o.group && o.group !== options[i - 1]?.group;
            return (
              <li key={o.value} role="presentation">
                {showGroup && <div className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">{o.group}</div>}
                <div
                  role="option"
                  data-index={i}
                  aria-selected={o.value === current}
                  aria-disabled={o.disabled || undefined}
                  onPointerMove={() => !o.disabled && setActive(i)}
                  onClick={() => choose(o)}
                  className={cn(
                    "relative flex cursor-default items-center gap-2 rounded-md py-1.5 pl-2 pr-8 text-sm select-none",
                    i === active && "bg-accent text-accent-foreground",
                    o.disabled && "opacity-50"
                  )}
                >
                  {o.icon && <o.icon className="size-4 text-muted-foreground" />}
                  {o.label}
                  {o.value === current && <Check className="absolute right-2 size-4 text-primary" />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
