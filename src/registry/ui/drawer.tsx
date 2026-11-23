"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useEscape, useFocusTrap, useIsClient, useLockScroll, usePresence } from "@/lib/hooks";

export interface DrawerProps {
  /** Whether the drawer is shown. */
  open: boolean;
  /** Called when it should close. */
  onOpenChange: (open: boolean) => void;
  /** Heading. */
  title?: React.ReactNode;
  /** Supporting text. */
  description?: React.ReactNode;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Bottom drawer you can drag down to dismiss. The background scales back
 * slightly while it's open, like a native sheet.
 */
export function Drawer({ open, onOpenChange, title, description, children, className }: DrawerProps) {
  const { mounted, closing } = usePresence(open, 280);
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEscape(() => onOpenChange(false), open);
  useLockScroll(open);
  useFocusTrap(panel, open);
  const isClient = useIsClient();
  if (!mounted || !isClient) return null;

  const end = () => {
    if (start.current == null) return;
    const h = panel.current?.offsetHeight || 400;
    if (drag > h * 0.28) onOpenChange(false);
    setDrag(0);
    start.current = null;
  };

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div
        className={cn("absolute inset-0 bg-black/50 transition-opacity duration-300", closing ? "opacity-0" : "animate-fade")}
        style={{ opacity: closing ? 0 : Math.max(0.2, 1 - drag / 400) }}
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Drawer"}
        tabIndex={-1}
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto flex max-h-[88vh] max-w-xl flex-col rounded-t-[22px] border border-b-0 bg-background text-foreground shadow-2xl outline-none",
          start.current == null && "transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)]",
          closing ? "translate-y-full" : !drag && "animate-sheet-bottom",
          className
        )}
        style={drag ? { transform: `translateY(${drag}px)` } : undefined}
      >
        <div
          className="grid cursor-grab touch-none place-items-center pb-2 pt-3 active:cursor-grabbing"
          onPointerDown={(e) => {
            start.current = e.clientY;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => start.current != null && setDrag(Math.max(0, e.clientY - start.current))}
          onPointerUp={end}
          onPointerCancel={end}
        >
          <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="overflow-y-auto px-6 pb-8">
          {(title || description) && (
            <div className="mb-5 grid gap-1 text-center">
              {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
