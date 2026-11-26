"use client";

import type * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useEscape, useFocusTrap, useIsClient, useLockScroll } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface ExpandableCardProps {
  /** The card as it sits in the grid. */
  preview: React.ReactNode;
  /** Heading of the open card, also its accessible name. */
  title: string;
  /** Extra content shown only when open. */
  children?: React.ReactNode;
  /** Extra classes for the card in the grid. */
  className?: string;
  /** Extra classes for the open panel. */
  panelClassName?: string;
}

/**
 * A card that grows out of its spot in the grid into a full panel, and shrinks back on close
 * (a FLIP animation, no libraries). Escape, the close button or the backdrop close it.
 */
export function ExpandableCard({ preview, title, children, className, panelClassName }: ExpandableCardProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"from" | "to" | "closing">("from");
  const card = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [from, setFrom] = useState<string>("none");
  const isClient = useIsClient();
  useLockScroll(open);
  useFocusTrap(panel, open && phase === "to");

  const close = () => {
    if (!open || phase === "closing") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setOpen(false);
    setPhase("closing");
    setTimeout(() => (setOpen(false), setPhase("from"), card.current?.focus()), 320);
  };
  useEscape(close, open);

  // Measure where the card is and start the panel there, then let it transition to its own place.
  useLayoutEffect(() => {
    if (!open || phase !== "from" || !card.current || !panel.current) return;
    const a = card.current.getBoundingClientRect();
    const b = panel.current.getBoundingClientRect();
    setFrom(`translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`);
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase("to")));
  }, [open, phase]);

  const transform = phase === "to" ? "none" : from;
  return (
    <>
      <button
        ref={card}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (setPhase("from"), setFrom("none"), setOpen(true))}
        className={cn("block w-full rounded-2xl border bg-card text-left transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", open && "opacity-0", className)}
      >
        {preview}
      </button>
      {open &&
        isClient &&
        createPortal(
          <div className="fixed inset-0 z-[100] grid place-items-center p-4">
            <div className={cn("absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300", phase === "to" ? "opacity-100" : "opacity-0")} onClick={close} aria-hidden />
            <div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className={cn("relative max-h-[85vh] w-full max-w-lg origin-top-left overflow-y-auto rounded-2xl border bg-card text-left shadow-2xl", panelClassName)}
              style={{ transform, transition: phase === "from" ? "none" : "transform 320ms cubic-bezier(.3,1.05,.4,1)" }}
            >
              <div>{preview}</div>
              <div className={cn("grid gap-3 px-5 pb-5 transition-opacity duration-300", phase === "to" ? "opacity-100 delay-150" : "opacity-0")}>{children}</div>
              <button type="button" onClick={close} aria-label="Close" className={cn("absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-background/80 text-muted-foreground shadow-sm backdrop-blur transition-opacity hover:text-foreground", phase === "to" ? "opacity-100" : "opacity-0")}>
                <X className="size-4" />
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
