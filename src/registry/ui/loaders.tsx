"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface LoaderProps {
  /** Animation style. */
  variant?: "dots" | "bars" | "pulse" | "ring" | "orbit" | "typing";
  /** Size in pixels. */
  size?: number;
  /** Accessible label. */
  label?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/** Loading indicators. variant: "dots" | "bars" | "pulse" | "ring" | "orbit" | "typing" */
export function Loader({ variant = "dots", size = 24, className, label = "Loading" }: LoaderProps) {
  const s = { width: size, height: size };
  const common = cn("inline-flex items-center justify-center text-foreground motion-reduce:[&_*]:animate-none", className);
  if (variant === "dots")
    return (
      <span role="status" aria-label={label} className={cn(common, "gap-1")} style={{ height: size }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-[ld-bounce_1s_ease-in-out_infinite] rounded-full bg-current"
            style={{ width: size / 4, height: size / 4, animationDelay: `${i * 0.15}s` }}
          />
        ))}
        <Keyframes />
      </span>
    );
  if (variant === "bars")
    return (
      <span role="status" aria-label={label} className={cn(common, "gap-[3px]")} style={s}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-full w-[3px] origin-center animate-[ld-bar_1s_ease-in-out_infinite] rounded-full bg-current"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
        <Keyframes />
      </span>
    );
  if (variant === "pulse")
    return (
      <span role="status" aria-label={label} className={cn(common, "relative")} style={s}>
        <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-40" />
        <span className="size-1/2 rounded-full bg-current" />
      </span>
    );
  if (variant === "ring")
    return (
      <span role="status" aria-label={label} className={common} style={s}>
        <span className="size-full animate-spin rounded-full border-[3px] border-current border-t-transparent opacity-90" />
      </span>
    );
  if (variant === "orbit")
    return (
      <span role="status" aria-label={label} className={cn(common, "relative")} style={s}>
        <span className="absolute inset-0 rounded-full border-2 border-current opacity-15" />
        <span className="absolute inset-0 animate-spin">
          <span className="absolute left-1/2 top-0 size-[22%] -translate-x-1/2 rounded-full bg-current" />
        </span>
      </span>
    );
  return (
    <span role="status" aria-label={label} className={cn(common, "gap-1 rounded-full bg-muted px-3 py-2")}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-[ld-fade_1.2s_ease-in-out_infinite] rounded-full bg-current"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
      <Keyframes />
    </span>
  );
}

function Keyframes() {
  return (
    <style>{`@keyframes ld-bounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-60%);opacity:1}}@keyframes ld-bar{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}@keyframes ld-fade{0%,100%{opacity:.25}50%{opacity:1}}`}</style>
  );
}

export interface HoldButtonProps {
  /** Milliseconds the button must be held. */
  duration?: number;
  /** Called once the hold completes. */
  onConfirm?: () => void;
  /** Colour of the fill. */
  variant?: "destructive" | "default";
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Button that has to be held to confirm a risky action. Releasing early cancels.
 * Keyboard users hold Space or Enter.
 */
export function HoldButton({
  children = "Hold to delete",
  duration = 1500,
  onConfirm,
  variant = "destructive",
  className,
}: HoldButtonProps) {
  const [p, setP] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef<number | undefined>(undefined);
  const start = useRef(0);
  const begin = () => {
    if (done) return;
    start.current = performance.now();
    const tick = (t: number) => {
      const v = Math.min(1, (t - start.current) / duration);
      setP(v);
      if (v < 1) raf.current = requestAnimationFrame(tick);
      else {
        setDone(true);
        onConfirm?.();
        setTimeout(() => (setDone(false), setP(0)), 1600);
      }
    };
    raf.current = requestAnimationFrame(tick);
  };
  const cancel = () => {
    if (done) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    setP(0);
  };
  return (
    <button
      type="button"
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && (e.preventDefault(), begin())}
      onKeyUp={(e) => (e.key === " " || e.key === "Enter") && cancel()}
      className={cn(
        "relative inline-flex h-10 select-none items-center justify-center overflow-hidden rounded-md border px-5 text-sm font-medium transition-colors",
        variant === "destructive" ? "border-destructive/40 text-destructive" : "text-foreground",
        className
      )}
    >
      <span
        className={cn("absolute inset-y-0 left-0", variant === "destructive" ? "bg-destructive" : "bg-primary")}
        style={{ width: `${p * 100}%` }}
        aria-hidden
      />
      <span className={cn("relative transition-colors", p > 0.5 && (variant === "destructive" ? "text-white" : "text-primary-foreground"))}>
        {done ? "Done" : children}
      </span>
    </button>
  );
}
