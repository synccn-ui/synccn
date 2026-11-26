"use client";

import type * as React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { Brain, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReasoningProps {
  /** The model's reasoning text, which can grow while it streams. */
  children?: React.ReactNode;
  /** True while the model is still thinking. Opens the panel, and closes it again when thinking ends. */
  streaming?: boolean;
  /** How long it thought, in seconds. Measured automatically when not given. */
  duration?: number;
  /** Open at first, when not streaming. */
  defaultOpen?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Collapsible "Thinking…" panel for reasoning models. It opens while the model thinks,
 * shows how long it took, and folds away once the answer starts.
 */
export function Reasoning({ children, streaming = false, duration, defaultOpen = false, className }: ReasoningProps) {
  const [open, setOpen] = useState(defaultOpen || streaming);
  const [measured, setMeasured] = useState<number | null>(null);
  const started = useRef<number | null>(null);
  const touched = useRef(false);
  const uid = useId();

  useEffect(() => {
    if (streaming) {
      started.current = performance.now();
      if (!touched.current) setOpen(true);
      return;
    }
    if (started.current !== null) {
      setMeasured(Math.max(1, Math.round((performance.now() - started.current) / 1000)));
      started.current = null;
      if (!touched.current) {
        const t = setTimeout(() => setOpen(false), 700);
        return () => clearTimeout(t);
      }
    }
  }, [streaming]);

  const secs = duration ?? measured;
  return (
    <div className={cn("grid", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${uid}-body`}
        onClick={() => ((touched.current = true), setOpen((o) => !o))}
        className="-ml-1 inline-flex w-fit items-center gap-1.5 rounded-md px-1 py-0.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <Brain className={cn("size-3.5", streaming && "animate-pulse")} aria-hidden />
        {streaming ? (
          <span className="bg-[linear-gradient(90deg,var(--muted-foreground)_0%,var(--foreground)_50%,var(--muted-foreground)_100%)] bg-[length:200%_100%] bg-clip-text text-transparent motion-safe:animate-shimmer">Thinking…</span>
        ) : (
          <span>{secs ? `Thought for ${secs} ${secs === 1 ? "second" : "seconds"}` : "Reasoning"}</span>
        )}
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", !open && "-rotate-90")} aria-hidden />
      </button>
      <div className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-out", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div id={`${uid}-body`} className="overflow-hidden" aria-hidden={!open}>
          <div className="mt-2 border-l-2 pl-3 text-[13px] leading-relaxed text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}
