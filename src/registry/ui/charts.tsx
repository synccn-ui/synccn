"use client";

import type * as React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ChartDatum {
  label: string;
  value: number;
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const nice = (max: number) => {
  const p = Math.pow(10, Math.floor(Math.log10(max || 1)));
  return Math.ceil(max / p) * p;
};

export interface BarChartProps {
  /** Bars, in order. */
  data: ChartDatum[];
  /** Chart height in pixels. */
  height?: number;
  /** Formats axis ticks and tooltip values. */
  format?: (value: number) => React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Responsive bar chart. data: [{ label, value }] */
export function BarChart({ data, height = 220, format = (v) => v, className }: BarChartProps) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 36, r: 8, t: 12, b: 26 };
  const max = nice(Math.max(...data.map((d) => d.value)));
  const iw = Math.max(0, w - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const bw = iw / data.length;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const narrow = w < 420;

  return (
    <div ref={ref} className={cn("relative w-full", className)} style={{ height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label="Bar chart">
          {ticks.map((t) => {
            const y = pad.t + ih - (t / max) * ih;
            return (
              <g key={t}>
                <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} className="stroke-border" strokeDasharray={t === 0 ? "0" : "3 4"} />
                <text x={pad.l - 8} y={y} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px] tabular-nums">
                  {format(t)}
                </text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const h = (d.value / max) * ih;
            const x = pad.l + i * bw + bw * 0.18;
            return (
              <g key={d.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                <rect x={pad.l + i * bw} y={pad.t} width={bw} height={ih} fill="transparent" />
                <rect
                  x={x}
                  y={pad.t + ih - h}
                  width={bw * 0.64}
                  height={h}
                  rx={Math.min(6, bw * 0.15)}
                  className={cn("fill-primary transition-opacity", hover != null && hover !== i && "opacity-40")}
                  style={{ transformOrigin: `0 ${pad.t + ih}px`, animation: `bar-grow .7s ${i * 40}ms cubic-bezier(.3,1,.4,1) backwards` }}
                />
                {(!narrow || i % 2 === 0) && (
                  <text x={pad.l + i * bw + bw / 2} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {hover != null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: pad.l + hover * bw + bw / 2, top: pad.t + ih - (data[hover].value / max) * ih - 6 }}
        >
          <p className="text-muted-foreground">{data[hover].label}</p>
          <p className="font-semibold tabular-nums">{format(data[hover].value)}</p>
        </div>
      )}
      <style>{`@keyframes bar-grow{from{transform:scaleY(0)}}`}</style>
    </div>
  );
}

export interface AreaChartProps {
  /** Points, in order. */
  data: ChartDatum[];
  /** Chart height in pixels. */
  height?: number;
  /** Formats the tooltip value. */
  format?: (value: number) => React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Area chart with a crosshair tooltip. data: [{ label, value }] */
export function AreaChart({ data, height = 200, format = (v) => v, className }: AreaChartProps) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId().replace(/:/g, "");
  const pad = { l: 8, r: 8, t: 16, b: 24 };
  const max = Math.max(...data.map((d) => d.value)) * 1.12;
  const min = Math.min(...data.map((d) => d.value)) * 0.85;
  const iw = Math.max(0, w - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const pts = data.map((d, i) => [pad.l + (i / (data.length - 1)) * iw, pad.t + ih - ((d.value - min) / (max - min)) * ih]);
  const line = pts
    .map((p, i) => {
      if (i === 0) return `M${p[0]},${p[1]}`;
      const [px, py] = pts[i - 1];
      const cx = (px + p[0]) / 2;
      return `C${cx},${py} ${cx},${p[1]} ${p[0]},${p[1]}`;
    })
    .join("");
  const area = `${line} L${pad.l + iw},${pad.t + ih} L${pad.l},${pad.t + ih} Z`;

  return (
    <div
      ref={ref}
      className={cn("relative w-full", className)}
      style={{ height }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const i = Math.round(((e.clientX - r.left - pad.l) / iw) * (data.length - 1));
        setHover(Math.max(0, Math.min(data.length - 1, i)));
      }}
      onPointerLeave={() => setHover(null)}
    >
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label="Area chart">
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1={pad.l} x2={w - pad.r} y1={pad.t + ih} y2={pad.t + ih} className="stroke-border" />
          <path d={area} fill={`url(#${gid})`} />
          <path d={line} fill="none" strokeWidth="2" className="stroke-primary" strokeLinecap="round" />
          {data.map((d, i) =>
            (i % Math.ceil(data.length / (w < 420 ? 4 : 8)) === 0 &&
              data.length - 1 - i >= Math.ceil(data.length / (w < 420 ? 4 : 8)) / 2) ||
            i === data.length - 1 ? (
              <text
                key={i}
                x={pts[i][0]}
                y={height - 6}
                textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                className="fill-muted-foreground text-[11px]"
              >
                {d.label}
              </text>
            ) : null
          )}
          {hover != null && (
            <g>
              <line
                x1={pts[hover][0]}
                x2={pts[hover][0]}
                y1={pad.t}
                y2={pad.t + ih}
                className="stroke-foreground/25"
                strokeDasharray="3 3"
              />
              <circle cx={pts[hover][0]} cy={pts[hover][1]} r="4.5" className="fill-background stroke-primary" strokeWidth="2" />
            </g>
          )}
        </svg>
      )}
      {hover != null && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: Math.min(Math.max(pts[hover][0] - 50, 0), w - 100), width: 100 }}
        >
          <p className="text-muted-foreground">{data[hover].label}</p>
          <p className="font-semibold tabular-nums">{format(data[hover].value)}</p>
        </div>
      )}
    </div>
  );
}

export interface SparklineProps {
  /** Points to plot. */
  values: number[];
  /** Width in pixels. */
  width?: number;
  /** Height in pixels. */
  height?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** Tiny inline trend line. values: number[] */
export function Sparkline({ values, width = 96, height = 28, className }: SparklineProps) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - 2 - ((v - min) / (max - min || 1)) * (height - 4)}`);
  const up = (values.at(-1) ?? 0) >= (values[0] ?? 0);
  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <polyline
        points={pts.join(" ")}
        fill="none"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
        className={up ? "stroke-success" : "stroke-destructive"}
      />
    </svg>
  );
}

const SERIES = [
  "var(--primary)",
  "oklch(0.7 0.15 230)",
  "oklch(0.72 0.16 155)",
  "oklch(0.75 0.15 70)",
  "oklch(0.66 0.2 15)",
  "oklch(0.62 0.2 290)",
];

export interface LineChartProps {
  /** X-axis labels. */
  labels: string[];
  /** One entry per line. */
  series: { name: string; values: number[] }[];
  /** Chart height in pixels. */
  height?: number;
  /** Formats ticks and tooltip values. */
  format?: (value: number) => React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Multi-series line chart with a legend and a shared crosshair. series: [{ name, values: number[] }] */
export function LineChart({ labels, series, height = 220, format = (v) => v, className }: LineChartProps) {
  const [ref, w] = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const [hidden, setHidden] = useState(() => new Set<string>());
  const pad = { l: 36, r: 10, t: 12, b: 24 };
  const shown = series.filter((s) => !hidden.has(s.name));
  const all = shown.flatMap((s) => s.values);
  const max = nice(Math.max(1, ...all));
  const iw = Math.max(0, w - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (i / (labels.length - 1)) * iw;
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const step = Math.ceil(labels.length / (w < 420 ? 4 : 7));

  return (
    <div className={cn("grid w-full gap-3", className)}>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
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
            className={cn("inline-flex items-center gap-1.5 text-xs transition-opacity", hidden.has(s.name) && "opacity-40")}
          >
            <span className="size-2.5 rounded-sm" style={{ background: SERIES[i % SERIES.length] }} />
            {s.name}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="relative w-full"
        style={{ height }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.max(0, Math.min(labels.length - 1, Math.round(((e.clientX - r.left - pad.l) / iw) * (labels.length - 1)))));
        }}
        onPointerLeave={() => setHover(null)}
      >
        {w > 0 && (
          <svg width={w} height={height} role="img" aria-label="Line chart">
            {[0, 0.5, 1].map((t) => (
              <g key={t}>
                <line
                  x1={pad.l}
                  x2={w - pad.r}
                  y1={y(t * max)}
                  y2={y(t * max)}
                  className="stroke-border"
                  strokeDasharray={t ? "3 4" : "0"}
                />
                <text x={pad.l - 8} y={y(t * max)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px]">
                  {format(t * max)}
                </text>
              </g>
            ))}
            {labels.map(
              (l, i) =>
                (i % step === 0 || i === labels.length - 1) && (
                  <text
                    key={i}
                    x={x(i)}
                    y={height - 6}
                    textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}
                    className="fill-muted-foreground text-[11px]"
                  >
                    {l}
                  </text>
                )
            )}
            {series.map(
              (s, si) =>
                !hidden.has(s.name) && (
                  <path
                    key={s.name}
                    d={s.values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join("")}
                    fill="none"
                    stroke={SERIES[si % SERIES.length]}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )
            )}
            {hover != null && (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} className="stroke-foreground/25" strokeDasharray="3 3" />
                {series.map(
                  (s, si) =>
                    !hidden.has(s.name) && (
                      <circle
                        key={s.name}
                        cx={x(hover)}
                        cy={y(s.values[hover])}
                        r="4"
                        fill="var(--background)"
                        stroke={SERIES[si % SERIES.length]}
                        strokeWidth="2"
                      />
                    )
                )}
              </g>
            )}
          </svg>
        )}
        {hover != null && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-36 rounded-lg border bg-popover p-2 text-xs shadow-md"
            style={{ left: x(hover) > w / 2 ? x(hover) - 152 : x(hover) + 12 }}
          >
            <p className="mb-1 font-medium">{labels[hover]}</p>
            {series.map(
              (s, si) =>
                !hidden.has(s.name) && (
                  <p key={s.name} className="flex items-center gap-1.5">
                    <span className="size-2 rounded-sm" style={{ background: SERIES[si % SERIES.length] }} />
                    <span className="flex-1 text-muted-foreground">{s.name}</span>
                    <span className="tabular-nums">{format(s.values[hover])}</span>
                  </p>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export interface DonutChartProps {
  /** Segments. */
  data: ChartDatum[];
  /** Diameter in pixels. */
  size?: number;
  /** Ring thickness in pixels. */
  thickness?: number;
  /** Formats the centre value. */
  format?: (value: number) => React.ReactNode;
  /** Caption under the total. */
  centerLabel?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/** Donut chart with an interactive legend and the total in the middle. data: [{ label, value }] */
export function DonutChart({ data, size = 200, thickness = 26, format = (v) => v, centerLabel = "Total", className }: DonutChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-6", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label="Donut chart">
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const seg = (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={SERIES[i % SERIES.length]}
                strokeWidth={hover === i ? thickness + 6 : thickness}
                strokeDasharray={`${Math.max(0, len - 2)} ${c}`}
                strokeDashoffset={-acc}
                className="cursor-pointer transition-[stroke-width,opacity] duration-200"
                opacity={hover == null || hover === i ? 1 : 0.35}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              />
            );
            acc += len;
            return seg;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <span className="text-2xl font-semibold tabular-nums tracking-tight">{format(hover == null ? total : data[hover].value)}</span>
          <span className="text-xs text-muted-foreground">{hover == null ? centerLabel : data[hover].label}</span>
        </div>
      </div>
      <ul className="grid gap-2 text-sm">
        {data.map((d, i) => (
          <li
            key={d.label}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            className={cn("flex items-center gap-2.5 transition-opacity", hover != null && hover !== i && "opacity-40")}
          >
            <span className="size-2.5 rounded-sm" style={{ background: SERIES[i % SERIES.length] }} />
            <span className="w-24">{d.label}</span>
            <span className="tabular-nums text-muted-foreground">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface GaugeProps {
  /** Current value. */
  value: number;
  /** Value that fills the gauge. */
  max?: number;
  /** Caption under the value. */
  label?: string;
  /** Width in pixels. */
  size?: number;
  /** Percentages where the colour turns amber, then red. */
  thresholds?: [number, number];
  /** Formats the centre value. */
  format?: (value: number) => React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Half-circle gauge with optional threshold colours. */
export function Gauge({
  value,
  max = 100,
  label,
  size = 220,
  thresholds = [60, 85],
  format = (v) => Math.round(v),
  className,
}: GaugeProps) {
  const pct = Math.min(1, Math.max(0, value / max));
  const r = size / 2 - 14;
  const len = Math.PI * r;
  const tone = pct * 100 >= thresholds[1] ? "var(--destructive)" : pct * 100 >= thresholds[0] ? "var(--warning)" : "var(--success)";
  const angle = Math.PI * (1 - pct);
  return (
    <div
      className={cn("relative grid justify-items-center", className)}
      style={{ width: size }}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`}>
        <path
          d={`M14 ${size / 2} A${r} ${r} 0 0 1 ${size - 14} ${size / 2}`}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          className="stroke-muted"
        />
        <path
          d={`M14 ${size / 2} A${r} ${r} 0 0 1 ${size - 14} ${size / 2}`}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          stroke={tone}
          strokeDasharray={len}
          strokeDashoffset={len * (1 - pct)}
          className="transition-[stroke-dashoffset,stroke] duration-700 ease-out"
        />
        <circle
          cx={size / 2 + r * Math.cos(angle)}
          cy={size / 2 - r * Math.sin(angle)}
          r="5"
          fill="var(--background)"
          stroke={tone}
          strokeWidth="3"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute bottom-0 grid justify-items-center">
        <span className="text-3xl font-semibold tabular-nums tracking-tight">{format(value)}</span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
