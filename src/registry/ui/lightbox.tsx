"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusTrap, useIsClient, useLockScroll } from "@/lib/hooks";

export interface LightboxItem {
  id: string;
  thumb: React.ReactNode;
  full: React.ReactNode;
  caption?: string;
}

export interface LightboxProps {
  /** Images. */
  items: LightboxItem[];
  /** Thumbnail columns. */
  columns?: 2 | 3 | 4;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Thumbnail grid that opens a full-screen viewer with arrows, swipe,
 * keyboard (←, →, Esc) and a thumbnail strip.
 * items: [{ id, thumb: ReactNode, full: ReactNode, caption? }]
 */
export function Lightbox({ items, columns = 3, className }: LightboxProps) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index != null;
  const panel = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);
  useLockScroll(open);
  const isClient = useIsClient();
  useFocusTrap(panel, open);

  const go = (d: number) => setIndex((i) => (i == null ? i : (i + d + items.length) % items.length));

  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className={cn("grid w-full gap-2", columns === 4 ? "grid-cols-4" : columns === 2 ? "grid-cols-2" : "grid-cols-3", className)}>
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Open ${it.caption || `image ${i + 1}`}`}
            className="group relative aspect-square overflow-hidden rounded-lg border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="block size-full transition-transform duration-300 group-hover:scale-105">{it.thumb}</span>
          </button>
        ))}
      </div>
      {open &&
        isClient &&
        createPortal(
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            tabIndex={-1}
            className="fixed inset-0 z-[120] flex animate-fade flex-col bg-black/92 text-white outline-none backdrop-blur-sm"
          >
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="tabular-nums text-white/70">
                {index + 1} / {items.length}
              </span>
              <button
                type="button"
                onClick={() => setIndex(null)}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-full hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            </div>
            <div
              className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16"
              onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
              onTouchEnd={(e) => {
                const dx = e.changedTouches[0].clientX - (touch.current ?? 0);
                if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              }}
            >
              <div key={index} className="grid max-h-full w-full max-w-3xl animate-in place-items-center">
                {items[index].full}
              </div>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:grid"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:grid"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
            {items[index].caption && <p className="px-4 pt-3 text-center text-sm text-white/80">{items[index].caption}</p>}
            <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4 scrollbar-none">
              {items.map((it, i) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "size-12 shrink-0 overflow-hidden rounded-md ring-2 transition-opacity",
                    i === index ? "ring-white" : "opacity-50 ring-transparent hover:opacity-80"
                  )}
                >
                  {it.thumb}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
