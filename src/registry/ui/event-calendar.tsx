"use client";

import type * as React from "react";
import { useId, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsClient, useNow } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export type EventColor = "default" | "blue" | "green" | "amber" | "red" | "violet";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string | number;
  /** For events that span days. Defaults to `start`. */
  end?: Date | string | number;
  /** All-day events show no time. */
  allDay?: boolean;
  color?: EventColor;
}

export interface EventCalendarProps {
  events: CalendarEvent[];
  /** Month shown first (any day in it). Defaults to the current month. */
  defaultMonth?: Date;
  /** Called when the person moves to another month, with its first day. */
  onMonthChange?: (month: Date) => void;
  /** Called when an event is chosen. */
  onEventClick?: (event: CalendarEvent) => void;
  /** Called when a day is chosen, with a "YYYY-MM-DD" key and its events. */
  onDayClick?: (day: string, events: CalendarEvent[]) => void;
  /**
   * First day of the week: 0 is Sunday, 1 is Monday.
   * @default 1
   */
  weekStartsOn?: 0 | 1;
  /**
   * Events shown in a day before "+N more".
   * @default 2
   */
  maxPerDay?: number;
  /**
   * IANA time zone used to place events on days and format their times, e.g. "America/New_York".
   * With it, events render on the server too; without it, they appear once the page loads in the browser's own time zone.
   */
  timeZone?: string;
  /**
   * Shows the selected day's events under the grid.
   * @default true
   */
  agenda?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

const COLORS: Record<EventColor, { chip: string; dot: string }> = {
  default: { chip: "bg-foreground/[0.07] text-foreground", dot: "bg-foreground/60" },
  blue: { chip: "bg-sky-500/15 text-sky-800 dark:text-sky-200", dot: "bg-sky-500" },
  green: { chip: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200", dot: "bg-emerald-500" },
  amber: { chip: "bg-amber-500/20 text-amber-800 dark:text-amber-200", dot: "bg-amber-500" },
  red: { chip: "bg-rose-500/15 text-rose-800 dark:text-rose-200", dot: "bg-rose-500" },
  violet: { chip: "bg-violet-500/15 text-violet-800 dark:text-violet-200", dot: "bg-violet-500" },
};

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const toDate = (v: Date | string | number) => (v instanceof Date ? v : new Date(v));
/** Day math on plain calendar dates, so it never depends on the time zone. */
const addDays = (key: string, n: number) => {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return keyOf(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
};

/**
 * Month view for events: chips with times, multi-day events, "+N more", today, keyboard
 * navigation between days and an agenda for the selected day. On phones, chips shrink to dots.
 */
export function EventCalendar({ events, defaultMonth, onMonthChange, onEventClick, onDayClick, weekStartsOn = 1, maxPerDay = 2, timeZone, agenda = true, className }: EventCalendarProps) {
  const uid = useId();
  const now = useNow(60_000);
  const isClient = useIsClient();
  const ready = !!timeZone || isClient;
  const grid = useRef<HTMLDivElement>(null);

  const dayFmt = useMemo(() => new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }), [timeZone]);
  const timeFmt = useMemo(() => new Intl.DateTimeFormat(undefined, { timeZone, hour: "numeric", minute: "2-digit" }), [timeZone]);
  const dayKey = (d: Date) => dayFmt.format(d);

  const [month, setMonth] = useState<{ y: number; m: number } | null>(() => (defaultMonth ? { y: defaultMonth.getFullYear(), m: defaultMonth.getMonth() } : null));
  const todayKey = now ? dayKey(now) : null;
  const shown = month ?? (todayKey ? { y: Number(todayKey.slice(0, 4)), m: Number(todayKey.slice(5, 7)) - 1 } : null);
  const [selected, setSelected] = useState<string | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);

  // Bucket events by day, repeating multi-day events on each day they cover.
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    if (!ready) return map;
    const sorted = [...events].sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime() || Number(!a.allDay) - Number(!b.allDay));
    for (const e of sorted) {
      const first = dayKey(toDate(e.start));
      const last = dayKey(toDate(e.end ?? e.start));
      for (let k = first, guard = 0; k <= last && guard < 62; k = addDays(k, 1), guard++) map.set(k, [...(map.get(k) ?? []), e]);
    }
    return map;
  }, [events, ready, dayFmt]); // eslint-disable-line react-hooks/exhaustive-deps

  const cells = useMemo(() => {
    if (!shown) return [];
    const firstDow = new Date(Date.UTC(shown.y, shown.m, 1)).getUTCDay();
    const lead = (firstDow - weekStartsOn + 7) % 7;
    const start = addDays(keyOf(shown.y, shown.m, 1), -lead);
    const daysInMonth = new Date(Date.UTC(shown.y, shown.m + 1, 0)).getUTCDate();
    const weeks = Math.ceil((lead + daysInMonth) / 7);
    return Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
  }, [shown?.y, shown?.m, weekStartsOn]); // eslint-disable-line react-hooks/exhaustive-deps

  const weekdays = useMemo(() => {
    const names = Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(2026, 0, 4 + i)).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }));
    return weekStartsOn === 1 ? [...names.slice(1), names[0]] : names;
  }, [weekStartsOn]);

  const go = (n: number, focus?: string) => {
    if (!shown) return;
    const t = new Date(Date.UTC(shown.y, shown.m + n, 1));
    const next = { y: t.getUTCFullYear(), m: t.getUTCMonth() };
    setMonth(next);
    onMonthChange?.(new Date(next.y, next.m, 1));
    if (focus) setFocusKey(focus);
  };

  const pick = (k: string) => {
    setSelected(k);
    setFocusKey(k);
    onDayClick?.(k, byDay.get(k) ?? []);
  };

  const inMonth = (k: string) => !!shown && k.slice(0, 7) === `${shown.y}-${pad(shown.m + 1)}`;
  const tabKey = (focusKey && cells.includes(focusKey) && focusKey) || (selected && cells.includes(selected) && selected) || (todayKey && cells.includes(todayKey) && todayKey) || cells.find(inMonth);

  const moveFocus = (k: string) => {
    setFocusKey(k);
    if (!inMonth(k)) go(k < cells[7] ? -1 : 1, k);
    requestAnimationFrame(() => grid.current?.querySelector<HTMLElement>(`[data-day="${k}"]`)?.focus());
  };

  const onKey = (e: React.KeyboardEvent, k: string) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (step) return e.preventDefault(), moveFocus(addDays(k, step));
    if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const [y, m, d] = k.split("-").map(Number);
      const t = new Date(Date.UTC(y, m - 1 + (e.key === "PageUp" ? -1 : 1), 1));
      const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
      return moveFocus(keyOf(t.getUTCFullYear(), t.getUTCMonth(), Math.min(d, last)));
    }
    if (e.key === "Enter" || e.key === " ") return e.preventDefault(), pick(k);
  };

  const label = shown ? new Date(Date.UTC(shown.y, shown.m, 1)).toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: "UTC" }) : " ";
  const longDay = (k: string) => new Date(`${k}T12:00:00Z`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
  const timeOf = (e: CalendarEvent) => (e.allDay ? "All day" : timeFmt.format(toDate(e.start)));
  const agendaDay = selected ?? (todayKey && shown && inMonth(todayKey) ? todayKey : null);
  const agendaEvents = agendaDay ? (byDay.get(agendaDay) ?? []) : [];

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border bg-card text-left", className)}>
      <div className="flex items-center gap-2 border-b px-3 py-2.5 sm:px-4">
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold sm:text-base" aria-live="polite" id={`${uid}-label`}>
          {label}
        </h3>
        <button
          type="button"
          onClick={() => {
            setMonth(null);
            if (todayKey) (setSelected(todayKey), setFocusKey(todayKey));
          }}
          disabled={!todayKey}
          className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-[13px] font-medium shadow-xs hover:bg-accent disabled:opacity-50"
        >
          Today
        </button>
        <div className="flex">
          <button type="button" aria-label="Previous month" onClick={() => go(-1)} className="grid size-8 place-items-center rounded-md hover:bg-accent">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" aria-label="Next month" onClick={() => go(1)} className="grid size-8 place-items-center rounded-md hover:bg-accent">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div ref={grid} role="grid" aria-labelledby={`${uid}-label`} className="grid grid-cols-7">
        <div role="row" className="contents">
          {weekdays.map((d) => (
            <div key={d} role="columnheader" className="border-b py-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <span className="sm:hidden">{d.slice(0, 1)}</span>
              <span className="hidden sm:inline">{d}</span>
            </div>
          ))}
        </div>
        {!shown && Array.from({ length: 35 }, (_, i) => <div key={i} aria-hidden className="h-14 border-b border-r sm:h-24 [&:nth-child(7n)]:border-r-0" />)}
        {Array.from({ length: cells.length / 7 }, (_, w) => (
          <div key={w} role="row" className="contents">
            {cells.slice(w * 7, w * 7 + 7).map((k, i) => {
              const list = byDay.get(k) ?? [];
              const out = !inMonth(k);
              const isToday = k === todayKey;
              const isSel = k === selected;
              const extra = list.length - maxPerDay;
              return (
                <div
                  key={k}
                  role="gridcell"
                  data-day={k}
                  tabIndex={k === tabKey ? 0 : -1}
                  aria-selected={isSel}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={`${longDay(k)}${list.length ? `, ${list.length} ${list.length === 1 ? "event" : "events"}` : ""}`}
                  onClick={() => pick(k)}
                  onKeyDown={(e) => onKey(e, k)}
                  onFocus={() => setFocusKey(k)}
                  className={cn(
                    "group relative flex h-14 min-w-0 cursor-pointer flex-col gap-0.5 border-b p-1 outline-none transition-colors sm:h-24 sm:p-1.5",
                    i < 6 && "border-r",
                    out ? "bg-muted/30 text-muted-foreground/60" : "hover:bg-muted/40",
                    isSel && "bg-brand-soft/60 hover:bg-brand-soft/60",
                    "focus-visible:z-10 focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center self-center rounded-full text-xs tabular-nums sm:self-start",
                      isToday && "bg-primary font-semibold text-primary-foreground"
                    )}
                  >
                    {Number(k.slice(8))}
                  </span>
                  <div className="hidden min-w-0 gap-0.5 sm:grid">
                    {list.slice(0, extra > 0 ? maxPerDay - 1 : maxPerDay).map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        tabIndex={-1}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setSelected(k);
                          onEventClick?.(e);
                        }}
                        title={`${timeOf(e)} · ${e.title}`}
                        className={cn("flex min-w-0 items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight hover:brightness-95 dark:hover:brightness-125", COLORS[e.color ?? "default"].chip)}
                      >
                        {!e.allDay && <span className="shrink-0 tabular-nums opacity-70">{timeOf(e).replace(/\s?([AP]M)/i, (m) => m.trim().slice(0, 1).toLowerCase())}</span>}
                        <span className="truncate">{e.title}</span>
                      </button>
                    ))}
                    {extra > 0 && <span className="px-1.5 text-[11px] font-medium text-muted-foreground">+{extra + 1} more</span>}
                  </div>
                  {list.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-0.5 sm:hidden" aria-hidden>
                      {list.slice(0, 3).map((e) => (
                        <span key={e.id} className={cn("size-1.5 rounded-full", COLORS[e.color ?? "default"].dot)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {agenda && (
        <div className="grid gap-2 p-3 sm:p-4" aria-live="polite">
          <p className="text-[13px] font-medium">{agendaDay ? longDay(agendaDay) : "Pick a day to see its events"}</p>
          {agendaDay && agendaEvents.length === 0 && (
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <CalendarDays className="size-4" /> Nothing scheduled.
            </p>
          )}
          {agendaEvents.length > 0 && (
            <ul className="grid gap-1">
              {agendaEvents.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => onEventClick?.(e)} className="flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-accent">
                    <span className={cn("h-8 w-1 shrink-0 rounded-full", COLORS[e.color ?? "default"].dot)} aria-hidden />
                    <span className="grid min-w-0 flex-1">
                      <span className="truncate text-sm font-medium">{e.title}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {timeOf(e)}
                        {e.end && !e.allDay && ` – ${timeFmt.format(toDate(e.end))}`}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
