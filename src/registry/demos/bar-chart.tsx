"use client";

import { BarChart } from "@/registry/ui/charts";

const data = [
  { label: "Jan", value: 42 },
  { label: "Feb", value: 58 },
  { label: "Mar", value: 51 },
  { label: "Apr", value: 77 },
  { label: "May", value: 69 },
  { label: "Jun", value: 94 },
  { label: "Jul", value: 88 },
  { label: "Aug", value: 103 },
];

export default function BarChartDemo() {
  return (
    <div className="w-full max-w-xl rounded-xl border bg-card p-4">
      <p className="text-sm font-semibold">New signups</p>
      <p className="mb-3 text-[13px] text-muted-foreground">Up 145% from January to August</p>
      <BarChart data={data} format={(v) => `${v}k`} />
    </div>
  );
}
