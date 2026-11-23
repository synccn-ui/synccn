"use client";

import { useState } from "react";
import { NumberInput } from "@/registry/ui/number-input";

export default function NumberInputDemo() {
  const [seats, setSeats] = useState(3);
  return (
    <div className="flex w-full max-w-sm items-center justify-between gap-4 rounded-xl border p-4">
      <div className="grid gap-0.5">
        <p className="text-sm font-medium">Team seats</p>
        <p className="text-[13px] tabular-nums text-muted-foreground">${seats * 12} per month</p>
      </div>
      <NumberInput value={seats} onValueChange={setSeats} min={1} max={50} aria-label="Seats" />
    </div>
  );
}
