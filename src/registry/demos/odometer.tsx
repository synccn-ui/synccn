"use client";

import { useEffect, useState } from "react";
import { Odometer } from "@/registry/ui/aurora";

export default function OdometerDemo() {
  const [v, setV] = useState(48290);
  useEffect(() => {
    const t = setInterval(() => setV((x) => x + Math.round(Math.random() * 900 - 200)), 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="grid justify-items-center gap-2">
      <p className="text-sm text-muted-foreground">Live signups</p>
      <Odometer value={v} className="text-6xl font-semibold tracking-tighter" />
    </div>
  );
}
