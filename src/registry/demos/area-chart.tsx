"use client";

import { AreaChart } from "@/registry/ui/charts";

const data = [18, 22, 21, 26, 24, 31, 29, 35, 33, 38, 42, 40, 47, 45, 52, 50, 56, 61].map((v, i) => ({ label: `Wk ${i + 1}`, value: v * 100 }));

export default function AreaChartDemo() {
  return (
    <div className="w-full max-w-xl rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Weekly active users</p>
          <p className="text-[13px] text-muted-foreground">Last 18 weeks</p>
        </div>
        <p className="text-xl font-semibold tabular-nums">6,100</p>
      </div>
      <AreaChart data={data} format={(v) => v.toLocaleString()} />
    </div>
  );
}
