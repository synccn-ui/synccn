"use client";

import type * as React from "react";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEscape, useFocusTrap, useIsClient, useLockScroll, usePresence } from "@/lib/hooks";

export interface DialogProps {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Called when it should close (Escape, overlay click, close button). */
  onOpenChange: (open: boolean) => void;
  /** Heading; strings also become the accessible name. */
  title?: React.ReactNode;
  /** Supporting text. */
  description?: React.ReactNode;
  /** Action buttons. */
  footer?: React.ReactNode;
  /** Maximum width. */
  size?: "sm" | "md" | "lg";
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

export function Dialog({ open, onOpenChange, title, description, children, footer, className, size = "md" }: DialogProps) {
  const { mounted, closing } = usePresence(open, 150);
  const panel = useRef<HTMLDivElement>(null);
  useEscape(() => onOpenChange(false), open);
  useLockScroll(open);
  useFocusTrap(panel, open);
  const isClient = useIsClient();
  if (!mounted || !isClient) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
      <div
        className={cn(
          "absolute inset-0 bg-black/45 backdrop-blur-[2px]",
          closing ? "animate-[fade_.15s_reverse_forwards]" : "animate-fade"
        )}
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        tabIndex={-1}
        className={cn(
          "relative w-full rounded-2xl border bg-background p-6 text-foreground shadow-2xl shadow-black/20 outline-none",
          widths[size],
          closing ? "animate-out" : "animate-in",
          className
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
        {(title || description) && (
          <div className="mb-5 grid gap-1.5 pr-8">
            {title && <h2 className="text-lg font-semibold leading-tight tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
        {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
