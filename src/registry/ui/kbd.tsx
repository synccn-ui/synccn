import type * as React from "react";
import { cn } from "@/lib/utils";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 select-none items-center justify-center gap-0.5 rounded-[5px] border border-b-2 bg-muted px-1.5 font-sans text-[11px] font-medium text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export interface SeparatorProps {
  /** Direction of the line. */
  orientation?: "horizontal" | "vertical";
  /** Text in the middle of a horizontal line. */
  label?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

export function Separator({ orientation = "horizontal", label, className }: SeparatorProps) {
  if (label)
    return (
      <div role="separator" className={cn("flex items-center gap-3 text-xs text-muted-foreground", className)}>
        <span className="h-px flex-1 bg-border" />
        {label}
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)}
    />
  );
}
