"use client";

import { useState } from "react";
import { Button } from "@/registry/ui/button";
import { NumberTicker } from "@/registry/ui/number-ticker";

export default function NumberTickerDemo() {
  const [v, setV] = useState(48290);
  return (
    <div className="grid justify-items-center gap-4">
      <p className="text-5xl font-semibold tracking-tight">
        <NumberTicker value={v} prefix="$" />
      </p>
      <p className="text-sm text-muted-foreground">Revenue this quarter</p>
      <Button size="sm" variant="outline" onClick={() => setV(Math.round(20000 + Math.random() * 80000))}>
        Randomise
      </Button>
    </div>
  );
}
