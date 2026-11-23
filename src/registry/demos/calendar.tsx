"use client";

import { useState } from "react";
import { Calendar, type DateRange } from "@/registry/ui/calendar";
import { ToggleGroup } from "@/registry/ui/toggle-group";

export default function CalendarDemo() {
  const [mode, setMode] = useState("range");
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [day, setDay] = useState<Date | null>(null);
  const fmt = (d: Date | null | undefined) => d?.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return (
    <div className="grid justify-items-center gap-3">
      <ToggleGroup size="sm" value={mode} onValueChange={setMode} options={[{ value: "single", label: "Single" }, { value: "range", label: "Range" }]} />
      {mode === "single" ? (
        <Calendar mode="single" value={day} onChange={setDay} disabled={(d) => d.getDay() === 0} />
      ) : (
        <Calendar mode="range" value={range} onChange={setRange} />
      )}
      <p className="text-[13px] tabular-nums text-muted-foreground">
        {mode === "single" ? day ? `Selected ${fmt(day)} (Sundays are disabled)` : "Pick a date (Sundays are disabled)" : range.from ? `${fmt(range.from)} → ${range.to ? fmt(range.to) : "pick an end date"}` : "Pick a start date"}
      </p>
    </div>
  );
}
