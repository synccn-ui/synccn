"use client";

import type * as React from "react";
import { useId } from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

export interface CollapsibleProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when it opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Trigger content, or a render function for a custom trigger. */
  trigger:
    | React.ReactNode
    | ((state: { open: boolean; toggle: () => void; "aria-expanded": boolean; "aria-controls": string }) => React.ReactNode);
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** One section that expands and collapses with a height animation. */
export function Collapsible({ open, defaultOpen = false, onOpenChange, trigger, children, className }: CollapsibleProps) {
  const [isOpen, setOpen] = useControllable({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = useId();
  return (
    <div className={cn("grid", className)}>
      {typeof trigger === "function" ? (
        trigger({ open: isOpen, toggle: () => setOpen(!isOpen), "aria-expanded": isOpen, "aria-controls": id })
      ) : (
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={id}
          onClick={() => setOpen(!isOpen)}
          className="flex items-center justify-between gap-3 rounded-md text-left text-sm font-medium"
        >
          {trigger}
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </button>
      )}
      <div
        id={id}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(.3,.9,.3,1)]",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

export interface AspectRatioProps {
  /** Width divided by height, e.g. 16 / 9. */
  ratio?: number;
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

/** Keeps media at a fixed ratio, e.g. 16/9. */
export function AspectRatio({ ratio = 16 / 9, className, children }: AspectRatioProps) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)} style={{ aspectRatio: ratio }}>
      {children}
    </div>
  );
}
