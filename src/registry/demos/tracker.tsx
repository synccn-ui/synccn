"use client";

import { useMemo } from "react";
import { useNow } from "@/lib/hooks";
import { StatusIndicator } from "@/registry/ui/status-indicator";
import { Tracker } from "@/registry/ui/data-viz";

export default function TrackerDemo() {
  const now = useNow();
  const todayKey = now ? now.toDateString() : null;
  const data = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        const d = new Date(todayKey ?? 0);
        d.setDate(d.getDate() - (59 - i));
        const status: "ok" | "warn" | "down" = i === 41 ? "down" : [12, 13, 50].includes(i) ? "warn" : "ok";
        const label = { ok: "No issues", warn: "Degraded performance", down: "Outage (24 min)" }[status];
        const when = todayKey ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : `${59 - i} days ago`;
        return { status, tooltip: `${when}: ${label}` };
      }),
    [todayKey]
  );
  return (
    <div className="grid w-full max-w-lg gap-3 rounded-xl border bg-card p-5 pt-12">
      <div className="flex items-center justify-between">
        <span className="font-semibold">API</span>
        <StatusIndicator status="online" className="text-sm text-muted-foreground" label="99.96% uptime" />
      </div>
      <Tracker data={data} />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>60 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
