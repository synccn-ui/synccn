"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNow } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const same = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && a.toDateString() === b.toDateString();
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

interface CalendarBaseProps {
  /** Month shown first. */
  defaultMonth?: Date;
  /** Return true to block a day. */
  disabled?: (date: Date) => boolean;
  /** Extra classes for the root element. */
  className?: string;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  /** Pick one day or a span of days. */
  mode?: "single";
  /** Controlled selection: a Date in "single" mode, { from, to } in "range" mode. */
  value?: Date | null;
  /** Called with the new Date or DateRange. */
  onChange?: (value: Date) => void;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  mode: "range";
  value?: DateRange;
  onChange?: (value: DateRange) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

/**
 * mode "single": value is a Date. mode "range": value is { from, to }.
 */
export function Calendar(props: CalendarProps) {
  const { mode = "single", defaultMonth, disabled, className } = props;
  const value = props.value as Date | DateRange | null | undefined;
  const onChange = props.onChange as ((v: Date | DateRange) => void) | undefined;
  const [internal, setInternal] = useState<Date | DateRange | null>(mode === "range" ? { from: null, to: null } : null);
  const sel = value !== undefined ? value : internal;
  const range = mode === "range" ? ((sel as DateRange | null) ?? { from: null, to: null }) : null;
  const single = mode === "single" ? (sel as Date | null) : null;
  const set = (v: Date | DateRange) => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };
  // Without a value or defaultMonth, the calendar opens on today's month. Today is only
  // known in the browser, so the server renders an empty grid of the same size.
  const now = useNow();
  const today = now ? startOfDay(now) : null;
  const [picked, setMonth] = useState<Date | null>(() => {
    const d = defaultMonth || (range ? range.from : single);
    return d ? new Date(d.getFullYear(), d.getMonth(), 1) : null;
  });
  const month = picked ?? (now ? new Date(now.getFullYear(), now.getMonth(), 1) : null);
  const [hover, setHover] = useState<Date | null>(null);

  const monthKey = month ? month.getFullYear() * 12 + month.getMonth() : null;
  const cells = useMemo(() => {
    if (monthKey === null) return [];
    const y = Math.floor(monthKey / 12);
    const m = monthKey % 12;
    const first = (new Date(y, m, 1).getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, i) => new Date(y, m, 1 - first + i));
  }, [monthKey]);

  const pick = (d: Date) => {
    if (!range) return set(d);
    const { from, to } = range;
    if (!from || (from && to)) return set({ from: d, to: null });
    if (d < from) return set({ from: d, to: from });
    set({ from, to: d });
  };

  const inRange = (d: Date) => {
    if (!range?.from) return false;
    const end = range.to || hover;
    if (!end) return false;
    const [a, b] = range.from < end ? [range.from, end] : [end, range.from];
    return d > a && d < b;
  };

  const shift = (n: number) => month && setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div className={cn("w-fit select-none rounded-xl border bg-card p-3", className)}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shift(-1)}
          className="grid size-8 place-items-center rounded-md hover:bg-accent"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-sm font-semibold" aria-live="polite">
          {month ? month.toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "\u00a0"}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shift(1)}
          className="grid size-8 place-items-center rounded-md hover:bg-accent"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div role="grid" className="grid grid-cols-7 gap-y-1">
        {DAYS.map((d) => (
          <div key={d} role="columnheader" className="grid h-8 place-items-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {!month && Array.from({ length: 42 }, (_, i) => <div key={i} aria-hidden className="size-9" />)}
        {cells.map((d) => {
          const outside = d.getMonth() !== month?.getMonth();
          const isSel = range ? same(d, range.from) || same(d, range.to) : same(d, single);
          const mid = inRange(d);
          const off = disabled?.(d);
          return (
            <button
              key={d.toISOString()}
              type="button"
              role="gridcell"
              aria-selected={isSel}
              aria-label={d.toDateString()}
              disabled={off}
              onClick={() => pick(d)}
              onPointerEnter={() => setHover(d)}
              className={cn(
                "relative grid size-9 place-items-center rounded-md text-sm tabular-nums transition-colors",
                "hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30",
                outside && "text-muted-foreground/50",
                same(d, today) && !isSel && "font-semibold text-primary",
                mid && "rounded-none bg-brand-soft text-foreground",
                isSel && "bg-primary text-primary-foreground hover:bg-primary"
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
