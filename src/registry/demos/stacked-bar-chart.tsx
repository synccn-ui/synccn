"use client";

import { useState } from "react";
import { StackedBarChart } from "@/registry/ui/stacked-bar-chart";
import { ToggleGroup } from "@/registry/ui/toggle-group";

const data = [
  { label: "Jun", free: 820, pro: 310, team: 90 },
  { label: "Jul", free: 900, pro: 360, team: 110 },
  { label: "Aug", free: 860, pro: 420, team: 150 },
  { label: "Sep", free: 980, pro: 470, team: 170 },
  { label: "Oct", free: 1040, pro: 560, team: 220 },
  { label: "Nov", free: 1120, pro: 640, team: 260 },
];

export default function StackedBarChartDemo() {
  const [mode, setMode] = useState("total");
  return (
    <div className="grid w-full max-w-xl gap-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">Accounts by plan</p>
        <ToggleGroup size="sm" value={mode} onValueChange={setMode} options={[{ value: "total", label: "Total" }, { value: "percent", label: "Share" }]} />
      </div>
      <StackedBarChart
        data={data}
        percent={mode === "percent"}
        series={[
          { key: "free", name: "Free" },
          { key: "pro", name: "Pro" },
          { key: "team", name: "Team" },
        ]}
      />
    </div>
  );
}
