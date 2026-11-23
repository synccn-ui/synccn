"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutoSide, useClickOutside, useControllable, useEscape, usePresence } from "@/lib/hooks";

export interface ComboboxOption {
  value: string;
  label: string;
  hint?: React.ReactNode;
}

export interface ComboboxProps {
  /** Choices. */
  options: ComboboxOption[];
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the new value (undefined when cleared). */
  onValueChange?: (value: string | undefined) => void;
  /** Shown when nothing is selected. */
  placeholder?: string;
  /** Placeholder for the search field. */
  searchPlaceholder?: string;
  /** Shown when the search matches nothing. */
  empty?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Searchable select. options: [{ value, label, hint? }] */
export function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  empty = "No matches. Try a different word.",
  className,
}: ComboboxProps) {
  const [current, setCurrent] = useControllable({ value, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const { mounted, closing } = usePresence(open, 120);
  const panel = useRef<HTMLDivElement>(null);
  const side = useAutoSide(root, panel, mounted);
  useClickOutside(root, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);

  const filtered = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  const selected = options.find((o) => o.value === current);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      requestAnimationFrame(() => input.current?.focus());
    }
  }, [open]);
  useEffect(() => setActive(0), [q]);

  const choose = (o: ComboboxOption) => {
    setCurrent(o.value === current ? undefined : o.value);
    setOpen(false);
  };

  return (
    <div ref={root} className={cn("relative w-full", className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>{selected?.label ?? placeholder}</span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>
      {mounted && (
        <div
          ref={panel}
          className={cn(
            "absolute z-50 w-full min-w-56",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            "overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg shadow-black/5",
            closing ? "animate-out" : "animate-in"
          )}
        >
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => Math.min(filtered.length - 1, a + 1)));
                if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => Math.max(0, a - 1)));
                if (e.key === "Enter" && filtered[active]) (e.preventDefault(), choose(filtered[active]));
              }}
              className="h-10 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-auto p-1 scrollbar-thin">
            {filtered.length === 0 && <li className="px-2 py-6 text-center text-sm text-muted-foreground">{empty}</li>}
            {filtered.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === current}
                onPointerMove={() => setActive(i)}
                onClick={() => choose(o)}
                className={cn("flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm", i === active && "bg-accent")}
              >
                <Check className={cn("size-4 text-primary", o.value === current ? "opacity-100" : "opacity-0")} />
                <span className="flex-1">{o.label}</span>
                {o.hint && <span className="text-xs text-muted-foreground">{o.hint}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
