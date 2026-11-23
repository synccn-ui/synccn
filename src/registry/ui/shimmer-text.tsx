"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerTextProps {
  /** Seconds per sweep. */
  duration?: number;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Text with a light sweep passing across it — good for "thinking…" states. */
export function ShimmerText({ children, className, duration = 2.4 }: ShimmerTextProps) {
  return (
    <span
      style={{ animationDuration: `${duration}s` }}
      className={cn(
        "inline-block animate-shimmer bg-[linear-gradient(110deg,var(--muted-foreground)_35%,var(--foreground)_50%,var(--muted-foreground)_65%)] bg-[length:200%_100%] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}

export interface WordRotateProps {
  /** Words to cycle through. */
  words: string[];
  /** Milliseconds each word stays. */
  interval?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** Cycles through words with a vertical slide. */
export function WordRotate({ words, interval = 2200, className }: WordRotateProps) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  return (
    <span className={cn("relative inline-grid overflow-hidden align-bottom", className)}>
      {words.map((w, k) => (
        <span
          key={w}
          aria-hidden={k !== i}
          className={cn(
            "col-start-1 row-start-1 transition-all duration-500 ease-[cubic-bezier(.3,1.2,.4,1)]",
            k === i
              ? "translate-y-0 opacity-100"
              : k === (i - 1 + words.length) % words.length
                ? "-translate-y-full opacity-0"
                : "translate-y-full opacity-0"
          )}
        >
          {w}
        </span>
      ))}
    </span>
  );
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=?";

export interface TextScrambleProps {
  /** Final text. */
  text: string;
  /** Milliseconds per frame. */
  speed?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/** Scrambles characters and resolves them left to right. Re-runs on hover. */
export function TextScramble({ text, speed = 28, className }: TextScrambleProps) {
  const [out, setOut] = useState(text);
  const raf = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const run = () => {
    let frame = 0;
    clearInterval(raf.current);
    raf.current = setInterval(() => {
      frame++;
      const resolved = Math.floor(frame / 2);
      setOut([...text].map((ch, i) => (ch === " " ? " " : i < resolved ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(""));
      if (resolved >= text.length) clearInterval(raf.current);
    }, speed);
  };
  useEffect(() => {
    run();
    return () => clearInterval(raf.current);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <span onPointerEnter={run} aria-label={text} className={cn("font-mono tabular-nums", className)}>
      <span aria-hidden>{out}</span>
    </span>
  );
}
