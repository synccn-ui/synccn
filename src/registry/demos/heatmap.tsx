"use client";

import { useMemo } from "react";
import { useNow } from "@/lib/hooks";
import { Heatmap } from "@/registry/ui/heatmap";

export default function HeatmapDemo() {
  const now = useNow();
  const todayKey = now ? now.toDateString() : null;
  const values = useMemo(() => {
    const out: Record<string, number> = {};
    if (!todayKey) return out;
    const pad = (n: number) => String(n).padStart(2, "0");
    const d = new Date(todayKey);
    for (let i = 0; i < 26 * 7; i++) {
      const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i);
      const seed = Math.sin(i * 12.9898) * 43758.5453;
      const r = seed - Math.floor(seed);
      const weekend = day.getDay() === 0 || day.getDay() === 6;
      out[`${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`] = r < (weekend ? 0.7 : 0.25) ? 0 : Math.floor(r * 12);
    }
    return out;
  }, [todayKey]);
  return (
    <div className="w-full max-w-xl rounded-xl border bg-card p-4">
      <Heatmap values={values} weeks={26} label="commits" />
    </div>
  );
}
