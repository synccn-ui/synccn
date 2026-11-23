import type * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Icon in the middle. */
  icon?: React.ElementType;
  /** Heading. */
  title: React.ReactNode;
  /** What to do next. */
  description?: React.ReactNode;
  /** Button that starts the next step. */
  action?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("grid place-items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center", className)}>
      {Icon && (
        <span className="relative grid size-12 place-items-center rounded-xl border bg-card shadow-sm">
          <span aria-hidden className="absolute -left-3 top-2 -z-10 size-10 -rotate-12 rounded-xl border bg-muted" />
          <span aria-hidden className="absolute -right-3 top-2 -z-10 size-10 rotate-12 rounded-xl border bg-muted" />
          <Icon className="size-5 text-muted-foreground" />
        </span>
      )}
      <div className="grid max-w-xs gap-1">
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
