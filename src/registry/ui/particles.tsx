"use client";

import type * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ParticlesProps {
  /** Number of particles. */
  quantity?: number;
  /** CSS colour. Defaults to the text colour. */
  color?: string;
  /** Base particle radius in pixels. */
  size?: number;
  /** How quickly particles react to the pointer, 0–1. */
  ease?: number;
  /** Radius around the pointer that pushes particles away. */
  repel?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Floating particles on a canvas that drift away from the pointer.
 * Place inside a relative container; it fills it.
 */
export function Particles({ quantity = 70, color, size = 1.4, ease = 0.06, repel = 80, className }: ParticlesProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: -9999, y: -9999 };
    let w = 0;
    let h = 0;
    let raf = 0;
    let parts: { x: number; y: number; vx: number; vy: number; r: number; a: number; ox: number; oy: number }[] = [];
    const fill = color || getComputedStyle(c).color;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: quantity }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: size * (0.5 + Math.random()),
        a: 0.2 + Math.random() * 0.6,
        ox: 0,
        oy: 0,
      }));
    };
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = fill;
      for (const p of parts) {
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;
        const dx = p.x + p.ox - mouse.x;
        const dy = p.y + p.oy - mouse.y;
        const d = Math.hypot(dx, dy);
        const tx = d < repel ? (dx / d) * (repel - d) : 0;
        const ty = d < repel ? (dy / d) * (repel - d) : 0;
        p.ox += (tx - p.ox) * ease;
        p.oy += (ty - p.oy) * ease;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x + p.ox, p.y + p.oy, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => ((mouse.x = -9999), (mouse.y = -9999));
    resize();
    tick();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const host = c.parentElement;
    if (!host) return;
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [quantity, color, size, ease, repel]);
  return <canvas ref={canvas} aria-hidden className={cn("pointer-events-none absolute inset-0 size-full text-foreground", className)} />;
}

export interface RetroGridProps {
  /** Tilt of the grid in degrees. */
  angle?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** Perspective grid receding to the horizon, scrolling slowly. */
export function RetroGrid({ angle = 65, className }: RetroGridProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden [perspective:200px]", className)}
      style={{ "--angle": `${angle}deg` } as React.CSSProperties}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--angle))]">
        <div className="absolute -inset-x-1/2 -top-full h-[300%] animate-[retro_14s_linear_infinite] [background-image:linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_22%,transparent)_1px,transparent_0),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_22%,transparent)_1px,transparent_0)] [background-size:56px_56px]" />
      </div>
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-background to-transparent" />
      <style>{`@keyframes retro{from{transform:translateY(-50%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}
