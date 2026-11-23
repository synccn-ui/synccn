"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface BlurFadeProps {
  /** Milliseconds before the animation starts. */
  delay?: number;
  /** Milliseconds the animation lasts. */
  duration?: number;
  /** Pixels the content rises. */
  y?: number;
  /** Starting blur in pixels. */
  blur?: number;
  /** Animate only the first time it enters the viewport. */
  once?: boolean;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Fades content in from a blur when it scrolls into view. Stagger with `delay`. */
export function BlurFade({ children, delay = 0, duration = 600, y = 10, blur = 8, once = true, className }: BlurFadeProps) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { threshold: 0.15 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [once]);
  return (
    <div
      ref={ref}
      className={cn("motion-reduce:!transform-none motion-reduce:!opacity-100 motion-reduce:!blur-none", className)}
      style={{
        opacity: inView ? 1 : 0,
        filter: inView ? "blur(0)" : `blur(${blur}px)`,
        transform: inView ? "none" : `translateY(${y}px)`,
        transition: `opacity ${duration}ms ease-out ${delay}ms, filter ${duration}ms ease-out ${delay}ms, transform ${duration}ms cubic-bezier(.2,.8,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export interface HighlighterProps {
  /** Marker colour (any CSS colour). */
  color?: string;
  /** Milliseconds after entering view before drawing. */
  delay?: number;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Animated marker highlight that draws under text when it comes into view. */
export function Highlighter({
  children,
  color = "color-mix(in oklch, var(--warning) 55%, transparent)",
  delay = 200,
  className,
}: HighlighterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.6 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <span
      ref={ref}
      className={cn("rounded-[0.2em] px-[0.1em] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]", className)}
      style={{
        backgroundImage: `linear-gradient(104deg, transparent 0.4%, ${color} 2.5%, ${color} 97%, transparent 99%)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: on ? "100% 88%" : "0% 88%",
        backgroundPosition: "0 60%",
        transition: `background-size 900ms cubic-bezier(.3,.8,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </span>
  );
}
