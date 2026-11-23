"use client";

import { useState } from "react";
import { Label } from "@/registry/ui/input";
import { TimePicker } from "@/registry/ui/time-picker";

export default function TimePickerDemo() {
  const [start, setStart] = useState("09:30");
  const [end, setEnd] = useState("17:00");
  return (
    <div className="grid gap-3">
      <div className="flex items-end gap-3">
        <div className="grid gap-2">
          <Label>Start</Label>
          <TimePicker value={start} onValueChange={setStart} />
        </div>
        <div className="grid gap-2">
          <Label>End</Label>
          <TimePicker value={end} onValueChange={setEnd} step={15} />
        </div>
      </div>
      <p className="text-[13px] tabular-nums text-muted-foreground">Stored as {start} – {end} (24-hour)</p>
    </div>
  );
}
