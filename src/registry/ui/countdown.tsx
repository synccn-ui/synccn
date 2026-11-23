"use client";

import type * as React from "react";
import { useNow } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const split = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
};

function Digit({ value }: { value: number | string }) {
  return (
    <span className="relative inline-grid overflow-hidden">
      <span key={value} className="col-start-1 row-start-1 animate-[enter_.35s_cubic-bezier(.3,1.2,.5,1)]">
        {String(value).padStart(2, "0")}
      </span>
    </span>
  );
}

export interface CountdownProps {
  /** Target time. */
  to: string | number | Date;
  /** Shown when the time is reached. */
  done?: React.ReactNode;
  /** Show unit labels under the numbers. */
  labels?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/** Live countdown to a date. Shows `done` when it reaches zero. Safe to server-render: the digits fill in once the page loads. */
export function Countdown({ to, done = "It's here", labels = true, className }: CountdownProps) {
  const target = typeof to === "number" ? to : new Date(to).getTime();
  const now = useNow(1000);
  const left = now ? target - now.getTime() : null;
  if (left !== null && left <= 0) return <p className={cn("text-lg font-semibold", className)}>{done}</p>;
  const parts = split(left ?? 0);
  return (
    <div role="timer" aria-live="off" className={cn("flex items-start gap-2 sm:gap-3", className)}>
      {Object.entries(parts).map(([k, v], i) => (
        <div key={k} className="flex items-start gap-2 sm:gap-3">
          {i > 0 && <span className="pt-2 text-2xl font-light text-muted-foreground/50">:</span>}
          <div className="grid justify-items-center gap-1.5">
            <span className="grid min-w-16 place-items-center rounded-xl border bg-card px-2 py-2 text-3xl font-semibold tabular-nums tracking-tight sm:min-w-20 sm:text-4xl">
              {left === null ? <span className="text-muted-foreground/40">--</span> : <Digit value={v} />}
            </span>
            {labels && <span className="text-xs capitalize text-muted-foreground">{k}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
