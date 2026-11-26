"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface RadarSeries {
  name: string;
  /** One value per axis, in the same order. */
  values: number[];
  /** CSS colour. Picked from the chart palette when not given. */
  color?: string;
}

export interface RadarChartProps {
  /** Axis labels, going clockwise from the top. */
  axes: string[];
  series: RadarSeries[];
  /** Value at the outer ring. Defaults to the largest value. */
  max?: number;
  /**
   * Rings drawn behind the shapes.
   * @default 4
   */
  rings?: number;
  /**
   * Width and height in pixels.
   * @default 300
   */
  size?: number;
  /** Formats values in the tooltip. */
  format?: (value: number) => string;
  /** Extra classes for the root element. */
  className?: string;
}

const PALETTE = ["var(--primary)", "oklch(0.7 0.15 230)", "oklch(0.72 0.16 155)", "oklch(0.75 0.15 70)", "oklch(0.66 0.2 15)"];

/**
 * Spider chart for comparing a few things across several qualities (plans, candidates,
 * releases). Hover an axis for exact values; a hidden table carries the data for screen readers.
 */
export function RadarChart({ axes, series, max, rings = 4, size = 300, format = (v) => String(v), className }: RadarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const uid = useId();
  const top = max ?? Math.max(1, ...series.flatMap((s) => s.values));
  const pad = 46;
  const c = size / 2;
  const r = c - pad;
  const angle = (i: number) => (Math.PI * 2 * i) / axes.length - Math.PI / 2;
  const pt = (i: number, v: number) => [c + Math.cos(angle(i)) * r * (v / top), c + Math.sin(angle(i)) * r * (v / top)] as const;
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, Math.max(0, Math.min(top, v))).join(",")).join(" ");
  const visible = series.filter((s) => !hidden.has(s.name));

  return (
    <figure className={cn("grid w-fit max-w-full justify-items-center gap-3", className)}>
      <div className="relative max-w-full">
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="h-auto max-w-full overflow-visible" role="img" aria-labelledby={`${uid}-desc`}>
          {Array.from({ length: rings }, (_, k) => (
            <polygon key={k} points={poly(axes.map(() => (top * (k + 1)) / rings))} fill="none" className="stroke-border" strokeWidth={1} />
          ))}
          {axes.map((a, i) => {
            const [x, y] = pt(i, top);
            const [lx, ly] = pt(i, top * 1.17);
            return (
              <g key={a} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                <line x1={c} y1={c} x2={x} y2={y} className={cn("stroke-border", hover === i && "stroke-foreground/40")} />
                <line x1={c} y1={c} x2={x} y2={y} stroke="transparent" strokeWidth={18} />
                <text x={lx} y={ly} textAnchor={Math.abs(lx - c) < 4 ? "middle" : lx > c ? "start" : "end"} dominantBaseline="middle" className={cn("fill-muted-foreground text-[11px]", hover === i && "fill-foreground font-medium")}>
                  {a}
                </text>
              </g>
            );
          })}
          {visible.map((s) => {
            const color = s.color ?? PALETTE[series.indexOf(s) % PALETTE.length];
            return (
              <g key={s.name}>
                <polygon points={poly(s.values)} fill={color} fillOpacity={0.14} stroke={color} strokeWidth={1.75} strokeLinejoin="round" className="transition-[opacity] duration-300" />
                {s.values.map((v, i) => {
                  const [x, y] = pt(i, Math.max(0, Math.min(top, v)));
                  return <circle key={i} cx={x} cy={y} r={hover === i ? 4 : 2.5} fill={color} className="pointer-events-none transition-[r]" />;
                })}
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 grid min-w-32 -translate-x-1/2 -translate-y-1/2 animate-in gap-1 rounded-lg border bg-popover/95 px-3 py-2 text-xs text-popover-foreground shadow-lg backdrop-blur">
            <p className="font-medium">{axes[hover]}</p>
            {visible.map((s) => (
              <p key={s.name} className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: s.color ?? PALETTE[series.indexOf(s) % PALETTE.length] }} />
                <span className="flex-1 text-muted-foreground">{s.name}</span>
                <span className="tabular-nums">{format(s.values[hover] ?? 0)}</span>
              </p>
            ))}
          </div>
        )}
      </div>
      <figcaption className="flex flex-wrap justify-center gap-1.5">
        {series.map((s, i) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={!hidden.has(s.name)}
            onClick={() =>
              setHidden((h) => {
                const n = new Set(h);
                n.has(s.name) ? n.delete(s.name) : n.add(s.name);
                return n;
              })
            }
            className={cn("inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-opacity", hidden.has(s.name) && "opacity-40")}
          >
            <span className="size-2 rounded-full" style={{ background: s.color ?? PALETTE[i % PALETTE.length] }} aria-hidden />
            {s.name}
          </button>
        ))}
      </figcaption>
      <table id={`${uid}-desc`} className="sr-only">
        <caption>Radar chart</caption>
        <thead>
          <tr>
            <th scope="col">Axis</th>
            {series.map((s) => (
              <th key={s.name} scope="col">
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {axes.map((a, i) => (
            <tr key={a}>
              <th scope="row">{a}</th>
              {series.map((s) => (
                <td key={s.name}>{format(s.values[i] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
