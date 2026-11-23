"use client";

import { useNow } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface ScheduleEvent {
  /** 0 = first day shown (Monday by default). */
  day: number;
  /** Start hour, e.g. 9.5 for 9:30. */
  start: number;
  end: number;
  title: string;
  tone?: "blue" | "violet" | "green" | "amber" | "rose";
}

const TONES = {
  blue: "border-sky-500/50 bg-sky-500/15 text-sky-900 dark:text-sky-100",
  violet: "border-violet-500/50 bg-violet-500/15 text-violet-900 dark:text-violet-100",
  green: "border-emerald-500/50 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100",
  amber: "border-amber-500/50 bg-amber-500/15 text-amber-900 dark:text-amber-100",
  rose: "border-rose-500/50 bg-rose-500/15 text-rose-900 dark:text-rose-100",
};
const fmtH = (h: number) => `${((h + 11) % 12) + 1}${h < 12 ? "am" : "pm"}`;

export interface WeekScheduleProps {
  /** Events to place. */
  events: ScheduleEvent[];
  /** First hour shown. */
  startHour?: number;
  /** Last hour shown. */
  endHour?: number;
  /** Pixels per hour. */
  hourHeight?: number;
  /** Column labels. */
  days?: string[];
  /** Called when an event is clicked. */
  onEventClick?: (event: ScheduleEvent) => void;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Week view calendar. events: [{ day: 0–6 (Mon–Sun), start: 9.5, end: 11, title, tone? }]
 * Shows a live "now" line on today's column.
 */
export function WeekSchedule({
  events,
  startHour = 8,
  endHour = 18,
  hourHeight = 44,
  days = ["Mon", "Tue", "Wed", "Thu", "Fri"],
  onEventClick,
  className,
}: WeekScheduleProps) {
  // The current-time line appears once the browser knows the time.
  const now = useNow(60000);
  const today = now ? (now.getDay() + 6) % 7 : -1;
  const nowH = now ? now.getHours() + now.getMinutes() / 60 : -1;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border bg-card scrollbar-thin", className)}>
      <div className="min-w-[560px]">
        <div className="grid border-b" style={{ gridTemplateColumns: `52px repeat(${days.length}, minmax(0,1fr))` }}>
          <span />
          {days.map((d, i) => (
            <span key={d} className={cn("py-2.5 text-center text-xs font-medium text-muted-foreground", i === today && "text-foreground")}>
              {d}
              {i === today && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">Today</span>
              )}
            </span>
          ))}
        </div>
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `52px repeat(${days.length}, minmax(0,1fr))`, height: hours.length * hourHeight }}
        >
          <div className="relative">
            {hours.map((h, i) => (
              <span
                key={h}
                className="absolute right-2 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground"
                style={{ top: i * hourHeight }}
              >
                {i > 0 && fmtH(h)}
              </span>
            ))}
          </div>
          {days.map((d, di) => (
            <div key={d} className={cn("relative border-l", di === today && "bg-accent/30")}>
              {hours.map((h, i) => (
                <span key={h} className="absolute inset-x-0 border-t border-dashed border-border/60" style={{ top: i * hourHeight }} />
              ))}
              {events
                .filter((e) => e.day === di)
                .map((e) => (
                  <button
                    key={e.title + e.start}
                    type="button"
                    onClick={() => onEventClick?.(e)}
                    className={cn(
                      "absolute inset-x-1 overflow-hidden rounded-md border-l-2 px-1.5 py-1 text-left text-[11px] leading-tight transition-[filter] hover:brightness-110",
                      TONES[e.tone || "blue"]
                    )}
                    style={{ top: (e.start - startHour) * hourHeight + 1, height: (e.end - e.start) * hourHeight - 2 }}
                  >
                    <span className="block truncate font-semibold">{e.title}</span>
                    <span className="block truncate opacity-70">
                      {fmtH(Math.floor(e.start))}–{fmtH(Math.floor(e.end))}
                    </span>
                  </button>
                ))}
              {di === today && nowH >= startHour && nowH <= endHour && (
                <span
                  className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-destructive before:absolute before:-left-1 before:-top-[3px] before:size-2 before:rounded-full before:bg-destructive"
                  style={{ top: (nowH - startHour) * hourHeight }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
