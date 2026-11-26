"use client";

import { useMemo } from "react";
import { useNow } from "@/lib/hooks";
import { RelativeTime } from "@/registry/ui/relative-time";

export default function RelativeTimeDemo() {
  const now = useNow();
  const rows = useMemo(() => {
    const t = now ? now.getTime() : Date.UTC(2026, 10, 26, 12);
    return [
      { label: "Just deployed", at: t - 20_000 },
      { label: "Last commit", at: t - 7 * 60_000 },
      { label: "Build started", at: t - 3 * 3_600_000 },
      { label: "Previous release", at: t - 2 * 86_400_000 },
      { label: "Trial ends", at: t + 5 * 86_400_000 },
      { label: "Project created", at: t - 40 * 86_400_000 },
    ];
  }, [now]);
  return (
    <ul className="grid w-full max-w-sm divide-y rounded-xl border bg-card text-sm">
      {rows.map((r, i) => (
        <li key={r.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
          <span className="text-muted-foreground">{r.label}</span>
          <RelativeTime date={r.at} format={i === 2 ? "short" : "long"} absoluteAfterDays={i === 5 ? 30 : undefined} className="font-medium" />
        </li>
      ))}
    </ul>
  );
}
