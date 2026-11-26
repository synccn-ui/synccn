"use client";

import { useEffect, useMemo, useRef } from "react";
import { useNow } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface GanttTask {
  id: string;
  name: string;
  /** First day, "YYYY-MM-DD". */
  start: string;
  /** Last day, "YYYY-MM-DD" (inclusive). The same as start for a one-day task or a milestone. */
  end: string;
  /** Share done, 0 to 1. */
  progress?: number;
  /** Drawn as a diamond on its start day. */
  milestone?: boolean;
  /** Row label shown under the name, e.g. an owner. */
  group?: string;
  color?: "default" | "blue" | "green" | "amber" | "red" | "violet";
}

export interface GanttChartProps {
  tasks: GanttTask[];
  /**
   * Width of one day in pixels.
   * @default 28
   */
  dayWidth?: number;
  /** Called when a bar is clicked. */
  onTaskClick?: (task: GanttTask) => void;
  /**
   * Draws a line on today.
   * @default true
   */
  showToday?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

const COLORS = {
  default: "bg-foreground/70",
  blue: "bg-sky-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-rose-500",
  violet: "bg-violet-500",
};
const day = (s: string) => Math.round(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 86_400_000);
const fromDay = (n: number) => new Date(n * 86_400_000);

/**
 * Timeline of tasks over days: bars with progress, milestones, weekends shaded, a today
 * line and month headers. Scrolls sideways while names stay pinned. No date library needed.
 */
export function GanttChart({ tasks, dayWidth = 28, onTaskClick, showToday = true, className }: GanttChartProps) {
  const now = useNow();
  const range = useMemo(() => {
    if (!tasks.length) return { from: 0, days: 0 };
    const from = Math.min(...tasks.map((t) => day(t.start))) - 2;
    const to = Math.max(...tasks.map((t) => day(t.end))) + 3;
    return { from, days: to - from + 1 };
  }, [tasks]);
  const days = Array.from({ length: range.days }, (_, i) => fromDay(range.from + i));
  const today = now ? day(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`) : null;
  const months: { label: string; span: number }[] = [];
  days.forEach((d) => {
    const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
    const last = months[months.length - 1];
    if (last?.label === label) last.span++;
    else months.push({ label, span: 1 });
  });
  const width = range.days * dayWidth;
  const ROW = 40;
  const scroller = useRef<HTMLDivElement>(null);
  // Bring today into view once it's known, a little in from the left edge.
  useEffect(() => {
    const el = scroller.current;
    if (!el || today === null || !showToday) return;
    el.scrollLeft = Math.max(0, (today - range.from) * dayWidth - el.clientWidth / 3);
  }, [today, range.from, dayWidth, showToday]);

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border bg-card text-left text-sm", className)}>
      <div className="flex">
        <div className="w-36 shrink-0 border-r sm:w-48">
          <div className="flex h-14 items-end border-b px-3 pb-2 text-xs font-medium text-muted-foreground">Task</div>
          {tasks.map((t) => (
            <div key={t.id} className="grid h-10 content-center border-b px-3 last:border-b-0">
              <span className="truncate font-medium">{t.name}</span>
              {t.group && <span className="truncate text-xs text-muted-foreground">{t.group}</span>}
            </div>
          ))}
        </div>
        <div ref={scroller} className="min-w-0 flex-1 overflow-x-auto" tabIndex={0} aria-label="Timeline, scroll sideways">
          <div className="relative" style={{ width }}>
            <div className="flex h-7 border-b">
              {months.map((m, i) => (
                <div key={i} className="truncate border-r px-2 pt-1.5 text-xs font-medium last:border-r-0" style={{ width: m.span * dayWidth }}>
                  {m.label}
                </div>
              ))}
            </div>
            <div className="flex h-7 border-b">
              {days.map((d, i) => (
                <div key={i} className={cn("grid shrink-0 place-items-center text-[10px] tabular-nums text-muted-foreground", range.from + i === today && "font-semibold text-primary")} style={{ width: dayWidth }}>
                  {d.getUTCDate()}
                </div>
              ))}
            </div>
            <div className="relative" style={{ height: tasks.length * ROW }}>
              {days.map((d, i) =>
                d.getUTCDay() === 0 || d.getUTCDay() === 6 ? <div key={i} aria-hidden className="absolute inset-y-0 bg-muted/50" style={{ left: i * dayWidth, width: dayWidth }} /> : null
              )}
              {tasks.map((_, i) => (
                <div key={i} aria-hidden className="absolute inset-x-0 border-b" style={{ top: (i + 1) * ROW - 1 }} />
              ))}
              {showToday && today !== null && today >= range.from && today < range.from + range.days && (
                <div aria-hidden className="absolute inset-y-0 z-[1] w-px bg-primary" style={{ left: (today - range.from + 0.5) * dayWidth }}>
                  <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-primary" />
                </div>
              )}
              {tasks.map((t, i) => {
                const s = day(t.start) - range.from;
                const len = day(t.end) - day(t.start) + 1;
                const p = Math.max(0, Math.min(1, t.progress ?? 0));
                const label = `${t.name}: ${t.start} to ${t.end}${t.progress != null ? `, ${Math.round(p * 100)}% done` : ""}`;
                if (t.milestone)
                  return (
                    <button key={t.id} type="button" aria-label={`${t.name}: milestone on ${t.start}`} title={`${t.name} · ${t.start}`} onClick={() => onTaskClick?.(t)} className={cn("absolute z-[2] size-3.5 rotate-45 rounded-[3px] ring-2 ring-card transition-transform hover:scale-125", COLORS[t.color ?? "default"])} style={{ left: (s + 0.5) * dayWidth - 7, top: i * ROW + ROW / 2 - 7 }} />
                  );
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-label={label}
                    title={label}
                    onClick={() => onTaskClick?.(t)}
                    className="group absolute z-[2] h-6 overflow-hidden rounded-md bg-muted text-left shadow-xs ring-1 ring-black/5 transition-transform hover:-translate-y-px dark:ring-white/10"
                    style={{ left: s * dayWidth + 2, width: len * dayWidth - 4, top: i * ROW + 8 }}
                  >
                    <span className={cn("absolute inset-y-0 left-0 opacity-90", COLORS[t.color ?? "default"])} style={{ width: `${p * 100}%` }} />
                    <span className={cn("absolute inset-0 opacity-25", COLORS[t.color ?? "default"])} />
                    {len * dayWidth > 56 && t.progress != null && <span className="relative px-2 text-[11px] font-medium leading-6 tabular-nums text-foreground mix-blend-luminosity dark:text-white">{Math.round(p * 100)}%</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
