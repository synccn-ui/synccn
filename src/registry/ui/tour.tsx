"use client";

import type * as React from "react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/lib/hooks";

export interface TourStep {
  /** CSS selector of the element to highlight. */
  target: string;
  title: string;
  body: React.ReactNode;
}

export interface TourProps {
  /** Steps in order. */
  steps: TourStep[];
  /** Whether the tour is running. */
  open: boolean;
  /** Called when it's skipped or finished. */
  onOpenChange: (open: boolean) => void;
  /** Called after the last step. */
  onFinish?: () => void;
}

/**
 * Product tour: dims the page, cuts a spotlight around each target element
 * and shows a step card beside it. Steps target elements by CSS selector.
 * steps: [{ target: "#id", title, body }]
 */
export function Tour({ steps, open, onOpenChange, onFinish }: TourProps) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const step = steps[i];

  const measure = useCallback(() => {
    const el = step && document.querySelector(step.target);
    if (!el) return setRect(null);
    const r = el.getBoundingClientRect();
    setRect({ x: r.left - 8, y: r.top - 8, w: r.width + 16, h: r.height + 16 });
  }, [step]);

  useEffect(() => {
    if (open) setI(0);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const el = document.querySelector(step.target);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    measure();
    const t = setTimeout(measure, 350);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, i, measure, step]);

  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  });

  const isClient = useIsClient();
  if (!open || !step || !isClient) return null;
  const last = i === steps.length - 1;
  const next = () => (last ? (onOpenChange(false), onFinish?.()) : setI(i + 1));
  const below = rect ? rect.y + rect.h + 220 < window.innerHeight : true;
  const cardX = rect ? Math.min(Math.max(12, rect.x), window.innerWidth - 332) : window.innerWidth / 2 - 160;
  const cardY = rect ? (below ? rect.y + rect.h + 12 : rect.y - 12) : window.innerHeight / 2 - 80;

  return createPortal(
    <div className="fixed inset-0 z-[130]" role="dialog" aria-modal="true" aria-label={step.title}>
      <svg className="absolute inset-0 size-full" onClick={() => onOpenChange(false)}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx="12" fill="black" className="transition-all duration-300" />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgb(0 0 0 / .6)" mask="url(#tour-mask)" />
      </svg>
      {rect && (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-white/80 transition-all duration-300"
          style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
        />
      )}
      <div
        key={i}
        className={cn(
          "absolute w-80 max-w-[calc(100vw-24px)] animate-in rounded-2xl border bg-popover p-4 text-popover-foreground shadow-2xl",
          !below && "-translate-y-full"
        )}
        style={{ left: cardX, top: cardY }}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Skip tour"
          className="absolute right-3 top-3 grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent"
        >
          <X className="size-4" />
        </button>
        <p className="pr-8 font-semibold">{step.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, k) => (
              <span key={k} className={cn("h-1.5 rounded-full transition-all", k === i ? "w-5 bg-foreground" : "w-1.5 bg-foreground/25")} />
            ))}
          </div>
          <div className="flex gap-2">
            {i > 0 && (
              <button type="button" onClick={() => setI(i - 1)} className="h-8 rounded-md px-3 text-sm hover:bg-accent">
                Back
              </button>
            )}
            <button
              type="button"
              autoFocus
              onClick={next}
              className="h-8 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
            >
              {last ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
