"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutoSide, useClickOutside, useControllable, useEscape, usePresence } from "@/lib/hooks";

export interface MultiSelectProps {
  /** Choices. */
  options: { value: string; label: string }[];
  /** Controlled selection. */
  value?: string[];
  /** Initial selection when uncontrolled. */
  defaultValue?: string[];
  /** Called with the new selection. */
  onValueChange?: (value: string[]) => void;
  /** Shown when nothing is selected. */
  placeholder?: string;
  /** Most items that can be picked. */
  max?: number;
  /** Chips shown before “+N more”. */
  maxChips?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** Pick several options from a searchable list; selections show as removable chips. */
export function MultiSelect({
  options,
  value,
  defaultValue = [],
  onValueChange,
  placeholder = "Select options",
  max,
  maxChips = 3,
  className,
}: MultiSelectProps) {
  const [sel, setSel] = useControllable({ value, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const { mounted, closing } = usePresence(open, 120);
  const side = useAutoSide(root, panel, mounted);
  useClickOutside(root, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);

  const filtered = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  const full = max && sel.length >= max;
  const toggle = (v: string) => setSel(sel.includes(v) ? sel.filter((x) => x !== v) : full ? sel : [...sel, v]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      requestAnimationFrame(() => search.current?.focus());
    }
  }, [open]);

  const labels = sel.map((v) => options.find((o) => o.value === v)).filter((o): o is NonNullable<typeof o> => !!o);

  return (
    <div ref={root} className={cn("relative w-full", className)}>
      <div
        role="combobox"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") && (e.preventDefault(), setOpen(true))}
        className="flex min-h-9 w-full cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background py-1 pl-1.5 pr-2 text-sm shadow-xs focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
      >
        <div className="flex min-w-0 flex-1 flex-wrap gap-1">
          {labels.length === 0 && <span className="px-1.5 text-muted-foreground">{placeholder}</span>}
          {labels.slice(0, maxChips).map((o) => (
            <span
              key={o.value}
              className="inline-flex animate-in items-center gap-1 rounded-md bg-secondary py-0.5 pl-2 pr-1 text-xs font-medium"
            >
              {o.label}
              <button
                type="button"
                aria-label={`Remove ${o.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(o.value);
                }}
                className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {labels.length > maxChips && (
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
              +{labels.length - maxChips} more
            </span>
          )}
        </div>
        {sel.length > 0 && (
          <button
            type="button"
            aria-label="Clear all"
            onClick={(e) => {
              e.stopPropagation();
              setSel([]);
            }}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </div>
      {mounted && (
        <div
          ref={panel}
          className={cn(
            "absolute z-50 w-full overflow-hidden rounded-xl border bg-popover shadow-lg shadow-black/10",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            closing ? "animate-out" : "animate-in"
          )}
        >
          <input
            ref={search}
            value={q}
            onChange={(e) => (setQ(e.target.value), setActive(0))}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => Math.min(filtered.length - 1, a + 1)));
              if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => Math.max(0, a - 1)));
              if (e.key === "Enter" && filtered[active]) (e.preventDefault(), toggle(filtered[active].value));
            }}
            placeholder="Search…"
            aria-label="Search options"
            className="h-10 w-full border-b bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
          />
          <ul role="listbox" aria-multiselectable="true" className="max-h-56 overflow-y-auto p-1 scrollbar-thin">
            {filtered.length === 0 && <li className="px-2 py-6 text-center text-sm text-muted-foreground">No matches.</li>}
            {filtered.map((o, i) => {
              const on = sel.includes(o.value);
              const blocked = full && !on;
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={on}
                  aria-disabled={blocked || undefined}
                  onPointerMove={() => setActive(i)}
                  onClick={() => !blocked && toggle(o.value)}
                  className={cn(
                    "flex cursor-default items-center gap-2.5 rounded-md px-2 py-1.5 text-sm",
                    i === active && "bg-accent",
                    blocked && "opacity-40"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-4 place-items-center rounded-[4px] border",
                      on && "border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {on && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <span className="flex-1">{o.label}</span>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <span>
              {sel.length} selected{max ? ` of ${max}` : ""}
            </span>
            <button type="button" onClick={() => setOpen(false)} className="font-medium text-foreground hover:underline">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
