"use client";

import type * as React from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface SpotlightCardProps {
  /** Spotlight radius in pixels. */
  radius?: number;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** A card whose border and surface light up under the pointer. */
export function SpotlightCard({ children, className, radius = 320 }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = ref.current!.getBoundingClientRect();
    ref.current!.style.setProperty("--x", `${e.clientX - r.left}px`);
    ref.current!.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      style={{ "--r": `${radius}px` } as React.CSSProperties}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-6 text-card-foreground",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        "before:bg-[radial-gradient(var(--r)_circle_at_var(--x)_var(--y),var(--brand-soft),transparent_70%)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100 [mask-composite:exclude] [mask-image:linear-gradient(#000,#000),linear-gradient(#000,#000)] [mask-clip:content-box,border-box] p-px"
        style={{ background: "radial-gradient(calc(var(--r) * 0.6) circle at var(--x) var(--y), var(--primary), transparent 70%)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export interface TiltCardProps {
  /** Maximum tilt in degrees. */
  max?: number;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** 3D tilt that follows the pointer, with a soft glare. */
export function TiltCard({ children, className, max = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current!.style.transform = `perspective(800px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
    ref.current!.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    ref.current!.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
  };
  const reset = () => {
    ref.current!.style.transform = "perspective(800px) rotateX(0) rotateY(0)";
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card transition-transform duration-200 ease-out will-change-transform",
        "after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,50%),oklch(1_0_0/0.25),transparent_55%)] after:opacity-0 after:transition-opacity hover:after:opacity-100",
        className
      )}
    >
      {children}
    </div>
  );
}
