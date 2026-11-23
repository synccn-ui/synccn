"use client";

import type * as React from "react";
import { useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const styles = {
  default: { box: "bg-card", icon: Info, tint: "text-foreground" },
  info: { box: "border-primary/30 bg-brand-soft", icon: Info, tint: "text-primary" },
  success: { box: "border-success/30 bg-success/8", icon: CheckCircle2, tint: "text-success" },
  warning: { box: "border-warning/40 bg-warning/10", icon: TriangleAlert, tint: "text-amber-600 dark:text-warning" },
  destructive: { box: "border-destructive/30 bg-destructive/8", icon: XCircle, tint: "text-destructive" },
};

export interface AlertProps {
  /** Colour and default icon. */
  variant?: "default" | "info" | "success" | "warning" | "destructive";
  /** Bold first line. */
  title?: React.ReactNode;
  /** Shows a close button that hides the alert. */
  dismissible?: boolean;
  /** Button or link shown under the text. */
  action?: React.ReactNode;
  /** Replaces the variant's default icon. */
  icon?: React.ElementType;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

export function Alert({ variant = "default", title, children, dismissible = false, action, icon, className }: AlertProps) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  const s = styles[variant];
  const Icon = icon || s.icon;
  return (
    <div
      role={variant === "destructive" ? "alert" : "status"}
      className={cn("relative flex w-full gap-3 rounded-xl border p-4", s.box, className)}
    >
      <Icon className={cn("mt-0.5 size-[18px] shrink-0", s.tint)} />
      <div className="grid flex-1 gap-1">
        {title && <p className={cn("text-sm font-semibold leading-tight", variant !== "default" && s.tint)}>{title}</p>}
        {children && <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setHidden(true)}
          className="-m-1 h-fit rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
