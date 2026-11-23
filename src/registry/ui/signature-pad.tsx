"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Eraser, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SignaturePadProps {
  /** Canvas height in pixels. */
  height?: number;
  /** Base line width in pixels. */
  stroke?: number;
  /** PNG data URL after each stroke, or null when cleared. */
  onChange?: (dataUrl: string | null) => void;
  /** Extra classes for the root element. */
  className?: string;
}

/** Draw with mouse, pen or finger. onChange receives a PNG data URL (or null when cleared). */
export function SignaturePad({ height = 180, stroke = 2.2, onChange, className }: SignaturePadProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  type Point = [x: number, y: number, pressure: number];
  const strokes = useRef<Point[][]>([]);
  const drawing = useRef<Point[] | null>(null);
  const [count, setCount] = useState(0);

  const redraw = () => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = getComputedStyle(c).color;
    for (const s of strokes.current) {
      ctx.beginPath();
      s.forEach(([x, y, p], i) => {
        ctx.lineWidth = stroke * (0.6 + (p || 0.5) * 0.8);
        if (i === 0) ctx.moveTo(x, y);
        else {
          const [px, py] = s[i - 1];
          ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
        }
      });
      ctx.stroke();
    }
  };

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const point = (e: React.PointerEvent): Point => {
    const r = canvas.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top, e.pressure];
  };
  const emit = () => {
    setCount(strokes.current.length);
    onChange?.(strokes.current.length ? canvas.current!.toDataURL("image/png") : null);
  };

  return (
    <div className={cn("grid w-full gap-2", className)}>
      <div className="relative overflow-hidden rounded-xl border bg-card">
        <canvas
          ref={canvas}
          style={{ height }}
          aria-label="Signature area"
          className="block w-full touch-none text-foreground"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = [point(e)];
            strokes.current.push(drawing.current);
            redraw();
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            drawing.current.push(point(e));
            redraw();
          }}
          onPointerUp={() => {
            drawing.current = null;
            emit();
          }}
        />
        <div className="pointer-events-none absolute inset-x-6 bottom-9 border-b border-dashed" />
        {count === 0 && (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-muted-foreground">Sign above the line</p>
        )}
      </div>
      <div className="flex justify-end gap-1">
        <button
          type="button"
          disabled={!count}
          onClick={() => (strokes.current.pop(), redraw(), emit())}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
        >
          <Undo2 className="size-3.5" /> Undo
        </button>
        <button
          type="button"
          disabled={!count}
          onClick={() => ((strokes.current = []), redraw(), emit())}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
        >
          <Eraser className="size-3.5" /> Clear
        </button>
      </div>
    </div>
  );
}
