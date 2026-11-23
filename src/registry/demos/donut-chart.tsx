"use client";

import { DonutChart } from "@/registry/ui/charts";

export default function DonutChartDemo() {
  return (
    <div className="w-full max-w-lg rounded-xl border bg-card p-5">
      <p className="mb-4 text-sm font-semibold">Visitors by device</p>
      <DonutChart
        centerLabel="Visitors"
        format={(v) => v.toLocaleString()}
        data={[
          { label: "Desktop", value: 18420 },
          { label: "Mobile", value: 12650 },
          { label: "Tablet", value: 3120 },
          { label: "Other", value: 860 },
        ]}
      />
    </div>
  );
}
