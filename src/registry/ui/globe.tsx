"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface GlobeProps {
  /** Width and height in pixels. */
  size?: number;
  /** Number of dots on the sphere. */
  dots?: number;
  /** Pulsing points. Keep the array stable between renders. */
  markers?: { lat: number; lng: number }[];
  /** Rotation per frame, in radians. */
  speed?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Dotted globe on a canvas: slowly rotates, can be dragged, and can show
 * pulsing markers. markers: [{ lat, lng }]. No map data or libraries needed.
 */
export function Globe({ size = 320, dots = 1400, markers = [], speed = 0.003, className }: GlobeProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = size * dpr;
    c.height = size * dpr;
    ctx.scale(dpr, dpr);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const color = getComputedStyle(c).color;
    const r = size / 2 - 6;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pts = Array.from({ length: dots }, (_, i) => {
      const y = 1 - (i / (dots - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const t = golden * i;
      return [Math.cos(t) * rad, y, Math.sin(t) * rad];
    });
    const mk = markers.map(({ lat, lng }) => {
      const la = (lat * Math.PI) / 180;
      const lo = (lng * Math.PI) / 180;
      return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)];
    });
    let rot = 0;
    let tilt = 0.35;
    let drag: { x: number; y: number; rot: number; tilt: number } | null = null;
    let raf = 0;
    let t = 0;
    const project = ([x, y, z]: number[]) => {
      const cx = x * Math.cos(rot) - z * Math.sin(rot);
      const cz = x * Math.sin(rot) + z * Math.cos(rot);
      const cy = y * Math.cos(tilt) - cz * Math.sin(tilt);
      const zz = y * Math.sin(tilt) + cz * Math.cos(tilt);
      return [size / 2 + cx * r, size / 2 - cy * r, zz];
    };
    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = color;
      for (const p of pts) {
        const [x, y, z] = project(p);
        if (z < -0.05) continue;
        ctx.globalAlpha = 0.15 + z * 0.65;
        ctx.beginPath();
        ctx.arc(x, y, 0.6 + z * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const m of mk) {
        const [x, y, z] = project(m);
        if (z < 0) continue;
        const pulse = (t % 90) / 90;
        ctx.globalAlpha = (1 - pulse) * 0.6;
        ctx.beginPath();
        ctx.arc(x, y, 3 + pulse * 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!drag && !reduce) rot += speed;
      raf = requestAnimationFrame(draw);
    };
    draw();
    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, rot, tilt };
      c.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      rot = drag.rot - (e.clientX - drag.x) * 0.008;
      tilt = Math.max(-1, Math.min(1, drag.tilt + (e.clientY - drag.y) * 0.006));
    };
    const up = () => {
      drag = null;
    };
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    return () => {
      cancelAnimationFrame(raf);
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", up);
    };
  }, [size, dots, markers, speed]);
  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label="Rotating globe"
      className={cn("cursor-grab touch-none text-foreground active:cursor-grabbing", className)}
      style={{ width: size, height: size }}
    />
  );
}
