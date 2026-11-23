"use client";

import { useEffect, useState } from "react";
import { Label } from "@/registry/ui/input";
import { DatePicker } from "@/registry/ui/date-picker";
import type { DateRange } from "@/registry/ui/calendar";

const addDays = (n: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
};

export default function DatePickerDemo() {
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  // Preselect the coming week once the page has loaded (today isn't known on the server).
  useEffect(() => setRange({ from: addDays(0), to: addDays(6) }), []);
  return (
    <div className="grid w-full max-w-xs gap-5">
      <div className="grid gap-2">
        <Label>Due date</Label>
        <DatePicker placeholder="Pick a due date" presets={[{ label: "Today", value: () => addDays(0) }, { label: "Tomorrow", value: () => addDays(1) }, { label: "In a week", value: () => addDays(7) }]} />
      </div>
      <div className="grid gap-2">
        <Label>Trip dates</Label>
        <DatePicker mode="range" value={range} onChange={setRange} />
      </div>
    </div>
  );
}
