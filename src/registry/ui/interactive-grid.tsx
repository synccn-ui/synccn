"use client";

import type * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface InteractiveGridProps {
  /**
   * Size of each square, in pixels.
   * @default 32
   */
  cellSize?: number;
  /**
   * How many cells around the pointer light up.
   * @default 1
   */
  radius?: number;
  /**
   * How long a lit cell takes to fade, in milliseconds.
   * @default 900
   */
  fade?: number;
  /**
   * Lights random cells now and then, so the grid looks alive on touch screens too.
   * @default true
   */
  ambient?: boolean;
  /** Extra classes for the root element. The grid uses the text colour, so set it with a text-* class. */
  className?: string;
  /** Content shown over the grid. */
  children?: React.ReactNode;
}

/**
 * Background grid whose squares light up under the pointer and fade out behind it.
 * Drawn on a canvas, paused when off screen, and static for people who prefer reduced motion.
 */
export function InteractiveGrid({ cellSize = 32, radius = 1, fade = 900, ambient = true, className, children }: InteractiveGridProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let heat = new Float32Array(0);
    let raf = 0;
    let last = 0;
    let visible = true;

    const draw = () => {
      const color = getComputedStyle(el).color;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.1;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += cellSize) (ctx.moveTo(Math.round(x) + 0.5, 0), ctx.lineTo(Math.round(x) + 0.5, h));
      for (let y = 0; y <= h; y += cellSize) (ctx.moveTo(0, Math.round(y) + 0.5), ctx.lineTo(w, Math.round(y) + 0.5));
      ctx.stroke();
      ctx.fillStyle = color;
      for (let i = 0; i < heat.length; i++) {
        if (heat[i] < 0.01) continue;
        ctx.globalAlpha = heat[i] * 0.28;
        ctx.fillRect((i % cols) * cellSize + 1, Math.floor(i / cols) * cellSize + 1, cellSize - 1, cellSize - 1);
      }
      ctx.globalAlpha = 1;
    };

    const tick = (t: number) => {
      const dt = last ? Math.min(64, t - last) : 16;
      last = t;
      const k = Math.exp(-dt / (fade / 3));
      let hot = false;
      for (let i = 0; i < heat.length; i++) {
        heat[i] *= k;
        if (heat[i] > 0.01) hot = true;
      }
      if (ambient && heat.length && Math.random() < dt / 160) heat[Math.floor(Math.random() * heat.length)] = 0.55;
      draw();
      raf = visible && (hot || ambient) ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (!raf && visible && !reduce) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    const resize = () => {
      const r = el.getBoundingClientRect();
      w = r.width;
      h = r.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.ceil(w / cellSize));
      rows = Math.max(1, Math.ceil(h / cellSize));
      heat = new Float32Array(cols * rows);
      draw();
    };

    const onMove = (e: PointerEvent) => {
      if (reduce) return;
      const r = el.getBoundingClientRect();
      const cx = Math.floor((e.clientX - r.left) / cellSize);
      const cy = Math.floor((e.clientY - r.top) / cellSize);
      for (let dy = -radius; dy <= radius; dy++)
        for (let dx = -radius; dx <= radius; dx++) {
          const x = cx + dx;
          const y = cy + dy;
          if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
          const d = Math.hypot(dx, dy);
          if (d > radius + 0.5) continue;
          const i = y * cols + x;
          heat[i] = Math.max(heat[i], 1 - d / (radius + 1));
        }
      wake();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    io.observe(el);
    // Redraw when the theme changes the text colour.
    const mo = new MutationObserver(() => (reduce ? draw() : wake()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    el.addEventListener("pointermove", onMove);
    resize();
    wake();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      el.removeEventListener("pointermove", onMove);
    };
  }, [cellSize, radius, fade, ambient]);

  return (
    <div ref={wrap} className={cn("relative isolate overflow-hidden text-foreground", className)}>
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 -z-10 size-full" />
      {children}
    </div>
  );
}
