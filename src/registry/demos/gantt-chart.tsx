"use client";

import { useMemo, useState } from "react";
import { useNow } from "@/lib/hooks";
import { GanttChart, type GanttTask } from "@/registry/ui/gantt-chart";

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function GanttChartDemo() {
  // Planned around today, which the browser fills in after loading.
  const now = useNow();
  const [picked, setPicked] = useState<string | null>(null);
  const tasks = useMemo<GanttTask[]>(() => {
    const base = now ?? new Date(Date.UTC(2026, 10, 26));
    const at = (n: number) => key(new Date(base.getFullYear(), base.getMonth(), base.getDate() + n));
    return [
      { id: "1", name: "Research", group: "synccn", start: at(-12), end: at(-6), progress: 1, color: "violet" },
      { id: "2", name: "Design", group: "synccn", start: at(-7), end: at(2), progress: 0.8, color: "blue" },
      { id: "3", name: "API", group: "synccn", start: at(-4), end: at(8), progress: 0.45, color: "green" },
      { id: "4", name: "Frontend", group: "synccn", start: at(1), end: at(13), progress: 0.1, color: "amber" },
      { id: "5", name: "Beta", start: at(14), end: at(14), milestone: true, color: "red" },
      { id: "6", name: "Launch", start: at(20), end: at(20), milestone: true, color: "green" },
    ];
  }, [now]);
  return (
    <div className="grid w-full max-w-3xl gap-2">
      <GanttChart tasks={tasks} onTaskClick={(t) => setPicked(t.name)} />
      <p className="text-center text-[13px] text-muted-foreground" aria-live="polite">
        {picked ? `Opened ${picked}` : "Click a bar or milestone"}
      </p>
    </div>
  );
}
