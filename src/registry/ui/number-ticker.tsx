"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface NumberTickerProps {
  /** Target value. */
  value: number;
  /** Starting value. */
  from?: number;
  /** Milliseconds to count. */
  duration?: number;
  /** Decimal places. */
  decimals?: number;
  /** Text before the number. */
  prefix?: string;
  /** Text after the number. */
  suffix?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/** Counts up to `value` with an ease-out curve once it scrolls into view. */
export function NumberTicker({ value, from = 0, duration = 1400, decimals = 0, prefix = "", suffix = "", className }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(from);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setStarted(true), { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const t0 = performance.now();
    const start = n;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setN(start + (value - start) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, started]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
