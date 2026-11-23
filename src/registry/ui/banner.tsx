"use client";

import type * as React from "react";
import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BannerProps {
  /** Adds a link after the message. */
  href?: string;
  /** Text for the link. */
  linkLabel?: string;
  /** Background style. */
  variant?: "default" | "muted" | "gradient";
  /** Shows a close button. */
  dismissible?: boolean;
  /** Called after the banner is closed. */
  onDismiss?: () => void;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Full-width announcement bar with an optional link and dismiss button. */
export function Banner({
  children,
  href,
  linkLabel = "Learn more",
  variant = "default",
  dismissible = true,
  onDismiss,
  className,
}: BannerProps) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div
      role="region"
      aria-label="Announcement"
      className={cn(
        "relative flex w-full items-center justify-center gap-x-3 gap-y-1 px-10 py-2.5 text-center text-sm",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "muted" && "border-b bg-muted/60 text-foreground",
        variant === "gradient" && "bg-[linear-gradient(90deg,oklch(0.55_0.2_290),oklch(0.6_0.2_330),oklch(0.68_0.18_40))] text-white",
        className
      )}
    >
      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span>{children}</span>
        {href && (
          <a
            href={href}
            onClick={(e) => href === "#" && e.preventDefault()}
            className="inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline"
          >
            {linkLabel} <ArrowRight className="size-3.5" />
          </a>
        )}
      </p>
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => (setHidden(true), onDismiss?.())}
          className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
