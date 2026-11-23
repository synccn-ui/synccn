"use client";

import { LineChart } from "@/registry/ui/charts";

const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function LineChartDemo() {
  return (
    <div className="w-full max-w-xl rounded-xl border bg-card p-4">
      <p className="text-sm font-semibold">Traffic by source</p>
      <p className="mb-3 text-[13px] text-muted-foreground">Visits in thousands. Click a legend item to hide it.</p>
      <LineChart
        labels={labels}
        format={(v) => `${Math.round(v)}k`}
        series={[
          { name: "Search", values: [32, 35, 38, 41, 40, 46, 52, 55, 53, 58, 63, 70] },
          { name: "Direct", values: [20, 22, 21, 25, 27, 26, 30, 33, 35, 34, 38, 41] },
          { name: "Social", values: [8, 12, 10, 15, 21, 18, 24, 22, 28, 31, 27, 34] },
        ]}
      />
    </div>
  );
}
