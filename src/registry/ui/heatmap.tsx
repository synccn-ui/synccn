"use client";

import { useMemo, useState } from "react";
import { useNow } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface HeatmapProps {
  /** Counts keyed by YYYY-MM-DD. */
  values?: Record<string, number>;
  /** Weeks to show, ending today. */
  weeks?: number;
  /** Unit used in tooltips, e.g. commits. */
  label?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/** Contribution-style calendar heatmap for the last `weeks` weeks. values: { "YYYY-MM-DD": number } */
export function Heatmap({ values = {}, weeks = 26, className, label = "contributions" }: HeatmapProps) {
  const [hover, setHover] = useState<{ key: string; date: Date; v: number } | null>(null);
  // The grid ends today, which only the browser knows, so it renders once the page loads.
  const now = useNow();
  const todayKey = now ? now.toDateString() : null;
  const days = useMemo(() => {
    if (!todayKey) return [];
    const end = new Date(todayKey);
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(end.getDate() - (weeks * 7 - 1));
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const pad = (n: number) => String(n).padStart(2, "0");
    const out = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      out.push({ key, date: new Date(d), v: values[key] || 0 });
    }
    return out;
  }, [values, weeks, todayKey]);
  const max = Math.max(1, ...days.map((d) => d.v));
  const level = (v: number) => (v === 0 ? 0 : Math.ceil((v / max) * 4));
  const tones = ["bg-muted", "bg-primary/25", "bg-primary/50", "bg-primary/75", "bg-primary"];
  const total = days.reduce((a, d) => a + d.v, 0);

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="overflow-x-auto scrollbar-none">
        <div className="grid w-max grid-flow-col grid-rows-7 gap-[3px]">
          {!todayKey && Array.from({ length: weeks * 7 }, (_, i) => <span key={i} aria-hidden className="size-3 rounded-[3px] bg-muted" />)}
          {days.map((d) => (
            <span
              key={d.key}
              onPointerEnter={() => setHover(d)}
              onPointerLeave={() => setHover(null)}
              className={cn("size-3 rounded-[3px] transition-transform hover:scale-125", tones[level(d.v)])}
              aria-label={`${d.v} ${label} on ${d.date.toDateString()}`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {hover
            ? `${hover.v} ${label} on ${hover.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
            : `${total.toLocaleString()} ${label} in the last ${weeks} weeks`}
        </span>
        <span className="flex items-center gap-1">
          Less
          {tones.map((t) => (
            <span key={t} className={cn("size-2.5 rounded-[2px]", t)} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
