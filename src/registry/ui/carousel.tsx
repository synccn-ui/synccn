"use client";

import type * as React from "react";
import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselProps {
  /** Slides visible at once. */
  perView?: number;
  /** Space between slides in pixels. */
  gap?: number;
  /** Milliseconds between automatic slides. 0 turns it off. */
  autoplay?: number;
  /** Wrap from the last slide to the first. */
  loop?: boolean;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Scroll-snap carousel: swipe, drag-free on touch, arrow buttons,
 * dots, keyboard arrows and optional autoplay (paused on hover and focus, off for reduced motion).
 */
export function Carousel({ children, perView = 1, gap = 12, autoplay = 0, loop = true, className }: CarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pages = Math.max(1, slides.length - Math.floor(perView) + 1);

  const go = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const n = loop ? (i + pages) % pages : Math.max(0, Math.min(pages - 1, i));
      const child = el.children[n] as HTMLElement | undefined;
      el.scrollTo({ left: child ? child.offsetLeft - el.offsetLeft : 0, behavior: "smooth" });
    },
    [pages, loop]
  );

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const on = () => {
      const w = ((el.children[0] as HTMLElement | undefined)?.offsetWidth ?? 0) + gap || 1;
      setIndex(Math.round(el.scrollLeft / w));
    };
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, [gap]);

  useEffect(() => {
    if (!autoplay || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go(index + 1), autoplay);
    return () => clearInterval(t);
  }, [autoplay, paused, index, go]);

  const arrow =
    "absolute top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border bg-background/80 shadow-sm backdrop-blur transition-opacity hover:bg-background disabled:opacity-0";
  return (
    <div
      role="region"
      aria-roledescription="carousel"
      className={cn("relative w-full", className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div
        ref={track}
        tabIndex={0}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-xl scrollbar-none focus-visible:outline-2 focus-visible:outline-ring"
        style={{ gap }}
      >
        {slides.map((s, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            className="shrink-0 snap-start"
            style={{ width: `calc((100% - ${(perView - 1) * gap}px) / ${perView})` }}
          >
            {s}
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Previous slide"
        disabled={!loop && index === 0}
        onClick={() => go(index - 1)}
        className={cn(arrow, "-left-3 sm:-left-4")}
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        disabled={!loop && index >= pages - 1}
        onClick={() => go(index + 1)}
        className={cn(arrow, "-right-3 sm:-right-4")}
      >
        <ChevronRight className="size-4" />
      </button>
      <div className="mt-3 flex justify-center gap-1.5">
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-foreground" : "w-1.5 bg-foreground/25 hover:bg-foreground/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
