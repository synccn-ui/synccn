import type * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  outline: "text-foreground",
  soft: "border-transparent bg-brand-soft text-primary",
  success: "border-transparent bg-success/15 text-success",
  warning: "border-transparent bg-warning/20 text-amber-700 dark:text-warning",
  destructive: "border-transparent bg-destructive/12 text-destructive",
};

export type BadgeVariant = "default" | "secondary" | "outline" | "soft" | "success" | "warning" | "destructive";

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "variant" | "dot"> {
  /** Colour style. */
  variant?: BadgeVariant;
  /** Shows a small dot before the label. */
  dot?: boolean;
  /** Extra classes for the root element. */
  className?: string;
  /** Content to render. */
  children?: React.ReactNode;
}

export function Badge({ className, variant = "default", dot = false, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
