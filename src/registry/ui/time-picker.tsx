"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutoSide, useClickOutside, useControllable, useEscape, usePresence } from "@/lib/hooks";

const pad = (n: number) => String(n).padStart(2, "0");

function Column<T extends string | number>({ items, value, onPick, label }: { items: T[]; value: T; onPick: (v: T) => void; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    ref.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "center" });
  }, []);
  return (
    <ul ref={ref} role="listbox" aria-label={label} className="h-52 w-14 overflow-y-auto p-1 scrollbar-none">
      {items.map((it) => (
        <li key={it}>
          <button
            type="button"
            role="option"
            aria-selected={it === value}
            onClick={() => onPick(it)}
            className={cn(
              "h-8 w-full rounded-md text-sm tabular-nums transition-colors",
              it === value ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            )}
          >
            {typeof it === "number" ? pad(it) : it}
          </button>
        </li>
      ))}
    </ul>
  );
}

export interface TimePickerProps {
  /** Controlled time as "HH:MM" (24-hour). */
  value?: string;
  /** Initial time when uncontrolled. */
  defaultValue?: string;
  /** Called with the new "HH:MM" time. */
  onValueChange?: (value: string) => void;
  /** Minutes between options. */
  step?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** value is "HH:MM" in 24-hour time; shown in 12-hour time with AM/PM. */
export function TimePicker({ value, defaultValue = "09:30", onValueChange, step = 5, className }: TimePickerProps) {
  const [v, setV] = useControllable({ value, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { mounted, closing } = usePresence(open, 120);
  const side = useAutoSide(root, panel, mounted);
  useClickOutside(root, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);

  const [H, M] = v.split(":").map(Number);
  const ampm: "AM" | "PM" = H >= 12 ? "PM" : "AM";
  const h12 = H % 12 || 12;
  const set = (h: number, m: number, ap: "AM" | "PM") => {
    const hh = (h % 12) + (ap === "PM" ? 12 : 0);
    setV(`${pad(hh)}:${pad(m)}`);
  };

  return (
    <div ref={root} className={cn("relative w-full max-w-40", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
      >
        <Clock className="size-4 text-muted-foreground" />
        <span className="tabular-nums">
          {h12}:{pad(M)} {ampm}
        </span>
      </button>
      {mounted && (
        <div
          ref={panel}
          className={cn(
            "absolute left-0 z-50 flex divide-x rounded-xl border bg-popover shadow-lg shadow-black/10",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            closing ? "animate-out" : "animate-in"
          )}
        >
          <Column label="Hour" items={Array.from({ length: 12 }, (_, i) => i + 1)} value={h12} onPick={(h) => set(h, M, ampm)} />
          <Column
            label="Minute"
            items={Array.from({ length: 60 / step }, (_, i) => i * step)}
            value={M - (M % step)}
            onPick={(m) => set(h12, m, ampm)}
          />
          <Column label="AM or PM" items={["AM", "PM"] as ("AM" | "PM")[]} value={ampm} onPick={(ap) => set(h12, M, ap)} />
        </div>
      )}
    </div>
  );
}
