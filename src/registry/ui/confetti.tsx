"use client";

/**
 * Dependency-free confetti burst on a temporary canvas.
 * confetti({ x, y }) — x/y are viewport fractions (0–1) of the origin.
 */
export interface ConfettiOptions {
  /** Origin across the viewport, 0–1. */
  x?: number;
  /** Origin down the viewport, 0–1. */
  y?: number;
  /** Number of pieces. */
  count?: number;
  /** Spread angle in degrees. */
  spread?: number;
  /** Piece colours. Defaults to the theme primary plus a few brights. */
  colors?: string[];
}

export function confetti({ x = 0.5, y = 0.6, count = 120, spread = 70, colors }: ConfettiOptions = {}) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "9999" });
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  const css = getComputedStyle(document.documentElement);
  const palette = colors || [css.getPropertyValue("--primary"), "#f5b83d", "#ef5b7a", "#43c59e", "#8b7cf6", "#3fb6f0"];
  const ox = innerWidth * x;
  const oy = innerHeight * y;
  const parts = Array.from({ length: count }, () => {
    const angle = (-90 + (Math.random() - 0.5) * spread * 2) * (Math.PI / 180);
    const v = 9 + Math.random() * 9;
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: palette[Math.floor(Math.random() * palette.length)],
      life: 0,
    };
  });
  let frame = 0;
  const tick = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = 0;
    for (const p of parts) {
      p.life++;
      p.vy += 0.32;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      const fade = Math.max(0, 1 - p.life / 150);
      if (fade > 0 && p.y < innerHeight + 40) alive++;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.scale(1, Math.cos(p.life * 0.15));
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) frame = requestAnimationFrame(tick);
    else canvas.remove();
  };
  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    canvas.remove();
  };
}
