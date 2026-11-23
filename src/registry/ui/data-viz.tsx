"use client";

import type * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface BarListProps {
  /** Rows. */
  data: { name: string; value: number }[];
  /** Formats each value. */
  format?: (value: number) => React.ReactNode;
  /** Sort rows by value, largest first. */
  sort?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/** Ranked horizontal bars with labels and values (top pages, referrers…). data: [{ name, value, href? }] */
export function BarList({ data, format = (v) => v.toLocaleString(), sort = true, className }: BarListProps) {
  const rows = sort ? [...data].sort((a, b) => b.value - a.value) : data;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className={cn("grid w-full gap-1.5", className)}>
      {rows.map((r) => (
        <li key={r.name} className="group flex items-center gap-4">
          <div className="relative h-8 min-w-0 flex-1">
            <div
              className="absolute inset-y-0 left-0 rounded-md bg-foreground/[0.09] transition-[width,background-color] duration-700 ease-out group-hover:bg-foreground/[0.14]"
              style={{ width: `${(r.value / max) * 100}%` }}
            />
            <span className="relative flex h-full items-center truncate px-2.5 text-sm">{r.name}</span>
          </div>
          <span className="w-14 shrink-0 text-right text-sm tabular-nums">{format(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export interface TrackerProps {
  /** One bar per period, oldest first. */
  data: { status: "ok" | "warn" | "down" | "none"; tooltip: string }[];
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Status history as a row of bars (uptime, deploys, check-ins). Hover for details.
 * data: [{ status: "ok" | "warn" | "down" | "none", tooltip }]
 */
export function Tracker({ data, className }: TrackerProps) {
  const [hover, setHover] = useState<number | null>(null);
  const tone = { ok: "bg-success", warn: "bg-warning", down: "bg-destructive", none: "bg-muted" };
  return (
    <div className={cn("relative w-full", className)}>
      <div className="flex h-9 gap-[2px]" onPointerLeave={() => setHover(null)}>
        {data.map((d, i) => (
          <span
            key={i}
            onPointerEnter={() => setHover(i)}
            className={cn(
              "flex-1 rounded-[3px] transition-opacity first:rounded-l-md last:rounded-r-md",
              tone[d.status],
              hover != null && hover !== i && "opacity-50"
            )}
            aria-label={d.tooltip}
          />
        ))}
      </div>
      {hover != null && (
        <div
          className="pointer-events-none absolute -top-9 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background"
          style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}
        >
          {data[hover].tooltip}
        </div>
      )}
    </div>
  );
}

export interface CategoryBarProps {
  /** Segments. */
  data: { label: string; value: number; color?: string }[];
  /** Formats legend values. */
  format?: (value: number) => React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** One bar split into proportional segments with a legend. data: [{ label, value, color? }] */
export function CategoryBar({ data, format = (v) => v, className }: CategoryBarProps) {
  const palette = ["var(--foreground)", "oklch(0.7 0.15 230)", "oklch(0.72 0.16 155)", "oklch(0.75 0.15 70)", "oklch(0.66 0.2 15)"];
  const total = data.reduce((a, d) => a + d.value, 0);
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className={cn("grid w-full gap-3", className)}>
      <div className="flex h-3 w-full gap-[3px] overflow-hidden rounded-full" onPointerLeave={() => setHover(null)}>
        {data.map((d, i) => (
          <span
            key={d.label}
            onPointerEnter={() => setHover(i)}
            className={cn(
              "h-full transition-opacity first:rounded-l-full last:rounded-r-full",
              hover != null && hover !== i && "opacity-35"
            )}
            style={{ width: `${(d.value / total) * 100}%`, background: d.color || palette[i % palette.length] }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {data.map((d, i) => (
          <li
            key={d.label}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            className={cn("flex items-center gap-1.5 transition-opacity", hover != null && hover !== i && "opacity-40")}
          >
            <span className="size-2.5 rounded-sm" style={{ background: d.color || palette[i % palette.length] }} />
            <span>{d.label}</span>
            <span className="tabular-nums text-muted-foreground">
              {format(d.value)} · {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface FunnelChartProps {
  /** Steps, from first to last. */
  data: { label: string; value: number }[];
  /** Formats each value. */
  format?: (value: number) => React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Conversion funnel: each stage narrows with its drop-off shown. data: [{ label, value }] */
export function FunnelChart({ data, format = (v) => v.toLocaleString(), className }: FunnelChartProps) {
  const max = data[0]?.value || 1;
  return (
    <ol className={cn("grid w-full gap-2", className)}>
      {data.map((d, i) => {
        const prev = data[i - 1]?.value;
        const drop = prev ? Math.round((1 - d.value / prev) * 100) : null;
        return (
          <li key={d.label} className="grid gap-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{d.label}</span>
              <span className="tabular-nums">
                {format(d.value)} <span className="text-xs text-muted-foreground">({Math.round((d.value / max) * 100)}%)</span>
              </span>
            </div>
            <div className="h-7 rounded-md bg-muted">
              <div
                className="mx-auto h-full rounded-md bg-foreground/80 transition-[width] duration-700"
                style={{ width: `${(d.value / max) * 100}%`, opacity: 1 - i * 0.13 }}
              />
            </div>
            {drop != null && <span className="text-right text-xs text-destructive">−{drop}% from previous step</span>}
          </li>
        );
      })}
    </ol>
  );
}
