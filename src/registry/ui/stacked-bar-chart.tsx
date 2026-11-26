"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface StackedBarSeries {
  key: string;
  name: string;
  /** CSS colour. Picked from the chart palette when not given. */
  color?: string;
}

export interface StackedBarChartProps {
  /** One entry per bar: a label plus a value for each series key. */
  data: ({ label: string } & Record<string, number | string>)[];
  series: StackedBarSeries[];
  /**
   * Height in pixels.
   * @default 240
   */
  height?: number;
  /** Formats values on the axis and in the tooltip. */
  format?: (value: number) => string;
  /**
   * Shows each bar as shares of 100%.
   * @default false
   */
  percent?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

const PALETTE = ["var(--primary)", "oklch(0.7 0.15 230)", "oklch(0.72 0.16 155)", "oklch(0.75 0.15 70)", "oklch(0.66 0.2 15)"];
const nice = (n: number) => {
  const p = 10 ** Math.floor(Math.log10(Math.max(1, n)));
  return Math.ceil(n / p) * p;
};

/**
 * Stacked bars for breakdowns over time (plan mix, traffic by source), as totals or as
 * shares of 100%. Hover a bar for its numbers; click legend items to hide a series.
 */
export function StackedBarChart({ data, series, height = 240, format = (v) => v.toLocaleString("en-US"), percent = false, className }: StackedBarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const uid = useId();
  const active = series.filter((s) => !hidden.has(s.key));
  const val = (d: StackedBarChartProps["data"][number], k: string) => Number(d[k]) || 0;
  const totals = data.map((d) => active.reduce((a, s) => a + val(d, s.key), 0));
  const top = percent ? 100 : nice(Math.max(1, ...totals));
  const color = (s: StackedBarSeries) => s.color ?? PALETTE[series.indexOf(s) % PALETTE.length];
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <figure className={cn("grid w-full gap-3", className)}>
      <div className="relative flex gap-2" style={{ height }}>
        <div className="flex shrink-0 flex-col-reverse justify-between pb-6 text-right text-[11px] tabular-nums text-muted-foreground" aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 leading-none first:translate-y-0">
              {percent ? `${t * 100}%` : format(top * t)}
            </span>
          ))}
        </div>
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="relative flex-1">
            {ticks.map((t) => (
              <span key={t} aria-hidden className="absolute inset-x-0 border-t border-dashed border-border" style={{ bottom: `${t * 100}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end gap-[6%] px-[3%]" role="img" aria-labelledby={`${uid}-t`}>
              {data.map((d, i) => {
                const total = totals[i];
                return (
                  <div key={d.label} className="relative flex h-full min-w-0 flex-1 flex-col-reverse" onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                    <div className={cn("flex w-full flex-col-reverse overflow-hidden rounded-t-md transition-opacity", hover !== null && hover !== i && "opacity-50")} style={{ height: `${((percent ? (total ? 100 : 0) : total) / top) * 100}%` }}>
                      {active.map((s) => (
                        <span key={s.key} className="w-full transition-[height] duration-500 ease-out first:rounded-b-none" style={{ height: `${total ? (val(d, s.key) / total) * 100 : 0}%`, background: color(s) }} />
                      ))}
                    </div>
                    {hover === i && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 grid min-w-36 -translate-x-1/2 animate-in gap-1 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                        <p className="font-medium">{d.label}</p>
                        {active.map((s) => (
                          <p key={s.key} className="flex items-center gap-2">
                            <span className="size-2 rounded-full" style={{ background: color(s) }} />
                            <span className="flex-1 text-muted-foreground">{s.name}</span>
                            <span className="tabular-nums">{percent ? `${total ? Math.round((val(d, s.key) / total) * 100) : 0}%` : format(val(d, s.key))}</span>
                          </p>
                        ))}
                        {!percent && <p className="flex justify-between border-t pt-1 font-medium"><span>Total</span><span className="tabular-nums">{format(total)}</span></p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex h-6 items-end gap-[6%] px-[3%]" aria-hidden>
            {data.map((d) => (
              <span key={d.label} className="min-w-0 flex-1 truncate text-center text-[11px] text-muted-foreground">
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="flex flex-wrap justify-center gap-1.5">
        {series.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={!hidden.has(s.key)}
            onClick={() =>
              setHidden((h) => {
                const n = new Set(h);
                n.has(s.key) ? n.delete(s.key) : n.add(s.key);
                return n;
              })
            }
            className={cn("inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-opacity", hidden.has(s.key) && "opacity-40")}
          >
            <span className="size-2 rounded-full" style={{ background: color(s) }} aria-hidden />
            {s.name}
          </button>
        ))}
      </figcaption>
      <table id={`${uid}-t`} className="sr-only">
        <caption>Stacked bar chart</caption>
        <thead>
          <tr>
            <th scope="col">Bar</th>
            {series.map((s) => (
              <th key={s.key} scope="col">{s.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              {series.map((s) => (
                <td key={s.key}>{format(val(d, s.key))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
