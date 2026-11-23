"use client";

import type * as React from "react";
import { cloneElement, createContext, useCallback, useContext, useRef } from "react";
import { cn } from "@/lib/utils";
import { useClickOutside, useControllable, useEscape, usePresence } from "@/lib/hooks";

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Ctx = createContext<PopoverContextValue | null>(null);

export interface PopoverProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when it opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

export function Popover({ open, defaultOpen = false, onOpenChange, children, className }: PopoverProps) {
  const [isOpen, setOpen] = useControllable({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const root = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), [setOpen]);
  useClickOutside(root, close, isOpen);
  useEscape(close, isOpen);
  return (
    <Ctx.Provider value={{ open: isOpen, setOpen }}>
      <div ref={root} className={cn("relative inline-flex", className)}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

/** Reads the nearest Popover's state. Throws outside <Popover>. */
export function usePopover() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Popover parts must be used inside <Popover>.");
  return ctx;
}

export interface PopoverTriggerProps {
  /** A single element that toggles the popover. */
  children: React.ReactElement<any>;
}

/** Pass a single element; it receives onClick + aria props. */
export function PopoverTrigger({ children }: PopoverTriggerProps) {
  const { open, setOpen } = usePopover();
  return cloneElement(children, {
    "aria-expanded": open,
    "aria-haspopup": "dialog",
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      setOpen(!open);
    },
  });
}

const sideClass = {
  bottom: "top-full mt-2",
  top: "bottom-full mb-2",
  right: "left-full ml-2 top-0",
  left: "right-full mr-2 top-0",
};
const alignClass = { start: "left-0", center: "left-1/2 -translate-x-1/2", end: "right-0" };

export interface PopoverContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "side" | "align"> {
  /** Side of the trigger to open on. */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment along that side. */
  align?: "start" | "center" | "end";
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

export function PopoverContent({ className, side = "bottom", align = "center", children, ...props }: PopoverContentProps) {
  const { open } = usePopover();
  const { mounted, closing } = usePresence(open, 140);
  if (!mounted) return null;
  return (
    <div
      role="dialog"
      className={cn(
        "absolute z-50 w-72 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg shadow-black/5 outline-none",
        sideClass[side],
        (side === "top" || side === "bottom") && alignClass[align],
        closing ? "animate-out" : "animate-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
