"use client";

import { useRef, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutoSide, useClickOutside, useEscape, usePresence } from "@/lib/hooks";
import { Calendar, type CalendarProps, type DateRange } from "@/registry/ui/calendar";

const fmt = (d: Date | null | undefined) => d?.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

interface DatePickerBaseProps {
  /** Shown when empty. */
  placeholder?: string;
  /** Extra classes for the root element. */
  className?: string;
}

export interface DatePickerSingleProps extends DatePickerBaseProps {
  /** One date or a range. */
  mode?: "single";
  /** Controlled value. */
  value?: Date | null;
  /** Called with the new Date or { from, to }. */
  onChange?: (value: Date | null) => void;
  /** Quick picks shown beside the calendar. */
  presets?: { label: string; value: () => Date }[];
}

export interface DatePickerRangeProps extends DatePickerBaseProps {
  mode: "range";
  value?: DateRange;
  onChange?: (value: DateRange) => void;
  presets?: { label: string; value: () => DateRange }[];
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

/** Field that opens a Calendar. mode "single" -> Date, mode "range" -> { from, to }. */
export function DatePicker(props: DatePickerProps) {
  const { mode = "single", placeholder = "Pick a date", className } = props;
  const value = props.value as Date | DateRange | null | undefined;
  const onChange = props.onChange as ((v: Date | DateRange | null) => void) | undefined;
  const presets = props.presets as { label: string; value: () => Date | DateRange }[] | undefined;
  const [inner, setInner] = useState<Date | DateRange | null>(mode === "range" ? { from: null, to: null } : null);
  const sel = value !== undefined ? value : inner;
  const range = mode === "range" ? ((sel as DateRange | null) ?? { from: null, to: null }) : null;
  const single = mode === "single" ? (sel as Date | null) : null;
  const set = (v: Date | DateRange | null) => {
    if (value === undefined) setInner(v);
    onChange?.(v);
  };
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { mounted, closing } = usePresence(open, 120);
  const side = useAutoSide(root, panel, mounted);
  useClickOutside(root, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);

  const label = range ? (range.from ? `${fmt(range.from)} – ${range.to ? fmt(range.to) : "…"}` : null) : fmt(single);
  const empty = range ? !range.from : !single;

  return (
    <div ref={root} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-sm shadow-xs focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn("flex-1 truncate", empty && "text-muted-foreground")}>{label || placeholder}</span>
        {!empty && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear date"
            onClick={(e) => {
              e.stopPropagation();
              set(mode === "range" ? { from: null, to: null } : null);
            }}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </span>
        )}
      </button>
      {mounted && (
        <div
          ref={panel}
          className={cn(
            "absolute left-0 z-50 flex overflow-hidden rounded-xl border bg-popover shadow-lg shadow-black/10",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            closing ? "animate-out" : "animate-in"
          )}
        >
          {presets && (
            <div className="hidden w-36 flex-col gap-0.5 border-r p-2 sm:flex">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => (set(p.value()), mode === "single" && setOpen(false))}
                  className="rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <Calendar
            className="rounded-none border-0"
            defaultMonth={(range ? range.from : single) || undefined}
            {...({
              mode,
              value: sel,
              onChange: (v: Date | DateRange) => {
                set(v);
                if (v instanceof Date || (v.from && v.to)) setTimeout(() => setOpen(false), 120);
              },
            } as CalendarProps)}
          />
        </div>
      )}
    </div>
  );
}
