"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface AuroraProps {
  /** CSS colours for the moving lights. */
  colors?: string[];
  /** Blur radius in pixels. */
  blur?: number;
  /** Overall opacity, 0–1. */
  opacity?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** Slow-moving coloured light behind content. Place inside a relative, overflow-hidden container. */
export function Aurora({
  colors = ["oklch(0.6 0.2 280)", "oklch(0.65 0.18 220)", "oklch(0.7 0.16 330)"],
  blur = 60,
  opacity = 0.45,
  className,
}: AuroraProps) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} style={{ opacity }}>
      {colors.map((c, i) => (
        <span
          key={i}
          className="absolute size-[60%] rounded-full motion-reduce:animate-none"
          style={{
            background: c,
            filter: `blur(${blur}px)`,
            left: `${[5, 40, 20][i % 3]}%`,
            top: `${[10, 0, 40][i % 3]}%`,
            animation: `aurora-${i % 3} ${14 + i * 3}s ease-in-out infinite alternate`,
          }}
        />
      ))}
      <style>{`@keyframes aurora-0{to{transform:translate(30%,20%) scale(1.2)}}@keyframes aurora-1{to{transform:translate(-25%,30%) scale(.9)}}@keyframes aurora-2{to{transform:translate(20%,-25%) scale(1.15)}}`}</style>
    </div>
  );
}

export interface GradientTextProps {
  /** Gradient stops. Repeat the first colour at the end for a seamless loop. */
  colors?: string[];
  /** Seconds for one full cycle. */
  duration?: number;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Text filled with a slowly moving gradient. */
export function GradientText({
  children,
  colors = ["oklch(0.75 0.15 250)", "oklch(0.75 0.18 320)", "oklch(0.82 0.14 60)", "oklch(0.75 0.15 250)"],
  duration = 6,
  className,
}: GradientTextProps) {
  return (
    <span
      className={cn("inline-block bg-clip-text text-transparent motion-reduce:animate-none", className)}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
        backgroundSize: "300% 100%",
        animation: `gtext ${duration}s linear infinite`,
      }}
    >
      {children}
      <style>{`@keyframes gtext{to{background-position:300% 0}}`}</style>
    </span>
  );
}

export interface FlipCardProps {
  /** Content on the front face. */
  front: React.ReactNode;
  /** Content on the back face. */
  back: React.ReactNode;
  /** Card height in pixels. */
  height?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** Card that flips in 3D to show its back on click or Enter. */
export function FlipCard({ front, back, className, height = 220 }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={flipped}
      aria-label={flipped ? "Show front" : "Show back"}
      onClick={() => setFlipped(!flipped)}
      className={cn("group w-full max-w-xs [perspective:1000px] focus-visible:outline-none", className)}
      style={{ height }}
    >
      <span
        className={cn(
          "relative block size-full transition-transform duration-700 [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(.3,.9,.3,1)]",
          flipped && "[transform:rotateY(180deg)]"
        )}
      >
        <span className="surface absolute inset-0 grid rounded-2xl border p-5 text-left [backface-visibility:hidden] group-focus-visible:ring-2 group-focus-visible:ring-ring">
          {front}
        </span>
        <span className="surface absolute inset-0 grid rounded-2xl border p-5 text-left [backface-visibility:hidden] [transform:rotateY(180deg)] group-focus-visible:ring-2 group-focus-visible:ring-ring">
          {back}
        </span>
      </span>
    </button>
  );
}

export interface OdometerProps {
  /** Number to show; digits roll when it changes. */
  value: number;
  /** Pads with leading zeros when `format` is false. */
  minDigits?: number;
  /** Adds thousands separators. */
  format?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/** Rolling-digit counter: each digit slides to its new value. */
export function Odometer({ value, className, minDigits = 1, format = true }: OdometerProps) {
  const str = format ? Math.round(value).toLocaleString("en-US") : String(Math.round(value)).padStart(minDigits, "0");
  return (
    <span aria-label={str} className={cn("inline-flex tabular-nums", className)}>
      {[...str].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={str.length - i} aria-hidden className="relative inline-block h-[1.1em] overflow-hidden leading-[1.1em]">
            <span
              className="block transition-transform duration-700 ease-[cubic-bezier(.3,1.1,.4,1)]"
              style={{ transform: `translateY(-${+ch * 1.1}em)` }}
            >
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} className="block h-[1.1em]">
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={`s${str.length - i}`} aria-hidden>
            {ch}
          </span>
        )
      )}
    </span>
  );
}

export interface TextAnimateProps {
  /** Text to animate. */
  text: string;
  /** Animate word by word or letter by letter. */
  by?: "word" | "letter";
  /** Milliseconds between each part. */
  stagger?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** Words or letters rise into place one after another when shown. */
export function TextAnimate({ text, by = "word", stagger = 60, className }: TextAnimateProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const parts = by === "letter" ? [...text] : text.split(/(\s+)/);
  return (
    <span ref={ref} aria-label={text} className={cn("inline-block", className)}>
      {parts.map((p, i) =>
        /^\s+$/.test(p) ? (
          <span key={i}>{p}</span>
        ) : (
          <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-bottom">
            <span
              className="inline-block motion-reduce:!translate-y-0 motion-reduce:!opacity-100"
              style={{
                transform: on ? "none" : "translateY(110%)",
                opacity: on ? 1 : 0,
                transition: `transform .7s cubic-bezier(.2,.8,.2,1) ${i * stagger}ms, opacity .7s ${i * stagger}ms`,
              }}
            >
              {p === " " ? " " : p}
            </span>
          </span>
        )
      )}
    </span>
  );
}

export interface RippleProps {
  /** Number of rings. */
  rings?: number;
  /** Diameter of the smallest ring in pixels. */
  size?: number;
  /** Pixels added to each ring's diameter. */
  gap?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** Concentric rings pulsing outward from the centre. */
export function Ripple({ rings = 6, size = 120, gap = 70, className }: RippleProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 grid place-items-center overflow-hidden [mask-image:radial-gradient(circle,black,transparent_70%)]",
        className
      )}
    >
      {Array.from({ length: rings }, (_, i) => (
        <span
          key={i}
          className="absolute rounded-full border bg-foreground/[0.03] motion-reduce:animate-none"
          style={{
            width: size + i * gap,
            height: size + i * gap,
            opacity: 1 - i * 0.14,
            animation: `ripple-ring 3.6s ease-in-out ${i * 0.12}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes ripple-ring{0%,100%{transform:scale(1)}50%{transform:scale(.94)}}`}</style>
    </div>
  );
}
