"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

type HSV = { h: number; s: number; v: number };

const hsvToHex = (h: number, s: number, v: number) => {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(5)}${f(3)}${f(1)}`;
};

const hexToHsv = (hex: string): HSV | null => {
  const m = hex.replace("#", "").match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return null;
  const [r, g, b] = m.slice(1).map((x: string) => parseInt(x, 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
};

function useDrag(onPos: (x: number, y: number) => void) {
  return (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const at = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      onPos(Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height)));
    };
    at(e.nativeEvent);
    const up = () => {
      window.removeEventListener("pointermove", at);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", at);
    window.addEventListener("pointerup", up);
  };
}

const SWATCHES = ["#0f172a", "#2563eb", "#0891b2", "#16a34a", "#ca8a04", "#ea580c", "#dc2626", "#db2777", "#7c3aed"];

export interface ColorPickerProps {
  /** Controlled hex colour. */
  value?: string;
  /** Initial hex colour when uncontrolled. */
  defaultValue?: string;
  /** Called with the new hex colour. */
  onValueChange?: (hex: string) => void;
  /** Preset colours shown under the picker. */
  swatches?: string[];
  /** Extra classes for the root element. */
  className?: string;
}

export function ColorPicker({ value, defaultValue = "#2f7ed8", onValueChange, swatches = SWATCHES, className }: ColorPickerProps) {
  const [hex, setHex] = useControllable({ value, defaultValue, onChange: onValueChange });
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(hex) || { h: 210, s: 0.7, v: 0.8 });
  const [text, setText] = useState(hex);
  const last = useRef(hex);

  if (hex !== last.current) {
    last.current = hex;
    const next = hexToHsv(hex);
    if (next) {
      setHsv(next);
      setText(hex);
    }
  }

  const commit = (n: HSV) => {
    setHsv(n);
    const h = hsvToHex(n.h, n.s, n.v);
    last.current = h;
    setText(h);
    setHex(h);
  };

  const area = useDrag((x: number, y: number) => commit({ ...hsv, s: x, v: 1 - y }));
  const hue = useDrag((x: number) => commit({ ...hsv, h: x * 359 }));

  return (
    <div className={cn("grid w-64 gap-3 rounded-xl border bg-card p-3", className)}>
      <div
        onPointerDown={area}
        className="relative h-40 cursor-crosshair touch-none rounded-lg"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))` }}
        role="slider"
        aria-label="Saturation and brightness"
        aria-valuetext={`${Math.round(hsv.s * 100)}% saturation, ${Math.round(hsv.v * 100)}% brightness`}
        tabIndex={0}
        onKeyDown={(e) => {
          const d = 0.03;
          const m = { ArrowRight: [d, 0], ArrowLeft: [-d, 0], ArrowUp: [0, d], ArrowDown: [0, -d] }[e.key];
          if (!m) return;
          e.preventDefault();
          commit({ ...hsv, s: Math.min(1, Math.max(0, hsv.s + m[0])), v: Math.min(1, Math.max(0, hsv.v + m[1])) });
        }}
      >
        <span
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/.3),0_2px_4px_rgb(0_0_0/.3)]"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hex }}
        />
      </div>
      <div
        onPointerDown={hue}
        className="relative h-3 cursor-pointer touch-none rounded-full"
        style={{ background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }}
        role="slider"
        aria-label="Hue"
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={Math.round(hsv.h)}
        tabIndex={0}
        onKeyDown={(e) => {
          const d = { ArrowRight: 4, ArrowLeft: -4 }[e.key];
          if (d) (e.preventDefault(), commit({ ...hsv, h: (hsv.h + d + 360) % 360 }));
        }}
      >
        <span
          className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/.3)]"
          style={{ left: `${(hsv.h / 359) * 100}%`, background: `hsl(${hsv.h} 100% 50%)` }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="size-8 shrink-0 rounded-md border" style={{ background: hex }} />
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            const n = hexToHsv(v);
            if (n) {
              last.current = v.toLowerCase();
              setHsv(n);
              setHex(v.toLowerCase());
            }
          }}
          aria-label="Hex colour"
          spellCheck={false}
          className="h-8 w-full rounded-md border border-input bg-background px-2 font-mono text-sm uppercase outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/25"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {swatches.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`Use ${s}`}
            onClick={() => {
              const n = hexToHsv(s);
              last.current = s;
              if (n) setHsv(n);
              setText(s);
              setHex(s);
            }}
            className={cn(
              "size-6 rounded-md border transition-transform hover:scale-110",
              hex.toLowerCase() === s && "ring-2 ring-ring ring-offset-2 ring-offset-card"
            )}
            style={{ background: s }}
          />
        ))}
      </div>
    </div>
  );
}
