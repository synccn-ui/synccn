"use client";

import type * as React from "react";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEscape, useFocusTrap, useIsClient, useLockScroll, usePresence } from "@/lib/hooks";

const sides = {
  right: { panel: "inset-y-0 right-0 h-full w-[88%] max-w-sm border-l", in: "animate-sheet-right", out: "translate-x-full" },
  left: { panel: "inset-y-0 left-0 h-full w-[88%] max-w-sm border-r", in: "animate-sheet-left", out: "-translate-x-full" },
  bottom: { panel: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t", in: "animate-sheet-bottom", out: "translate-y-full" },
};

export interface SheetProps {
  /** Whether the sheet is shown. */
  open: boolean;
  /** Called when it should close. */
  onOpenChange: (open: boolean) => void;
  /** Edge it slides in from. */
  side?: "left" | "right" | "bottom";
  /** Heading. */
  title?: React.ReactNode;
  /** Supporting text. */
  description?: React.ReactNode;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** A panel that slides in from the edge of the screen. Bottom sheets get a drag handle. */
export function Sheet({ open, onOpenChange, side = "right", title, description, children, className }: SheetProps) {
  const { mounted, closing } = usePresence(open, 260);
  const panel = useRef<HTMLDivElement>(null);
  useEscape(() => onOpenChange(false), open);
  useLockScroll(open);
  useFocusTrap(panel, open);
  const isClient = useIsClient();
  if (!mounted || !isClient) return null;
  const s = sides[side];

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div
        className={cn("absolute inset-0 bg-black/40 transition-opacity duration-300", closing ? "opacity-0" : "animate-fade")}
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Panel"}
        tabIndex={-1}
        className={cn(
          "absolute flex flex-col overflow-y-auto bg-background p-6 text-foreground shadow-2xl outline-none transition-transform duration-[260ms] ease-[cubic-bezier(.32,.72,0,1)]",
          s.panel,
          closing ? s.out : s.in,
          className
        )}
      >
        {side === "bottom" && <div className="mx-auto -mt-2 mb-4 h-1.5 w-12 shrink-0 rounded-full bg-muted" aria-hidden />}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
        {(title || description) && (
          <div className="mb-5 grid gap-1 pr-8">
            {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
