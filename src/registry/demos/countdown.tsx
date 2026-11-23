"use client";

import { useState } from "react";
import { useNow } from "@/lib/hooks";
import { Countdown } from "@/registry/ui/countdown";

export default function CountdownDemo() {
  // Count down to a moment about two days after the page loads.
  const now = useNow();
  const [target, setTarget] = useState<number | null>(null);
  if (now && target === null) setTarget(now.getTime() + (2 * 86400 + 5 * 3600 + 32 * 60 + 9) * 1000);
  return (
    <div className="grid justify-items-center gap-4">
      <p className="text-sm text-muted-foreground">Launch in</p>
      <Countdown to={target ?? 0} />
    </div>
  );
}
