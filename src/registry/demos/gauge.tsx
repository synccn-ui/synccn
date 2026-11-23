"use client";

import { useState } from "react";
import { Gauge } from "@/registry/ui/charts";
import { Slider } from "@/registry/ui/slider";

export default function GaugeDemo() {
  const [v, setV] = useState([42]);
  return (
    <div className="grid w-full max-w-xs justify-items-center gap-6">
      <Gauge value={v[0]} label="CPU usage" format={(x) => `${Math.round(x)}%`} />
      <Slider value={v} onValueChange={setV} aria-label="CPU usage" />
      <p className="text-center text-xs text-muted-foreground">Turns amber at 60% and red at 85%.</p>
    </div>
  );
}
